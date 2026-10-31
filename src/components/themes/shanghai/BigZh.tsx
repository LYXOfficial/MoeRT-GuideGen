import { useMemo } from "react";
import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyZh } from "./define/colors";
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
 * 中文大字（标准图 42「康新公路站」左边那段）。
 *
 * 版式实测（图 43 站名：中文 ink 198 / 牌面高 430 = 0.46H）：
 *  - 默认字号 33px（0.52H × 0.88 ink）
 *  - 默认字距 0.02em，略大于中英文字组件（用户要求）
 *  - 只认 TextArea 里的换行，不按宽度折行
 *  - 上下按**真实墨迹**（actualBoundingBoxAscent/Descent）居中，offsetY=0 时视觉正中
 */
export interface BigZhProps {
  chinese: string;
  align?: "left" | "center" | "right";
  weight?: TextWeight;
  /** 字距（em） */
  letterSpacing?: number;
  fontSize?: number;
  /** 行距倍数（× 字号） */
  lineHeight?: number;
  /** 整体上下偏移（px） */
  offsetY?: number;
  foreground?: string;
  background?: string;
}

export const bigZhDefaultProps: BigZhProps = {
  chinese: "国家会展中心",
  align: "left",
  weight: "medium",
  letterSpacing: 0.02,
  fontSize: 28,
  lineHeight: 1.08,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.transparent,
};

const SIZE_MIN = 10;
const SIZE_MAX = 96;
const SCOPE = "themes.shanghai.components.BigZh.props";

const clamp = (v: unknown, min: number, max: number, fb: number) => {
  const n = Number(v);
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fb));
};

export const bigZhEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: `${SCOPE}.chinese`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 3 }} />,
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

export default function BigZh({
  chinese = bigZhDefaultProps.chinese,
  align = bigZhDefaultProps.align,
  weight = bigZhDefaultProps.weight,
  letterSpacing = bigZhDefaultProps.letterSpacing,
  fontSize = bigZhDefaultProps.fontSize,
  lineHeight = bigZhDefaultProps.lineHeight,
  offsetY = bigZhDefaultProps.offsetY,
  foreground = bigZhDefaultProps.foreground,
  background = bigZhDefaultProps.background,
}: BigZhProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss(weight ?? "medium");
  const size = clamp(fontSize, SIZE_MIN, SIZE_MAX, 33);
  const lh = clamp(lineHeight, 0.8, 2, 1.08);
  const dy = Number(offsetY) || 0;
  const ls = Number(letterSpacing) || 0;
  const alignMode = align ?? "left";

  const layout = useMemo(() => {
    const lines = normalizeSvgLines(chinese);
    const font = `${weightValue} ${size}px ${fontFamilyZh}`;
    const metrics = lines.map(line => measureInk(line, font, ls, size));
    const width = Math.max(
      1,
      Math.ceil(Math.max(0, ...metrics.map(m => m.inkWidth)))
    );
    const step = size * lh;
    // 真实墨迹：取多行的最大上/下伸，整块按墨迹居中
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
    // fontsReady 参与依赖：字体就绪后重新量
  }, [chinese, size, lh, dy, ls, weightValue, alignMode, fontsReady]);

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
            fontSize={size}
            fontWeight={weightValue}
            fill={foreground}
            fontFamily={fontFamilyZh}
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

BigZh.getEditorConfig = (t: (key: string) => string) => bigZhEditorConfig(t);
