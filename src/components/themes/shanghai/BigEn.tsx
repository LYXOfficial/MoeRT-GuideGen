import { useMemo } from "react";
import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import { normalizeSvgLines } from "../../../utils/svgText";
import {
  inkShift,
  measureInk,
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
 *  - 上下按**真实墨迹**（actualBoundingBoxAscent/Descent）居中，offsetY=0 时视觉正中
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
}

export const bigEnDefaultProps: BigEnProps = {
  english: "HONGQIAO INTERNATIONAL\n AIRPORT TERMINAL 2",
  align: "left",
  weight: "medium",
  letterSpacing: 0.01,
  fontSize: 15,
  lineHeight: 1.2,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.transparent,
};

const SIZE_MIN = 6;
const SIZE_MAX = 64;
const SCOPE = "themes.shanghai.components.BigEn.props";

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
      label: `${SCOPE}.english`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "weight",
      label: `${SCOPE}.weight.displayName`,
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
      label: `${SCOPE}.align.displayName`,
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
      label: `${SCOPE}.letterSpacing`,
      element: <InputNumber step={0.005} min={-0.05} max={0.5} />,
    },
    {
      key: "fontSize",
      label: `${SCOPE}.fontSize`,
      element: <InputNumber step={1} min={SIZE_MIN} max={SIZE_MAX} />,
    },
    {
      key: "lineHeight",
      label: `${SCOPE}.lineHeight`,
      element: <InputNumber step={0.01} min={0.8} max={2} />,
    },
    {
      key: "offsetY",
      label: `${SCOPE}.offsetY`,
      element: <InputNumber step={1} min={-32} max={32} />,
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
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
}: BigEnProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "medium");
  const size = clamp(fontSize, SIZE_MIN, SIZE_MAX, 15);
  const lh = clamp(lineHeight, 0.8, 2, 1.2);
  const dy = Number(offsetY) || 0;
  const ls = Number(letterSpacing) || 0;
  const alignMode = align ?? "left";

  const layout = useMemo(() => {
    const lines = normalizeSvgLines(english);
    const font = `${weightValue} ${size}px ${fontFamilyEn}`;
    const metrics = lines.map(line => measureInk(line, font, ls, size));
    const width = Math.max(
      1,
      Math.ceil(Math.max(0, ...metrics.map(m => m.inkWidth)))
    );
    const step = size * lh;
    const ascent = Math.max(0, ...metrics.map(m => m.inkAscent));
    const descent = Math.max(0, ...metrics.map(m => m.inkDescent));
    const inkH = (lines.length - 1) * step + ascent + descent;
    const top = (ROW_H - inkH) / 2 + dy;
    return lines.map((line, i) => ({
      line,
      x: inkShift(metrics[i], width, alignMode) + EDGE_PAD,
      y: top + ascent + i * step,
      width,
    }));
  }, [english, size, lh, dy, ls, weightValue, alignMode, fontsReady]);

  const boxW = layout[0]?.width ?? 1;

  return (
    <BackgroundBox
      background={background}
      style={{ height: ROW_H, width: boxW + EDGE_PAD * 2 }}
    >
      <svg
        width={boxW + EDGE_PAD * 2}
        height={ROW_H}
        style={{ display: "block" }}
      >
        {layout.map((p, index) => (
          <text
            key={index}
            x={p.x}
            y={p.y}
            fontSize={size}
            fontWeight={weightValue}
            fill={foreground}
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

BigEn.getEditorConfig = (t: (key: string) => string) => bigEnEditorConfig(t);
