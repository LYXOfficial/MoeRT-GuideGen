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

import chengduColors from "../components/themes/chengdu/define/colors";

type VersionedData = { version: number } & Record<string, unknown>;
type Migration = (data: VersionedData) => VersionedData;

/** 北京旧版「文字」组件的存档标识别名（存档里的 item.type = displayName 键） */
const BEIJING_OLD_TEXT_TYPE = "themes.beijingOld.components.Text";

/**
 * 重庆 / 成都「文字」缺字段时要补的默认值（字号/行距/偏移 = 各自 textDefaultProps，
 * 改那边记得同步）。
 *
 * `digitMode` 单独说明：这个字段是后来才加的，加之前组件里只有「突出」一种行为，
 * 所以老档缺这个键要按**当时的**默认值「突出」补，而不是现在的默认值「持平」——
 * 否则老标牌里的数字会突然缩回正文大小。
 */
const TEXT_LAYOUT_DEFAULTS: Record<string, Record<string, any>> = {
  "themes.chongqing.components.Text": {
    fontSizeZh: 22,
    fontSizeEn: 14,
    lineGap: 16,
    offsetY: 0,
    digitMode: "prominent",
  },
  "themes.chengdu.components.Text": {
    fontSizeZh: 22,
    fontSizeEn: 14,
    lineGap: 16,
    offsetY: 0,
  },
};

/** 老档里「背景色 = 透明」可能存成的几种值（各主题的 transparent 常量都是这个字面量） */
const themesTransparentValues: unknown[] = ["transparent", ""];

/** 成都图标的存档标识：它的 `background` 是「图形挖空处」的颜色，不是组件底色 */
const CHENGDU_ICON_TYPE = "themes.chengdu.components.Icon";

type SaveRow = Array<{ id: string; type: string; props: Record<string, any> }>;

/**
 * 逐条遍历 rows（含容器 Frame / 双行容器的 props.children），把条目交给 upgrade 改。
 * upgrade 返回的新条目继续往下递归，所以容器里的子条目也会被处理。
 */
function mapRowItems(
  rows: unknown,
  upgrade: (item: SaveRow[number]) => SaveRow[number]
): SaveRow {
  if (!Array.isArray(rows)) return [];
  const walk = (item: any): any => {
    if (!item || typeof item !== "object") return item;
    const props = item.props;
    if (!props || typeof props !== "object") return item;
    const next = upgrade({ ...item, props: { ...props } });
    if (Array.isArray(next.props.children)) {
      next.props = {
        ...next.props,
        children: mapRowItems(next.props.children, upgrade),
      };
    }
    return next;
  };
  return rows.map(row =>
    Array.isArray(row) ? row.map(walk) : row
  ) as SaveRow;
}

/** MIGRATIONS[1] 表示把 version 1 的存档迁到 2，以此类推 */
const MIGRATIONS: Record<number, Migration> = {
  // v1 → v2：北京旧版「文字」的单一「字距」拆成「中文字距 / 英文字距」
  // （老值双份回填，旧字段删掉，老档视觉不跳）。
  1: data => ({
    ...data,
    version: 2,
    // rows 形状不对就原样留着，交给 isSaveData 拒收，不要「修」成空画板
    ...(Array.isArray(data.rows)
      ? {
          rows: mapRowItems(data.rows, item => {
            if (
              item.type !== BEIJING_OLD_TEXT_TYPE ||
              !("letterSpacing" in item.props)
            ) {
              return item;
            }
            const props: Record<string, any> = { ...item.props };
            const legacy = props.letterSpacing;
            // 只在缺新字段时回填，避免覆盖已经手动设过的新值
            if (props.letterSpacingZh === undefined) {
              props.letterSpacingZh = legacy;
            }
            if (props.letterSpacingEn === undefined) {
              props.letterSpacingEn = legacy;
            }
            delete props.letterSpacing;
            return { ...item, props };
          }),
        }
      : {}),
  }),
  // v3 → v4：修回成都图标被写成 transparent 的「背景色」。
  // 图标的 `background` 是图形挖空处的颜色（底板是 foreground），写成 transparent
  // 会让挖空处露出底板 → 整块纯色方块。老档里凡是 transparent 的都按「有板色跟随板色、
  // 没有就回成都默认」修正（用户在弹窗里自己改成别的颜色的不动）。
  3: data => {
    const config = (data.config ?? {}) as Record<string, any>;
    const boardBg =
      typeof config.boardBackground === "string" && config.boardBackground.length > 0
        ? config.boardBackground
        : null;
    const fallback = boardBg ?? chengduColors.exitbackground;
    return {
      ...data,
      version: 4,
      ...(Array.isArray(data.rows)
        ? {
            rows: mapRowItems(data.rows, item => {
              if (item.type !== CHENGDU_ICON_TYPE) return item;
              const transparent =
                themesTransparentValues.includes(item.props.background);
              if (!transparent) return item;
              return { ...item, props: { ...item.props, background: fallback } };
            }),
          }
        : {}),
    };
  },
  // v2 → v3：重庆 / 成都「文字」新增中英字号、中英行距、上下偏移。
  // 渲染层本来就会用默认值兜底，但**编辑弹窗读的是 props**，老档缺字段就显示成空输入框，
  // 所以在迁移里补齐（已手动设过的不动）。
  2: data => ({
    ...data,
    version: 3,
    ...(Array.isArray(data.rows)
      ? {
          rows: mapRowItems(data.rows, item => {
            const defaults = TEXT_LAYOUT_DEFAULTS[item.type];
            if (!defaults) return item;
            const props: Record<string, any> = { ...item.props };
            let changed = false;
            for (const [key, value] of Object.entries(defaults)) {
              // 空串也当「没设」：InputNumber 清空后存下来就是空串
              if (props[key] === undefined || props[key] === "") {
                props[key] = value;
                changed = true;
              }
            }
            return changed ? { ...item, props } : item;
          }),
        }
      : {}),
  }),
};

export const LATEST_SAVE_VERSION = 4;

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
