import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  foregroundFormItem,
  numberFormItem,
} from "./Background";

export interface SpecLineProps {
  /** 线宽（px） */
  width?: number;
  foreground?: string;
  background?: string;
}

// 上海默认使用黄色分隔线
export const specLineDefaultProps: SpecLineProps = {
  width: 2,
  foreground: colors.specline,
  background: colors.transparent,
};

export const specLineEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    numberFormItem("themes.shanghai.components.SpecLine.props", "width", "width"),
    foregroundFormItem("themes.shanghai.components.SpecLine.props"),
    ...backgroundFormItems("themes.shanghai.components.SpecLine.props"),
  ],
});

function SpecLine({
  width = specLineDefaultProps.width,
  foreground = specLineDefaultProps.foreground,
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
          fill={foreground}
        />
      </svg>
    </BackgroundBox>
  );
}

SpecLine.getEditorConfig = (t: (key: string) => string) =>
  specLineEditorConfig(t);

export default SpecLine;
