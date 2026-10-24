import type { FC } from "react";
import type { GlyphBox, GlyphProps } from "./glyph-types";

/**
 * 由 docs/beijing/raw/gen_batch.py 从 visys.pdf 第 7 页（Classic Style 经典样式）行 9 方向箭头 的矢量图层直接提取生成：
 * 路径坐标、填充规则、配色角色均取自原始印刷文件，未做人工重绘。
 */

/** 原始名称：ArrowLeft */
export const ArrowLeftGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0.4 4.75 23.2 14.5"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 23.600 13.967 L 8.196 13.967 L 14.322 19.250 L 8.606 19.250 L 0.400 11.998 L 8.601 4.750 L 14.314 4.750 L 8.196 10.023 L 23.600 10.023 Z M 23.600 13.967" fill={color} />
  </svg>
);

/** 原始名称：ArrowRight */
export const ArrowRightGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0.4 4.75 23.2 14.5"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 0.400 10.033 L 15.805 10.033 L 9.677 4.750 L 15.395 4.750 L 23.600 12.002 L 15.400 19.250 L 9.686 19.250 L 15.805 13.975 L 0.400 13.975 Z M 0.400 10.033" fill={color} />
  </svg>
);

/** 原始名称：ArrowUp */
export const ArrowUpGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="4.75 0.4 14.5 23.2"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 10.033 23.600 L 10.033 8.197 L 4.750 14.323 L 4.750 8.605 L 12.002 0.400 L 19.250 8.600 L 19.250 14.314 L 13.977 8.197 L 13.977 23.600 Z M 10.033 23.600" fill={color} />
  </svg>
);

/** 原始名称：ArrowDown */
export const ArrowDownGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="4.75 0.4 14.5 23.2"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 13.967 0.400 L 13.967 15.805 L 19.250 9.677 L 19.250 15.395 L 11.999 23.600 L 4.750 15.400 L 4.750 9.686 L 10.025 15.805 L 10.025 0.400 Z M 13.967 0.400" fill={color} />
  </svg>
);

/** 原始名称：ArrowUpLeft */
export const ArrowUpLeftGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0.4 0.401 23.2 23.198"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 19.967 23.599 L 5.770 9.402 L 6.548 19.918 L 1.278 14.648 L 0.400 0.401 L 14.637 1.279 L 19.903 6.545 L 9.405 5.769 L 23.600 19.964 Z M 19.967 23.599" fill={color} />
  </svg>
);

/** 原始名称：ArrowUpRight */
export const ArrowUpRightGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0.402 0.4 23.196 23.2"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 0.402 19.965 L 14.598 5.772 L 4.082 6.547 L 9.352 1.278 L 23.598 0.400 L 22.720 14.638 L 17.455 19.903 L 18.233 9.404 L 4.037 23.600 Z M 0.402 19.965" fill={color} />
  </svg>
);

/** 原始名称：ArrowDownLeft */
export const ArrowDownLeftGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0.403 0.4 23.194 23.2"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 23.597 4.035 L 9.401 18.231 L 19.916 17.453 L 14.647 22.722 L 0.403 23.600 L 1.281 9.364 L 6.544 4.099 L 5.768 14.596 L 19.962 0.400 Z M 23.597 4.035" fill={color} />
  </svg>
);

/** 原始名称：ArrowDownRight */
export const ArrowDownRightGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0.4 0.402 23.2 23.196"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 4.034 0.402 L 18.230 14.598 L 17.453 4.085 L 22.722 9.354 L 23.600 23.598 L 9.362 22.720 L 4.097 17.455 L 14.596 18.233 L 0.400 4.037 Z M 4.034 0.402" fill={color} />
  </svg>
);

export const GLYPHS: Record<string, FC<GlyphProps>> = {
  ArrowLeftGlyph,
  ArrowRightGlyph,
  ArrowUpGlyph,
  ArrowDownGlyph,
  ArrowUpLeftGlyph,
  ArrowUpRightGlyph,
  ArrowDownLeftGlyph,
  ArrowDownRightGlyph,
};
