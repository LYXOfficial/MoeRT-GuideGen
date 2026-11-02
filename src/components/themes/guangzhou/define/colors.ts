/**
 * 广州地铁主题配色。
 *
 * 依据（全部实测/官方，见 docs/guangzhou/notes/01、07）：
 *  - 线路色：广州地铁官方线网接口 `apis.gzmtr.com/app-map/metroweb/linestation`
 *    的 Wayback 快照（2024-02，25 条，字段 lineColor 为 8 位 RGBA，alpha 恒 ff）；
 *    快照早于 10/11/12 号线开通，这三条按开通后取值（10/11 经实拍印证）。
 *  - 牌面默认底色 `#252225`：11 号线悬挂牌实拍（RGB 37,34,37）。
 *  - 出口红 `#D41627`、18 号线灰 `#9E9F95`：用户提供的实拍取样。
 *  - 羊角标志红 `#C51935`：Wikimedia 标志矢量里的实际填充色。
 *
 * ⚠️ 灯箱背光会把颜色抬亮（4 号线站台圆实拍 #3DCA4B，官方色 #01824a），
 *    所以这里一律用官方 hex，照片取样只用来确认「是哪个色」。
 */
const colors = {
  // 透明：间距/空格默认用它；落板不固化（见 AGENTS.md 底板配色铁律）
  transparent: "transparent",

  // ===== 版面基础色 =====
  /** 常规悬挂牌底色（近黑，略带紫灰） */
  background: "#252225",
  /** 版面信息色 */
  foreground: "#FFFFFF",
  /** 徽章、牌面描边 */
  border: "#FFFFFF",
  white: "#FFFFFF",
  black: "#000000",

  // ===== 三套预设底面（用户拍板只做配色，不加新组件） =====
  /** 出口 / 入口门楣：红底白字 */
  backgroundExit: "#D41627",
  /** 18 号线：灰底白字 */
  background18: "#9E9F95",

  // ===== 品牌 =====
  /** 羊角标志红（logo 矢量实测） */
  brandRed: "#C51935",

  // ===== 分隔线 =====
  specline: "#FFFFFF",

  // ===== 线路识别色（官方接口） =====
  line1: "#EDCF3D", // 129 C
  line2: "#00679E", // 3015 C
  line3: "#E89E47", // 157 C
  line4: "#01824A", // 348 C
  line5: "#C70541", // 1935 C
  line6: "#6E0346", // 242 C
  line7: "#9DD32D", // 375 C
  line8: "#00858A", // 321 C
  line9: "#5EC998", // 346 C
  line10: "#6E90B6", // 652 C（2025-06 开通，五羊邨实拍印证）
  line11: "#F5BB17", // 环线（2024-12 开通，实拍为黄色）
  line12: "#59621D", // 378 C（2025-06 开通）
  line13: "#888600", // 582 C
  line14: "#792720", // 181 C（含知识城支线）
  line15: "#AE8A79", // 4725 C（规划，仅供参考）
  line16: "#9E652E", // 730 C（规划）
  line17: "#8B84D7", // 2715 C（规划）
  line18: "#364C9C", // 快线（牌上偏亮，仍用官方值）
  line19: "#BB29BB", // Purple C（规划）
  line20: "#D9017A", // Process Magenta C（规划）
  line21: "#230B55", // 275 C
  line22: "#D14D23", // 282→实际橙红
  line24: "#1FADA9", // 2397 CP（规划）
  line28: "#D28BB7", // 514 CP（规划）
  /** 广佛线 382 C */
  lineGF: "#BBD80A",
  /** APM 线 306 C */
  lineAPM: "#00BDE2",
  /** 海珠有轨电车 1 号线 361 C */
  lineTHZ1: "#5EB630",
  /** 黄埔有轨电车 1 号线 */
  lineTHP1: "#BD0000",
};

export default colors;

/** 汉字字体：思源黑体（云端引用 Noto Sans SC，复用北京那套） */
export const fontFamilyZh =
  '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", SimHei, sans-serif';

/**
 * 拉丁字母 / 数字：Arial（用户 2026-11-02 明确要求「西文字体要用 arial」）。
 * 项目自带 /fonts/Arial.ttf，见 fonts/arial.css。
 */
export const fontFamilyEn = `Arial, "Arial Unicode MS", Helvetica, ${fontFamilyZh}`;

/** 站名宋体（思源宋体，见 fonts/serif.css） */
export const fontFamilySerif = `"Noto Serif SC", "Noto Serif TC", "Songti SC", SimSun, serif`;

/**
 * 线路下拉选项：`value` 存进 props，`key` 是色板里的常量名，
 * 显示文本由 i18n `themes.guangzhou.lines.<value>` 提供。
 */
export const LINE_OPTIONS = [
  { value: "1", key: "line1" },
  { value: "2", key: "line2" },
  { value: "3", key: "line3" },
  { value: "4", key: "line4" },
  { value: "5", key: "line5" },
  { value: "6", key: "line6" },
  { value: "7", key: "line7" },
  { value: "8", key: "line8" },
  { value: "9", key: "line9" },
  { value: "10", key: "line10" },
  { value: "11", key: "line11" },
  { value: "12", key: "line12" },
  { value: "13", key: "line13" },
  { value: "14", key: "line14" },
  { value: "18", key: "line18" },
  { value: "21", key: "line21" },
  { value: "22", key: "line22" },
  { value: "GF", key: "lineGF" },
  { value: "APM", key: "lineAPM" },
  { value: "THZ1", key: "lineTHZ1" },
  { value: "THP1", key: "lineTHP1" },
] as const;

export type LineValue = (typeof LINE_OPTIONS)[number]["value"];

/** 线路代码 → 颜色 */
export const lineColor = (line?: string): string => {
  const hit = LINE_OPTIONS.find(option => option.value === line);
  return hit ? (colors[hit.key] as string) : colors.line1;
};
