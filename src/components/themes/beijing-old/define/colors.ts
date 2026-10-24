/**
 * 北京旧版（2015 / 经典样式）配色定义。
 *
 * 取色依据：
 *  - 版面基础色：centralgo.site/vitool 的 window.COLOR_MODE_RULES（A 蓝色系深色底）。
 *    经典样式即 vitool 的「经典」素材系列，画板底色 #092f52（底色蓝·较浅）、
 *    深色文字 #002538（文字蓝·较深，亮底时用）。
 *  - 线路色：vitool window.colorPalette 官方 hex（与新版相同的色板 —— 经典线路牌
 *    （visys.pdf 第 7 页）按 2025 年线路全集展示，颜色本身新旧一致）。
 *  - 「出口绿」visys.pdf p7 经典出口牌实测 fill = #25AA41，与新版一致。
 *  - 注意：visys.pdf p7 页面底的印刷渲染色（无色彩管理 CMYK→RGB）偏灰
 *    （约 #0e3463 / 各线路色也偏暗），不做取色依据。
 */
const colors = {
  // ===== 版面基础色（vitool COLOR_MODE_RULES：A 蓝色系深色底）=====
  background: "#092f52", // 经典样式版面衬底（底色蓝·较浅）
  foreground: "#ffffff", // --mode-item 前景（文字/图形）
  textblue: "#002538", // --mode-clsdark 文字蓝（较深，亮底/方块内文字用）
  white: "#ffffff",
  border: "#e5e7eb",
  // 经典样式没有新版黄色分隔线：分割线为单色（oth@bw.svg，深底白 / 浅底深蓝）
  specline: "#ffffff", // --mode-divider：经典单色分割线（深底默认白）
  divider: "#ffffff",

  // ===== 图形符号色 =====
  exit: "#25aa41", // 经典方形出口牌绿（visys p7 实测，与新版一致）
  prohibit: "#db1c30", // 禁止/警示红（暂沿用新版值，旧版禁止类图标素材后补）

  // ===== 线路标志色（vitool colorPalette 官方 hex，经典线路牌共用）=====
  line1: "#c23a30", // 1 号线 / 八通线
  line2: "#006098", // 2 号线
  line3: "#e60033", // 3 号线
  line4: "#008e9c", // 4 号线 / 大兴线
  line5: "#a6217f", // 5 号线
  line6: "#d29700", // 6 号线
  line7: "#fac671", // 7 号线
  line8: "#009b6b", // 8 号线
  line9: "#8fc31f", // 9 号线
  line10: "#009bc0", // 10 号线
  line11: "#ed796b", // 11 号线
  line12: "#c76b00", // 12 号线
  line13: "#f9e700", // 13 号线
  line14: "#d5a7a1", // 14 号线
  line15: "#6a357d", // 15 号线
  line16: "#76a32d", // 16 号线
  line17: "#00a9a9", // 17 号线
  line18: "#5654a2", // 18 号线
  line19: "#d6abc1", // 19 号线
  line22: "#f7c8ce", // 22 号线
  line28: "#35570b", // 28 号线
  lineyizhuang: "#e40077", // 亦庄线
  linefangshan: "#e46022", // 房山线 / 燕房线
  lines1: "#b25921", // S1 线
  linechangping: "#de82b2", // 昌平线
  linexijiao: "#e6081b", // 西郊线 / 亦庄 T1 线
  linecapitalairport: "#a29bbb", // 首都机场线
  linedaxingairport: "#004ba0", // 大兴机场线
};

export default colors;

/** 汉字字体：与新版共用思源黑体（云端 Noto Sans SC） */
export const fontFamilyZh =
  '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", SimHei, sans-serif';

/** 拉丁字母/数字字体：Arial */
export const fontFamilyEn = `Arial, ${fontFamilyZh}`;
