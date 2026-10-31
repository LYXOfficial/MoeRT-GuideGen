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
  inkShift,
  measureInk,
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
 *  - 中文在上、英文在下
 *  - 只认用户在 TextArea 里敲的换行，不按宽度自动折行
 *  - 左右按**墨迹边界**对齐（中文和拉丁的 side bearing 不同，
 *    按排字原点对齐时英文会探出 1–2px），左右各留 1px 防压边
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
};

const ZH_MIN = 8;
const ZH_MAX = 64;
const EN_MIN = 6;
const EN_MAX = 48;
const SCOPE = "themes.shanghai.components.Text.props";

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
      label: `${SCOPE}.chinese`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
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
      key: "lineGap",
      label: `${SCOPE}.lineGap`,
      element: <InputNumber step={1} min={0} max={40} />,
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
}: TextProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "medium");
  const zhSize = clamp(fontSizeZh, ZH_MIN, ZH_MAX, 28);
  const enSize = clamp(fontSizeEn, EN_MIN, EN_MAX, 13);
  const gap = Math.max(0, Number(lineGap) || 0);
  const dy = Number(offsetY) || 0;
  const ls = Number(letterSpacing) || 0;
  const alignMode = align ?? "left";

  const layout = useMemo(() => {
    const zhLines = normalizeSvgLines(chinese);
    const enLines = normalizeSvgLines(english);
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
    // 行距：中文 1.05em、英文 1.2em（拉丁 ink ≈0.97em）
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
      gap +
      enAscent +
      (enLines.length - 1) * enStep +
      enDescent;
    const top = (ROW_H - inkH) / 2 + dy;
    const zhFirst = top + zhAscent;
    const enFirst = zhFirst + (zhLines.length - 1) * zhStep + zhDescent + gap + enAscent;
    return {
      width,
      zhStep,
      enStep,
      zhFirst,
      enFirst,
      zh: zhLines.map((line, i) => ({
        line,
        x: inkShift(zhMetrics[i], width, alignMode) + EDGE_PAD,
        y: zhFirst + i * zhStep,
      })),
      en: enLines.map((line, i) => ({
        line,
        x: inkShift(enMetrics[i], width, alignMode) + EDGE_PAD,
        y: enFirst + i * enStep,
      })),
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
    alignMode,
    fontsReady,
  ]);

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
        {layout.zh.map((p, index) => (
          <text
            key={`zh-${index}`}
            x={p.x}
            y={p.y}
            fontSize={zhSize}
            fontWeight={weightValue}
            fill={foreground}
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
            fill={foreground}
            fontFamily={fontFamilyEn}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
          >
            {p.line}
          </text>
        ))}
      </svg>
    </MultiRowBackground>
  );
}

Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
