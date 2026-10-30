import { fontFamilyFutura } from "./colors";

/**
 * BadgeGlyph —— 线路标图形本体（纯 SVG，无外层容器）。
 *
 * 几何取 東京メトロ CI 指南 P8：外径 = 100 单位，
 * 内白圆直径 0.765A、环厚 0.1175A、字母 ink 0.248A、数字 ink 0.267A、
 * 字母/数字墨迹间隙 0.073A。
 *
 * 三条补充规则（现场徽章实拍）：
 *  - **没有数字时字母放大**，只有单个字母时再放大一档；
 *  - 数字之间留一点字距，且按**墨迹**横向居中（Futura 的数字左右边距不对称，
 *    按 advance 居中看起来会偏一边）；
 *  - 徽章本体可以是圆环，也可以是圆角方环。
 */
const RING = 100;
const INNER_R = (RING * 0.765) / 2;
export const RING_WIDTH = (RING - RING * 0.765) / 2;
const LETTER_INK = RING * 0.248;
const NUMBER_INK = RING * 0.267;
const INK_GAP = RING * 0.073;

/** Futura 大写 cap 高 ≈ 0.72em，数字 ink ≈ 0.71em */
const CAP = 0.72;
const DIGIT = 0.71;

export type BadgeShape = "circle" | "rect";
/** 环厚：normal 标准 / thick 加粗（单字母无数字时现场用更粗的环） */
export type RingThickness = "normal" | "thick";

export interface BadgeGlyphProps {
  /** 直径 / 边长（px） */
  size: number;
  letter?: string;
  number?: string;
  color: string;
  foreground?: string;
  shape?: BadgeShape;
  thickness?: RingThickness;
}

/** 用 canvas 量墨迹：返回相对原点的左右边界 */
function inkMetrics(text: string, font: string) {
  const fallback = { left: 0, right: 0, width: 0 };
  if (typeof document === "undefined" || !text) return fallback;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return fallback;
  ctx.font = font;
  const m = ctx.measureText(text);
  return {
    left: m.actualBoundingBoxLeft ?? 0,
    right: m.actualBoundingBoxRight ?? m.width,
    width: m.width,
  };
}

/**
 * 把字符串按「墨迹中心」放到 cx 上，返回 SVG text 的起始 x。
 * advance 与墨迹不一致（尤其 Futura 数字、单字母）时，这一步决定歪不歪。
 */
function inkCenteredX(
  text: string,
  font: string,
  cx: number,
  extraSpacing = 0
): number {
  const { left, right, width } = inkMetrics(text, font);
  if (!width) return cx;
  const n = Array.from(text).length;
  const spacingTail = extraSpacing * Math.max(0, n - 1);
  const inkCenterFromOrigin = (right - left) / 2 + spacingTail / 2;
  return cx - inkCenterFromOrigin;
}

export default function BadgeGlyph({
  size,
  letter = "",
  number = "",
  color,
  foreground = "#1a1a1a",
  shape = "circle",
  thickness = "normal",
}: BadgeGlyphProps) {
  const letterText = (letter ?? "").toUpperCase().slice(0, 3);
  const numberText = (number ?? "").trim();

  // 没有数字 → 字母放大；没有数字且只有一个字母 → 再放大一档
  const letterInk = numberText
    ? LETTER_INK
    : letterText.length <= 1
      ? LETTER_INK * 1.75
      : LETTER_INK * 1.35;

  const available = INNER_R * 2 * 0.86;
  const baseLetterFont = letterInk / CAP;
  const letterWidth = letterText.length * baseLetterFont * 0.68;
  const letterScale = letterWidth > available ? available / letterWidth : 1;
  const letterFont = baseLetterFont * letterScale;
  const numberFont = NUMBER_INK / DIGIT;
  // 官方数字之间有一点字距（0.02A）
  const numberSpacing = RING * 0.02;

  // 字母被缩小（2–3 个字母）后墨迹高度变了，居中必须用**缩放后**的高度算，
  // 否则三字母时整块会偏下（用户实测 GAA 不居中）
  const letterInkActual = letterFont * CAP;
  const inkTotal = numberText
    ? letterInkActual + INK_GAP + NUMBER_INK
    : letterInkActual;
  const inkTop = (RING - inkTotal) / 2;
  const letterBaseline = inkTop + letterInkActual;
  const numberTop = letterBaseline + INK_GAP;
  const numberBaseline = numberTop + NUMBER_INK;

  const cx = RING / 2;
  const letterFontCss = `700 ${letterFont}px ${fontFamilyFutura}`;
  const numberFontCss = `700 ${numberFont}px ${fontFamilyFutura}`;

  const rx = shape === "rect" ? RING * 0.22 : RING / 2;
  // 环厚两档：加粗档 ≈ 1.45 倍（现场单字母徽章的环明显更厚）
  const ringW = thickness === "thick" ? RING_WIDTH * 1.45 : RING_WIDTH;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${RING} ${RING}`}
      aria-hidden
      style={{ display: "block", flex: "none" }}
    >
      <rect x={0} y={0} width={RING} height={RING} rx={rx} fill={color} />
      <rect
        x={ringW}
        y={ringW}
        width={RING - ringW * 2}
        height={RING - ringW * 2}
        rx={Math.max(0, rx - ringW)}
        fill="#ffffff"
      />
      {letterText && (
        <text
          x={inkCenteredX(letterText, letterFontCss, cx)}
          y={letterBaseline}
          fill={foreground}
          fontSize={letterFont}
          fontWeight={700}
          style={{ fontFamily: fontFamilyFutura }}
        >
          {letterText}
        </text>
      )}
      {numberText && (
        <text
          x={inkCenteredX(numberText, numberFontCss, cx, numberSpacing)}
          y={numberBaseline}
          fill={foreground}
          fontSize={numberFont}
          fontWeight={700}
          letterSpacing={numberSpacing}
          style={{ fontFamily: fontFamilyFutura }}
        >
          {numberText}
        </text>
      )}
    </svg>
  );
}
