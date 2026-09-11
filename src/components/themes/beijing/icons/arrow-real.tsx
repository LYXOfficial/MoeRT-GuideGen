import type { FC } from "react";
import type { GlyphBox, GlyphProps } from "./glyph-types";

/**
 * 由 docs/beijing/raw/gen_batch.py 从 visys.pdf 第 3 页（箭头与方向·暗底色） 的矢量图层直接提取生成：
 * 路径坐标、填充规则、配色角色均取自原始印刷文件，未做人工重绘。
 */

/** 原始名称：左 */
export const ArrowLeftGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 17.288 2.140 L 11.497 2.140 L 0.400 12.000 L 11.497 21.860 L 17.288 21.860 L 8.193 13.984 L 23.600 13.984 L 23.600 10.019 L 8.193 10.019 Z M 17.288 2.140" fill={color} />
  </svg>
);

/** 原始名称：右 */
export const ArrowRightGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 6.711 2.140 L 12.503 2.140 L 23.600 12.000 L 12.503 21.860 L 6.711 21.860 L 15.807 13.984 L 0.400 13.984 L 0.400 10.019 L 15.807 10.019 Z M 6.711 2.140" fill={color} />
  </svg>
);

/** 原始名称：上/前 */
export const ArrowUpGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 21.860 17.290 L 21.860 11.497 L 12.000 0.400 L 2.140 11.497 L 2.140 17.290 L 10.016 8.193 L 10.016 23.600 L 13.981 23.600 L 13.981 8.193 Z M 21.860 17.290" fill={color} />
  </svg>
);

/** 原始名称：下/进 */
export const ArrowDownGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 21.860 6.710 L 21.860 12.502 L 12.000 23.600 L 2.140 12.502 L 2.140 6.710 L 10.016 15.807 L 10.016 0.400 L 13.981 0.400 L 13.981 15.807 Z M 21.860 6.710" fill={color} />
  </svg>
);

/** 原始名称：左上 */
export const ArrowUpLeftGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 6.497 23.600 L 1.473 18.576 L 0.400 0.400 L 18.576 1.473 L 23.600 6.497 L 8.881 5.438 L 22.242 18.800 L 18.804 22.238 L 5.441 8.877 Z M 6.497 23.600" fill={color} />
  </svg>
);

/** 原始名称：左上 */
export const ArrowUpRightGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 0.400 6.497 L 5.424 1.473 L 23.600 0.400 L 22.527 18.576 L 17.503 23.600 L 18.562 8.879 L 5.200 22.242 L 1.760 18.802 L 15.123 5.441 Z M 0.400 6.497" fill={color} />
  </svg>
);

/** 原始名称：左下 */
export const ArrowDownLeftGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 6.497 0.400 L 1.473 5.424 L 0.400 23.600 L 18.576 22.527 L 23.600 17.503 L 8.881 18.563 L 22.242 5.200 L 18.804 1.760 L 5.441 15.123 Z M 6.497 0.400" fill={color} />
  </svg>
);

/** 原始名称：右下 */
export const ArrowDownRightGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 0.400 17.503 L 5.424 22.527 L 23.600 23.600 L 22.527 5.424 L 17.503 0.400 L 18.563 15.119 L 5.200 1.758 L 1.760 5.196 L 15.123 18.559 Z M 0.400 17.503" fill={color} />
  </svg>
);

/** 原始名称：左掉头 */
export const ArrowUturnLeftGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 19.268 7.688 C 19.268 5.414 17.427 3.571 15.151 3.571 C 12.876 3.571 11.034 5.414 11.034 7.688 L 11.034 17.367 L 17.337 10.087 L 17.337 14.719 L 9.446 23.600 L 1.559 14.719 L 1.559 10.087 L 7.858 17.367 L 7.858 7.688 C 7.858 6.755 8.035 5.863 8.357 5.041 C 9.413 2.323 12.057 0.400 15.151 0.400 C 16.678 0.400 18.098 0.871 19.268 1.672 C 21.183 2.986 22.441 5.188 22.441 7.688 L 22.441 21.596 L 19.268 21.596 Z M 19.268 7.688" fill={color} />
  </svg>
);

/** 原始名称：右掉头 */
export const ArrowUturnRightGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 4.733 7.688 C 4.733 5.414 6.574 3.571 8.850 3.571 C 11.125 3.571 12.966 5.414 12.966 7.688 L 12.966 17.367 L 6.664 10.087 L 6.664 14.719 L 14.554 23.600 L 22.440 14.719 L 22.440 10.087 L 16.142 17.367 L 16.142 7.688 C 16.142 6.755 15.966 5.863 15.642 5.041 C 14.588 2.323 11.944 0.400 8.850 0.400 C 7.322 0.400 5.903 0.871 4.733 1.672 C 2.816 2.986 1.560 5.188 1.560 7.688 L 1.560 21.596 L 4.733 21.596 Z M 4.733 7.688" fill={color} />
  </svg>
);

/** 原始名称：左后方 */
export const ArrowBackLeftGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 12.195 17.367 L 12.195 7.688 C 12.195 5.412 14.037 3.571 16.312 3.571 L 21.280 3.571 L 21.280 0.400 L 16.312 0.400 C 13.218 0.400 10.574 2.323 9.518 5.041 C 9.194 5.864 9.019 6.755 9.019 7.688 L 9.019 17.367 L 2.720 10.087 L 2.720 14.719 L 10.607 23.600 L 18.498 14.719 L 18.498 10.087 Z M 12.195 17.367" fill={color} />
  </svg>
);

/** 原始名称：右后方 */
export const ArrowBackRightGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <path d="M 11.806 17.367 L 11.806 7.688 C 11.806 5.412 9.965 3.571 7.689 3.571 L 2.720 3.571 L 2.720 0.400 L 7.689 0.400 C 10.782 0.400 13.426 2.323 14.482 5.041 C 14.806 5.864 14.982 6.755 14.982 7.688 L 14.982 17.367 L 21.280 10.087 L 21.280 14.719 L 13.394 23.600 L 5.504 14.719 L 5.504 10.087 Z M 11.806 17.367" fill={color} />
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
  ArrowUturnLeftGlyph,
  ArrowUturnRightGlyph,
  ArrowBackLeftGlyph,
  ArrowBackRightGlyph,
};
