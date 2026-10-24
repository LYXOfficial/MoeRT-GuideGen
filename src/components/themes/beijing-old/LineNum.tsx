import { Select } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import lines from "./define/lines";
import {
  fontEn,
  fontZh,
  measureText,
  normalizeSvgLine,
  useFontsReady,
  WEIGHT_VALUE,
} from "./define/text";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  commonSelectFormItem,
  digitFormItem,
  foregroundFormItem,
  textFormItem,
} from "./Background";

/**
 * 线路牌（经典样式）。
 *
 * 版式按 visys.pdf 第 7 页「Classic Style」矢量图层实测复原（a = 56.6pt），
 * 并以官方 DB11/T 657.2—2024 示例图校准行语境（行高 = 1.5a，方形模块 = 1a）：
 *  - 牌 = 线路色圆角矩形（rx = 0.075a），高 1a（宽高比 ≈ 1.85–1.9，官方图 36–40 实测），
 *    数字牌宽 1.85a（两位数 1.95a），文字牌宽 = 内容宽 + 0.52a（八通线实测）。
 *  - 数字（Arial）ink 0.742a、垂直居中；「号线」ink 0.40a、「Line N」cap 0.188a，
 *    两行文字互相居中对齐、整栏垂直居中（1 号线牌 text_probe 实测）。
 *  - 数字与文字栏的间隙：一位数 0.303a、两位数 0.065a（两组实测），
 *    内容整体在牌内水平居中。
 */
export interface LineNumProps {
  /** 线路号；留空则为文字线路牌（如「八通线 / Batong Line」） */
  lineId?: string;
  /** 线路标志色（colors 的键），即牌面底色 */
  colorKey?: string;
  /** 中文文字，数字牌为「号线」，文字牌为线路名 */
  textZh?: string;
  /** 英文文字，如「Line 1」「Batong Line」 */
  textEn?: string;
  /** default = 满行尺寸；small = 小尺寸整体缩放 */
  size?: "default" | "small";
  /** 前景色（牌内文字）；留空用白色 */
  foreground?: string;
  /** 底板色；留空用经典版面深蓝 */
  background?: string;
  /** 第二行背景色（上下分色） */
  background2?: string;
}

