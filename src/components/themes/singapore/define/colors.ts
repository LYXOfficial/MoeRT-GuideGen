/**
 * 新加坡 MRT 主题配色。
 *
 * 官方依据：
 *  - 线路色：LTA 官方线网图 PDF（Pantone 专色 → sRGB），见 docs/singapore/notes/01_线路与色彩.md
 *  - Sun Yellow #FFD141 / Rainforest Green：LTA《RE:think》与手册
 *  - 导向牌深藏青：2026 实拍取样（待校色）
 */
const colors = {
  transparent: "transparent",

  /** 导向牌底（深藏青） */
  panelNavy: "#12242E",
  /** 新站名牌底（Rainforest Green，待官方色卡校准） */
  rainforest: "#0B3B33",
  /** 旧版站名牌底（2023 及以前） */
  legacyNavy: "#172D3C",
  /** PSD 站名条底色 */
  platformDark: "#111111",
  /** 强调黄（出口块 / PT 胶囊） */
  sunYellow: "#FFD141",

  background: "#12242E",
  foreground: "#FFFFFF",
  border: "#FFFFFF",
  white: "#FFFFFF",
  black: "#000000",
  ink: "#141414",

  specline: "#FFFFFF",

  // ===== 线路色（官方） =====
  lineNS: "#E2261B",
  lineEW: "#009645",
  lineNE: "#9E28B6",
  lineCC: "#FF9F19",
  lineDT: "#0056B8",
  lineTE: "#9D5A18",
  /** JRL / CRL 官方未公开：用户拍板先取二手值 */
  lineJR: "#008996",
  lineCR: "#94D600",
  lineLRT: "#718473",
} as const;

/** 英文/数字：LTA Identity，缺字回落 Segoe UI（用户 2026-11-13） */
export const fontFamilyEn =
  '"LTA Identity", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
/** 中文：LTA Identity 缺中文，实际落 Noto Sans SC */
export const fontFamilyZh =
  '"LTA Identity", "Segoe UI", "Noto Sans SC", "Source Han Sans SC", sans-serif';
/** 普通 sans（用户指定 Segoe UI） */
export const fontFamilySans =
  '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

/** 泰米尔文 */
export const fontFamilyTa =
  '"LTA Identity", "Segoe UI", "Noto Sans Tamil", sans-serif';

export default colors;
