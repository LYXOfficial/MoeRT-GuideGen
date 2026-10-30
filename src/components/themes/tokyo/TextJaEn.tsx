import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import TextRenderer from "./define/TextRenderer";
import { langFormItems } from "./define/textForms";
import { backgroundFormItems, foregroundFormItem } from "./Background";

/** TextJaEn —— 日英双语两块（上日下英，两块参数各自独立） */
export interface TextJaEnProps {
  ja: string;
  jaSize?: number;
  jaWeight?: number;
  jaSpacing?: number;
  jaLineGap?: number;
  en: string;
  enSize?: number;
  enWeight?: number;
  enSpacing?: number;
  enLineGap?: number;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}

export const textJaEnDefaultProps: TextJaEnProps = {
  ja: "国会議事堂方面",
  jaSize: 22,
  jaWeight: 700,
  jaSpacing: 0,
  jaLineGap: 2,
  en: "National Diet Bldg.",
  enSize: 11,
  enWeight: 500,
  enSpacing: 0,
  enLineGap: 1,
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
};

const SCOPE = "themes.tokyo-metro.components.TextJaEn.props";

export const textJaEnEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    ...langFormItems(t, SCOPE, "ja"),
    ...langFormItems(t, SCOPE, "en"),
    {
      key: "align",
      label: `${SCOPE}.align.displayName`,
      element: (
        <Select>
          <Select.Option value="left">{t(`${SCOPE}.align.left`)}</Select.Option>
          <Select.Option value="center">
            {t(`${SCOPE}.align.center`)}
          </Select.Option>
          <Select.Option value="right">
            {t(`${SCOPE}.align.right`)}
          </Select.Option>
        </Select>
      ),
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
  ],
});

function TextJaEn({
  ja = textJaEnDefaultProps.ja,
  jaSize = textJaEnDefaultProps.jaSize,
  jaWeight = textJaEnDefaultProps.jaWeight,
  jaSpacing = textJaEnDefaultProps.jaSpacing,
  jaLineGap = textJaEnDefaultProps.jaLineGap,
  en = textJaEnDefaultProps.en,
  enSize = textJaEnDefaultProps.enSize,
  enWeight = textJaEnDefaultProps.enWeight,
  enSpacing = textJaEnDefaultProps.enSpacing,
  enLineGap = textJaEnDefaultProps.enLineGap,
  align = "left",
  foreground = textJaEnDefaultProps.foreground,
  background = textJaEnDefaultProps.background,
}: TextJaEnProps) {
  return (
    <TextRenderer
      background={background}
      align={align}
      blocks={[
        {
          text: ja,
          size: jaSize ?? 26,
          weight: jaWeight ?? 700,
          spacing: jaSpacing ?? 0,
          lineGap: jaLineGap ?? 2,
          family: "zh",
          color: foreground,
        },
        {
          text: en,
          size: enSize ?? 13,
          weight: enWeight ?? 500,
          spacing: enSpacing ?? 0,
          lineGap: enLineGap ?? 1,
          family: "en",
          color: foreground,
        },
      ]}
    />
  );
}

TextJaEn.getEditorConfig = (t: (key: string) => string) =>
  textJaEnEditorConfig(t);

export default TextJaEn;
