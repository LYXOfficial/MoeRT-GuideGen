import { Input, InputNumber, Switch } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 出口字母。
 *
 * 用户 2026-11-03：「出口不用跟箭头，也不用加出口 exit 的字，只需要英文大字母」。
 * 所以这里只剩大号拉丁字母（多出口用逗号），不带中英文标签、不带箭头。
 */
export interface ExitNumProps {
  /** 出口字母，多出口用逗号，如 "A,B" */
  letters?: string;
  /** 字高（px） */
  fontSize?: number;
  /** 粗体（默认开） */
  bold?: boolean;
  fill?: string;
  background?: string;
}

export const exitNumDefaultProps: ExitNumProps = {
  letters: "A.B",
  fontSize: 42,
  bold: true,
  fill: colors.foreground,
  background: colors.transparent,
};

export const exitNumEditorConfig = (_t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "letters",
      label: "themes.guangzhou.components.ExitNum.props.letters",
      element: <Input />,
    },
    {
      key: "fontSize",
      label: "themes.guangzhou.components.ExitNum.props.fontSize",
      element: <InputNumber min={8} max={54} />,
    },
    {
      key: "bold",
      label: "themes.guangzhou.components.ExitNum.props.bold.displayName",
      element: <Switch size="small" />,
    },
    {
      key: "fill",
      label: "themes.guangzhou.components.ExitNum.props.fill",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.guangzhou.components.ExitNum.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function ExitNum({
  letters = exitNumDefaultProps.letters,
  fontSize = exitNumDefaultProps.fontSize,
  bold = exitNumDefaultProps.bold,
  fill = exitNumDefaultProps.fill,
  background = exitNumDefaultProps.background,
}: ExitNumProps) {
  return (
    <div
      className="h-16 flex items-center"
      style={{
        backgroundColor: background,
        color: fill,
        paddingLeft: 3,
        paddingRight: 3,
      }}
    >
      <span
        style={{
          fontFamily: fontFamilyEn,
          fontSize: Math.max(8, Math.min(44, fontSize ?? 28)),
          fontWeight: bold === false ? 400 : 700,
          lineHeight: 1,
          whiteSpace: "pre-wrap",
        }}
      >
        {letters}
      </span>
    </div>
  );
}

ExitNum.getEditorConfig = (t: (key: string) => string) => exitNumEditorConfig(t);

export default ExitNum;
