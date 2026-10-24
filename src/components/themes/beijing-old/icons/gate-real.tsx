import type { FC } from "react";
import type { GlyphBox, GlyphProps } from "./glyph-types";

/**
 * 本文件的两个图形来自 visys.pdf 矢量提取（与新版主题同源）：
 *  - CrossGlyph ←「禁止特殊」（第 3 页，纯叉形，无底色盘）
 *  - GateArrowDownGlyph ←「下/进」（第 3 页新版粗箭头，自助设施通行标志用）
 * 旧版这两个标志同样按「前景色指定」使用，不自带配色。
 */

/** 原始名称：禁止特殊 */
export const CrossGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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

/** 原始名称：下/进 */
export const GateArrowDownGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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


/**
 * 带框禁止叉：圆角方框描边跟随前景色 {color}，叉形固定红色（不做配色槽）。
 * 几何 = 禁止特殊（叉）原矢量缩放居中 + 组件内画的描边方框。
 */
export const FramedCrossGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
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
    <rect
      x={1.1}
      y={1.1}
      width={21.8}
      height={21.8}
      rx={2.6}
      fill="none"
      stroke={color}
      strokeWidth={0.9}
    />
    <g transform="translate(12 12) scale(0.72) translate(-12 -12)">
      <path d="M 15.035 12.002 L 23.600 20.562 L 20.562 23.600 L 11.998 15.037 L 3.433 23.600 L 0.400 20.562 L 8.963 12.002 L 0.400 3.438 L 3.433 0.400 L 11.998 8.963 L 20.562 0.400 L 23.600 3.438 Z M 15.035 12.002" fill="#db1c30" />
    </g>
  </svg>
);
