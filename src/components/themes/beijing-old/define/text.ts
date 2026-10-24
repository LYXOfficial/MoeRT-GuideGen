/**
 * 北京旧版主题的文字/度量工具 —— 与新版共用同一套实现
 * （思源黑体 + Arial、canvas 量宽、SVG 空白预处理、云端字体就绪钩子）。
 */
export {
  fontEn,
  fontZh,
  measureText,
  normalizeSvgLine,
  useFontsReady,
  weightCss,
  WEIGHT_VALUE,
  type TextWeight,
} from "../../beijing/define/text";
