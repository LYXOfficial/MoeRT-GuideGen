import { Switch } from "@douyinfe/semi-ui";
import type { FC } from "react";
import {
  ArrowLeftGlyph,
  ArrowRightGlyph,
  ArrowUpGlyph,
  ArrowDownGlyph,
  ArrowUpLeftGlyph,
  ArrowUpRightGlyph,
  ArrowDownLeftGlyph,
  ArrowDownRightGlyph,
  ArrowUturnLeftGlyph,
  ArrowUturnRightGlyph,
  ArrowBackLeftGlyph,
  ArrowBackRightGlyph,
} from "./icons/arrow-real";
import {
  fontEn,
  fontZh,
  measureText,
  useFontsReady,
  WEIGHT_VALUE,
  type TextWeight,
} from "./define/text";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import type { GlyphBox, GlyphProps } from "./icons/glyph-types";
import {
  MultiRowBackground,
  backgroundFormItems,
  commonSelectFormItem,
  foregroundFormItem,
  textFormItem,
} from "./Background";

/**
 * 箭头（M3）。
 * - 8 向 + 左/右掉头 + 左后方 + 右后方，图形全部取自 visys.pdf 第 3 页矢量图层（见 icons/arrow-real.tsx）
 * - showText=false 时箭头占满整行；=true 时箭头缩小上移、文本排在下方
 * - variant 提供暗底/亮底两套配色（颜色留空时按 variant 自动取色）
 */
export type ArrowDirection =
  | "left"
  | "right"
  | "up"
  | "down"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right"
  | "uturn-left"
  | "uturn-right"
  | "back-left"
  | "back-right";

export const ARROW_DIRECTIONS: ArrowDirection[] = [
  "left",
  "right",
  "up",
  "down",
  "up-left",
  "up-right",
  "down-left",
  "down-right",
  "uturn-left",
  "uturn-right",
  "back-left",
  "back-right",
];

const ARROW_GLYPHS: Record<ArrowDirection, FC<GlyphProps & GlyphBox>> = {
  left: ArrowLeftGlyph,
  right: ArrowRightGlyph,
  up: ArrowUpGlyph,
  down: ArrowDownGlyph,
  "up-left": ArrowUpLeftGlyph,
  "up-right": ArrowUpRightGlyph,
  "down-left": ArrowDownLeftGlyph,
  "down-right": ArrowDownRightGlyph,
  "uturn-left": ArrowUturnLeftGlyph,
  "uturn-right": ArrowUturnRightGlyph,
  "back-left": ArrowBackLeftGlyph,
  "back-right": ArrowBackRightGlyph,
};

export interface ArrowProps {
  direction?: ArrowDirection;
  showText?: boolean;
  textZh?: string;
  textEn?: string;
  /** 整体对齐（箭头 + 文字作为一个单元）；默认 center */
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
  background2?: string;
}

