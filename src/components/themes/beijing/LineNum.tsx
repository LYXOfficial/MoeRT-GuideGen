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
  foregroundFormItem,
  digitFormItem,
  numberFormItem,
  textFormItem,
} from "./Background";

/**
 * 数字线路标（M2）。
 *
 * 版式按「新版线路标志」实测复原，两个来源比例完全一致：
 *  A) 标准 stdrd.pdf 附录 A 线路名称色块组合样张：
 *     色块 42.39×28.27（1.50:1）；数字 ink 13.98=0.495H；「号线」ink 8.45=0.30H；
 *     「Line N」ink 3.59=0.127H；底部线路色带 32.96×7.54（带高 0.267H）
 *  B) 用户提供的 8 号线标参考图（216×159）像素实测：
 *     底板 #142134（新版藏青）、色带 #00a675、文字白；数字 ink 70/141=0.496H、
 *     「号线」37/141=0.262H、「Line 8」19/141=0.135H、色带 36/141=0.255H；
 *     数字 0.170H–0.666H、「号线」0.191H–0.447H、「Line N」0.532H–0.666H
 *
 * 关键结构（旧实现完全做错的地方）：**底板是版面藏青，线路色只出现在底部色带**，
 * 不是整块线路色底板；数字在左并纵向跨两行，右上「号线」、右下「Line N」，文字白色。
 */
export interface LineNumProps {
  /** 线路号；留空则不渲染，且右侧不留空位 */
  lineId?: string;
  /** 线路标志色（colors 的键），即底部色带颜色 */
  colorKey?: string;
  /** 中文文字，如「号线」「房山线」 */
  textZh?: string;
  /** 英文文字，如「Line 1」「Fangshan Line」 */
  textEn?: string;
  /** default = 占满整行（贴底）；small = 小尺寸 + 较大左右间距 */
  size?: "default" | "small";
  /** 色带左侧延长（px），只绘制，不支持投放 */
  extendLeft?: number;
  /** 色带右侧延长（px） */
  extendRight?: number;
  /** 前景色（数字与文字）；留空用白色 */
  foreground?: string;
  /** 底板色；留空用新版版面藏青 */
  background?: string;
  /** 第二行背景色（上下分色） */
  background2?: string;
}

export const lineNumDefaultProps: LineNumProps = {
  lineId: "6",
  colorKey: "line6",
  textZh: "号线",
  textEn: "Line 6",
  size: "default",
  extendLeft: 0,
  extendRight: 0,
  // 留空 = 白色文字（新版线路标文字坐在藏青底板上，不随线路换蓝字）
  foreground: colors.foreground,
  // 留空 = 新版版面藏青
  background: colors.background,
  background2: colors.background,
};

export const LINE_COLOR_KEYS: string[] = Array.from(
  new Set(lines.map(line => line.colorKey))
);

/** 唯一的线路色下拉（选项文案复用 themes.beijing.colors.<key>） */
const lineColorFormItem = (
  t: (key: string) => string
): EditorConfig["forms"][number] => ({
  key: "colorKey",
  label: "themes.beijing.components.LineNum.props.colorKey.displayName",
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
            {t(`themes.beijing.colors.${key}`)}
          </span>
        </Select.Option>
      ))}
    </Select>
  ),
});

