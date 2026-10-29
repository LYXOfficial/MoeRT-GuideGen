import type { FC } from "react";
import {
  ArrowLeftGlyph,
  ArrowRightGlyph,
  ArrowUpGlyph,
  ArrowDownGlyph,
  ArrowUpLeftGlyph,
  ArrowUpRightGlyph,
  ArrowDownLeftGlyph,
  ArrowDownRightGlyph,
} from "./icons/arrow-real";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import type { GlyphBox, GlyphProps } from "./icons/glyph-types";
import {
  Background,
  backgroundFormItems,
  commonSelectFormItem,
  foregroundFormItem,
} from "./Background";

/**
 * 箭头（经典样式）。
 *
 * - 只有 8 个方向（左右上下 + 四斜），图形全部取自 visys.pdf 第 7 页「Classic Style」
 *   行 9 的矢量图层（见 icons/arrow-real.tsx）：燕尾凹口头、等厚直杆、尾端平切，
 *   直行与斜向是同一套字形旋转 45°，不做掉头/后向变体。
 * - 组件盒 = 方形 64×64（占满整行），箭头 ink 按 visys p7 网格实测比例居中：
 *   格 = 1.4a = 行高，左右箭头 ink 56.6×35.4pt、上下 35.4×56.7pt、斜 43.4×43.5pt。
 */
export type ArrowDirection =
  | "left"
  | "right"
  | "up"
  | "down"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right";

export const ARROW_DIRECTIONS: ArrowDirection[] = [
  "left",
  "right",
  "up",
  "down",
  "up-left",
  "up-right",
  "down-left",
  "down-right",
];

const ARROW_GLYPHS: Record<ArrowDirection, FC<GlyphProps & GlyphBox>> = {
  left: ArrowLeftGlyph,
  right: ArrowRightGlyph,
  up: ArrowUpGlyph,
  down: ArrowDownGlyph,
  "up-left": ArrowUpLeftGlyph,
  "up-right": ArrowUpRightGlyph,
  "down-left": ArrowDownLeftGlyph,
  "down-right": ArrowDownRightGlyph,
};

export interface ArrowProps {
  direction?: ArrowDirection;
  foreground?: string;
  background?: string;
}

export const arrowDefaultProps: ArrowProps = {
  direction: "up-right",
  foreground: colors.foreground,
  background: colors.transparent,
};

export const arrowEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijingOld.components.Arrow.props";
  return {
    forms: [
      commonSelectFormItem(t, scope, "direction", "direction", ARROW_DIRECTIONS),
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
/**
 * 行语境按官方 DB11/T 657.2—2024 示例图：行高 = 1.5a，箭头 ink 宽 = 1a。
 * ink 宽高比保持 visys p7 矢量原比例（水平箭头 56.6:35.4 ≈ 1:0.625）。
 */
const A = ROW_H / 1.5;

/** 每个方向的箭头 ink 宽高（px，按 1a 宽 + p7 比例）——glyph 是 tight 视框，直接按此尺寸摆放 */
const ARROW_INK: Record<ArrowDirection, { w: number; h: number }> = {
  left: { w: A, h: A * (35.4 / 56.6) },
  right: { w: A, h: A * (35.4 / 56.6) },
  up: { w: A * (35.4 / 56.6), h: A * (56.7 / 56.6) },
  down: { w: A * (35.4 / 56.6), h: A * (56.7 / 56.6) },
  "up-left": { w: A * (43.4 / 56.6), h: A * (43.5 / 56.6) },
  "up-right": { w: A * (43.4 / 56.6), h: A * (43.5 / 56.6) },
  "down-left": { w: A * (43.4 / 56.6), h: A * (43.5 / 56.6) },
  "down-right": { w: A * (43.4 / 56.6), h: A * (43.5 / 56.6) },
};

function Arrow({
  direction = arrowDefaultProps.direction,
  foreground = arrowDefaultProps.foreground,
  background = arrowDefaultProps.background,
}: ArrowProps) {
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.transparent;

  const dir = direction ?? "up";
  const ink = ARROW_INK[dir] ?? ARROW_INK.up;
  const inkW = ink.w;
  const inkH = ink.h;
  const Glyph = ARROW_GLYPHS[dir] ?? ArrowUpGlyph;

  return (
    <Background
      background={bg}
      style={{ height: ROW_H, width: ROW_H }}
    >
      <svg width={ROW_H} height={ROW_H}>
        <Glyph
          color={fg}
          width={inkW}
          height={inkH}
          x={(ROW_H - inkW) / 2}
          y={(ROW_H - inkH) / 2}
        />
      </svg>
    </Background>
  );
}

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);

export default Arrow;
