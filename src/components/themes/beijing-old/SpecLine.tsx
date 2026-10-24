import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
  numberFormItem,
} from "./Background";

export interface SpecLineProps {
  /** 线宽（px） */
  width?: number;
  foreground?: string;
  background?: string;
  background2?: string;
}

// 经典样式分隔线为单色（oth@bw.svg）：深色底默认白色，可改前景色
export const specLineDefaultProps: SpecLineProps = {
  width: 3,
  foreground: colors.specline,
  background: colors.background,
  background2: colors.background,
};

export const specLineEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    numberFormItem("themes.beijingOld.components.SpecLine.props", "width", "width"),
    foregroundFormItem("themes.beijingOld.components.SpecLine.props"),
    ...backgroundFormItems("themes.beijingOld.components.SpecLine.props"),
  ],
});

function SpecLine({
  width = specLineDefaultProps.width,
  foreground = specLineDefaultProps.foreground,
  background = specLineDefaultProps.background,
  background2 = specLineDefaultProps.background2,
}: SpecLineProps) {
  const lineWidth = Math.max(1, width ?? 2);
  return (
    <MultiRowBackground
      background={background}
      background2={background2}
      className="z-10"
      style={{ width: lineWidth, height: 64 }}
    >
      <svg width={lineWidth} height={64}>
        <path
          d={`M 0 3 L ${lineWidth} 3 L ${lineWidth} 61 L 0 61 Z`}
          fill={foreground}
        />
      </svg>
    </MultiRowBackground>
  );
}

SpecLine.getEditorConfig = (t: (key: string) => string) =>
  specLineEditorConfig(t);

export default SpecLine;
