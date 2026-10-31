import { InputNumber } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  foregroundFormItem,
  colorFormItem,
  digitFormItem,
} from "./Background";
import { BADGE_BORDER, PLATE_H, ROW_H } from "./define/layout";
import { measureText, useFontsReady } from "./define/text";

/**
 * 数字线路标（标准图 43 的「12」「22」方块）。
 *
 * 版式实测（图 43，牌面高 430px）：
 *  - 徽章外框 299 / 430 = 0.695H → 44.5px（64px 行高）
 *  - 白描边 6/299 ≈ 0.02 → 1.3px
 *  - 数字 ink 194/299 = 0.649 × 边长 → 字号 = 0.9 × 边长（Helvetica cap 0.717em）
 *  - 无圆角；左右各只留 1px 透明边，压接缝时不会盖住描边
 *
 * 只画徽章本身，不画「号线」「Line 12」——那是中英文字组件的事。
 */
export interface LineNumProps {
  /** 线路编号（1–2 位数字） */
  number: string;
  /** 徽章边长（px） */
  size?: number;
  /** 数字颜色 */
  foreground?: string;
  /** 线路识别色（徽章底色） */
  lineColor?: string;
  /** 描边色 */
  border?: string;
  /** 徽章背后的版面底色 */
  background?: string;
}

export const lineNumDefaultProps: LineNumProps = {
  number: "1",
  size: PLATE_H,
  foreground: colors.white,
  lineColor: colors.line1,
  border: colors.white,
  background: colors.transparent,
};

const SIZE_MIN = 20;
const SIZE_MAX = 72;
const SCOPE = "themes.shanghai.components.LineNum.props";

export const lineNumEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    digitFormItem(SCOPE, "number", 2),
    {
      key: "size",
      label: `${SCOPE}.size`,
      element: <InputNumber step={0.5} min={SIZE_MIN} max={SIZE_MAX} />,
    },
    foregroundFormItem(SCOPE),
    colorFormItem(SCOPE, "lineColor"),
    colorFormItem(SCOPE, "border"),
    ...backgroundFormItems(SCOPE),
  ],
});

export default function LineNum({
  number = lineNumDefaultProps.number,
  size = lineNumDefaultProps.size,
  foreground = lineNumDefaultProps.foreground,
  lineColor = lineNumDefaultProps.lineColor,
  border = lineNumDefaultProps.border,
  background = lineNumDefaultProps.background,
}: LineNumProps) {
  const fontsReady = useFontsReady();
  const side = Math.min(SIZE_MAX, Math.max(SIZE_MIN, Number(size) || PLATE_H));
  const text = String(number ?? "").replace(/\D/g, "").slice(0, 2) || "1";
  const fontSize = side * 0.9;
  const cap = fontSize * 0.717;
  // 左右各留 3px「一点点间隙」：和 号线/图标并排时不至于完全贴死，
  // 又不像整块留白那样破坏紧凑贴合
  const gapX = 3;
  const box = side + gapX * 2;
  const top = (ROW_H - side) / 2;
  const baseline = top + side / 2 + cap / 2;
  // 两位数字过宽时按比例压窄（保持徽章是正方形）
  const measured = measureText(text, `400 ${fontSize}px ${fontFamilyEn}`);
  const scale = measured > side * 0.78 ? (side * 0.78) / measured : 1;
  void fontsReady;

  return (
    <BackgroundBox
      background={background}
      style={{ height: ROW_H, width: box }}
    >
      <svg width={box} height={ROW_H} style={{ display: "block" }}>
        <rect
          x={gapX + BADGE_BORDER / 2}
          y={top + BADGE_BORDER / 2}
          width={side - BADGE_BORDER}
          height={side - BADGE_BORDER}
          fill={lineColor}
          stroke={border}
          strokeWidth={BADGE_BORDER}
        />
        <text
          x={box / 2}
          y={baseline}
          fontSize={fontSize}
          fontWeight={400}
          fill={foreground}
          fontFamily={fontFamilyEn}
          textAnchor="middle"
          transform={
            scale < 1
              ? `translate(${box / 2}, 0) scale(${scale}, 1) translate(${-box / 2}, 0)`
              : undefined
          }
        >
          {text}
        </text>
      </svg>
    </BackgroundBox>
  );
}

LineNum.getEditorConfig = (t: (key: string) => string) =>
  lineNumEditorConfig(t);
