import { useMemo } from "react";
import { InputNumber, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
  colorFormItem,
} from "./Background";
import { PLATE_H, ROW_H } from "./define/layout";
import {
  measureText,
  useFontsReady,
  weightCss,
  type TextWeight,
} from "./define/text";
import { normalizeSvgLine } from "../../../utils/svgText";

/**
 * 文字线路标（附录 A 右列「线路名称及识别色在深灰底色上的表达」）。
 *
 * 版式：小圆角矩形（半径 ≈ 0.06 高）+ 白色描边，两行文字：
 * 中文在上、英文在下；磁浮线是上下两段色（青绿 / 橙），所以底色支持双色。
 * 白描边、圆角、两段色都按原始图形（磁浮线、市域线两块牌）实测：
 *  - 牌高 = 44.5px（与数字徽章同高，能并排贴合）
 *  - 中文 ≈ 20px、英文 ≈ 10px、左右内边距 6px
 */
export interface TextLineNumProps {
  chinese: string;
  english: string;
  /** 上段 / 单色线路色 */
  color1: string;
  /** 下段线路色（磁浮为橙色；留空则整块单色） */
  color2?: string;
  /** 文字颜色 */
  foreground?: string;
  /** 描边色 */
  border?: string;
  /** 圆角（px） */
  radius?: number;
  /** 牌高（px） */
  height?: number;
  fontSizeZh?: number;
  fontSizeEn?: number;
  /** 左右内边距（px） */
  paddingX?: number;
  weight?: TextWeight;
  /** 中英之间空隙（px） */
  lineGap?: number;
  background?: string;
}

export const textLineNumDefaultProps: TextLineNumProps = {
  chinese: "磁浮线",
  english: "Maglev Line",
  color1: colors.maglev1,
  color2: colors.maglev2,
  foreground: colors.white,
  border: colors.white,
  radius: 3,
  height: PLATE_H,
  fontSizeZh: 20,
  fontSizeEn: 10,
  paddingX: 6,
  weight: "medium",
  lineGap: 2,
  background: colors.transparent,
};

const SCOPE = "themes.shanghai.components.TextLineNum.props";

export const textLineNumEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: `${SCOPE}.chinese`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 1 }} />,
    },
    {
      key: "english",
      label: `${SCOPE}.english`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 2 }} />,
    },
    colorFormItem(SCOPE, "color1"),
    colorFormItem(SCOPE, "color2"),
    foregroundFormItem(SCOPE),
    colorFormItem(SCOPE, "border"),
    {
      key: "radius",
      label: `${SCOPE}.radius`,
      element: <InputNumber step={0.5} min={0} max={12} />,
    },
    {
      key: "height",
      label: `${SCOPE}.height`,
      element: <InputNumber step={0.5} min={24} max={64} />,
    },
    {
      key: "fontSizeZh",
      label: `${SCOPE}.fontSizeZh`,
      element: <InputNumber step={1} min={8} max={48} />,
    },
    {
      key: "fontSizeEn",
      label: `${SCOPE}.fontSizeEn`,
      element: <InputNumber step={1} min={6} max={32} />,
    },
    {
      key: "paddingX",
      label: `${SCOPE}.paddingX`,
      element: <InputNumber step={0.5} min={0} max={20} />,
    },
    {
      key: "lineGap",
      label: `${SCOPE}.lineGap`,
      element: <InputNumber step={1} min={0} max={16} />,
    },
    ...backgroundFormItems(SCOPE),
  ],
});

export default function TextLineNum({
  chinese = textLineNumDefaultProps.chinese,
  english = textLineNumDefaultProps.english,
  color1 = textLineNumDefaultProps.color1,
  color2 = textLineNumDefaultProps.color2,
  foreground = textLineNumDefaultProps.foreground,
  border = textLineNumDefaultProps.border,
  radius = textLineNumDefaultProps.radius,
  height = textLineNumDefaultProps.height,
  fontSizeZh = textLineNumDefaultProps.fontSizeZh,
  fontSizeEn = textLineNumDefaultProps.fontSizeEn,
  paddingX = textLineNumDefaultProps.paddingX,
  weight = textLineNumDefaultProps.weight,
  lineGap = textLineNumDefaultProps.lineGap,
  background = textLineNumDefaultProps.background,
}: TextLineNumProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "medium");
  const plateH = Math.min(64, Math.max(24, Number(height) || PLATE_H));
  const zhSize = Math.max(8, Math.min(48, Number(fontSizeZh) || 20));
  const enSize = Math.max(6, Math.min(32, Number(fontSizeEn) || 10));
  const pad = Math.max(0, Number(paddingX) || 0);
  const gap = Math.max(0, Number(lineGap) || 0);
  const r = Math.max(0, Math.min(12, Number(radius) || 0));
  const zh = normalizeSvgLine(chinese);
  const en = normalizeSvgLine(english);
  const zhFont = `${weightValue} ${zhSize}px ${fontFamilyZh}`;
  const enFont = `${weightValue} ${enSize}px ${fontFamilyEn}`;
  const plateW = useMemo(
    () =>
      Math.ceil(Math.max(measureText(zh, zhFont), measureText(en, enFont))) +
      pad * 2,
    [zh, en, zhFont, enFont, pad, fontsReady]
  );
  const gapX = 3;
  const boxW = plateW + gapX * 2;
  const top = (ROW_H - plateH) / 2;
  const zhInk = zhSize * 0.88;
  const enCap = enSize * 0.716;
  const enDesc = enSize * 0.25;
  const inkH = zhInk + gap + enCap + enDesc;
  const contentTop = top + (plateH - inkH) / 2;
  const zhBaseline = contentTop + zhInk;
  const enBaseline = zhBaseline + gap + enCap;

  const bands = color2 && color2 !== color1 ? [color1, color2] : [color1];
  const bg =
    bands.length === 1
      ? bands[0]
      : `linear-gradient(to bottom, ${bands[0]} 0% 50%, ${bands[1]} 50% 100%)`;

  return (
    <MultiRowBackground
      background={background}
      style={{ height: ROW_H, width: boxW }}
    >
      <div
        style={{
          position: "absolute",
          left: gapX,
          right: gapX,
          top,
          height: plateH,
          borderRadius: r,
          border: `1px solid ${border}`,
          background: bg,
          overflow: "hidden",
        }}
      >
        <svg width={plateW} height={plateH} style={{ display: "block" }}>
          <text
            x={pad}
            y={zhBaseline - top}
            fontSize={zhSize}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={fontFamilyZh}
            xmlSpace="preserve"
          >
            {zh}
          </text>
          <text
            x={pad}
            y={enBaseline - top}
            fontSize={enSize}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={fontFamilyEn}
            xmlSpace="preserve"
          >
            {en}
          </text>
        </svg>
      </div>
    </MultiRowBackground>
  );
}

TextLineNum.getEditorConfig = (t: (key: string) => string) =>
  textLineNumEditorConfig(t);
