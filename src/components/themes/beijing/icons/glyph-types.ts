/**
 * 北京新版图形符号（设施图标）的统一契约。
 *
 * 所有图标都是纯内联 SVG，只负责「画」：
 *  - 尺寸由外层容器决定（本文件里的 svg 一律 width/height = 100%）
 *  - 颜色只允许来自 props，不允许写死色值
 *  - 统一 24×24 视框，图形按原始印刷文件的墨迹范围等比居中
 *
 * 角色槽（由 docs/beijing/raw 的提取脚本按 PDF 实际填充色映射而来）：
 *  - color      主绘制色（设施浅蓝 / 白 / 红 …）
 *  - secondary  第二色（女卫粉、AED 白等）
 *  - ground     挖空与细节色，等于版面底色（组件背景）
 */
export interface GlyphProps {
  /** 主绘制色 */
  color: string;
  /** 第二色（反白或点缀色，如 AED 的白十字、女卫的裙装） */
  secondary?: string;
  /** 版面底色（挖空 / 细节），一般为组件背景色 */
  ground?: string;
}

/**
 * 尺寸/定位槽：图形既能放进 HTML 容器（width/height 用百分比），
 * 也能作为嵌套 <svg> 放进外层 SVG（此时用 x/y/width/height 定位）。
 */
export interface GlyphBox {
  width?: number | string;
  height?: number | string;
  x?: number;
  y?: number;
}