export const lineNumDefaultProps: LineNumProps = {
  lineId: "1",
  colorKey: "line1",
  textZh: "号线",
  textEn: "Line 1",
  size: "default",
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

export const LINE_COLOR_KEYS: string[] = Array.from(
  new Set(lines.map(line => line.colorKey))
);

/** 唯一的线路色下拉（选项文案复用 themes.beijingOld.colors.<key>） */
const lineColorFormItem = (
  t: (key: string) => string
): EditorConfig["forms"][number] => ({
  key: "colorKey",
  label: "themes.beijingOld.components.LineNum.props.colorKey.displayName",
  element: (
    <Select>
      {LINE_COLOR_KEYS.map(key => (
        <Select.Option key={key} value={key}>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-sm"
              style={{
                backgroundColor: (colors as Record<string, string>)[key],
              }}
            />
            {t(`themes.beijingOld.colors.${key}`)}
          </span>
        </Select.Option>
      ))}
    </Select>
  ),
});

export const lineNumEditorConfig = (
  t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijingOld.components.LineNum.props";
  return {
    forms: [
      digitFormItem(scope, "lineId", 2),
      lineColorFormItem(t),
      textFormItem(scope, "textZh"),
      textFormItem(scope, "textEn"),
      commonSelectFormItem(t, scope, "size", "size", ["default", "small"]),
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;

/** 牌高 1a：行 = 1.5a（官方 DB11/T 657.2—2024 示例图：方形模块 = 1a ≈ 2/3 行高） */
const BLOCK_H = ROW_H / 1.5;
/** 「Line N」字距（1 号线牌 glyph 实测 ≈ 0.06em，Arial 默认字距偏紧） */
const EN_SPACING = 0.06;
/** 圆角半径 0.075a（p7 底板 path 实测 rx 4.25 / 56.6） */
const RADIUS = BLOCK_H * (4.25 / 56.6);
/** 数字 ink 0.742a（1/10 号线牌实测 41.66–42.36 / 56.6），Arial cap = 0.716em */
const NUM_SIZE = (BLOCK_H * 0.742) / 0.716;
/** 「号线」ink 0.40a（汉字 ink = 0.88em） */
const ZH_SIZE = (BLOCK_H * 0.4) / 0.88;
/** 「Line N」cap 0.188a */
const EN_SIZE = (BLOCK_H * 0.188) / 0.716;
/** 文字栏（号线 ink + 0.089a 间隙 + Line cap）总高 0.677a，整体垂直居中 */
const TEXT_COL_H = BLOCK_H * 0.677;
/** 数字与文字栏间隙：一位数 0.303a、两位数 0.065a */
const GAP_1 = BLOCK_H * 0.303;
const GAP_2 = BLOCK_H * 0.065;
/** 文字牌左右留白合计 0.52a（八通线牌实测两侧各 0.26a） */
const TEXT_PLATE_PAD = BLOCK_H * 0.52;
/** 数字牌宽：1.85a + 0.1a × (位数 - 1) */
const PLATE_W_1DIGIT = BLOCK_H * 1.85;
const PLATE_W_EXTRA = BLOCK_H * 0.1;
/** 牌外左右留白 */
const OUTER_MARGIN = 5;
/** 小尺寸整体缩放（与新版口径一致） */
const SMALL_SCALE = 0.62;

const NUM_INK = BLOCK_H * 0.742;
const ZH_INK = BLOCK_H * 0.4;

function LineNum({
  lineId = lineNumDefaultProps.lineId,
  colorKey = lineNumDefaultProps.colorKey,
  textZh = lineNumDefaultProps.textZh,
  textEn = lineNumDefaultProps.textEn,
  size = lineNumDefaultProps.size,
  foreground = lineNumDefaultProps.foreground,
  background = lineNumDefaultProps.background,
  background2 = lineNumDefaultProps.background2,
}: LineNumProps) {
  const fontsReady = useFontsReady();
  const scale = size === "small" ? SMALL_SCALE : 1;
  const key = colorKey && colorKey in colors ? colorKey : "line1";
  const plateColor = (colors as Record<string, string>)[key];
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bgColor =
    background && background.length > 0 ? background : colors.background;

  const numText = (lineId ?? "").trim();
  const zhText = normalizeSvgLine(textZh);
  const enText = normalizeSvgLine(textEn);

  const numFont = fontEn("medium", NUM_SIZE);
  const zhFont = fontZh("medium", ZH_SIZE);
  const enFont = fontEn("medium", EN_SIZE);
  const numWidth = numText ? measureText(numText, numFont) : 0;
  const zhWidth = zhText ? measureText(zhText, zhFont) : 0;
  const enWidth = enText ? measureText(enText, enFont) : 0;

  const hasNum = Boolean(numText);
  // 英文字距要计入排版宽度：rendered = measure + spacing × (字符数 - 1)
  const enSpacing = EN_SPACING * EN_SIZE;
  const enRendered =
    enWidth + enSpacing * Math.max(0, Array.from(enText ?? "").length - 1);
  const textWidth = Math.max(zhWidth, enRendered);
  // PDF 标注的数字↔文字间隙是「墨迹对墨迹」（1 号线牌 ink 实测 0.303a、
  // 10 号线牌 0.065a）。measureText 给的是 advance 宽度，两端各带一段
  // 空白边（bearing），直接用会显得间隙过大 —— 用 canvas 的 ink 边界
  // 把两侧 bearing 扣掉。
  const inkOf = (text: string, font: string) => {
    if (!text || typeof document === "undefined") return null;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;
    ctx.font = font;
    const m = ctx.measureText(text);
    return {
      advance: m.width,
      // start 锚点下：ink 左缘偏移（汉字 ≈ 0）、ink 右缘偏移
      left: -m.actualBoundingBoxLeft,
      right: m.actualBoundingBoxRight,
    };
  };
  const numInk = hasNum ? inkOf(numText, numFont) : null;
  const zhInk = zhText ? inkOf(zhText, zhFont) : null;
  const numRightBearing = numInk ? Math.max(0, numInk.advance - numInk.right) : 0;
  const zhLeftBearing = zhInk ? Math.max(0, zhInk.left) : 0;
  const gap = hasNum
    ? Math.max(
        1,
        (numText.length >= 2 ? GAP_2 : GAP_1) - numRightBearing - zhLeftBearing
      )
    : 0;

  // 牌宽：数字牌按位数固定（1.85a / 1.95a），文字牌按内容自适应；
  // 内容过宽时（超长线路名）退化为内容 + 两侧 0.26a。
  const digits = Math.max(1, Array.from(numText).length);
  const plateW = hasNum
    ? Math.max(
        PLATE_W_1DIGIT + PLATE_W_EXTRA * (digits - 1),
        numWidth + gap + textWidth + BLOCK_H * 0.2
      )
    : Math.max(BLOCK_H, textWidth + TEXT_PLATE_PAD);

  // 内容整体水平居中
  const contentW = hasNum ? numWidth + gap + textWidth : textWidth;
  const contentX = (plateW - contentW) / 2;
  const numX = contentX;
  // 文字栏两行互相居中对齐（锚点 = 文字栏的中心，不是右缘）
  const textCenterX = contentX + contentW - textWidth / 2;
  const zhX = textCenterX - zhWidth / 2;
  const enX = textCenterX - enRendered / 2;

  const totalWidth = OUTER_MARGIN * 2 + plateW;
  const blockY = (ROW_H - BLOCK_H) / 2;
  const centerY = blockY + BLOCK_H / 2;

  // 数字 ink 垂直居中（Arial 数字无下降部，基线 = ink 底）
  const numBaseline = centerY + NUM_INK / 2;
  // 文字栏整体垂直居中：号线 ink 顶在栏顶、Line cap 底在栏底
  const textColTop = centerY - TEXT_COL_H / 2;
  const zhBaseline = textColTop + ZH_INK;
  const enBaseline = textColTop + TEXT_COL_H;

  return (
    <MultiRowBackground
      background={bgColor}
      background2={background2}
      style={{ height: ROW_H * scale, width: totalWidth * scale }}
    >
      <svg
        width={totalWidth * scale}
        height={ROW_H * scale}
        viewBox={`0 0 ${totalWidth} ${ROW_H}`}
        data-fonts-ready={fontsReady}
      >
        <rect
          x={OUTER_MARGIN}
          y={blockY}
          width={plateW}
          height={BLOCK_H}
          rx={RADIUS}
          fill={plateColor}
        />
        {numText ? (
          <text
            x={OUTER_MARGIN + numX}
            y={numBaseline}
            fontSize={NUM_SIZE}
            fontWeight={WEIGHT_VALUE.medium}
            fill={fg}
            fontFamily={fontFamilyEn}
            xmlSpace="preserve"
          >
            {numText}
          </text>
        ) : null}
        {zhText ? (
          <text
            x={OUTER_MARGIN + zhX}
            y={zhBaseline}
            fontSize={ZH_SIZE}
            fontWeight={WEIGHT_VALUE.medium}
            fill={fg}
            fontFamily={fontFamilyEn}
            xmlSpace="preserve"
          >
            {zhText}
          </text>
        ) : null}
        {enText ? (
          <text
            x={OUTER_MARGIN + enX}
            y={enBaseline}
            fontSize={EN_SIZE}
            fontWeight={WEIGHT_VALUE.medium}
            letterSpacing={EN_SPACING * EN_SIZE}
            fill={fg}
            fontFamily="Arial, Helvetica, sans-serif"
            xmlSpace="preserve"
          >
            {enText}
          </text>
        ) : null}
      </svg>
    </MultiRowBackground>
  );
}

LineNum.getEditorConfig = (t: (key: string) => string) =>
  lineNumEditorConfig(t);

export default LineNum;
