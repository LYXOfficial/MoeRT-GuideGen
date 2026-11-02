import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  colorFormItem,
  numberFormItem,
} from "./Background";

export interface SpecLineProps {
  /** 线宽（px） */
  width?: number;
  fill?: string;
  background?: string;
}

export const specLineDefaultProps: SpecLineProps = {
  width: 2,
  fill: colors.specline,
  background: colors.transparent,
};

export const specLineEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    numberFormItem("themes.guangzhou.components.SpecLine.props", "width", "width"),
    colorFormItem("themes.guangzhou.components.SpecLine.props", "fill"),
    ...backgroundFormItems("themes.guangzhou.components.SpecLine.props"),
  ],
});

function SpecLine({
  width = specLineDefaultProps.width,
  fill = specLineDefaultProps.fill,
  background = specLineDefaultProps.background,
}: SpecLineProps) {
  const lineWidth = Math.max(1, width ?? 2);
  return (
    <BackgroundBox
      background={background}
      className="z-10"
      style={{ width: lineWidth, height: 64 }}
    >
      <svg width={lineWidth} height={64}>
        <path
          d={`M 0 8 L ${lineWidth} 8 L ${lineWidth} 56 L 0 56 Z`}
          fill={fill}
        />
      </svg>
    </BackgroundBox>
  );
}

SpecLine.getEditorConfig = (t: (key: string) => string) =>
  specLineEditorConfig(t);

export default SpecLine;
