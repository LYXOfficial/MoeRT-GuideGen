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

/** 北京旧版「文字」组件的存档标识别名（存档里的 item.type = displayName 键） */
const BEIJING_OLD_TEXT_TYPE = "themes.beijingOld.components.Text";

type SaveRow = Array<{ id: string; type: string; props: Record<string, any> }>;

/**
 * v1 → v2：北京旧版「文字」的单一「字距」拆成「中文字距 / 英文字距」。
 * 老值原样复制到两个新字段（老档视觉不跳），旧字段删掉。
 * 递归进容器（Frame / 双行容器）的 props.children：容器里的文字也一并升级。
 */
function upgradeBeijingOldTextRows(rows: unknown): SaveRow {
  if (!Array.isArray(rows)) return [];
  const upgradeItem = (item: any): any => {
    if (!item || typeof item !== "object") return item;
    const props = item.props;
    if (!props || typeof props !== "object") return item;
    const nextProps: Record<string, any> = { ...props };
    if (item.type === BEIJING_OLD_TEXT_TYPE && "letterSpacing" in nextProps) {
      const legacy = nextProps.letterSpacing;
      // 只在缺新字段时回填，避免覆盖已经手动设过的新值
      if (nextProps.letterSpacingZh === undefined) {
        nextProps.letterSpacingZh = legacy;
      }
      if (nextProps.letterSpacingEn === undefined) {
        nextProps.letterSpacingEn = legacy;
      }
      delete nextProps.letterSpacing;
    }
    if (Array.isArray(nextProps.children)) {
      nextProps.children = upgradeBeijingOldTextRows(nextProps.children);
    }
    return { ...item, props: nextProps };
  };
  return rows.map(row =>
    Array.isArray(row) ? row.map(upgradeItem) : row
  ) as SaveRow;
}

/** MIGRATIONS[1] 表示把 version 1 的存档迁到 2，以此类推 */
const MIGRATIONS: Record<number, Migration> = {
  1: data => ({
    ...data,
    version: 2,
    // rows 形状不对就原样留着，交给 isSaveData 拒收，不要「修」成空画板
    ...(Array.isArray(data.rows)
      ? { rows: upgradeBeijingOldTextRows(data.rows) }
      : {}),
  }),
};

export const LATEST_SAVE_VERSION = 2;

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
