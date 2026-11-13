import { fontFamilyEn, fontFamilyZh } from "./colors";

export type TextWeight = "normal" | "medium" | "bold" | "black";
export const WEIGHT_VALUE: Record<TextWeight, number> = {
  normal: 400,
  medium: 500,
  bold: 700,
  black: 800,
};
export const weightCss = (w: TextWeight | number): number =>
  typeof w === "number" ? w : WEIGHT_VALUE[w] ?? 400;

export const fontEn = (w: TextWeight | number, size: number) =>
  `${weightCss(w)} ${size}px ${fontFamilyEn}`;
export const fontZh = (w: TextWeight | number, size: number) =>
  `${weightCss(w)} ${size}px ${fontFamilyZh}`;

export { normalizeSvgLine } from "../../../../utils/svgText";

let ctx: CanvasRenderingContext2D | null = null;
/** canvas 量宽；无 DOM 时按字号估算，保证不抛错 */
export const measureText = (text: string, font: string): number => {
  if (!text) return 0;
  if (!ctx && typeof document !== "undefined") {
    ctx = document.createElement("canvas").getContext("2d");
  }
  if (!ctx) {
    const size = Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? 12);
    return Array.from(text).length * size * 0.6;
  }
  ctx.font = font;
  return ctx.measureText(text).width;
};
