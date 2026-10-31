import { useMemo } from "react";
import { Input, InputNumber, Select } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
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
 * 数字 / 字母（标准图 54 出入口信息组合里那个大「3」、图 43 的「3 号口」）。
 *
 * 版式实测（图 43：数字 ink 301 / 牌面高 430 = 0.70H）：
 *  - 默认字号 62px（Helvetica 数字 cap ≈ 0.717em → ink 44.5px，正好塞满 64px 行）
 *  - 左右只留 1px，和别的元素压接缝时不会被盖住
 */
export interface NumAlphabetProps {
  value: string;
  weight?: TextWeight;
  fontWeight?: number;
  fontSize?: number;
  /** 字距（em） */
  letterSpacing?: number;
  offsetY?: number;
  foreground?: string;
  background?: string;
}

export const numAlphabetDefaultProps: NumAlphabetProps = {
  value: "3",
  weight: "normal",
  fontWeight: 400,
  fontSize: 62,
  letterSpacing: 0,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.transparent,
};

const SIZE_MIN = 8;
const SIZE_MAX = 96;

const clamp = (v: unknown, min: number, max: number, fb: number) => {
  const n = Number(v);
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fb));
};

export const numAlphabetEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "value",
      label: "themes.shanghai.components.NumAlphabet.props.value",
      element: <Input />,
    },
    {
      key: "weight",
      label: "themes.shanghai.components.NumAlphabet.props.weight.displayName",
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
      key: "fontSize",
      label: "themes.shanghai.components.NumAlphabet.props.fontSize",
      element: <InputNumber step={1} min={SIZE_MIN} max={SIZE_MAX} />,
    },
    {
      key: "letterSpacing",
      label: "themes.shanghai.components.NumAlphabet.props.letterSpacing",
      element: <InputNumber step={0.01} min={-0.1} max={0.5} />,
    },
    {
      key: "offsetY",
      label: "themes.shanghai.components.NumAlphabet.props.offsetY",
      element: <InputNumber step={1} min={-32} max={32} />,
    },
    foregroundFormItem("themes.shanghai.components.NumAlphabet.props"),
    ...backgroundFormItems("themes.shanghai.components.NumAlphabet.props"),
  ],
});

export default function NumAlphabet({
  value = numAlphabetDefaultProps.value,
  weight = numAlphabetDefaultProps.weight,
  fontSize = numAlphabetDefaultProps.fontSize,
  letterSpacing = numAlphabetDefaultProps.letterSpacing,
  offsetY = numAlphabetDefaultProps.offsetY,
  foreground = numAlphabetDefaultProps.foreground,
  background = numAlphabetDefaultProps.background,
}: NumAlphabetProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "normal");
  const size = clamp(fontSize, SIZE_MIN, SIZE_MAX, 62);
  const dy = Number(offsetY) || 0;
  const ls = Number(letterSpacing) || 0;

  const layout = useMemo(() => {
    const text = normalizeSvgLine(value);
    const font = `${weightValue} ${size}px ${fontFamilyEn}`;
    const width = Math.max(
      1,
      Math.ceil(
        measureText(text, font) +
          ls * size * Math.max(0, Array.from(text).length - 1)
      )
    );
    const cap = size * 0.717;
    const baseline = (ROW_H - cap) / 2 + cap + dy;
    return { text, width, baseline };
  }, [value, size, dy, ls, weightValue, fontsReady]);

  return (
    <MultiRowBackground
      background={background}
      style={{ height: ROW_H, width: layout.width + EDGE_PAD * 2 }}
    >
      <svg
        width={layout.width + EDGE_PAD * 2}
        height={ROW_H}
        style={{ display: "block" }}
      >
        <text
          x={EDGE_PAD}
          y={layout.baseline}
          fontSize={size}
          fontWeight={weightValue}
          fill={foreground}
          fontFamily={fontFamilyEn}
          letterSpacing={`${ls}em`}
          xmlSpace="preserve"
        >
          {layout.text}
        </text>
      </svg>
    </MultiRowBackground>
  );
}

NumAlphabet.getEditorConfig = (t: (key: string) => string) =>
  numAlphabetEditorConfig(t);
