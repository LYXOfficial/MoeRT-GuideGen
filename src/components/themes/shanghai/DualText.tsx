import { useMemo } from "react";
import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import { normalizeSvgLine } from "../../../utils/svgText";
import {
  measureText,
  useFontsReady,
  weightCss,
  type TextWeight,
} from "./define/text";
import { EDGE_PAD, ROW_H } from "./define/layout";

/**
 * 双行文本（出口信息组合里的「老沪闵路 / Laohumin Rd.」这一类）。
 *
 * 结构与成都主题的站名组件一致：中文一行、英文一行，整体居中对齐；
 * 但字号小一圈（成都 24/14 → 上海 20/11），因为上海的双语信息块
 * 在标准图 54 里只占牌面很小一块（中文 ink ≈ 0.09H）。
 */
export interface DualTextProps {
  chinese: string;
  english: string;
  align?: "left" | "center" | "right";
  weight?: TextWeight;
  letterSpacing?: number;
  fontSizeZh?: number;
  fontSizeEn?: number;
  /** 中英之间空隙（px） */
  lineGap?: number;
  offsetY?: number;
  foreground?: string;
  background?: string;
  background2?: string;
}

export const dualTextDefaultProps: DualTextProps = {
  chinese: "老沪闵路",
  english: "Laohumin Rd.",
  align: "center",
  weight: "medium",
  letterSpacing: 0,
  fontSizeZh: 20,
  fontSizeEn: 11,
  lineGap: 2,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.transparent,
  background2: colors.transparent,
};

const clamp = (v: unknown, min: number, max: number, fb: number) => {
  const n = Number(v);
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fb));
};

export const dualTextEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.shanghai.components.DualText.props.chinese",
      element: <TextArea autosize={{ minRows: 1, maxRows: 2 }} />,
    },
    {
      key: "english",
      label: "themes.shanghai.components.DualText.props.english",
      element: <TextArea autosize={{ minRows: 1, maxRows: 2 }} />,
    },
    {
      key: "weight",
      label: "themes.shanghai.components.DualText.props.weight.displayName",
      element: (
        <Select>
          <Select.Option value="normal">
            {t("themes.shanghai.common.weight.normal")}
          </Select.Option>
          <Select.Option value="medium">
            {t("themes.shanghai.common.weight.medium")}
          </Select.Option>
          <Select.Option value="bold">
            {t("themes.shanghai.common.weight.bold")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "align",
      label: "themes.shanghai.components.DualText.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.shanghai.common.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.shanghai.common.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.shanghai.common.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "letterSpacing",
      label: "themes.shanghai.components.DualText.props.letterSpacing",
      element: <InputNumber step={0.01} min={-0.1} max={0.5} />,
    },
    {
      key: "fontSizeZh",
      label: "themes.shanghai.components.DualText.props.fontSizeZh",
      element: <InputNumber step={1} min={8} max={64} />,
    },
    {
      key: "fontSizeEn",
      label: "themes.shanghai.components.DualText.props.fontSizeEn",
      element: <InputNumber step={1} min={6} max={48} />,
    },
    {
      key: "lineGap",
      label: "themes.shanghai.components.DualText.props.lineGap",
      element: <InputNumber step={1} min={0} max={24} />,
    },
    {
      key: "offsetY",
      label: "themes.shanghai.components.DualText.props.offsetY",
      element: <InputNumber step={1} min={-32} max={32} />,
    },
    foregroundFormItem("themes.shanghai.components.DualText.props"),
    ...backgroundFormItems("themes.shanghai.components.DualText.props"),
  ],
});

export default function DualText({
  chinese = dualTextDefaultProps.chinese,
  english = dualTextDefaultProps.english,
  align = dualTextDefaultProps.align,
  weight = dualTextDefaultProps.weight,
  letterSpacing = dualTextDefaultProps.letterSpacing,
  fontSizeZh = dualTextDefaultProps.fontSizeZh,
  fontSizeEn = dualTextDefaultProps.fontSizeEn,
  lineGap = dualTextDefaultProps.lineGap,
  offsetY = dualTextDefaultProps.offsetY,
  foreground = dualTextDefaultProps.foreground,
  background = dualTextDefaultProps.background,
  background2 = dualTextDefaultProps.background2,
}: DualTextProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "medium");
  const zhSize = clamp(fontSizeZh, 8, 64, 20);
  const enSize = clamp(fontSizeEn, 6, 48, 11);
  const gap = Math.max(0, Number(lineGap) || 0);
  const dy = Number(offsetY) || 0;
  const ls = Number(letterSpacing) || 0;

  const layout = useMemo(() => {
    const zh = normalizeSvgLine(chinese);
    const en = normalizeSvgLine(english);
    const zhFont = `${weightValue} ${zhSize}px ${fontFamilyZh}`;
    const enFont = `${weightValue} ${enSize}px ${fontFamilyEn}`;
    const width = Math.max(
      measureText(zh, zhFont) +
        ls * zhSize * Math.max(0, Array.from(zh).length - 1),
      measureText(en, enFont) +
        ls * enSize * Math.max(0, Array.from(en).length - 1)
    );
    const zhInk = zhSize * 0.88;
    const enCap = enSize * 0.716;
    const inkH = zhInk + gap + enCap + enSize * 0.25;
    const top = (ROW_H - inkH) / 2 + dy;
    return {
      zh,
      en,
      width: Math.max(1, Math.ceil(width)),
      zhBaseline: top + zhInk,
      enBaseline: top + zhInk + gap + enCap,
    };
  }, [
    chinese,
    english,
    zhSize,
    enSize,
    gap,
    dy,
    ls,
    weightValue,
    fontsReady,
  ]);

  const anchor =
    align === "center" ? "middle" : align === "right" ? "end" : "start";
  const groupX =
    align === "center"
      ? layout.width / 2
      : align === "right"
        ? layout.width
        : 0;

  return (
    <MultiRowBackground
      background={background}
      background2={background2}
      style={{ height: ROW_H, width: layout.width + EDGE_PAD * 2 }}
    >
      <svg
        width={layout.width + EDGE_PAD * 2}
        height={ROW_H}
        style={{ display: "block" }}
      >
        <g transform={`translate(${groupX + EDGE_PAD}, 0)`} textAnchor={anchor}>
          <text
            fontSize={zhSize}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={fontFamilyZh}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
            y={layout.zhBaseline}
            x={0}
          >
            {layout.zh}
          </text>
          <text
            fontSize={enSize}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={fontFamilyEn}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
            y={layout.enBaseline}
            x={0}
          >
            {layout.en}
          </text>
        </g>
      </svg>
    </MultiRowBackground>
  );
}

DualText.getEditorConfig = (t: (key: string) => string) =>
  dualTextEditorConfig(t);
