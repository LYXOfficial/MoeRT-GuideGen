import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import TextRenderer from "./define/TextRenderer";
import { langFormItems } from "./define/textForms";
import { backgroundFormItems, foregroundFormItem } from "./Background";

/** TextJa —— 纯日语一块（站名、方面、设施名等） */
export interface TextJaProps {
  ja: string;
  jaSize?: number;
  jaWeight?: number;
  jaSpacing?: number;
  jaLineGap?: number;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}

export const textJaDefaultProps: TextJaProps = {
  ja: "国会議事堂方面",
  jaSize: 24,
  jaWeight: 700,
  jaSpacing: 0,
  jaLineGap: 2,
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
};

const SCOPE = "themes.tokyo-metro.components.TextJa.props";

export const textJaEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    ...langFormItems(t, SCOPE, "ja"),
    {
      key: "align",
      label: `${SCOPE}.align.displayName`,
      element: (
        <Select>
          <Select.Option value="left">
            {t(`${SCOPE}.align.left`)}
          </Select.Option>
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

function TextJa({
  ja = textJaDefaultProps.ja,
  jaSize = textJaDefaultProps.jaSize,
  jaWeight = textJaDefaultProps.jaWeight,
  jaSpacing = textJaDefaultProps.jaSpacing,
  jaLineGap = textJaDefaultProps.jaLineGap,
  align = "left",
  foreground = textJaDefaultProps.foreground,
  background = textJaDefaultProps.background,
}: TextJaProps) {
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
      ]}
    />
  );
}

TextJa.getEditorConfig = (t: (key: string) => string) => textJaEditorConfig(t);

export default TextJa;
