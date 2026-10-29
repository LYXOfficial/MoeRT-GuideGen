/**
 * 存档版本迁移注册表（预留脚手架）。
 *
 * 存档版本号**只有这一个取值点**（LATEST_SAVE_VERSION）：写入侧（buildSaveData /
 * createEmptySaveData）和校验侧（isSaveData 的 version 区间判断）都从它派生，
 * 改版本号只需要动这里，不会再出现「改了写入忘了改校验 → 老档被拒收」的坑。
 *
 * 升级流程：
 *   1. 纯追加式改动（新增可选字段、老字段语义不变）——**不用改版本号**。
 *      老存档缺字段读成 undefined，代码里用默认值兜住即可；版本号只在破坏性改动时才动。
 *   2. 破坏性改动（字段改名 / 删字段 / 语义变了）——改 LATEST_SAVE_VERSION，
 *      并在 MIGRATIONS 里按「旧版本号 → 迁移函数」补一条，函数返回带上新 version 的完整数据。
 *
 * loadArchiveData、旧版单存档（guide-autosave）迁移、导入工程文件的路径都会在
 * isSaveData 校验之前调用 migrateSaveData 自动逐级迁移——老存档不会再被当成
 * 「校验不过」拒收或清空。
 */

type VersionedData = { version: number } & Record<string, unknown>;
type Migration = (data: VersionedData) => VersionedData;

/** MIGRATIONS[1] 表示把 version 1 的存档迁到 2，以此类推 */
const MIGRATIONS: Record<number, Migration> = {
  // 示例（升级时改写）：
  // 1: data => ({ ...data, version: 2, newField: 默认值 }),
};

export const LATEST_SAVE_VERSION = 1;

/** 把解析结果按注册表逐级迁移到最新版本；识别不了的结构原样返回，交给上层校验 */
export function migrateSaveData(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  let data = parsed as VersionedData;
  if (typeof data.version !== "number") return parsed;
  let guard = 0;
  while (data.version < LATEST_SAVE_VERSION && MIGRATIONS[data.version]) {
    data = MIGRATIONS[data.version](data);
    if (++guard > 16) break; // 迁移表配置成环时的保险丝
  }
  return data;
}
