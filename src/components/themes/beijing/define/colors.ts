/**
 * 北京新版（基于 DB11/T 657.2—2024 的改编版）配色定义。
 *
 * 取色依据（按需求「以 vitool 实际 hex 为准」）：
 *  - 版面基础色与线路色：centralgo.site/vitool 的 window.colorPalette / COLOR_MODE_RULES（A 蓝色系深色底）
 *  - vitool 的素材 SVG（assets/page/*.svg）匿名不可获取，因此「出口绿 / 设施浅蓝 / 女卫粉」
 *    改用标准附录给出的 CMYK 经渲染实测得到的值，已在下方逐条标注
 */
const colors = {
  // ===== 版面基础色（vitool COLOR_MODE_RULES：A 蓝色系深色底）=====
  background: "#142134", // 新版版面衬底（官方样式表/visys/extra 实测一致；旧版经典深蓝是 #092f52）
  foreground: "#ffffff", // --mode-item 前景（文字/图形）
  textblue: "#002538", // --mode-item(B) / --mode-clsdark 文字蓝（深）
  white: "#ffffff",
  border: "#e5e7eb",
  specline: "#fff100", // --mode-ydivider 新版黄色分隔线
  divider: "#ffffff", // --mode-divider 反白分隔线

  // ===== 图形符号色 =====
  facility: "#00adef", // 设施浅蓝：卫生间/扶梯/楼梯等（标准 C100 M0 Y0 K0 渲染实测）
  facilityfemale: "#ed127c", // 女士卫生间粉（标准 C0 M95 Y20 K0 渲染实测）
  exit: "#25aa41", // 「出」字图符绿（标准 C85 M0 Y100 K5 渲染实测）
  prohibit: "#db1c30", // 禁止 / 警示红（VI 实测）
  aedsubstrate: "#eb851d", // AED 位置标志衬底橙（标准 C5 M50 Y95 K0 渲染实测）

  // ===== 线路标志色（vitool colorPalette，hex 权威）=====
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
  line18: "#5654a2", // 18 号线（标准附录 A 为「?」，此处取 vitool 值）
  line19: "#d6abc1", // 19 号线
  line22: "#f7c8ce", // 22 号线
  lineyizhuang: "#e40077", // 亦庄线
  linefangshan: "#e46022", // 房山线 / 燕房线
  lines1: "#b25921", // S1 线
  linechangping: "#de82b2", // 昌平线
  line28: "#35570b", // 28 号线
  linexijiao: "#e6081b", // 西郊线 / 亦庄 T1 线
  linecapitalairport: "#a29bbb", // 首都机场线
  linedaxingairport: "#004ba0", // 大兴机场线
};

export default colors;

/** 汉字字体：思源黑体（云端引用 Noto Sans SC，见 fonts/sourcehansans.css） */
export const fontFamilyZh =
  '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", SimHei, sans-serif';

/** 拉丁字母/数字字体：Arial（系统字体，标准 §1.1.4.3） */
export const fontFamilyEn = "Arial, " + fontFamilyZh;
