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

import beijingColors from "../components/themes/beijing/define/colors";
import beijingOldColors from "../components/themes/beijing-old/define/colors";
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
    alignV: "center",
    // digitMode 见上方说明：老档要按当时的默认值「突出」补
    digitMode: "prominent",
  },
  "themes.chengdu.components.Text": {
    fontSizeZh: 22,
    fontSizeEn: 14,
    lineGap: 16,
    offsetY: 0,
    alignV: "center",
  },
};

/**
 * 给重庆 / 成都「文字」补齐缺的版式字段（幂等，空串也当「没设」）。
 * 渲染层本来有默认值兜底，但**编辑弹窗读的是 props**，不补就是空输入框。
 */
function fillTextLayoutDefaults(data: VersionedData): VersionedData {
  if (!Array.isArray(data.rows)) return data;
  return {
    ...data,
    rows: mapRowItems(data.rows, item => {
      const defaults = TEXT_LAYOUT_DEFAULTS[item.type];
      if (!defaults) return item;
      const props: Record<string, any> = { ...item.props };
      let changed = false;
      for (const [key, value] of Object.entries(defaults)) {
        if (props[key] === undefined || props[key] === "") {
          props[key] = value;
          changed = true;
        }
      }
      return changed ? { ...item, props } : item;
    }),
  };
}

/** 成都图标的存档标识 */
const CHENGDU_ICON_TYPE = "themes.chengdu.components.Icon";

/** 有效颜色：非空串、不是透明 */
const isRealColor = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0 && v !== "transparent";

/**
 * 成都图标拆分 background / iconFill（幂等）。
 *
 * 拆分前 `background` 同时当「外圈底衬」和「图形色」用；拆分后：
 *  · `iconFill` = 图形色（原来那个 background 如果是真颜色就搬过来，否则用成都默认）；
 *  · `background` = 底衬（有板色跟板色，没有就透明，按成都那档规则）。
 * 已经拆过的条目再跑一遍不会有任何变化，所以除了迁移，存档载入时也会跑一次
 * （早期 v4 存档可能只跑过「补颜色」那版，缺 iconFill）。
 */
function splitChengduIconColors(data: VersionedData): VersionedData {
  if (!Array.isArray(data.rows)) return data;
  const config = (data.config ?? {}) as Record<string, any>;
  const boardBg =
    typeof config.boardBackground === "string" && config.boardBackground.length > 0
      ? config.boardBackground
      : null;
  const backdrop = boardBg ?? "transparent";
  return {
    ...data,
    rows: mapRowItems(data.rows, item => {
      if (item.type !== CHENGDU_ICON_TYPE) return item;
      const props: Record<string, any> = { ...item.props };
      // 「还没拆过」= iconFill 没有有效颜色。拆完 iconFill 一定是个真颜色，
      // 所以这一步幂等：拆过的条目（哪怕用户后来改了 bottom 的底衬色）不会再动。
      if (isRealColor(props.iconFill)) return item;
      props.iconFill = isRealColor(props.background)
        ? props.background
        : chengduColors.exitbackground;
      // 老的 background 已经搬去 iconFill 了，底衬按成都那档规则回到板色/透明
      props.background = backdrop;
      return { ...item, props };
    }),
  };
}

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

/** 成都两种线路标（数字 / 文字）的存档标识 —— 它们都有「风格」档 */
const CHENGDU_LINE_TYPES = ["themes.chengdu.components.LineNum", "themes.chengdu.components.LineText"];

/**
 * 给成都「线路标 / 文字线路标」补 `variant`（classic / block），老档缺就补 "classic"（幂等）。
 * 文字线路标是后加的，早期 v6 存档只有数字线路标被补过，所以载入时也会再跑一次。
 */
function fillChengduLineVariant(data: VersionedData): VersionedData {
  if (!Array.isArray(data.rows)) return data;
  return {
    ...data,
    rows: mapRowItems(data.rows, item => {
      if (!CHENGDU_LINE_TYPES.includes(item.type)) return item;
      if (typeof item.props.variant === "string" && item.props.variant) return item;
      return { ...item, props: { ...item.props, variant: "classic" } };
    }),
  };
}

/** 北京新旧主题四种线路标 → 它们各自的色板（老档 `colorKey` 存的是这里的键） */
const BEIJING_LINE_PALETTES: Record<string, Record<string, string>> = {
  "themes.beijing.components.LineNum": beijingColors,
  "themes.beijing.components.TextLineNum": beijingColors,
  "themes.beijingOld.components.Line": beijingOldColors,
  "themes.beijingOld.components.TextLineNum": beijingOldColors,
};

/**
 * 北京新旧线路标的 `colorKey`（色板键）→ `color`（hex）。
 *
 * 原来线路色是「色板键」的下拉，换不成自定义色；现在线路色跟其它颜色字段一样
 * 存 hex、编辑器走取色器（色板常量也换算成 hex）。老档在这里把键还原成 hex，
 * 颜色一点都不变（幂等：已经有 `color` 就不再动，`colorKey` 删掉）。
 */
function migrateBeijingLineColor(data: VersionedData): VersionedData {
  if (!Array.isArray(data.rows)) return data;
  return {
    ...data,
    rows: mapRowItems(data.rows, item => {
      const palette = BEIJING_LINE_PALETTES[item.type];
      const legacy = item.props.colorKey;
      if (!palette || legacy === undefined) return item;
      const props: Record<string, any> = { ...item.props };
      if (props.color === undefined || props.color === "") {
        // 认不出来的键就原样留着（渲染层空值会回退 1 号线，不会白屏）
        props.color =
          typeof legacy === "string" && legacy in palette
            ? palette[legacy]
            : legacy;
      }
      delete props.colorKey;
      return { ...item, props };
    }),
  };
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
  // v3 → v4：成都图标的 background 拆成 background（底衬）+ iconFill（图形色）。
  // 以前一个 background 同时当这两件事用，被固化成 transparent 后挖空处露出底板，
  // 整个图标变成一块纯色方块。拆分后：图形色独立可设、底衬跟底板（透明）。
  3: data => ({ ...splitChengduIconColors(data), version: 4 }),
  // v2 → v3：重庆 / 成都「文字」新增中英字号、中英行距、上下偏移。
  2: data => ({ ...fillTextLayoutDefaults(data), version: 3 }),
  // v4 → v5：同一批「文字」又加了纵向对齐（alignV），老档补成「居中」——
  // 编辑弹窗读 props，不补就是个空下拉框。
  4: data => ({ ...fillTextLayoutDefaults(data), version: 5 }),
  // v5 → v6：成都「线路标」新增风格档（经典 / 色块），老档一律按「经典」——
  // 编辑弹窗读 props，不补就是个空下拉框。
  5: data => ({ ...fillChengduLineVariant(data), version: 6 }),
  // v6 → v7：北京新旧线路标的线路色从「色板键（colorKey）」改成「hex（color）」，
  // 编辑器才能用取色器选自定义色。老档按键查色板还原成 hex，老标牌颜色不变。
  6: data => ({ ...migrateBeijingLineColor(data), version: 7 }),
};

export const LATEST_SAVE_VERSION = 7;

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
  // 幂等修补：早期 v4 存档只跑过「补颜色」那版迁移，缺 iconFill，这里补上
  if (typeof data.version === "number" && data.version >= 4) {
    data = splitChengduIconColors(data);
  }
  // 同理：文字线路标是 v6 之后才加的风格档，早期 v6 存档缺这个键，补成「经典」
  if (typeof data.version === "number" && data.version >= 6) {
    data = fillChengduLineVariant(data);
  }
  return data;
}
