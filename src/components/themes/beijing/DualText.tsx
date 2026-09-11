import { useMemo } from "react";
import { Input, InputNumber, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import {
  fontEn,
  fontZh,
  measureText,
  useFontsReady,
  weightCss,
} from "./define/text";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";

/**
 * 两行文字（M4）：两行「中文 + 英文」的出口/街名结构。
 *
 * 版式按规范图实测（牌面 195×107 → 64px 行高），**字号与上下间距全部锁死**，
 * 不提供面板调节：
 *   中文 ink ≈0.150H → 字号 11px；英文 cap ≈0.075H → 字号 6.7px
 *   四条基线（占牌面高）：中文1 0.318H、英文1 0.449H、中文2 0.720H、英文2 0.841H
 * 不设换行宽度、也不自动换行（文本长度由用户自己控制）。
 */
export interface DualTextProps {
  line1chinese: string;
  line1english: string;
  line2chinese: string;
  line2english: string;
  align?: "left" | "center" | "right";
  letterSpacing?: number;
  foreground?: string;
  background?: string;
  background2?: string;
}

export const dualTextDefaultProps: DualTextProps = {
  line1chinese: "玩命科学园",
  line1english: "Shabuzhuchelehei",
  line2chinese: "神田白八马女子学院",
  line2english: "Xianzairenzhuizhechepao",
  align: "left",
  letterSpacing: 0,
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

/**
 * 字号锁死：按规范图实测后换算到 64px 行高。
 * 规范图牌面高 107px ↔ 本编辑器 64px（比例 0.598）：
 *   中文 ink 16px（0.150H）→ 9.6px ink → 字号 11px
 *   英文 cap 8px（0.075H）→ 4.8px cap → 字号 6.7px
 */
const ZH_SIZE = 11;
const EN_SIZE = 6.7;
/**
 * 字重锁死（不再提供面板项）。
 * 注意：本项目把预置档位定义成 normal 400 / medium 600 / bold 800，
 * 这里需要的是 500（介于 normal 与 medium 之间），所以直接用数值，不占用档位。
 */
const TEXT_WEIGHT = 500;
/** 四条基线锁死（占 64px 行高的比例 × 64） */
const R1_ZH_BASELINE = 20.4; // 0.318H
const R1_EN_BASELINE = 28.7; // 0.449H
const R2_ZH_BASELINE = 46.1; // 0.720H
const R2_EN_BASELINE = 53.8; // 0.841H
const ROW_H = 64;

export const dualTextEditorConfig = (
  t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijing.components.DualText.props";
  return {
    forms: [
      { key: "line1chinese", label: `${scope}.line1chinese`, element: <Input /> },
      { key: "line1english", label: `${scope}.line1english`, element: <Input /> },
      { key: "line2chinese", label: `${scope}.line2chinese`, element: <Input /> },
      { key: "line2english", label: `${scope}.line2english`, element: <Input /> },
      {
        key: "align",
        label: `${scope}.align.displayName`,
        element: (
          <Select>
            <Select.Option value="left">
              {t("themes.beijing.common.align.left")}
            </Select.Option>
            <Select.Option value="center">
              {t("themes.beijing.common.align.center")}
            </Select.Option>
            <Select.Option value="right">
              {t("themes.beijing.common.align.right")}
            </Select.Option>
          </Select>
        ),
      },
      {
        key: "letterSpacing",
        label: `${scope}.letterSpacing`,
        element: <InputNumber step={0.01} min={0} max={0.5} />,
      },
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

function DualText({
  line1chinese = dualTextDefaultProps.line1chinese,
  line1english = dualTextDefaultProps.line1english,
  line2chinese = dualTextDefaultProps.line2chinese,
  line2english = dualTextDefaultProps.line2english,
  align = dualTextDefaultProps.align,
  letterSpacing = dualTextDefaultProps.letterSpacing,
  foreground = dualTextDefaultProps.foreground,
  background = dualTextDefaultProps.background,
  background2 = dualTextDefaultProps.background2,
}: DualTextProps) {
  const fontsReady = useFontsReady();
  const zhFont = fontZh(TEXT_WEIGHT, ZH_SIZE);
  const enFont = fontEn(TEXT_WEIGHT, EN_SIZE);
  const ls = letterSpacing ?? 0;

  // 不换行：每段文字就是一行，宽度取四段里最宽者
  const layout = useMemo(() => {
    const widthOf = (text: string, size: number, font: string) =>
      measureText(text ?? "", font) +
      ls * size * Math.max(0, Array.from(text ?? "").length - 1);
    const width = Math.max(
      widthOf(line1chinese, ZH_SIZE, zhFont),
      widthOf(line1english, EN_SIZE, enFont),
      widthOf(line2chinese, ZH_SIZE, zhFont),
      widthOf(line2english, EN_SIZE, enFont)
    );
    return { width: Math.max(1, Math.ceil(width)) };
  }, [
    line1chinese,
    line1english,
    line2chinese,
    line2english,
    zhFont,
    enFont,
    ls,
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

  const line = (
    key: string,
    text: string,
    baseline: number,
    size: number,
    font: string
  ) => (
    <text
      key={key}
      x={0}
      y={baseline}
      fontSize={size}
      fontWeight={weightCss(TEXT_WEIGHT)}
      fill={foreground}
      fontFamily={font}
      letterSpacing={`${ls}em`}
    >
      {text}
    </text>
  );

  return (
    <MultiRowBackground
      background={background}
      background2={background2}
      style={{ height: ROW_H }}
    >
      <div className="ml-1.25 mr-1.25" style={{ width: layout.width }}>
        <svg
          width={layout.width}
          height={ROW_H}
          data-fonts-ready={fontsReady}
        >
          <g transform={`translate(${groupX}, 0)`} textAnchor={anchor}>
            {line("r1zh", line1chinese, R1_ZH_BASELINE, ZH_SIZE, zhFont)}
            {line("r1en", line1english, R1_EN_BASELINE, EN_SIZE, enFont)}
            {line("r2zh", line2chinese, R2_ZH_BASELINE, ZH_SIZE, zhFont)}
            {line("r2en", line2english, R2_EN_BASELINE, EN_SIZE, enFont)}
          </g>
        </svg>
      </div>
    </MultiRowBackground>
  );
}

DualText.getEditorConfig = (t: (key: string) => string) =>
  dualTextEditorConfig(t);

export default DualText;
