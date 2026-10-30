import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  Background,
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

// 东京：分隔线**满高、无上下间距**（白/黑单色），深色底默认白
export const specLineDefaultProps: SpecLineProps = {
  width: 3,
  foreground: colors.specline,
  background: colors.transparent,
};

export const specLineEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    numberFormItem("themes.tokyo-metro.components.SpecLine.props", "width", "width"),
    foregroundFormItem("themes.tokyo-metro.components.SpecLine.props"),
    ...backgroundFormItems("themes.tokyo-metro.components.SpecLine.props"),
  ],
});

function SpecLine({
  width = specLineDefaultProps.width,
  foreground = specLineDefaultProps.foreground,
  background = specLineDefaultProps.background,
}: SpecLineProps) {
  const lineWidth = Math.max(1, width ?? 2);
  return (
    <Background
      background={background}
      className="z-10"
      style={{ width: lineWidth, height: 64 }}
    >
      <svg width={lineWidth} height={64}>
        <path
          d={`M 0 0 L ${lineWidth} 0 L ${lineWidth} 64 L 0 64 Z`}
          fill={foreground}
        />
      </svg>
    </Background>
  );
}

SpecLine.getEditorConfig = (t: (key: string) => string) =>
  specLineEditorConfig(t);

export default SpecLine;
