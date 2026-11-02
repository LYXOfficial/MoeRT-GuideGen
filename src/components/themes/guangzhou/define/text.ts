import { useEffect, useState } from "react";
import { fontFamilyEn, fontFamilyZh } from "./colors";

/**
 * 广州主题的字体/度量工具（照上海那套，用户要求「补偿照着别的主题做」）。
 *
 * 汉字用思源黑体（Noto Sans SC），拉丁字母与数字用 Arial（/fonts/Arial.ttf）。
 * 所有字号以「牌面高 = 64px」为基准换算。
 */
export type TextWeight = "normal" | "medium" | "bold";

export const WEIGHT_VALUE: Record<TextWeight, number> = {
  normal: 400,
  medium: 500,
  bold: 700,
};

/**
 * 字重 → CSS 数值。
 * 支持直接给数值：预置档位之外的数值（例如 500）不必再往 WEIGHT_VALUE 里塞新档位，
 * 直接 `weightCss(500)` / `fontZh(500, size)` 即可。
 */
export const weightCss = (weight: TextWeight | number): number =>
  typeof weight === "number" ? weight : WEIGHT_VALUE[weight];

/** 中文字体串（用于 canvas measureText 与 SVG font-family） */
export const fontZh = (weight: TextWeight | number, size: number): string =>
  `${weightCss(weight)} ${size}px ${fontFamilyZh}`;

/** 拉丁/数字字体串 */
export const fontEn = (weight: TextWeight | number, size: number): string =>
  `${weightCss(weight)} ${size}px ${fontFamilyEn}`;

/**
 * 单行文本在 SVG <text> 里的空白预处理：制表/换行按 SVG 规则先变成空格，
 * 首尾和中间的空格全部原样保留（用户要求首尾空格也算进去）。
 *
 * 配合 <text xmlSpace="preserve"> 使用时，连续空格会被真的画出来（默认的
 * xml:space="default" 会把它们折叠成一个），而 measureText 本来就是按实际字符数算宽度的，
 * 两边这才对得上；否则会出现「英文打了多个空格只显示一个、下面的色块却越打越长」。
 */
// 实现统一放在 utils/svgText，避免各主题各写一份、行为跑偏
export { normalizeSvgLine } from "../../../../utils/svgText";

let measureCtx: CanvasRenderingContext2D | null = null;

/** 用 canvas 量文字宽度；无 DOM 环境时退化为按字号估算，保证不抛错 */
export const measureText = (text: string, font: string): number => {
  if (!text) return 0;
  if (!measureCtx && typeof document !== "undefined") {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) {
    const size = Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? 12);
    return Array.from(text).length * size * 0.6;
  }
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
};

/**
 * 字体就绪开关：云端思源黑体是异步加载的，
 * 量宽前必须等 document.fonts.ready，否则首帧宽度会偏小。
 */
export const useFontsReady = (): boolean => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    document.fonts?.ready
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  return ready;
};

/** 标准 §1.1.4.3 字宽约束：汉字/单独数字默认 100%、最小 85%；罗马字母 95%、最小 80% */
export const MIN_ZH_SCALE = 0.85;
export const MIN_EN_SCALE = 0.8;

/**
 * 计算需要横向压缩的倍数（用于超宽文本）。
 * @param measured 实测宽度
 * @param limit 允许的最大宽度
 * @param minScale 标准允许的最小压缩倍数
 */
export const fitScale = (
  measured: number,
  limit: number,
  minScale: number
): number => {
  if (measured <= limit || measured <= 0) return 1;
  return Math.max(minScale, limit / measured);
};

/**
 * 文字**墨迹**边界（不是排字宽度）。
 *
 * 中文和拉丁的左右侧边距（side bearing）不一样：同一段起点排下来，
 * 拉丁「E」的墨迹往往比汉字更靠左（约 1–2px），于是「出口 / Exit」左对齐时
 * 英文会探出去一点；右对齐时则右边探出去（用户实测反馈）。
 * 这里用 canvas 的 actualBoundingBoxLeft/Right 拿到真实墨迹范围，
 * 对齐时按墨迹边缘而不是排字原点对齐。
 *
 * 以 `<text x=0 textAnchor="start">` 绘制时：墨迹范围 = [-inkLeft, +inkRight]。
 */
export interface InkMetrics {
  /** 原点左侧的墨迹宽度（正数） */
  inkLeft: number;
  /** 原点右侧的墨迹宽度（正数） */
  inkRight: number;
  /** 墨迹总宽 */
  inkWidth: number;
  /** 基线以上的墨迹高度（实际值，比 0.88em 准） */
  inkAscent: number;
  /** 基线以下的墨迹高度 */
  inkDescent: number;
}

export const measureInk = (
  text: string,
  font: string,
  letterSpacing = 0,
  fontSize = 0
): InkMetrics => {
  if (!text)
    return {
      inkLeft: 0,
      inkRight: 0,
      inkWidth: 0,
      inkAscent: 0,
      inkDescent: 0,
    };
  if (!measureCtx && typeof document !== "undefined") {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) {
    const size = Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? 12);
    const width = Array.from(text).length * size * 0.6;
    return {
      inkLeft: 0,
      inkRight: width,
      inkWidth: width,
      inkAscent: size * 0.88,
      inkDescent: size * 0.12,
    };
  }
  measureCtx.font = font;
  const m = measureCtx.measureText(text);
  const gaps = Math.max(0, Array.from(text).length - 1);
  const extra = letterSpacing * fontSize * gaps;
  const left = m.actualBoundingBoxLeft ?? 0;
  const right = (m.actualBoundingBoxRight ?? m.width) + extra;
  const size = Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? 12);
  return {
    inkLeft: left,
    inkRight: right,
    inkWidth: left + right,
    inkAscent: m.actualBoundingBoxAscent ?? size * 0.88,
    inkDescent: m.actualBoundingBoxDescent ?? size * 0.12,
  };
};

/** 按对齐方式求「让墨迹边界对齐」所需的绘制原点偏移 */
export const inkShift = (
  metrics: InkMetrics,
  width: number,
  align: "left" | "center" | "right"
): number => {
  if (align === "right") return width - metrics.inkRight;
  if (align === "center")
    return width / 2 - (metrics.inkRight - metrics.inkLeft) / 2;
  return metrics.inkLeft;
};
