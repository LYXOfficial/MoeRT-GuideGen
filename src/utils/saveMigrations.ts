/**
 * 存档版本迁移注册表（预留脚手架）。
 *
 * 未来 SaveData.version 升级（1 → 2 → …）时：
 *   1. 在 MIGRATIONS 里按「旧版本号 → 迁移函数」登记，函数返回带上新 version 的完整数据；
 *   2. 把 LATEST_SAVE_VERSION 提到最新版本号。
 *
 * loadArchiveData 与导入工程文件的路径都会在 isSaveData 校验之前调用
 * migrateSaveData 自动逐级迁移——老存档不会再被当成「校验不过」拒收或清空。
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
