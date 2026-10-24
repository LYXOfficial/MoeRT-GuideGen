import type { FC } from "react";
import type { GlyphBox, GlyphProps } from "./glyph-types";

/**
 * 由 docs/beijing/raw/gen_batch.py 从 visys.pdf 第 7 页（Classic Style 经典样式）行 9 方形出口牌 的矢量图层直接提取生成：
 * 路径坐标、填充规则、配色角色均取自原始印刷文件，未做人工重绘。
 */

/** 原始名称：ExitClassic */
export const ExitClassicGlyph: FC<GlyphProps & GlyphBox> = ({ color, ground, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="0.401 0.4 23.198 23.2"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 23.599 23.600 L 0.401 23.600 L 0.401 0.400 L 23.599 0.400 Z M 23.599 23.600" fill={ground} />
    <path d="M 5.476 20.700 L 5.476 16.780 L 8.515 16.780 L 8.515 17.444 L 6.303 17.444 L 6.303 18.312 L 8.360 18.312 L 8.360 18.973 L 6.303 18.973 L 6.303 20.039 L 8.592 20.039 L 8.592 20.700 Z M 5.476 20.700" fill={color} />
    <path d="M 9.164 20.700 L 10.565 18.654 L 9.295 16.780 L 10.263 16.780 L 11.084 18.039 L 11.889 16.780 L 12.848 16.780 L 11.574 18.684 L 12.974 20.700 L 11.976 20.700 L 11.068 19.344 L 10.156 20.700 Z M 9.164 20.700" fill={color} />
    <path d="M 13.661 16.780 L 14.487 16.780 L 14.487 20.700 L 13.661 20.700 Z M 13.661 16.780" fill={color} />
    <path d="M 16.484 20.700 L 16.484 17.444 L 15.268 17.444 L 15.268 16.780 L 18.525 16.780 L 18.525 17.444 L 17.312 17.444 L 17.312 20.700 Z M 16.484 20.700" fill={color} />
    <path d="M 13.375 8.837 L 13.375 12.989 L 15.832 12.989 L 15.832 9.738 L 18.525 9.738 L 18.525 15.533 L 5.476 15.533 L 5.476 9.738 L 8.172 9.738 L 8.172 12.989 L 10.625 12.989 L 10.625 8.837 L 5.476 8.837 L 5.476 3.946 L 8.172 3.946 L 8.172 6.528 L 10.625 6.528 L 10.625 3.300 L 13.375 3.300 L 13.375 6.528 L 15.832 6.528 L 15.832 3.946 L 18.525 3.946 L 18.525 8.837 Z M 13.375 8.837" fill={color} />
  </svg>
);

export const GLYPHS: Record<string, FC<GlyphProps>> = {
  ExitClassicGlyph,
};
