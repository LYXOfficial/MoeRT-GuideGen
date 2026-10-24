import { useMemo } from "react";
import { Input, InputNumber, Select, Switch } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import {
  fontEn,
  fontZh,
  measureText,
  useFontsReady,
  weightCss,
} from "./define/text";
import { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";

/**
 * 双行文字（经典样式）：两行「中文 / 英文」逐行对齐出入口编号的两个描边方块
 * （ExitNum 的 double 形态：每块 0.5a 见方、间隔 0.1a，块中心距 = 0.6a）。
 *
 *  - 每行 = 中文一行 + 英文另起一行（英文在中文下方，基线随中文行）
 *  - 每组（中文+英文）的中心对齐对应方块的中心：字号取块内字母 ink
 *    （0.45 × 0.5a），英文 cap 为中文 ink 的 0.7 倍
 *  - showEn = false 时只渲染两行中文（「东北口 / 西南口」这类无英文场合）
 */
export interface DualTextProps {
  line1chinese: string;
  line1english: string;
  line2chinese: string;
  line2english: string;
  /** 是否渲染行内英文（false = 纯两行中文） */
  showEn?: boolean;
  align?: "left" | "center" | "right";
  letterSpacing?: number;
  foreground?: string;
  background?: string;
  background2?: string;
}

export const dualTextDefaultProps: DualTextProps = {
  line1chinese: "东北口",
  line1english: "Northeast Exit",
  line2chinese: "西南口",
  line2english: "Southwest Exit",
  showEn: true,
  align: "left",
  letterSpacing: 0,
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

/** a（行 = 1.5a，与出口方块同一语境） */
const A = 64 / 1.5;
/** 中文 ink = 0.45 × 0.5a（出口 double 块内字母 ink），汉字 ink ≈ 0.88em */
const ZH_SIZE = (A * 0.225) / 0.88;
/** 英文 cap = 中文 ink 的 0.7 倍，Arial cap = 0.716em */
const EN_SIZE = (A * 0.225 * 0.7) / 0.716;
/** 组中心距 = 0.5a 块 + 0.1a 间隔（对齐出口 double 方块） */
const LINE_STEP = A * 0.6;
/** 组内英文与中文的间隙 */
const EN_GAP = 2;
const ROW_H = 64;
/** 中易黑体单一字重，官方观感偏粗 */
const TEXT_WEIGHT = 700;

export const dualTextEditorConfig = (
  t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijingOld.components.DualText.props";
  return {
    forms: [
      { key: "line1chinese", label: `${scope}.line1chinese`, element: <Input /> },
      { key: "line1english", label: `${scope}.line1english`, element: <Input /> },
      { key: "line2chinese", label: `${scope}.line2chinese`, element: <Input /> },
      { key: "line2english", label: `${scope}.line2english`, element: <Input /> },
      {
        key: "showEn",
        label: `${scope}.showEn`,
        element: <Switch />,
      },
      {
        key: "align",
        label: `${scope}.align.displayName`,
        element: (
          <Select>
            <Select.Option value="left">
              {t("themes.beijingOld.common.align.left")}
            </Select.Option>
            <Select.Option value="center">
              {t("themes.beijingOld.common.align.center")}
            </Select.Option>
            <Select.Option value="right">
              {t("themes.beijingOld.common.align.right")}
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
  showEn = dualTextDefaultProps.showEn,
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

  // 两行内容：每行 = 中文 + （可选）跟随的英文
  const rows = useMemo(
    () => [
      { zh: line1chinese, en: line1english },
      { zh: line2chinese, en: line2english },
    ],
    [line1chinese, line1english, line2chinese, line2english]
  );

  const layout = useMemo(() => {
    const widthOf = (text: string, size: number, font: string) =>
      measureText(text ?? "", font) +
      ls * size * Math.max(0, Array.from(text ?? "").length - 1);
    const lineWidth = (row: { zh: string; en: string }) => {
      const zhW = widthOf(row.zh, ZH_SIZE, zhFont);
      if (!showEn || !row.en) return zhW;
      return Math.max(zhW, widthOf(row.en, EN_SIZE, enFont));
    };
    const width = Math.max(...rows.map(lineWidth), 1);
    return { width: Math.max(1, Math.ceil(width)) };
  }, [rows, showEn, zhFont, enFont, ls, fontsReady]);

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
      style={{ height: ROW_H }}
    >
      <div className="ml-1.25 mr-1.25" style={{ width: layout.width }}>
        <svg
          width={layout.width}
          height={ROW_H}
          data-fonts-ready={fontsReady}
        >
          <g transform={`translate(${groupX}, 0)`} textAnchor={anchor}>
            {rows.map((row, index) => {
              // 每组（中文+英文另起一行）的中心对齐对应方块的中心
              const center = ROW_H / 2 + (index - 0.5) * LINE_STEP;
              const zhInk = ZH_SIZE * 0.88;
              const enCap = showEn && row.en ? EN_SIZE * 0.716 : 0;
              const groupH = zhInk + (enCap ? EN_GAP + enCap : 0);
              const zhBaseline = center - groupH / 2 + zhInk;
              const enBaseline = zhBaseline + EN_GAP + enCap;
              return (
                <g key={index}>
                  {row.zh ? (
                    <text
                      x={0}
                      y={zhBaseline}
                      fontSize={ZH_SIZE}
                      fontWeight={weightCss(TEXT_WEIGHT)}
                      fill={foreground}
                      fontFamily={fontFamilyZh}
                      letterSpacing={`${ls}em`}
                    >
                      {row.zh}
                    </text>
                  ) : null}
                  {showEn && row.en ? (
                    <text
                      x={0}
                      y={enBaseline}
                      fontSize={EN_SIZE}
                      fontWeight={weightCss(TEXT_WEIGHT)}
                      fill={foreground}
                      fontFamily={fontFamilyEn}
                    >
                      {row.en}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </MultiRowBackground>
  );
}

DualText.getEditorConfig = (t: (key: string) => string) =>
  dualTextEditorConfig(t);

export default DualText;
