import { Select } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import lines, { findLine } from "./define/lines";
import {
  fontEn,
  fontZh,
  measureText,
  normalizeSvgLine,
  useFontsReady,
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
  foreground: "", // 留空 = 白字；黄底线路自动用文字蓝
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
/** 圆角半径 0.065a（官方样例牌顶行内缩 10px / 牌高 155px 实测） */
const RADIUS = BLOCK_H * 0.065;
/** 数字 ink 0.735a（官方样例「1」ink 高 0.735H 实测），Arial cap = 0.716em */
const NUM_SIZE = (BLOCK_H * 0.735) / 0.716;
/** 「号线」ink 0.40a（汉字 ink ≈ 0.88em） */
const ZH_SIZE = (BLOCK_H * 0.4) / 0.88;
/** 「Line N」cap 0.187a（官方样例实测，八通线的 0.239H 含 g 下降部） */
const EN_SIZE = (BLOCK_H * 0.187) / 0.716;
/** 文字栏总高（号线 ink + 间隙 + Line cap）= 0.684a（无数字时垂直居中用） */
const TEXT_COL_H = BLOCK_H * 0.684;
/** 「号线」ink 底到「Line N」cap 顶的间隙 0.097a（1 号线牌实测） */
const TEXT_GAP_LINE = BLOCK_H * 0.097;
const EN_CAP_H = BLOCK_H * 0.187;
/**
 * 数字牌布局锚点（官方样例实测，单位 a）：
 *  - 一位数（1 号线牌 W/H 1.852）：数字 ink x0 = 0.194a、文字栏 x0 = 0.769a、牌宽 1.852a
 *  - 两位数（13 号线牌 W/H 1.926）：数字压缩后 ink x0 = 0.118a、文字栏 x0 = 0.955a、牌宽 1.926a
 *  - 文字栏（号线/Line 两行互相居中）在两块官方牌里的 ink 宽同为 0.839a
 */
const ONE_DIGIT = { numX: 0.194, textX: 0.769, plateW: 1.852 };
const TWO_DIGIT = { numX: 0.118, textX: 0.955, plateW: 1.926 };
/** 官方文字栏 ink 宽（锚定文字栏中心用） */
const TEXT_COL_INK = 0.839;
/** 两位数及以上的数字横向压缩比例（同新版 numScale 的手法） */
const NUM_COMPRESS = 0.9;
/** 文字牌左右留白 0.194a（八通线牌实测左 0.194a / 右 0.175a） */
const PAD_X = BLOCK_H * 0.194;
/** 牌外左右留白 */
const OUTER_MARGIN = 5;
/** 小尺寸整体缩放（与新版口径一致） */
const SMALL_SCALE = 0.62;
/** 数字用 Arial 原生粗度（官方样例数字笔画细）；汉字保持 700 观感 */
const PLATE_WEIGHT = 400;

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
  const bgColor =
    background && background.length > 0 ? background : colors.background;

  const numText = (lineId ?? "").trim();
  const zhText = normalizeSvgLine(textZh);
  const enText = normalizeSvgLine(textEn);

  const numFont = fontEn(PLATE_WEIGHT, NUM_SIZE);
  const zhFont = fontZh(700, ZH_SIZE);
  const enFont = fontEn(400, EN_SIZE);
  const digits = Array.from(numText).length;
  // 两位数及以上：数字整体横向压缩（官方 13 号线牌实测）
  const numScale = digits >= 2 ? NUM_COMPRESS : 1;
  const m = digits >= 2 ? TWO_DIGIT : ONE_DIGIT;
  /**
   * 数字字距按首位形态自适应：1 开头（字形窄、右侧空隙大）收得更紧，
   * 其余数字微收 —— 官方「13」号牌的「1」「3」墨迹间隙明显小于同字号排布。
   */
  const numSpacing =
    digits >= 2 ? (numText.startsWith("1") ? -0.024 : -0.006) * NUM_SIZE : 0;
  const enRendered = enText ? measureText(enText, enFont) : 0;
  const zhWidth = zhText ? measureText(zhText, zhFont) : 0;
  const hasNum = Boolean(numText);
  const textWidth = Math.max(zhWidth, enRendered);
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

  // 牌上文字色：默认按线路（黄底深蓝字），显式给了 foreground 则跟随
  const textColor =
    foreground && foreground.length > 0
      ? foreground
      : (findLine(Object.keys(colors).find(k => (colors as Record<string, string>)[k] === plateColor) ?? "")?.textColor ?? colors.foreground);
  // PDF/官方样例标注的数字↔文字间隙是「墨迹对墨迹」（1 号线牌 ink 实测
  // 0.303a、10 号线牌 0.065a）。measureText 给的是 advance 宽度，两端各带
  // 一段空白边（bearing），直接用会显得间隙过大 —— 用 canvas 的 ink 边界
  // 把两侧 bearing 扣掉。
  const numInkRaw = hasNum ? inkOf(numText, numFont) : null;
  const numInk = numInkRaw
    ? {
        advance: numInkRaw.advance * numScale,
        left: numInkRaw.left * numScale,
        right: numInkRaw.right * numScale,
      }
    : null;

  // 数字牌：官方锚点直接定位（数字 ink x0 / 文字栏 x0 / 牌宽），内容超宽时向右扩展
  // 文字牌：内容贴左 0.194a，牌宽 = 内容 + 两侧边距
  const plateW = hasNum
    ? Math.max(
        m.plateW * BLOCK_H,
        m.textX * BLOCK_H + textWidth + BLOCK_H * 0.15
      )
    : Math.max(BLOCK_H, textWidth + PAD_X * 2);

  // 数字 ink x0 锚定：numX = 目标 ink 位置 - 数字 ink 左 bearing（压缩后）
  const numX = hasNum && numInk ? m.numX * BLOCK_H - numInk.left : PAD_X;
  // 文字栏中心锚定：官方文字栏 ink 宽 0.839a，两行互相居中于栏中心
  const textCenterX = m.textX * BLOCK_H + (TEXT_COL_INK * BLOCK_H) / 2;
  const zhX = textCenterX - zhWidth / 2;
  // 有数字时英文右对齐到文字栏右缘（官方样例「Line 1」贴齐「号线」右缘）
  const textColRight = textCenterX + (TEXT_COL_INK * BLOCK_H) / 2;
  const enX = textColRight - enRendered;

  const totalWidth = OUTER_MARGIN * 2 + plateW;
  const blockY = (ROW_H - BLOCK_H) / 2;
  const centerY = blockY + BLOCK_H / 2;

  // 数字 ink 垂直居中（Arial 数字无下降部，基线 = ink 底）
  const numBaseline = centerY + NUM_INK / 2;
  // 「号线」ink 顶与数字 ink 顶对齐（官方样例）；「Line N」沉到下方
  const numInkTop = numBaseline - NUM_INK;
  const zhBaseline = hasNum
    ? numInkTop + ZH_INK
    : centerY - TEXT_COL_H / 2 + ZH_INK;
  const enBaseline = zhBaseline + TEXT_GAP_LINE + EN_CAP_H;

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
          <g transform={`translate(${OUTER_MARGIN + numX} 0) scale(${numScale} 1)`}>
            <text
              x={0}
              y={numBaseline}
              fontSize={NUM_SIZE}
              fontWeight={PLATE_WEIGHT}
              letterSpacing={numSpacing}
              fill={textColor}
              fontFamily={fontFamilyEn}
              xmlSpace="preserve"
            >
              {numText}
            </text>
          </g>
        ) : null}
        {zhText ? (
          <text
            x={OUTER_MARGIN + zhX}
            y={zhBaseline}
            fontSize={ZH_SIZE}
            fontWeight={700}
            fill={textColor}
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
            fontWeight={400}
            fill={textColor}
            fontFamily={fontFamilyEn}
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
