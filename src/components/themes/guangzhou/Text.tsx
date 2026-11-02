import { useMemo } from "react";
import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  colorFormItem,
} from "./Background";
import { normalizeSvgLines } from "../../../utils/svgText";
import {
  inkShift,
  measureInk,
  useFontsReady,
  weightCss,
  type TextWeight,
} from "./define/text";
import { ROW_H } from "./define/layout";

/** 文字左右各留 3px（用户 2026-11-03 要求） */
const SIDE_PAD = 5;

/**
 * 中英文字（广州主题的通用文字组件）。
 *
 * 照上海那套做（用户 2026-11-03：「补偿你应该照着别的的做，它们是对的」）：
 * 用 SVG `<text>` 绘制，横向位置由 canvas 的 actualBoundingBox 求出**墨迹**边界，
 * 再按 align 把墨迹贴到左/右/中线——中英 side bearing 不同也不会互相探出去。
 * 不按宽度自动折行，换行用 TextArea 回车；空格用 xmlSpace="preserve" 原样保留。
 */
export interface TextProps {
  zh?: string;
  en?: string;
  align?: "left" | "center" | "right";
  weight?: TextWeight;
  /** 字距（em） */
  letterSpacing?: number;
  fontSizeZh?: number;
  fontSizeEn?: number;
  /** 中英之间空隙（px） */
  gap?: number;
  fill?: string;
  background?: string;
}

export const textDefaultProps: TextProps = {
  zh: "出口",
  en: "Exit",
  align: "left",
  weight: "normal",
  letterSpacing: 0,
  fontSizeZh: 25,
  fontSizeEn: 11,
  gap: 3,
  fill: colors.foreground,
  background: colors.transparent,
};

const ZH_MIN = 8;
const ZH_MAX = 64;
const EN_MIN = 6;
const EN_MAX = 48;
const SCOPE = "themes.guangzhou.components.Text.props";

const clamp = (v: unknown, min: number, max: number, fb: number) => {
  const n = Number(v);
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fb));
};

export const textEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "zh",
      label: `${SCOPE}.zh`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "en",
      label: `${SCOPE}.en`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "weight",
      label: `${SCOPE}.weight.displayName`,
      element: (
        <Select>
          <Select.Option value="normal">
            {t("themes.guangzhou.common.weight.normal")}
          </Select.Option>
          <Select.Option value="medium">
            {t("themes.guangzhou.common.weight.medium")}
          </Select.Option>
          <Select.Option value="bold">
            {t("themes.guangzhou.common.weight.bold")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "align",
      label: `${SCOPE}.align.displayName`,
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.guangzhou.common.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.guangzhou.common.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.guangzhou.common.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "letterSpacing",
      label: `${SCOPE}.letterSpacing`,
      element: <InputNumber step={0.01} min={-0.1} max={0.5} />,
    },
    {
      key: "fontSizeZh",
      label: `${SCOPE}.fontSizeZh`,
      element: <InputNumber step={1} min={ZH_MIN} max={ZH_MAX} />,
    },
    {
      key: "fontSizeEn",
      label: `${SCOPE}.fontSizeEn`,
      element: <InputNumber step={1} min={EN_MIN} max={EN_MAX} />,
    },
    {
      key: "gap",
      label: `${SCOPE}.gap`,
      element: <InputNumber step={1} min={0} max={40} />,
    },
    colorFormItem(SCOPE, "fill"),
    ...backgroundFormItems(SCOPE),
  ],
});

export default function Text({
  zh = textDefaultProps.zh,
  en = textDefaultProps.en,
  align = textDefaultProps.align,
  weight = textDefaultProps.weight,
  letterSpacing = textDefaultProps.letterSpacing,
  fontSizeZh = textDefaultProps.fontSizeZh,
  fontSizeEn = textDefaultProps.fontSizeEn,
  gap = textDefaultProps.gap,
  fill = textDefaultProps.fill,
  background = textDefaultProps.background,
}: TextProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "normal");
  const zhSize = clamp(fontSizeZh, ZH_MIN, ZH_MAX, 18);
  const enSize = clamp(fontSizeEn, EN_MIN, EN_MAX, 9);
  const lineGap = Math.max(0, Number(gap) || 0);
  const ls = Number(letterSpacing) || 0;
  const alignMode = align ?? "left";

  const layout = useMemo(() => {
    const zhLines = normalizeSvgLines(zh);
    const enLines = normalizeSvgLines(en);
    const zhFont = `${weightValue} ${zhSize}px ${fontFamilyZh}`;
    const enFont = `${weightValue} ${enSize}px ${fontFamilyEn}`;
    const zhMetrics = zhLines.map(line => measureInk(line, zhFont, ls, zhSize));
    const enMetrics = enLines.map(line => measureInk(line, enFont, ls, enSize));
    const width = Math.max(
      1,
      Math.ceil(
        Math.max(
          0,
          ...zhMetrics.map(m => m.inkWidth),
          ...enMetrics.map(m => m.inkWidth)
        )
      )
    );
    const zhStep = zhSize * 1.05;
    const enStep = enSize * 1.2;
    const zhAscent = Math.max(0, ...zhMetrics.map(m => m.inkAscent));
    const zhDescent = Math.max(0, ...zhMetrics.map(m => m.inkDescent));
    const enAscent = Math.max(0, ...enMetrics.map(m => m.inkAscent));
    const enDescent = Math.max(0, ...enMetrics.map(m => m.inkDescent));
    const inkH =
      zhAscent +
      (zhLines.length - 1) * zhStep +
      zhDescent +
      lineGap +
      enAscent +
      (enLines.length - 1) * enStep +
      enDescent;
    const top = (ROW_H - inkH) / 2;
    const zhFirst = top + zhAscent;
    const enFirst =
      zhFirst + (zhLines.length - 1) * zhStep + zhDescent + lineGap + enAscent;
    return {
      width,
      zh: zhLines.map((line, i) => ({
        line,
        x: inkShift(zhMetrics[i], width, alignMode) + SIDE_PAD,
        y: zhFirst + i * zhStep,
      })),
      en: enLines.map((line, i) => ({
        line,
        x: inkShift(enMetrics[i], width, alignMode) + SIDE_PAD,
        y: enFirst + i * enStep,
      })),
    };
  }, [zh, en, zhSize, enSize, lineGap, ls, weightValue, alignMode, fontsReady]);

  return (
    <BackgroundBox
      background={background}
      style={{ height: ROW_H, width: layout.width + SIDE_PAD * 2 }}
    >
      <svg
        width={layout.width + SIDE_PAD * 2}
        height={ROW_H}
      >
        {layout.zh.map((p, index) => (
          <text
            key={`zh-${index}`}
            x={p.x}
            y={p.y}
            fontSize={zhSize}
            fontWeight={weightValue}
            fill={fill}
            fontFamily={fontFamilyZh}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
          >
            {p.line}
          </text>
        ))}
        {layout.en.map((p, index) => (
          <text
            key={`en-${index}`}
            x={p.x}
            y={p.y}
            fontSize={enSize}
            fontWeight={weightValue}
            fill={fill}
            fontFamily={fontFamilyEn}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
          >
            {p.line}
          </text>
        ))}
      </svg>
    </BackgroundBox>
  );
}

Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
