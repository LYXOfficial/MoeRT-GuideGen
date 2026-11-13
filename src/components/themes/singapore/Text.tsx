import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilySans } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { EDGE_PAD, ROW_H } from "./define/layout";
import { weightCss, type TextWeight } from "./define/text";

/**
 * 通用文字（用户 2026-11-13）：
 * TextArea 输入、允许换行、**不 trim、不折叠多空格**；
 * 行距 / 对齐 / 字号 / 字重 / 字体 / 字距全部可调。
 * 单语站名、`to 站名`、`ends at`、说明小字都用它。
 */
export interface TextProps {
  text?: string;
  align?: "left" | "center" | "right";
  fontSize?: number;
  weight?: TextWeight;
  /** identity = LTA Identity；sans = Segoe UI */
  font?: "identity" | "sans";
  letterSpacing?: number;
  lineHeight?: number;
  /** 上下偏移（px，正数向上） */
  offsetY?: number;
  color?: string;
  background?: string;
}

export const textDefaultProps: TextProps = {
  text: "to Chinatown",
  align: "left",
  fontSize: 36,
  weight: "normal",
  font: "identity",
  letterSpacing: 0,
  lineHeight: 1.2,
  offsetY: 0,
  color: colors.foreground,
  background: colors.transparent,
};

const SCOPE = "themes.singapore.components.Text.props";

export const textEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "text",
      label: `${SCOPE}.text`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 6 }} />,
    },
    {
      key: "font",
      label: `${SCOPE}.font`,
      element: (
        <Select>
          <Select.Option value="identity">{t("themes.singapore.common.font.identity")}</Select.Option>
          <Select.Option value="sans">{t("themes.singapore.common.font.sans")}</Select.Option>
        </Select>
      ),
    },
    {
      key: "align",
      label: `${SCOPE}.align`,
      element: (
        <Select>
          <Select.Option value="left">{t("themes.singapore.common.align.left")}</Select.Option>
          <Select.Option value="center">{t("themes.singapore.common.align.center")}</Select.Option>
          <Select.Option value="right">{t("themes.singapore.common.align.right")}</Select.Option>
        </Select>
      ),
    },
    {
      key: "weight",
      label: `${SCOPE}.weight`,
      element: (
        <Select>
          <Select.Option value="normal">{t("themes.singapore.common.weight.normal")}</Select.Option>
          <Select.Option value="medium">{t("themes.singapore.common.weight.medium")}</Select.Option>
          <Select.Option value="bold">{t("themes.singapore.common.weight.bold")}</Select.Option>
          <Select.Option value="black">{t("themes.singapore.common.weight.black")}</Select.Option>
        </Select>
      ),
    },
    { key: "fontSize", label: `${SCOPE}.fontSize`, element: <InputNumber min={6} max={96} /> },
    { key: "letterSpacing", label: `${SCOPE}.letterSpacing`, element: <InputNumber step={0.5} min={-5} max={20} /> },
    { key: "lineHeight", label: `${SCOPE}.lineHeight`, element: <InputNumber step={0.05} min={0.6} max={3} /> },
    { key: "offsetY", label: `${SCOPE}.offsetY`, element: <InputNumber step={1} min={-32} max={32} /> },
    { key: "color", label: `${SCOPE}.color`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

function Text({
  text = textDefaultProps.text,
  align = textDefaultProps.align,
  fontSize = textDefaultProps.fontSize,
  weight = textDefaultProps.weight,
  font = textDefaultProps.font,
  letterSpacing = textDefaultProps.letterSpacing,
  lineHeight = textDefaultProps.lineHeight,
  offsetY = textDefaultProps.offsetY,
  color = textDefaultProps.color,
  background = textDefaultProps.background,
}: TextProps) {
  return (
    <div
      className="h-full"
      style={{
        height: ROW_H,
        display: "flex",
        alignItems: "center",
        background,
        paddingLeft: EDGE_PAD,
        paddingRight: EDGE_PAD,
      }}
    >
      <div
        style={{
          fontFamily: font === "sans" ? fontFamilySans : fontFamilyEn,
          fontSize,
          fontWeight: weightCss(weight ?? "normal"),
          letterSpacing,
          lineHeight,
          color,
          textAlign: align,
          whiteSpace: "pre-wrap",
          width: "max-content",
          // 正数向上：与其它主题一致
          transform: `translateY(${-(offsetY ?? 0)}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
}

Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);

export default Text;
