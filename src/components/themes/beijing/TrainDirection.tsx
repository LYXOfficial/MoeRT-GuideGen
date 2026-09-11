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
import { Select } from "@douyinfe/semi-ui";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
  textFormItem,
} from "./Background";

/**
 * 乘车方向（M3）：「开往 XX」+「To XX」。
 * 中文：「开往」标准字重（normal）、站名稍粗（medium）；
 * 英文：不分前后缀**一律粗体**（bold）。
 * 对齐：可选左右，默认靠左。
 */
export interface TrainDirectionProps {
  prefixZh?: string;
  prefixEn?: string;
  destinationZh?: string;
  destinationEn?: string;
  /** 对齐；默认 left */
  align?: "left" | "right";
  foreground?: string;
  background?: string;
  background2?: string;
}

export const trainDirectionDefaultProps: TrainDirectionProps = {
  prefixZh: "开往",
  prefixEn: "To",
  destinationZh: "繁华世界",
  destinationEn: "Tianwaitian",
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

export const trainDirectionEditorConfig = (
  t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijing.components.TrainDirection.props";
  return {
    forms: [
      textFormItem(scope, "prefixZh"),
      textFormItem(scope, "prefixEn"),
      textFormItem(scope, "destinationZh"),
      textFormItem(scope, "destinationEn"),
      {
        key: "align",
        label: `${scope}.align.displayName`,
        element: (
          <Select>
            <Select.Option value="left">
              {t("themes.beijing.common.align.left")}
            </Select.Option>
            <Select.Option value="right">
              {t("themes.beijing.common.align.right")}
            </Select.Option>
          </Select>
        ),
      },
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
// 用户核对 PDF 后的更正：**「开往」与站名同字号、同一基线、无偏移**（仅字重不同）
const PREFIX_ZH_SIZE = 25;
const DEST_ZH_SIZE = 25;
const PREFIX_EN_SIZE = 15;
const DEST_EN_SIZE = 15;
const PREFIX_WEIGHT: TextWeight = "normal";
const DEST_WEIGHT: TextWeight = "medium";
/** 英文不分前后缀都是粗体 */
const EN_WEIGHT: TextWeight = "bold";
const WORD_GAP = 4;
/** 始终存在的左右间距 */
const PAD_X = 5;
/** 英文相对对齐边向内收的像素（平衡拉丁字母侧边距的视觉） */
const EN_INWARD = 1;

function TrainDirection({
  prefixZh = trainDirectionDefaultProps.prefixZh,
  prefixEn = trainDirectionDefaultProps.prefixEn,
  destinationZh = trainDirectionDefaultProps.destinationZh,
  destinationEn = trainDirectionDefaultProps.destinationEn,
  foreground = trainDirectionDefaultProps.foreground,
  background = trainDirectionDefaultProps.background,
  background2 = trainDirectionDefaultProps.background2,
  align = trainDirectionDefaultProps.align,
}: TrainDirectionProps) {
  const fontsReady = useFontsReady();
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.background;

  const zhPrefix = (prefixZh ?? "").trim();
  const zhDest = (destinationZh ?? "").trim();
  const enPrefix = (prefixEn ?? "").trim();
  const enDest = (destinationEn ?? "").trim();

  const zhPrefixFont = fontZh(PREFIX_WEIGHT, PREFIX_ZH_SIZE);
  const zhDestFont = fontZh(DEST_WEIGHT, DEST_ZH_SIZE);
  const enPrefixFont = fontEn(EN_WEIGHT, PREFIX_EN_SIZE);
  const enDestFont = fontEn(EN_WEIGHT, DEST_EN_SIZE);

  const zhPrefixW = measureText(zhPrefix, zhPrefixFont);
  const zhDestW = measureText(zhDest, zhDestFont);
  const enPrefixW = measureText(enPrefix, enPrefixFont);
  const enDestW = measureText(enDest, enDestFont);

  const zhGap = zhPrefix && zhDest ? WORD_GAP : 0;
  const enGap = enPrefix && enDest ? WORD_GAP : 0;
  const zhWidth = zhPrefixW + zhGap + zhDestW;
  const enWidth = enPrefixW + enGap + enDestW;

  // 内容区 = 较宽的那一行；左右各留固定 PAD_X。
  // 不做 Math.ceil：向上取整会在右边多出不到 1px 的空隙。
  const innerWidth = Math.max(zhWidth, enWidth);
  const width = innerWidth + PAD_X * 2;
  // 对齐用「锚点」实现而不是用测量宽度算起点：
  // 右对齐时整行右缘精确落在距色块右缘 PAD_X 处，不依赖测量误差，也不会右偏。
  const isRight = align === "right";
  const zhAnchorX = isRight ? width - PAD_X : PAD_X;
  // 英文相对对齐边「向内」收 1px：拉丁字母自带侧边距，与中文齐平时视觉上会略外凸
  const enAnchorX = isRight
    ? width - PAD_X - EN_INWARD
    : PAD_X + EN_INWARD;
  // 「开往」与站名共用一条基线（实测牌面 0.507H → 64px 行高 32.5），英文在下一行
  const zhBaseline = 32.5;
  const enBaseline = 49.3;

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      style={{ height: ROW_H, width }}
    >
      <svg width={width} height={ROW_H} data-fonts-ready={fontsReady}>
        {/* 中文行：开往 + 站名（同一行，用 tspan 保持整体对齐） */}
        <text
          x={zhAnchorX}
          y={zhBaseline}
          textAnchor={isRight ? "end" : "start"}
          fill={fg}
        >
          <tspan
            fontSize={PREFIX_ZH_SIZE}
            fontWeight={WEIGHT_VALUE[PREFIX_WEIGHT]}
          >
            {zhPrefix}
          </tspan>
          <tspan
            fontSize={DEST_ZH_SIZE}
            fontWeight={WEIGHT_VALUE[DEST_WEIGHT]}
            dx={zhGap}
          >
            {zhDest}
          </tspan>
        </text>
        {/* 英文行：To + 站名（粗体 + 同一行对齐） */}
        <text
          x={enAnchorX}
          y={enBaseline}
          textAnchor={isRight ? "end" : "start"}
          fill={fg}
          fontFamily="Arial, Helvetica, sans-serif"
        >
          <tspan
            fontSize={PREFIX_EN_SIZE}
            fontWeight={WEIGHT_VALUE[EN_WEIGHT]}
          >
            {enPrefix}
          </tspan>
          <tspan
            fontSize={DEST_EN_SIZE}
            fontWeight={WEIGHT_VALUE[EN_WEIGHT]}
            dx={enGap}
          >
            {enDest}
          </tspan>
        </text>
      </svg>
    </MultiRowBackground>
  );
}

TrainDirection.getEditorConfig = (t: (key: string) => string) =>
  trainDirectionEditorConfig(t);

export default TrainDirection;
