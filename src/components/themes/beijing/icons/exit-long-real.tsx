import type { FC } from "react";
import type { GlyphBox, GlyphProps } from "./glyph-types";

/**
 * 由 docs/beijing/raw/gen_batch.py 从 visys.pdf 第 4 页（出口特殊样式A，长条出口） 的矢量图层直接提取生成：
 * 路径坐标、填充规则、配色角色均取自原始印刷文件，未做人工重绘。
 */

/** 原始名称：出口特殊样式A */
export const ExitLongAGlyph: FC<GlyphProps & GlyphBox> = ({ color, ground, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0.401 8.134 23.199 7.733"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 23.600 15.867 L 0.401 15.867 L 0.401 8.134 L 23.600 8.134 Z M 23.600 15.867" fill={ground} />
    <path d="M 12.332 12.479 L 13.265 12.479 L 13.265 11.478 L 13.912 11.478 L 13.912 13.160 L 10.089 13.160 L 10.089 11.478 L 10.736 11.478 L 10.736 12.479 L 11.668 12.479 L 11.668 11.065 L 10.142 11.065 L 10.142 9.378 L 10.789 9.378 L 10.789 10.357 L 11.668 10.357 L 11.668 9.100 L 12.332 9.100 L 12.332 10.357 L 13.265 10.357 L 13.265 9.378 L 13.858 9.378 L 13.858 11.065 L 12.332 11.065 Z M 12.332 12.479" fill={color} />
    <path d="M 10.089 14.900 L 10.089 13.595 L 10.979 13.595 L 10.979 13.816 L 10.331 13.816 L 10.331 14.105 L 10.934 14.105 L 10.934 14.325 L 10.331 14.325 L 10.331 14.680 L 11.002 14.680 L 11.002 14.900 Z M 10.089 14.900" fill={color} />
    <path d="M 11.169 14.900 L 11.580 14.219 L 11.208 13.595 L 11.491 13.595 L 11.732 14.014 L 11.968 13.595 L 12.248 13.595 L 11.875 14.229 L 12.285 14.900 L 11.993 14.900 L 11.727 14.449 L 11.460 14.900 Z M 11.169 14.900" fill={color} />
    <path d="M 12.487 13.595 L 12.729 13.595 L 12.729 14.900 L 12.487 14.900 Z M 12.487 13.595" fill={color} />
    <path d="M 13.314 14.900 L 13.314 13.816 L 12.958 13.816 L 12.958 13.595 L 13.912 13.595 L 13.912 13.816 L 13.556 13.816 L 13.556 14.900 Z M 13.314 14.900" fill={color} />
  </svg>
);

export const GLYPHS: Record<string, FC<GlyphProps>> = {
  ExitLongAGlyph,
};
