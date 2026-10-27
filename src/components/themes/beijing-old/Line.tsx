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
  Background,
  backgroundFormItems,
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
export interface LineProps {
  /** 线路号；留空则为文字线路牌（如「八通线 / Batong Line」） */
  lineId?: string;
  /** 线路标志色（colors 的键），即牌面底色 */
  colorKey?: string;
  /** 中文文字，数字牌为「号线」，文字牌为线路名 */
  textZh?: string;
  /** 英文文字，如「Line 1」「Batong Line」 */
  textEn?: string;
  /** 前景色（牌内文字）；留空用白色 */
  foreground?: string;
  /** 底板色；留空用经典版面深蓝 */
  background?: string;
  /** 第二行背景色（上下分色） */
}

export const lineDefaultProps: LineProps = {
  lineId: "1",
  colorKey: "line1",
  textZh: "号线",
  textEn: "Line 1",
  foreground: colors.foreground,
  background: colors.background,
};

export const LINE_COLOR_KEYS: string[] = Array.from(
  new Set(lines.map(line => line.colorKey))
);

/** 唯一的线路色下拉（选项文案复用 themes.beijingOld.colors.<key>） */
const lineColorFormItem = (
  t: (key: string) => string
): EditorConfig["forms"][number] => ({
  key: "colorKey",
  label: "themes.beijingOld.components.Line.props.colorKey.displayName",
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

export const lineEditorConfig = (
  t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijingOld.components.Line.props";
  return {
    forms: [
      digitFormItem(scope, "lineId", 2),
      lineColorFormItem(t),
      textFormItem(scope, "textZh"),
      textFormItem(scope, "textEn"),
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;

/** 牌高 1a：行 = 1.5a（官方 DB11/T 657.2—2024 示例图：方形模块 = 1a ≈ 2/3 行高） */
const BLOCK_H = ROW_H / 1.5;
/** 圆角半径 0.09a（放大对比官方样例目测校准） */
const RADIUS = BLOCK_H * 0.09;
/** 数字 ink 0.735a（官方样例「1」ink 高 0.735H 实测），Arial cap = 0.716em */
const NUM_SIZE = (BLOCK_H * 0.735) / 0.716;
/** 「号线」ink 0.40a（汉字 ink ≈ 0.88em） */
const ZH_SIZE = (BLOCK_H * 0.4) / 0.88;
/** 「Line N」cap 0.187a（官方样例实测，八通线的 0.239H 含 g 下降部） */
const EN_SIZE = (BLOCK_H * 0.187) / 0.716;
/**
 * 数字牌布局锚点（官方样例实测，单位 a）：
 *  - 一位数（1 号线牌 W/H 1.852）：数字 ink x0 = 0.194a、文字栏 x0 = 0.769a、牌宽 1.852a
 *  - 两位数（13 号线牌 W/H 1.926）：数字压缩后 ink x0 = 0.118a、文字栏 x0 = 0.955a、牌宽 1.926a
 *  - 文字栏（号线/Line 两行互相居中）在两块官方牌里的 ink 宽同为 0.839a
 */
const ONE_DIGIT = { numX: 0.194, gap: 0.26, padR: 0.194, textX: 0.769, plateW: 1.852 };
const TWO_DIGIT = { numX: 0.118, gap: 0.1, padR: 0.118, textX: 0.955, plateW: 1.926 };
// 官方牌宽（一位 1.85a / 两位 1.95a）—— 内容不超宽时用固定值
/** 官方文字栏 ink 宽（锚定文字栏中心用） */
const TEXT_COL_INK = 0.839;
/** 两位数及以上的数字横向压缩比例（同新版 numScale 的手法） */
const NUM_COMPRESS = 0.9;
/** 文字牌左右留白 0.194a（八通线牌实测左 0.194a / 右 0.175a） */
const PAD_X = BLOCK_H * 0.194;
/** 数字 ink 与文字栏之间的保底间隙（官方 13 号牌实测 ≈ 0.03a，很挤） */
const MIN_GAP = BLOCK_H * 0.03;
/** 牌外左右留白 */
const OUTER_MARGIN = 5;
/** 数字用 Arial 原生粗度（官方样例数字笔画细）；汉字保持 700 观感 */
const PLATE_WEIGHT = 400;

const NUM_INK = NUM_SIZE * 0.716;
/** SimHei 汉字 ink 顶到基线的距离（px，放大实测校准） */
const ZH_ASCENT_PX = 15.24;

function Line({
  lineId = lineDefaultProps.lineId,
  colorKey = lineDefaultProps.colorKey,
  textZh = lineDefaultProps.textZh,
  textEn = lineDefaultProps.textEn,
  foreground = lineDefaultProps.foreground,
  background = lineDefaultProps.background,
}: LineProps) {
  const fontsReady = useFontsReady();
  const scale = 1;
  const key = colorKey && colorKey in colors ? colorKey : "line1";
  const plateColor = (colors as Record<string, string>)[key];
  const bgColor =
    background && background.length > 0 ? background : colors.background;

  const numText = normalizeSvgLine(lineId);
  const zhText = normalizeSvgLine(textZh);
  const enText = normalizeSvgLine(textEn);

  const numFont = fontEn(PLATE_WEIGHT, NUM_SIZE);
  const zhFont = fontZh(700, ZH_SIZE);
  const enFont = fontEn(400, EN_SIZE);
  const digits = Array.from(numText).length;
  const m = digits >= 2 ? TWO_DIGIT : ONE_DIGIT;
  /**
   * 数字横向压缩：牌宽严格固定（一位 1.85a / 两位 1.95a），
   * 数字可用宽 = 官方文字栏锚点 - 保底间隙 - 数字 ink 起点；
   * 两位数默认压到 NUM_COMPRESS，任何数字超宽都进一步压缩 —— 换线路色/位数牌宽严格不变。
   */
  /**
   * 数字字距按首位形态自适应：1 开头（字形窄、右侧空隙大）收得更紧，
   * 其余数字微收 —— 官方「13」号牌的「1」「3」墨迹间隙明显小于同字号排布。
   */
  const numSpacing =
    digits >= 2 ? (numText.startsWith("1") ? -0.032 : -0.012) * NUM_SIZE : 0;
  const enRendered = enText ? measureText(enText, enFont) : 0;
  const zhWidth = zhText ? measureText(zhText, zhFont) : 0;
  const hasNum = Boolean(numText.trim());
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
      // ink 顶到基线的真实距离（汉字 ink 高随字体/字重变化，不能靠模型值）
      ascent: m.actualBoundingBoxAscent,
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
  // letterSpacing 会收窄 ink 右缘：把它计入 ink 度量，保证排版与渲染一致
  if (numInkRaw && numSpacing !== 0) {
    numInkRaw.right += numSpacing * Math.max(0, digits - 1);
  }

  const numScale = digits >= 2 ? NUM_COMPRESS : 1;
  const numInk = numInkRaw
    ? {
        advance: numInkRaw.advance * numScale,
        left: numInkRaw.left * numScale,
        right: numInkRaw.right * numScale,
      }
    : null;

  const numInkX0 = hasNum ? m.numX * BLOCK_H : 0;
  const numInkW = numInk ? numInk.right - numInk.left : 0;
  const padR = hasNum ? m.padR * BLOCK_H : PAD_X;
  // 数字已被压缩到「ink 右 + 保底间隙 ≤ 官方文字栏锚点」（见 numScale），
  // 因此文字栏恒落官方锚点、牌宽恒官方值；仅文字比官方栏宽长时扩展
  const numInkRight = hasNum && numInk ? numInkX0 + numInkW : 0;
  const textInkX0 = hasNum
    ? Math.max(m.textX * BLOCK_H, numInkRight + MIN_GAP)
    : PAD_X;
  // 数字 ink x0 锚定：numX = 目标 ink 位置 - 数字 ink 左 bearing（压缩后）
  const numX = hasNum && numInk ? numInkX0 - numInk.left : PAD_X;
  // 文字栏：ink 宽 = max(官方 0.839a, 中英实测 ink)，超宽时栏扩展、牌跟着撑
  const zhInkM = zhText ? inkOf(zhText, zhFont) : null;
  const enInkM = enText ? inkOf(enText, enFont) : null;
  const zhInkW = zhInkM ? zhInkM.right - zhInkM.left : 0;
  const enInkW = enInkM ? enInkM.right - enInkM.left : 0;
  const colLeft = textInkX0;
  const colInkW = Math.max(TEXT_COL_INK * BLOCK_H, zhInkW, enInkW, 1);
  const colRight = colLeft + colInkW;
  const plateW = hasNum ? colRight + padR : colRight + PAD_X;
  // 有数字：中英文都按 ink 右对齐到栏右缘（官方样例「号线/Line 1」贴右）；
  // 中文 700 是伪粗（SimHei 无 700 档），SVG 合成粗体使 ink 右缘比 canvas
  // 实测（不合成）宽 ≈1.5px —— 右对齐时补偿掉，保证与英文 ink 右严格齐平
  const zhX = hasNum
    ? colRight - (zhInkM ? zhInkM.right : zhWidth) + (zhInkM ? 1.5 : 0)
    : colLeft + (colInkW - zhWidth) / 2;
  const enX = hasNum
    ? colRight - (enInkM ? enInkM.right : enRendered)
    : colLeft + (colInkW - enRendered) / 2;

  const totalWidth = OUTER_MARGIN * 2 + plateW;
  const blockY = (ROW_H - BLOCK_H) / 2;
  const centerY = blockY + BLOCK_H / 2;

  // 数字 ink 垂直居中（Arial 数字无下降部，基线 = ink 底）
  const numBaseline = centerY + NUM_INK / 2;
  // 「号线」ink 顶与数字 ink 顶对齐（官方样例）；「Line N」沉到下方
  const numInkTop = numBaseline - NUM_INK;
  // 「号线」ink 顶与数字 ink 顶对齐；SimHei 汉字 ascent 写死（SVG 渲染实测 0.52em）。
  // 纯中文牌（无数字）与数字牌共用同一组基线，垂直位置完全一致。
  const zhBaseline = numInkTop + ZH_ASCENT_PX;
  // 英文 ink 底与数字 ink 底对齐（Arial 无下降字符时基线即 cap 底）
  const enBaseline = numBaseline;

  return (
    <Background
      background={bgColor}
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
    </Background>
  );
}

Line.getEditorConfig = (t: (key: string) => string) =>
  lineEditorConfig(t);

export default Line;
