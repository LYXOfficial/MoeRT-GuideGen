import type { FC } from "react";
import type { GlyphBox, GlyphProps } from "./glyph-types";

/**
 * 由 docs/beijing/raw/gen_batch.py 从 visys.pdf 第 3 页（禁止类图形） 的矢量图层直接提取生成：
 * 路径坐标、填充规则、配色角色均取自原始印刷文件，未做人工重绘。
 */

/** 原始名称：禁止特殊 */
export const ProhibitedGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 15.035 12.002 L 23.600 20.562 L 20.562 23.600 L 11.998 15.037 L 3.433 23.600 L 0.400 20.562 L 8.963 12.002 L 0.400 3.438 L 3.433 0.400 L 11.998 8.963 L 20.562 0.400 L 23.600 3.438 Z M 15.035 12.002" fill={color} />
  </svg>
);

/** 原始名称：闸机禁止 */
export const GateProhibitedGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 15.037 12.002 L 23.600 20.562 L 20.562 23.600 L 11.998 15.037 L 3.433 23.600 L 0.400 20.562 L 8.963 12.002 L 0.400 3.438 L 3.433 0.400 L 11.998 8.963 L 20.562 0.400 L 23.600 3.438 Z M 15.037 12.002" fill={color} />
  </svg>
);

export const GLYPHS: Record<string, FC<GlyphProps>> = {
  ProhibitedGlyph,
  GateProhibitedGlyph,
};