export const arrowDefaultProps: ArrowProps = {
  direction: "up",
  showText: false,
  textZh: "下一站",
  textEn: "Next Station",
  align: "center",
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

export const arrowEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijing.components.Arrow.props";
  return {
    forms: [
      commonSelectFormItem(t, scope, "direction", "direction", ARROW_DIRECTIONS),
      {
        key: "showText",
        label: `${scope}.showText`,
        element: <Switch />,
      },
      textFormItem(scope, "textZh"),
      textFormItem(scope, "textEn"),
      commonSelectFormItem(t, scope, "align", "align", [
        "left",
        "center",
        "right",
      ]),
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
/**
 * 间距按 PDF 实测（模块 a = 84.58pt ↔ 64px 行高）：
 *  - 模块内边距 1/6a ≈ 10.7px（vitool .canvas padding 25/150，visys P3 实测 14.1/84.83）
 *  - 纯箭头 ink = 0.667a ≈ 42.7px（visys P3 第 0–12 格实测 56.6/84.83）
 *  - 「下一站」箭头 ink = 0.48a ≈ 30.7px（visys P3 第 17/18 格实测 40.67/84.83）
 *  - 箭头与文本的间隙 = 0.083a ≈ 5.3px（模块内边距之半）
 */
const MODULE_PADDING = 64 / 6;
/**
 * 带文字时的几何：按标准图（图一）实测的「占牌面高比例」换算到 64px 行高。
 * 连通域实测（牌面 105×107）：上留白 0.121H、箭头 ink 高 0.402H（宽高比 1.163）、
 * 箭头→「下一站」0.103H、「下一站」ink 0.140H、→英文 0.056H、英文 cap 0.075H、下留白 0.103H。
 */
const PAD_TOP_RATIO = 0.121;
const ARROW_INK_RATIO = 0.402;
const GAP1_RATIO = 0.103;
const ZH_INK_RATIO = 0.14;
const GAP2_RATIO = 0.056;
const EN_CAP_RATIO = 0.075;
/** 方盒内箭头 ink 的宽高比（横箭头 50:43） */
const ARROW_ASPECT = 1.163;

const ARROW_INK_WITH_TEXT = ROW_H * ARROW_INK_RATIO;
const ARROW_BOX_WITH_TEXT = ARROW_INK_WITH_TEXT * ARROW_ASPECT;
const ARROW_BOX_WITH_TEXT_Y =
  ROW_H * PAD_TOP_RATIO - (ARROW_BOX_WITH_TEXT - ARROW_INK_WITH_TEXT) / 2;
/** 「下一站」字号（ink = 0.140H）；「Next Station」字号（cap = 0.075H） */
const TEXT_ZH_SIZE = (ROW_H * ZH_INK_RATIO) / 0.88;
const TEXT_EN_SIZE = (ROW_H * EN_CAP_RATIO) / 0.716;
const TEXT_ZH_BASELINE =
  ROW_H *
  (PAD_TOP_RATIO + ARROW_INK_RATIO + GAP1_RATIO + ZH_INK_RATIO);
const TEXT_EN_BASELINE =
  ROW_H *
  (PAD_TOP_RATIO +
    ARROW_INK_RATIO +
    GAP1_RATIO +
    ZH_INK_RATIO +
    GAP2_RATIO +
    EN_CAP_RATIO);
/** 带文字时的最小总宽（允许比整模块窄，文字很短时也不会过窄） */
const MIN_WIDTH_WITH_TEXT = 40;
/** 文字用 regular 字重 */
const TEXT_WEIGHT: TextWeight = "normal";

function Arrow({
  direction = arrowDefaultProps.direction,
  showText = arrowDefaultProps.showText,
  textZh = arrowDefaultProps.textZh,
  textEn = arrowDefaultProps.textEn,
  foreground = arrowDefaultProps.foreground,
  background = arrowDefaultProps.background,
  background2 = arrowDefaultProps.background2,
  align = arrowDefaultProps.align,
}: ArrowProps) {
  const fontsReady = useFontsReady();
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.background;
  const zhText = (textZh ?? "").trim();
  const enText = (textEn ?? "").trim();
  const withText = Boolean(showText) && Boolean(zhText || enText);

  const zhFont = fontZh(TEXT_WEIGHT, TEXT_ZH_SIZE);
  const enFont = fontEn(TEXT_WEIGHT, TEXT_EN_SIZE);
  const zhWidth = measureText(zhText, zhFont);
  const enWidth = measureText(enText, enFont);
  const textWidth = Math.max(zhWidth, enWidth);

  // 纯箭头占满模块（含 1/6 模块内边距）；有文本时箭头按标准图缩小并上移
  const glyphSize = withText
    ? ARROW_BOX_WITH_TEXT
    : ROW_H - MODULE_PADDING * 2;
  // 宽度 = 箭头盒与文字行里较宽者 + 两侧 1/6 模块内边距。
  // 纯箭头保持一个正方形模块；带文字时不再强制撑到整模块宽，
  // 按内容自适应（文字短时组件更窄），只保留一个很小的下限。
  const contentWidth = Math.max(glyphSize, textWidth);
  const width = withText
    ? Math.max(MIN_WIDTH_WITH_TEXT, Math.ceil(contentWidth) + MODULE_PADDING * 2)
    : ROW_H;
  // 箭头始终水平居中；align 只作用于下方文字行的对齐（默认居中）
  const glyphX = (width - glyphSize) / 2;
  const textX =
    align === "left"
      ? MODULE_PADDING
      : align === "right"
        ? width - MODULE_PADDING
        : width / 2;
  const textAnchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
  const glyphY = withText ? ARROW_BOX_WITH_TEXT_Y : (ROW_H - glyphSize) / 2;
  const zhBaseline = TEXT_ZH_BASELINE;
  const enBaseline = TEXT_EN_BASELINE;

  const Glyph = ARROW_GLYPHS[direction ?? "up"] ?? ArrowUpGlyph;

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      style={{ height: ROW_H, width }}
    >
      <svg width={width} height={ROW_H} data-fonts-ready={fontsReady}>
        <Glyph
          color={fg}
          width={glyphSize}
          height={glyphSize}
          x={glyphX}
          y={glyphY}
        />
        {withText ? (
          <>
            {zhText ? (
              <text
                x={textX}
                y={zhBaseline}
                fontSize={TEXT_ZH_SIZE}
                fontWeight={WEIGHT_VALUE[TEXT_WEIGHT]}
                fill={fg}
                textAnchor={textAnchor}
              >
                {zhText}
              </text>
            ) : null}
            {enText ? (
              <text
                x={textX}
                y={enBaseline}
                fontSize={TEXT_EN_SIZE}
                fontWeight={WEIGHT_VALUE[TEXT_WEIGHT]}
                fill={fg}
                textAnchor={textAnchor}
                fontFamily="Arial, Helvetica, sans-serif"
              >
                {enText}
              </text>
            ) : null}
          </>
        ) : null}
      </svg>
    </MultiRowBackground>
  );
}

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);

export default Arrow;
