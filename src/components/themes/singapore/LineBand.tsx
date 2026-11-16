import { Input, InputNumber } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { ROW_H } from "./define/layout";
import { weightCss, type TextWeight } from "./define/text";

/** 线路名条：线路色横条 + 白色线路全名 */
export interface LineBandProps {
  text?: string;
  color?: string;
  textColor?: string;
  height?: number;
  padLeft?: number;
  padRight?: number;
  size?: number;
  weight?: TextWeight;
  background?: string;
}

export const lineBandDefaultProps: LineBandProps = {
  text: "Circle Line",
  color: colors.lineCC,
  textColor: colors.foreground,
  height: 36,
  padLeft: 16,
  padRight: 16,
  size: 28,
  weight: "normal",
  background: colors.transparent,
};

const SCOPE = "themes.singapore.components.LineBand.props";

export const lineBandEditorConfig = (_t: (key: string) => string): EditorConfig => ({
  forms: [
    { key: "text", label: `${SCOPE}.text`, element: <Input /> },
    { key: "color", label: `${SCOPE}.color`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "textColor", label: `${SCOPE}.textColor`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "height", label: `${SCOPE}.height`, element: <InputNumber min={20} max={64} /> },
    { key: "padLeft", label: `${SCOPE}.padLeft`, element: <InputNumber min={0} max={1000} step={10} /> },
    { key: "padRight", label: `${SCOPE}.padRight`, element: <InputNumber min={0} max={1000} step={10} /> },
    { key: "size", label: `${SCOPE}.size`, element: <InputNumber min={8} max={64} /> },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

function LineBand({
  text = lineBandDefaultProps.text,
  color = lineBandDefaultProps.color,
  textColor = lineBandDefaultProps.textColor,
  height = lineBandDefaultProps.height,
  padLeft = lineBandDefaultProps.padLeft,
  padRight = lineBandDefaultProps.padRight,
  size = lineBandDefaultProps.size,
  weight = lineBandDefaultProps.weight,
  background = lineBandDefaultProps.background,
}: LineBandProps) {
  return (
    <div
      className="h-full"
      style={{
        height: ROW_H,
        display: "flex",
        alignItems: "center",
        background,
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <div
        style={{
          height,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          paddingLeft: padLeft,
          paddingRight: padRight,
        }}
      >
        <span
          style={{
            fontFamily: fontFamilyEn,
            fontSize: size,
            fontWeight: weightCss(weight ?? "normal"),
            color: textColor,
            whiteSpace: "pre",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

LineBand.getEditorConfig = (t: (key: string) => string) => lineBandEditorConfig(t);

export default LineBand;
