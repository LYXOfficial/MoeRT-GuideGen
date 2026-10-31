/**
 * 上海地铁主题配色（依据 DB31/T 1104《城市轨道交通导向标识系统设计规范》修订稿 2025-11）。
 *
 * 所有 CMYK 值都直接抄自标准原文，没有凭空调色：
 *  - 版面色：6.4.1 内发光导向牌底色「深灰 C0 M0 Y0 K92-95」
 *  - 出站色：6.4.2 出站相关信息「黄 C0 M18 Y94 K0」
 *  - 信息色：6.4.2 进站/换乘「白 C0 M0 Y0 K0」
 *  - 申通红：6.1 图 1「上海城市轨道交通图形符号及色号 C0 M100 Y100 K0」
 *  - 线路识别色：附录 A（1—23 号线 / 浦江线 / 市域线 / 磁浮双色）
 *
 * CMYK → sRGB 用 ISO Coated（FOGRA27L）转，与标准附录 A 的色块渲染逐条对照过
 * （差异来自 PDF 内 JPEG 压缩，≤5%）；对照表见 docs/shanghai/notes/颜色与字体.md。
 */
const colors = {
  // 透明：间距/空格默认用它；落板不固化（见 AGENTS.md 底板配色铁律）
  transparent: "transparent",

  // ===== 版面基础色 =====
  /** 内发光 / 附着式导向牌底色（深灰 K95） */
  background: "#2D2B2E",
  /** 版面信息色（进站、换乘、站名） */
  foreground: "#FFFFFF",
  /** 附着式 / 白底版面（前景/背景色 2 的反向组合） */
  background2: "#FFFFFF",
  /** 白底版面上的信息色（深灰） */
  foreground2: "#2D2B2E",
  /** 徽章、牌面描边 */
  border: "#FFFFFF",
  white: "#FFFFFF",
  black: "#000000",
  /** 分隔线（经典版面用白色细线） */
  specline: "#FFFFFF",

  // ===== 出口 =====
  /** 出口底色 = 版面深灰（与背景色 1 相同） */
  exitBackground: "#2D2B2E",
  /** 出口信息黄色（C0 M18 Y94 K0） */
  exitForeground: "#FFCF00",

  // ===== 专用图形符号 =====
  /** 申通地铁标志红（C0 M100 Y100 K0） */
  shentongRed: "#E3001B",

  // ===== 线路识别色（附录 A，CMYK 转 ISO Coated） =====
  line1: "#E00030", // C2 M100 Y82 K0
  line2: "#88BB18", // C54 M0 Y100 K0
  line3: "#FCD000", // C2 M16 Y100 K0
  line4: "#45277E", // C86 M100 Y3 K1
  line5: "#954D96", // C49 M78 Y0 K0
  line6: "#E10064", // C2 M100 Y28 K0
  line7: "#EC6711", // C0 M69 Y100 K0
  line8: "#0093D1", // C99 M13 Y4 K0
  line9: "#87CCEA", // C48 M5 Y2 K0
  line10: "#C5B1D4", // C25 M34 Y0 K0
  line11: "#832330", // C32 M94 Y72 K36
  line12: "#00745A", // C100 M26 Y71 K12
  line13: "#E998C1", // C5 M51 Y0 K0
  line14: "#5F5C21", // C60 M50 Y100 K30
  line15: "#BAA587", // C25 M30 Y45 K10
  line16: "#9AD2C0", // C44 M0 Y30 K0
  line17: "#BC7771", // C30 M60 Y50 K0
  line18: "#C19455", // C0 M30 Y65 K30
  line19: "#F6A97D", // C0 M42 Y52 K0
  line20: "#009A5C", // C93 M0 Y78 K0
  line21: "#F9AA00", // C0 M38 Y100 K0
  line22: "#5D3969", // C75 M90 Y35 K0
  line23: "#B4D278", // C37 M0 Y64 K0
  /** 浦江线 C0 M0 Y0 K40 */
  linepujiang: "#B1B3B5",
  /** 市域线 C0 M0 Y0 K60 */
  linesuburban: "#86878A",
  /** 磁浮线上色 / 下色（C87 M55 Y64 K12 / C23 M79 Y100 K0） */
  maglev1: "#215E57",
  maglev2: "#C54D1F",
};

export default colors;

/** 汉字字体：思源黑体（云端引用 Noto Sans SC，见 fonts/sourcehansans.css） */
export const fontFamilyZh =
  '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", SimHei, sans-serif';

/** 拉丁字母 / 数字：Helvetica（标准 8.2.6 要求西文用无衬线体；项目自带 Helvetica.ttf） */
export const fontFamilyEn = `Helvetica, "Helvetica Neue", Arial, ${fontFamilyZh}`;

/** 线路下拉的选项：id 用于数据，颜色常量名 + 显示文本由组件决定 */
export const LINE_COLOR_KEYS = [
  "line1",
  "line2",
  "line3",
  "line4",
  "line5",
  "line6",
  "line7",
  "line8",
  "line9",
  "line10",
  "line11",
  "line12",
  "line13",
  "line14",
  "line15",
  "line16",
  "line17",
  "line18",
  "line19",
  "line20",
  "line21",
  "line22",
  "line23",
  "linepujiang",
  "linesuburban",
] as const;
