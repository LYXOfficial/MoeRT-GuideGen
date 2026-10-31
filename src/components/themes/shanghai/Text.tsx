import { useMemo } from "react";
import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import { normalizeSvgLines } from "../../../utils/svgText";
import {
  measureText,
  useFontsReady,
  weightCss,
  type TextWeight,
} from "./define/text";
import { EDGE_PAD, ROW_H } from "./define/layout";

/**
 * 中英文字（上海主题的通用文字组件）。
 *
 * 版式取自标准图 3／图 4／图 27（内发光牌与墙面信息带）：
 *  - 中文 28px、英文 13px（图 43 实测：中文 ink 164/430 ≈ 0.38H → 字号 0.43H ≈ 28px；
 *    英文 cap 60/430 ≈ 0.14H → 字号 ≈ 13px）
 *  - 中文在上、英文在下，英文默认与中文左对齐
 *  - 只认用户在 TextArea 里敲的换行，不按宽度自动折行
 *  - 左右只留 1px：与相邻元素靠 margin -1px 压接缝时不会盖到字形
 */
export interface TextProps {
  chinese: string;
  english: string;
  align?: "left" | "center" | "right";
  weight?: TextWeight;
  /** 字距（em） */
  letterSpacing?: number;
  fontSizeZh?: number;
  fontSizeEn?: number;
  /** 中英之间空隙（px） */
  lineGap?: number;
  /** 整体上下偏移（px，正数向下） */
  offsetY?: number;
  foreground?: string;
  background?: string;
  background2?: string;
}

export const textDefaultProps: TextProps = {
  chinese: "出口",
  english: "Exit",
  align: "left",
  weight: "medium",
  letterSpacing: 0,
  fontSizeZh: 28,
  fontSizeEn: 13,
  lineGap: 4,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.transparent,
  background2: colors.transparent,
};

const ZH_MIN = 8;
const ZH_MAX = 64;
const EN_MIN = 6;
const EN_MAX = 48;
const LS_MAX = 0.5;

const clamp = (v: unknown, min: number, max: number, fb: number) => {
  const n = Number(v);
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fb));
};

export const textEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.shanghai.components.Text.props.chinese",
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "english",
      label: "themes.shanghai.components.Text.props.english",
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "weight",
      label: "themes.shanghai.components.Text.props.weight.displayName",
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
      label: "themes.shanghai.components.Text.props.align.displayName",
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
      label: "themes.shanghai.components.Text.props.letterSpacing",
      element: <InputNumber step={0.01} min={-0.1} max={LS_MAX} />,
    },
    {
      key: "fontSizeZh",
      label: "themes.shanghai.components.Text.props.fontSizeZh",
      element: <InputNumber step={1} min={ZH_MIN} max={ZH_MAX} />,
    },
    {
      key: "fontSizeEn",
      label: "themes.shanghai.components.Text.props.fontSizeEn",
      element: <InputNumber step={1} min={EN_MIN} max={EN_MAX} />,
    },
    {
      key: "lineGap",
      label: "themes.shanghai.components.Text.props.lineGap",
      element: <InputNumber step={1} min={0} max={40} />,
    },
    {
      key: "offsetY",
      label: "themes.shanghai.components.Text.props.offsetY",
      element: <InputNumber step={1} min={-32} max={32} />,
    },
    foregroundFormItem("themes.shanghai.components.Text.props"),
    ...backgroundFormItems("themes.shanghai.components.Text.props"),
  ],
});

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  weight = textDefaultProps.weight,
  letterSpacing = textDefaultProps.letterSpacing,
  fontSizeZh = textDefaultProps.fontSizeZh,
  fontSizeEn = textDefaultProps.fontSizeEn,
  lineGap = textDefaultProps.lineGap,
  offsetY = textDefaultProps.offsetY,
  foreground = textDefaultProps.foreground,
  background = textDefaultProps.background,
  background2 = textDefaultProps.background2,
}: TextProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "medium");
  const zhSize = clamp(fontSizeZh, ZH_MIN, ZH_MAX, 28);
  const enSize = clamp(fontSizeEn, EN_MIN, EN_MAX, 13);
  const gap = Math.max(0, Number(lineGap) || 0);
  const dy = Number(offsetY) || 0;
  const ls = Number(letterSpacing) || 0;

  const layout = useMemo(() => {
    const zhLines = normalizeSvgLines(chinese);
    const enLines = normalizeSvgLines(english);
    const zhFont = `${weightValue} ${zhSize}px ${fontFamilyZh}`;
    const enFont = `${weightValue} ${enSize}px ${fontFamilyEn}`;
    const widthOf = (lines: string[], font: string, size: number) =>
      Math.max(
        0,
        ...lines.map(
          line =>
            measureText(line, font) +
            ls * size * Math.max(0, Array.from(line).length - 1)
        )
      );
    const width = Math.max(
      widthOf(zhLines, zhFont, zhSize),
      widthOf(enLines, enFont, enSize)
    );
    // 行距：中文 1.05em、英文 1.2em（拉丁 ink ≈0.97em）
    const zhStep = zhSize * 1.05;
    const enStep = enSize * 1.2;
    const zhInk = zhSize * 0.88;
    const enCap = enSize * 0.716;
    const enDesc = enSize * 0.25;
    const inkH =
      (zhLines.length - 1) * zhStep +
      zhInk +
      gap +
      (enLines.length - 1) * enStep +
      enCap +
      enDesc;
    const top = (ROW_H - inkH) / 2 + dy;
    return {
      zhLines,
      enLines,
      width: Math.max(1, Math.ceil(width)),
      zhStep,
      enStep,
      inkH,
      top,
      zhInk,
      enCap,
      zhFont,
      enFont,
    };
  }, [chinese, english, zhSize, enSize, gap, dy, ls, weightValue, fontsReady]);

  const anchor =
    align === "center" ? "middle" : align === "right" ? "end" : "start";
  const groupX =
    align === "center"
      ? layout.width / 2
      : align === "right"
        ? layout.width
        : 0;
  const zhStart = layout.top + layout.zhInk;
  const enStart =
    zhStart + (layout.zhLines.length - 1) * layout.zhStep + gap + layout.enCap;

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
        <g
          transform={`translate(${groupX + EDGE_PAD}, 0)`}
          textAnchor={anchor}
        >
          <text
            fontSize={zhSize}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={fontFamilyZh}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
          >
            {layout.zhLines.map((line, index) => (
              <tspan
                key={index}
                x={0}
                y={zhStart + index * layout.zhStep}
              >
                {line}
              </tspan>
            ))}
          </text>
          <text
            fontSize={enSize}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={fontFamilyEn}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
          >
            {layout.enLines.map((line, index) => (
              <tspan
                key={index}
                x={0}
                y={enStart + index * layout.enStep}
              >
                {line}
              </tspan>
            ))}
          </text>
        </g>
      </svg>
    </MultiRowBackground>
  );
}

Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
