import type { FC } from "react";
import type { GlyphBox, GlyphProps } from "./glyph-types";

/**
 * 由 docs/beijing/raw/gen_batch.py 从 visys.pdf 第 3 页（出口 A 的「出」字图符） 的矢量图层直接提取生成：
 * 路径坐标、填充规则、配色角色均取自原始印刷文件，未做人工重绘。
 */

/** 原始名称：出口A */
export const ExitCharGlyph: FC<GlyphProps & GlyphBox> = ({ color, width = "100%", height = "100%", x, y }) => (
  <svg
    viewBox="6.744 4.025 10.512 15.95"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path d="M 12.913 13.315 L 15.478 13.315 L 15.478 10.564 L 17.256 10.564 L 17.256 15.190 L 6.744 15.190 L 6.744 10.564 L 8.522 10.564 L 8.522 13.315 L 11.088 13.315 L 11.088 9.429 L 6.891 9.429 L 6.891 4.787 L 8.670 4.787 L 8.670 7.480 L 11.088 7.480 L 11.088 4.025 L 12.913 4.025 L 12.913 7.480 L 15.478 7.480 L 15.478 4.787 L 17.109 4.787 L 17.109 9.429 L 12.913 9.429 Z M 12.913 13.315" fill={color} />
    <path d="M 6.744 19.975 L 6.744 16.386 L 9.192 16.386 L 9.192 16.994 L 7.411 16.994 L 7.411 17.789 L 9.068 17.789 L 9.068 18.394 L 7.411 18.394 L 7.411 19.370 L 9.254 19.370 L 9.254 19.975 Z M 6.744 19.975" fill={color} />
    <path d="M 9.715 19.975 L 10.844 18.102 L 9.821 16.386 L 10.600 16.386 L 11.262 17.539 L 11.910 16.386 L 12.684 16.386 L 11.656 18.129 L 12.785 19.975 L 11.981 19.975 L 11.248 18.734 L 10.514 19.975 Z M 9.715 19.975" fill={color} />
    <path d="M 13.338 16.386 L 14.004 16.386 L 14.004 19.975 L 13.338 19.975 Z M 13.338 16.386" fill={color} />
    <path d="M 15.612 19.975 L 15.612 16.994 L 14.633 16.994 L 14.633 16.386 L 17.256 16.386 L 17.256 16.994 L 16.279 16.994 L 16.279 19.975 Z M 15.612 19.975" fill={color} />
  </svg>
);

export const GLYPHS: Record<string, FC<GlyphProps>> = {
  ExitCharGlyph,
};
