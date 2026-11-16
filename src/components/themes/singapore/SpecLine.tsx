import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  colorFormItem,
  numberFormItem,
} from "./Background";
import { ROW_H } from "./define/layout";

/**
 * 分隔线（LTA 官方 DP 系列里用来切「上/下两行方向」的那道横线）。
 * 用户 2026-11-13：加回来。背景永远透明。
 */
export interface SpecLineProps {
  /** 线宽（px） */
  width?: number;
  /** 线体上下留白（px） */
  insetY?: number;
  fill?: string;
  background?: string;
}

export const specLineDefaultProps: SpecLineProps = {
  width: 3,
  insetY: 4,
  fill: colors.specline,
  background: colors.transparent,
};

const SCOPE = "themes.singapore.components.SpecLine.props";

export const specLineEditorConfig = (_t: (key: string) => string): EditorConfig => ({
  forms: [
    numberFormItem(SCOPE, "width", "width", 1, 12),
    numberFormItem(SCOPE, "insetY", "insetY", 0, 30),
    colorFormItem(SCOPE, "fill"),
    ...backgroundFormItems(SCOPE),
  ],
});

function SpecLine({
  width = specLineDefaultProps.width,
  insetY = specLineDefaultProps.insetY,
  fill = specLineDefaultProps.fill,
  background = specLineDefaultProps.background,
}: SpecLineProps) {
  const lineWidth = Math.max(1, width ?? 3);
  const inset = Math.max(0, Math.min(ROW_H / 2 - 1, insetY ?? 8));
  return (
    <BackgroundBox
      background={background}
      className="z-10"
      style={{ width: lineWidth, height: ROW_H }}
    >
      <svg width={lineWidth} height={ROW_H}>
        <rect
          x={0}
          y={inset}
          width={lineWidth}
          height={ROW_H - inset * 2}
          fill={fill}
        />
      </svg>
    </BackgroundBox>
  );
}

SpecLine.getEditorConfig = (t: (key: string) => string) => specLineEditorConfig(t);

export default SpecLine;
