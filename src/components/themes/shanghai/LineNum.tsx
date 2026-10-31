import { Input, InputNumber } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  colorFormItem,
} from "./Background";
import { BADGE_BORDER, ROW_H } from "./define/layout";
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
  /** 数字颜色（独立于全局「默认前景色」，不会被它覆盖） */
  textColor?: string;
  /** 线路识别色（徽章底色） */
  lineColor?: string;
  /** 描边色 */
  border?: string;
  /** 左右边距（px），默认 5 */
  gapX?: number;
  /** 徽章背后的版面底色 */
  background?: string;
}

export const lineNumDefaultProps: LineNumProps = {
  number: "1",
  textColor: colors.white,
  lineColor: colors.line1,
  border: colors.white,
  gapX: 7,
  background: colors.background,
};

/** 徽章边长锁死（用户要求：没必要开放调整） */
const BADGE_SIZE = 40;
/** 逗号相对字号（多出口时别太突兀） */
const COMMA_SCALE = 0.62;
const SCOPE = "themes.shanghai.components.LineNum.props";

/** 只允许数字与逗号（多线路/多出口时手动写「2,5」） */
function NumberListInput({
  value = "",
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Input
      value={value}
      maxLength={5}
      onChange={next =>
        onChange?.(
          String(next ?? "")
            .replace(/[^\d,]/g, "")
            .slice(0, 5)
        )
      }
    />
  );
}

export const lineNumEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "number",
      label: `${SCOPE}.number`,
      element: <NumberListInput />,
    },
    colorFormItem(SCOPE, "textColor"),
    colorFormItem(SCOPE, "lineColor"),
    colorFormItem(SCOPE, "border"),
    {
      key: "gapX",
      label: `${SCOPE}.gapX`,
      element: <InputNumber step={1} min={0} max={24} />,
    },
    ...backgroundFormItems(SCOPE),
  ],
});

export default function LineNum({
  number = lineNumDefaultProps.number,
  textColor = lineNumDefaultProps.textColor,
  lineColor = lineNumDefaultProps.lineColor,
  border = lineNumDefaultProps.border,
  gapX = lineNumDefaultProps.gapX,
  background = lineNumDefaultProps.background,
}: LineNumProps) {
  const fontsReady = useFontsReady();
  const side = BADGE_SIZE;
  // 允许手动输入逗号（多线路/多出口）：只保留数字与逗号，压缩连续逗号
  const text =
    String(number ?? "")
      .replace(/[^\d,]/g, "")
      .replace(/,{2,}/g, ",")
      .replace(/^,|,$/g, "")
      .slice(0, 5) || "1";
  const fontSize = side * 0.9;
  const cap = fontSize * 0.717;
  // 左右边距可调（默认 5px）：和 号线/图标并排时留一点缝，又不至于太散
  const pad = Math.max(0, Number(gapX ?? lineNumDefaultProps.gapX) || 0);
  const box = side + pad * 2;
  const top = (ROW_H - side) / 2;
  const baseline = top + side / 2 + cap / 2;
  // 两位数字过宽时按比例压窄（保持徽章是正方形）
  // 逗号按 0.62 倍渲染，量宽时也按同一字号算，否则居中会偏
  const segs = (text.match(/,+|[^,]+/g) ?? []).map(part => ({
    part,
    size: part.startsWith(",") ? fontSize * COMMA_SCALE : fontSize,
  }));
  const measured = segs.reduce(
    (sum, seg) => sum + measureText(seg.part, `400 ${seg.size}px ${fontFamilyEn}`),
    0
  );
  const scale = measured > side * 0.78 ? (side * 0.78) / measured : 1;
  void fontsReady;

  return (
    <BackgroundBox
      background={background}
      style={{ height: ROW_H, width: box }}
    >
      <svg width={box} height={ROW_H} style={{ display: "block" }}>
        <rect
          x={pad + BADGE_BORDER / 2}
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
          fill={textColor}
          fontFamily={fontFamilyEn}
          textAnchor="middle"
          transform={
            scale < 1
              ? `translate(${box / 2}, 0) scale(${scale}, 1) translate(${-box / 2}, 0)`
              : undefined
          }
        >
          {segs.map((seg, index) => (
            <tspan key={index} fontSize={seg.size}>
              {seg.part}
            </tspan>
          ))}
        </text>
      </svg>
    </BackgroundBox>
  );
}

LineNum.getEditorConfig = (t: (key: string) => string) =>
  lineNumEditorConfig(t);
