import { useMemo } from "react";
import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
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
 * 英文大字（标准图 42「KANGXIN HIGHWAY STATION」那段）。
 *
 * 版式实测（图 43 英文站名 ink 98/430，含下伸部）：
 *  - 默认字号 15px（0.235H）
 *  - 可换行、可调行距 / 对齐 / 字距 / 字重 / 上下偏移
 *  - 默认字距 0.01em，略大于中英文字组件
 */
export interface BigEnProps {
  english: string;
  align?: "left" | "center" | "right";
  weight?: TextWeight;
  /** 字距（em） */
  letterSpacing?: number;
  fontSize?: number;
  /** 行距倍数（× 字号） */
  lineHeight?: number;
  offsetY?: number;
  foreground?: string;
  background?: string;
  background2?: string;
}

export const bigEnDefaultProps: BigEnProps = {
  english: "KANGXIN HIGHWAY STATION",
  align: "left",
  weight: "medium",
  letterSpacing: 0.01,
  fontSize: 15,
  lineHeight: 1.2,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.transparent,
  background2: colors.transparent,
};

const SIZE_MIN = 6;
const SIZE_MAX = 64;
const EN_CAP = 0.716;
const EN_DESC = 0.25;

const clamp = (v: unknown, min: number, max: number, fb: number) => {
  const n = Number(v);
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fb));
};

export const bigEnEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "english",
      label: "themes.shanghai.components.BigEn.props.english",
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "weight",
      label: "themes.shanghai.components.BigEn.props.weight.displayName",
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
      label: "themes.shanghai.components.BigEn.props.align.displayName",
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
      label: "themes.shanghai.components.BigEn.props.letterSpacing",
      element: <InputNumber step={0.005} min={-0.05} max={0.5} />,
    },
    {
      key: "fontSize",
      label: "themes.shanghai.components.BigEn.props.fontSize",
      element: <InputNumber step={1} min={SIZE_MIN} max={SIZE_MAX} />,
    },
    {
      key: "lineHeight",
      label: "themes.shanghai.components.BigEn.props.lineHeight",
      element: <InputNumber step={0.01} min={0.8} max={2} />,
    },
    {
      key: "offsetY",
      label: "themes.shanghai.components.BigEn.props.offsetY",
      element: <InputNumber step={1} min={-32} max={32} />,
    },
    foregroundFormItem("themes.shanghai.components.BigEn.props"),
    ...backgroundFormItems("themes.shanghai.components.BigEn.props"),
  ],
});

export default function BigEn({
  english = bigEnDefaultProps.english,
  align = bigEnDefaultProps.align,
  weight = bigEnDefaultProps.weight,
  letterSpacing = bigEnDefaultProps.letterSpacing,
  fontSize = bigEnDefaultProps.fontSize,
  lineHeight = bigEnDefaultProps.lineHeight,
  offsetY = bigEnDefaultProps.offsetY,
  foreground = bigEnDefaultProps.foreground,
  background = bigEnDefaultProps.background,
  background2 = bigEnDefaultProps.background2,
}: BigEnProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "medium");
  const size = clamp(fontSize, SIZE_MIN, SIZE_MAX, 15);
  const lh = clamp(lineHeight, 0.8, 2, 1.2);
  const dy = Number(offsetY) || 0;
  const ls = Number(letterSpacing) || 0;

  const layout = useMemo(() => {
    const lines = normalizeSvgLines(english);
    const font = `${weightValue} ${size}px ${fontFamilyEn}`;
    const width = Math.max(
      0,
      ...lines.map(
        line =>
          measureText(line, font) +
          ls * size * Math.max(0, Array.from(line).length - 1)
      )
    );
    const step = size * lh;
    const cap = size * EN_CAP;
    const inkH = (lines.length - 1) * step + cap + size * EN_DESC;
    // 以「cap 顶」对齐：首行基线 = 顶部 + cap
    const top = (ROW_H - inkH) / 2 + dy;
    return { lines, width: Math.max(1, Math.ceil(width)), step, cap, top, font };
  }, [english, size, lh, dy, ls, weightValue, fontsReady]);

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
            fontSize={size}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={fontFamilyEn}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
          >
            {layout.lines.map((line, index) => (
              <tspan
                key={index}
                x={0}
                y={layout.top + layout.cap + index * layout.step}
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

BigEn.getEditorConfig = (t: (key: string) => string) => bigEnEditorConfig(t);
