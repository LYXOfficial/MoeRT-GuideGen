import { Select, Switch } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { fontFamilyEn, fontFamilyZh } from "./define/colors";
import { langFormItems } from "./define/textForms";
import { backgroundFormItems, foregroundFormItem } from "./Background";

/**
 * TextQuad —— 四语块（日 / 英 / 中 / 韩）。
 *
 * 每个语种的字号、字重、字距、行距都独立；**空着的语种整块塌陷**，
 * 不会留下空行（现场很多牌只印了其中两三语）。
 */
export interface TextQuadProps {
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
  zh: string;
  zhSize?: number;
  zhWeight?: number;
  zhSpacing?: number;
  zhLineGap?: number;
  ko: string;
  koSize?: number;
  koWeight?: number;
  koSpacing?: number;
  koLineGap?: number;
  /** 中文与韩文是否排在同一行（现场多数牌是同一行；可关掉各自独占一行） */
  zhkoSameLine?: boolean;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}

export const textQuadDefaultProps: TextQuadProps = {
  ja: "国会議事堂方面",
  jaSize: 20,
  jaWeight: 700,
  jaSpacing: 0,
  jaLineGap: 2,
  en: "National Diet Bldg.",
  enSize: 11,
  enWeight: 500,
  enSpacing: 0,
  enLineGap: 1,
  zh: "国会议事堂方向",
  zhSize: 11,
  zhWeight: 500,
  zhSpacing: 0,
  zhLineGap: 1,
  ko: "국회의사당 방면",
  koSize: 11,
  koWeight: 500,
  koSpacing: 0,
  koLineGap: 1,
  zhkoSameLine: true,
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
};

const SCOPE = "themes.tokyo-metro.components.TextQuad.props";

export const textQuadEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    ...langFormItems(t, SCOPE, "ja"),
    ...langFormItems(t, SCOPE, "en"),
    ...langFormItems(t, SCOPE, "zh"),
    ...langFormItems(t, SCOPE, "ko"),
    {
      key: "zhkoSameLine",
      label: `${SCOPE}.zhkoSameLine`,
      element: <Switch size="small" />,
    },
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

function TextQuad(props: TextQuadProps) {
  const {
    ja = textQuadDefaultProps.ja,
    jaSize = textQuadDefaultProps.jaSize,
    jaWeight = textQuadDefaultProps.jaWeight,
    jaSpacing = textQuadDefaultProps.jaSpacing,
    jaLineGap = textQuadDefaultProps.jaLineGap,
    en = textQuadDefaultProps.en,
    enSize = textQuadDefaultProps.enSize,
    enWeight = textQuadDefaultProps.enWeight,
    enSpacing = textQuadDefaultProps.enSpacing,
    enLineGap = textQuadDefaultProps.enLineGap,
    zh = textQuadDefaultProps.zh,
    zhSize = textQuadDefaultProps.zhSize,
    zhWeight = textQuadDefaultProps.zhWeight,
    zhSpacing = textQuadDefaultProps.zhSpacing,
    zhLineGap = textQuadDefaultProps.zhLineGap,
    ko = textQuadDefaultProps.ko,
    koSize = textQuadDefaultProps.koSize,
    koWeight = textQuadDefaultProps.koWeight,
    koSpacing = textQuadDefaultProps.koSpacing,
    koLineGap = textQuadDefaultProps.koLineGap,
    zhkoSameLine = true,
    align = "left",
    foreground = textQuadDefaultProps.foreground,
    background = textQuadDefaultProps.background,
  } = props;

  const justifyContent =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  // 现场牌的四语块是：日语一行 / 英语一行 / **中文与韩文同一行**（都较短）。
  // 所以中文、韩文不各自占一行，而是并排放在最后一行；任一为空就只留另一个。
  const bottom = [
    { text: zh, size: zhSize, weight: zhWeight, spacing: zhSpacing, gap: zhLineGap },
    { text: ko, size: koSize, weight: koWeight, spacing: koSpacing, gap: koLineGap },
  ].filter(b => (b.text ?? "").trim().length > 0);

  const line = (
    text: string,
    size: number,
    weight: number,
    spacing: number,
    gap: number,
    family: "zh" | "en" = "zh"
  ) => {
    if ((text ?? "").trim().length === 0) return null;
    const fam = family === "en" ? fontFamilyEn : fontFamilyZh;
    // 折行宽度已砍掉；需要多行就在 TextArea 里回车
    const lines = (text ?? "").split("\n");
    return (
      <div style={{ color: foreground }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: size,
              fontWeight: weight,
              letterSpacing: spacing,
              lineHeight: `${size + gap}px`,
              whiteSpace: "nowrap",
              fontFamily: fam,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="flex h-16 flex-col justify-center"
      style={{ backgroundColor: background, paddingLeft: 2, paddingRight: 2, alignItems: justifyContent }}
    >
      {line(ja, jaSize ?? 20, jaWeight ?? 700, jaSpacing ?? 0, jaLineGap ?? 2, "zh")}
      {line(en, enSize ?? 11, enWeight ?? 500, enSpacing ?? 0, enLineGap ?? 1, "en")}
      {bottom.length > 0 && (
        <div
          style={{
            display: "flex",
            // 关掉「中韩同排」时改成竖排，各自独占一行
            flexDirection: zhkoSameLine ? "row" : "column",
            gap: zhkoSameLine ? 10 : 0,
            alignItems: "baseline",
          }}
        >
          {bottom.map((b, i) => (
            <span
              key={i}
              style={{
                fontSize: b.size,
                fontWeight: b.weight,
                letterSpacing: b.spacing,
                lineHeight: `${(b.size ?? 11) + (b.gap ?? 1)}px`,
                whiteSpace: "nowrap",
                color: foreground,
              }}
            >
              {b.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

TextQuad.getEditorConfig = (t: (key: string) => string) =>
  textQuadEditorConfig(t);

export default TextQuad;
