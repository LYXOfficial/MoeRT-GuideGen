/**
 * 北京旧版主题的文字/度量工具。
 *
 * 汉字用中易黑体（SimHei，fonts/simhei.css 从 CDN 引入），
 * 西文与数字用 Arial —— 与官方样例的度量一致。
 * 量宽/字重/空白预处理等工具与新版共用同一套实现。
 */
import { fontFamilyEn, fontFamilyZh } from "./colors";
import { weightCss, type TextWeight } from "../../beijing/define/text";

export {
  measureText,
  normalizeSvgLine,
  useFontsReady,
  weightCss,
  WEIGHT_VALUE,
  type TextWeight,
} from "../../beijing/define/text";

/** 中文字体串（用于 canvas measureText 与 SVG font-family） */
export const fontZh = (weight: TextWeight | number, size: number): string =>
  `${weightCss(weight)} ${size}px ${fontFamilyZh}`;

/** 拉丁/数字字体串（旧版与中文同为中易黑体） */
export const fontEn = (weight: TextWeight | number, size: number): string =>
  `${weightCss(weight)} ${size}px ${fontFamilyEn}`;
