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
  inkShift,
  measureInk,
  useFontsReady,
  weightCss,
  type TextWeight,
} from "./define/text";
import { EDGE_PAD, ROW_H } from "./define/layout";

/**
 * 双行文本（标准图 54 出入口信息组合）：
 * **两组「中文 + 英文」**——
 *   老沪闵路 / Laohumin Rd.
 *   龙华寺 / Long Hua Temple
 *
 * 比成都主题的站名组件小一圈（成都 24 / 14 → 上海 20 / 11）。
 * 哪一组两个字段都空就整组跳过；上下按真实墨迹居中，左右按墨迹边界对齐。
 */
export interface DualTextProps {
  line1chinese: string;
  line1english: string;
  line2chinese: string;
  line2english: string;
  align?: "left" | "center" | "right";
  weight?: TextWeight;
  letterSpacing?: number;
  fontSizeZh?: number;
  fontSizeEn?: number;
  /** 同一组里中文与英文之间空隙（px） */
  lineGap?: number;
  /** 两组之间空隙（px） */
  pairGap?: number;
  offsetY?: number;
  foreground?: string;
  background?: string;
}

export const dualTextDefaultProps: DualTextProps = {
  line1chinese: "老沪闵路",
  line1english: "Laohumin Rd.",
  line2chinese: "龙华寺",
  line2english: "Long Hua Temple",
  align: "center",
  weight: "medium",
  letterSpacing: 0,
  fontSizeZh: 19,
  fontSizeEn: 10.5,
  lineGap: 1.5,
  pairGap: 4,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.transparent,
};

const SCOPE = "themes.shanghai.components.DualText.props";

const clamp = (v: unknown, min: number, max: number, fb: number) => {
  const n = Number(v);
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fb));
};

export const dualTextEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "line1chinese",
      label: `${SCOPE}.line1chinese`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 1 }} />,
    },
    {
      key: "line1english",
      label: `${SCOPE}.line1english`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 2 }} />,
    },
    {
      key: "line2chinese",
      label: `${SCOPE}.line2chinese`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 1 }} />,
    },
    {
      key: "line2english",
      label: `${SCOPE}.line2english`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 2 }} />,
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
      element: <InputNumber step={1} min={8} max={64} />,
    },
    {
      key: "fontSizeEn",
      label: `${SCOPE}.fontSizeEn`,
      element: <InputNumber step={1} min={6} max={48} />,
    },
    {
      key: "lineGap",
      label: `${SCOPE}.lineGap`,
      element: <InputNumber step={1} min={0} max={24} />,
    },
    {
      key: "pairGap",
      label: `${SCOPE}.pairGap`,
      element: <InputNumber step={1} min={0} max={32} />,
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

export default function DualText({
  line1chinese = dualTextDefaultProps.line1chinese,
  line1english = dualTextDefaultProps.line1english,
  line2chinese = dualTextDefaultProps.line2chinese,
  line2english = dualTextDefaultProps.line2english,
  align = dualTextDefaultProps.align,
  weight = dualTextDefaultProps.weight,
  letterSpacing = dualTextDefaultProps.letterSpacing,
  fontSizeZh = dualTextDefaultProps.fontSizeZh,
  fontSizeEn = dualTextDefaultProps.fontSizeEn,
  lineGap = dualTextDefaultProps.lineGap,
  pairGap = dualTextDefaultProps.pairGap,
  offsetY = dualTextDefaultProps.offsetY,
  foreground = dualTextDefaultProps.foreground,
  background = dualTextDefaultProps.background,
}: DualTextProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "medium");
  const zhSize = clamp(fontSizeZh, 8, 64, 19);
  const enSize = clamp(fontSizeEn, 6, 48, 10.5);
  const gap = Math.max(0, Number(lineGap) || 0);
  const pair = Math.max(0, Number(pairGap) || 0);
  const dy = Number(offsetY) || 0;
  const ls = Number(letterSpacing) || 0;
  const alignMode = align ?? "center";

  const layout = useMemo(() => {
    const zhFont = `${weightValue} ${zhSize}px ${fontFamilyZh}`;
    const enFont = `${weightValue} ${enSize}px ${fontFamilyEn}`;
    const groups = [
      { zh: normalizeSvgLine(line1chinese), en: normalizeSvgLine(line1english) },
      { zh: normalizeSvgLine(line2chinese), en: normalizeSvgLine(line2english) },
    ].filter(g => g.zh.length > 0 || g.en.length > 0);

    type Line = {
      text: string;
      size: number;
      family: string;
      metrics: ReturnType<typeof measureInk>;
      y: number;
    };
    const lines: Line[] = [];
    let cursor = 0;
    groups.forEach((g, gi) => {
      if (g.zh) {
        const m = measureInk(g.zh, zhFont, ls, zhSize);
        const baseline = cursor + m.inkAscent;
        lines.push({
          text: g.zh,
          size: zhSize,
          family: fontFamilyZh,
          metrics: m,
          y: baseline,
        });
        cursor = baseline + m.inkDescent + gap;
      }
      if (g.en) {
        const m = measureInk(g.en, enFont, ls, enSize);
        const baseline = cursor + m.inkAscent;
        lines.push({
          text: g.en,
          size: enSize,
          family: fontFamilyEn,
          metrics: m,
          y: baseline,
        });
        cursor = baseline + m.inkDescent;
      }
      if (gi < groups.length - 1) cursor += pair;
    });

    const inkH = Math.max(0, cursor);
    const top = (ROW_H - inkH) / 2 + dy;
    const width = Math.max(
      1,
      Math.ceil(Math.max(0, ...lines.map(l => l.metrics.inkWidth)))
    );
    return lines.map(l => ({
      ...l,
      x: inkShift(l.metrics, width, alignMode) + EDGE_PAD,
      y: l.y + top,
      width,
    }));
    // fontsReady 参与依赖：字体就绪后重新量
  }, [
    line1chinese,
    line1english,
    line2chinese,
    line2english,
    zhSize,
    enSize,
    gap,
    pair,
    dy,
    ls,
    weightValue,
    alignMode,
    fontsReady,
  ]);

  const boxW = layout[0]?.width ?? 1;

  return (
    <MultiRowBackground
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
            fontSize={p.size}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={p.family}
            letterSpacing={`${ls}em`}
            xmlSpace="preserve"
          >
            {p.text}
          </text>
        ))}
      </svg>
    </MultiRowBackground>
  );
}

DualText.getEditorConfig = (t: (key: string) => string) =>
  dualTextEditorConfig(t);
