import { useEffect, useState } from "react";
import { fontFamilyEn, fontFamilyZh } from "./colors";

/**
 * 北京主题通用的字体/度量工具。
 *
 * 依据标准 §1.1.4：汉字用思源黑体（本项目云端引用 Noto Sans SC），
 * 拉丁字母与数字用 Arial。字号换算基准见 docs/beijing/vitool.md (d-6)：
 * vitool 模块高 150px，本编辑器行高 64px，比例 ≈ 0.4267。
 */
export type TextWeight = "normal" | "medium" | "bold";

export const WEIGHT_VALUE: Record<TextWeight, number> = {
  normal: 400,
  medium: 600,
  bold: 800,
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