export const lineNumEditorConfig = (
  t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijing.components.LineNum.props";
  return {
    forms: [
      digitFormItem(scope, "lineId", 2),
      lineColorFormItem(t),
      textFormItem(scope, "textZh"),
      textFormItem(scope, "textEn"),
      {
        key: "size",
        label: `${scope}.size.displayName`,
        element: (
          <Select>
            <Select.Option value="default">
              {t("themes.beijing.common.size.default")}
            </Select.Option>
            <Select.Option value="small">
              {t("themes.beijing.common.size.small")}
            </Select.Option>
          </Select>
        ),
      },
      numberFormItem(scope, "extendLeft", "extendLeft", 20),
      numberFormItem(scope, "extendRight", "extendRight", 20),
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;

interface SizeSpec {
  /** 色块总高（px） */
  blockH: number;
  /** 数字 ink 占色块高（官方实测 0.531） */
  numInk: number;
  /** 「号线」ink 占色块高（0.323） */
  zhInk: number;
  /** 「Line N」ink 占色块高（0.135） */
  enInk: number;
  /** 内容上留白占色块高（0.104） */
  padTop: number;
  /** 底部线路色带高度占色块高（0.26） */
  bandRatio: number;
  /** 左右内边距 */
  padX: number;
  /** 最小宽高比（官方 2 号线标 W/H≈1.24） */
  minRatio: number;
  outerMargin: number;
}

/**
 * 实测来源：官方样式表「五倍尺寸横向标志牌」里的 2 号线标（像素实测）
 *   标总高 96（内容 51 + 上下留白 10 + 色带 25）→ 色带 0.26H
 *   数字 ink 51=0.531H、「号线」ink 31=0.323H、「Line N」ink 13=0.135H
 *   数字在左纵跨两行，「号线」右上、「Line N」右下（与数字底齐平），文字白色
 *   宽由内容决定（2 号线标 W/H≈1.24，10 号线更宽）
 */
const SIZE_SPEC: SizeSpec = {
  blockH: 65,
  numInk: 0.55,
  zhInk: 0.323,
  enInk: 0.135,
  padTop: 0.104,
  bandRatio: 0.26,
  padX: 0,
  minRatio: 1.2,
  outerMargin: 5,
};

/**
 * 小尺寸 = 默认版式整体原地缩放（scale 0.62 ≈ 原来 blockH 40 的观感），
 * 不再为 small 单独维护一套常量（字号是写死的，单独改 blockH 会把文字撑破）。
 */
const SMALL_SCALE = 0.6;

/** 数字右缘到「号线」左缘的间隙（附录 A 样张 7.88pt / 42.39 ≈ 0.19W） */
const NUM_GAP_RATIO = -0.13;

/** 数字栏预留用的压缩比例（与两位数的 numScale 保持一致） */
const NUM_SLOT_SCALE = 0.85;

function LineNum({
  lineId = lineNumDefaultProps.lineId,
  colorKey = lineNumDefaultProps.colorKey,
  textZh = lineNumDefaultProps.textZh,
  textEn = lineNumDefaultProps.textEn,
  size = lineNumDefaultProps.size,
  extendLeft = lineNumDefaultProps.extendLeft,
  extendRight = lineNumDefaultProps.extendRight,
  foreground = lineNumDefaultProps.foreground,
  background = lineNumDefaultProps.background,
  background2 = lineNumDefaultProps.background2,
}: LineNumProps) {
  const fontsReady = useFontsReady();
  const spec = SIZE_SPEC;
  // 小尺寸：不另建常量，直接整体原地缩放
  const scale = size === "small" ? SMALL_SCALE : 1;
  const key = colorKey && colorKey in colors ? colorKey : "line1";
  const bandColor = (colors as Record<string, string>)[key];
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const plateColor =
    background && background.length > 0 ? background : colors.background;

  const numText = (lineId ?? "").trim();
  // 首尾空白去掉、制表换行当空格；中间的空格保留（渲染侧配 xmlSpace="preserve"）
  const zhText = normalizeSvgLine(textZh);
  const enText = normalizeSvgLine(textEn);

  const numFontSize = 42;
  const zhFontSize = 18;
  const enFontSize = 10;

  const zhSpacing = 0;
  const enSpacing = 0.2;

  const zhFont = fontZh("medium", zhFontSize);
  const enFont = fontEn("medium", enFontSize);
  const numFont = fontEn("medium", numFontSize);

  // 线路号为两位及以上时横向压缩（标准字宽：数字最小 85%）
  const numScale = numText.length >= 2 ? 0.85 : 1;
  const numSpacing =
    numText.length >= 2
      ? numText[0] === "1" && numText.length === 2
        ? -5
        : -1
      : 0;
  const numWidth = numText ? measureText(numText, numFont) * numScale : 0;
  const zhWidth = zhText ? measureText(zhText, zhFont) : 0;
  const enWidth = enText ? measureText(enText, enFont) : 0;

  // 数字栏固定宽度：至少按两位数字预留 → 一位数与两位数的组件总宽一致，
  // 一位数多出来的空隙留在数字右侧（数字仍贴左）；线路号为空时不预留。
  // 预留一律用两位数的压缩比例（NUM_SLOT_SCALE），否则一位数(numScale=1)会比两位数更宽。
  const numSlotWidth = numText
    ? Math.max(
        numWidth,
        measureText(
          "0".repeat(Math.max(2, Array.from(numText).length)),
          numFont
        ) * NUM_SLOT_SCALE
      )
    : 0;

  const gap = numText && (zhText || enText) ? spec.blockH * NUM_GAP_RATIO : 0;
  // 字距必须计入排版宽度。注意单位：SVG 的 letter-spacing 无单位时按「用户单位(px)」算，
  // 本文件数字字距 numSpacing 也是 px（-3/-5），所以这里同样按 px：
  //   rendered = measureText + spacing × (字数-1)
  // （之前误按 em 放大，导致色块被撑宽、文字却没真加字距，看着又"延长"又"不靠右"）
  const zhRendered =
    zhWidth + zhSpacing * Math.max(0, Array.from(zhText ?? "").length - 1);
  const enRendered =
    enWidth + enSpacing * Math.max(0, Array.from(enText ?? "").length - 1);
  const textWidth = Math.max(zhRendered, enRendered);
  // 两处视觉微调：与下方 numX / textX 共用，否则色块宽度会漏算这份偏移
  const numLeftNudge = 2; // 数字整体右移
  const textLeftNudge = 5; // 文字栏（号线 / Line N）再右移
  const contentLeft = spec.padX + numLeftNudge;
  // 没有线路号时：中英文整体居中，色块按内容自适应（左右等边距）
  const hasNum = Boolean(numText);
  const sidePad = spec.padX + numLeftNudge;
  const contentWidth = hasNum
    ? numSlotWidth + gap + textLeftNudge + textWidth
    : textWidth;
  // 色块宽度 = 内容实际占用宽度（左内边距 + 内容 + 右内边距），
  // 不再按 minRatio 额外撑宽，否则色块会比文字长、右边留出一条空档。
  const blockWidth = Math.max(
    1,
    Math.ceil(
      hasNum
        ? contentLeft + contentWidth + spec.padX
        : contentWidth + sidePad * 2
    )
  );

  const extLeft = Math.max(0, extendLeft ?? 0);
  const extRight = Math.max(0, extendRight ?? 0);
  const totalWidth = spec.outerMargin * 2 + blockWidth + extLeft + extRight;
  const originX = spec.outerMargin + extLeft;

  const blockY = ROW_H - spec.blockH;
  const bandH = spec.blockH * spec.bandRatio;

  // 内容上留白 → 数字 ink → 「号线」上缘与数字上缘齐平 → 「Line N」底与数字底齐平
  const contentTop = blockY + spec.blockH * spec.padTop;
  const numInk = spec.blockH * spec.numInk;
  const numBaseline = contentTop + numInk;
  const zhBaseline = contentTop + 20;
  const enBaseline = numBaseline;

  const numX = originX + contentLeft;
  // 有数字：「号线」/「Line N」紧跟在固定数字栏之后；
  // 无数字：两行文字整体在色块内水平居中
  const textCenterX = originX + blockWidth / 2;
  const textX = hasNum
    ? numX + numSlotWidth + gap + textLeftNudge
    : textCenterX;
  // 文字栏右缘 = 中文/英文里更宽的那个的右缘（色块右内边距就贴在它后面）
  const textRight = textX + Math.max(zhRendered, enRendered);
  // 有数字时：中文、英文都右对齐到这条右缘 ——
  // 英文比「号线」长的时候，中文跟着往右走到英文右缘，而不是待在原地；
  // 没有数字时两行整体在色块内居中（锚点 = 色块中心），不受影响。
  // text-anchor="end" 的锚点含末尾字距，各自补一个自己的字距（px）；
  // 英文再左移 1px 作视觉微调。
  const zhAnchorX = hasNum ? textRight + zhSpacing : textCenterX;
  const enAnchorX = hasNum ? textRight + enSpacing - 1 : textCenterX;

  return (
    <MultiRowBackground
      background={plateColor}
      background2={background2}
      style={{ height: ROW_H * scale, width: totalWidth * scale }}
    >
      <svg
        width={totalWidth * scale}
        height={ROW_H * scale}
        viewBox={`0 0 ${totalWidth} ${ROW_H}`}
        data-fonts-ready={fontsReady}
      >
        {/* 底板不自己画：背景交给 MultiRowBackground（background / background2 上下分色），
            这里只画底部线路色带，保证两行背景能透出来 */}
        {/* 底部线路色带（含左右延长段） */}
        <rect
          x={originX - extLeft}
          y={blockY + spec.blockH - bandH}
          width={blockWidth + extLeft + extRight}
          height={bandH}
          fill={bandColor}
        />
        {numText ? (
          <g transform={`translate(${numX} 0) scale(${numScale} 1)`}>
            <text
              x={0}
              y={numBaseline}
              fontSize={numFontSize}
              letterSpacing={numSpacing}
              fontWeight={WEIGHT_VALUE["medium"]}
              fill={fg}
              fontFamily={fontFamilyEn}
            >
              {numText}
            </text>
          </g>
        ) : null}
        {zhText ? (
          <text
            x={zhAnchorX}
            textAnchor={hasNum ? "end" : "middle"}
            y={zhBaseline}
            fontSize={zhFontSize}
            fontWeight={WEIGHT_VALUE["bold"]}
            fontFamily={fontFamilyEn}
            letterSpacing={zhSpacing}
            fill={fg}
            xmlSpace="preserve"
          >
            {zhText}
          </text>
        ) : null}
        {enText ? (
          // 英文右对齐（原为左对齐，其余排版不动）
          <text
            x={enAnchorX}
            y={enBaseline}
            fontSize={enFontSize}
            fontWeight={WEIGHT_VALUE["bold"]}
            letterSpacing={enSpacing}
            textAnchor={hasNum ? "end" : "middle"}
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
