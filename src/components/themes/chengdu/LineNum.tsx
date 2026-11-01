import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select, Switch } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import RectModeSelect from "../../RectModeSelect";
import { normalizeSvgLine } from "../../../utils/svgText";

export interface LineNumProps {
  num: string;
  lineColor: string;
  customChinese?: string;
  customEnglish?: string;
  showText?: boolean;
  showRect?: boolean;
  /** 色块模式：default = 标准示例（满高宽块）；narrow = 窄色块（旧版式） */
  rectMode?: "default" | "narrow";
  /**
   * 风格：classic = 经典（左侧竖条 + 数字/文字）；block = 色块（2026 版，
   * 整块圆角牌面，数字与文字缩小一圈装进牌里）
   */
  variant?: "classic" | "block";
  align?: string;
  foreground?: string;
  background?: string;
}

export const lineNumDefaultProps: LineNumProps = {
  num: "3",
  lineColor: colors.line3,
  customChinese: "号线",
  customEnglish: "Line",
  showText: true,
  showRect: true,
  rectMode: "default",
  variant: "classic",
  align: "left",
  foreground: colors.foreground,
  background: colors.transparent,
};

export const lineNumEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "lineColor",
      label: "themes.chengdu.components.LineNum.props.lineColor",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "num",
      label: "themes.chengdu.components.LineNum.props.num",
      element: <Input />,
    },
    {
      key: "customChinese",
      label: "themes.chengdu.components.LineNum.props.customChinese",
      element: <Input />,
    },
    {
      key: "customEnglish",
      label: "themes.chengdu.components.LineNum.props.customEnglish",
      element: <Input />,
    },
    {
      key: "showText",
      label: "themes.chengdu.components.LineNum.props.showText",
      element: <Switch />,
    },
    {
      key: "showRect",
      label: "themes.chengdu.components.LineNum.props.showRect",
      element: <Switch />,
    },
    {
      key: "rectMode",
      label: "themes.chengdu.components.LineNum.props.rectMode.displayName",
      element: (
        <RectModeSelect

          labelDefault={t("themes.chengdu.components.LineNum.props.rectMode.default")}

          labelNarrow={t("themes.chengdu.components.LineNum.props.rectMode.narrow")}

        />
      ),
    },
    {
      key: "variant",
      label: "themes.chengdu.components.LineNum.props.variant.displayName",
      element: (
        <Select>
          <Select.Option value="classic">
            {t("themes.chengdu.components.LineNum.props.variant.classic")}
          </Select.Option>
          <Select.Option value="block">
            {t("themes.chengdu.components.LineNum.props.variant.block")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "align",
      label: "themes.chengdu.components.LineNum.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chengdu.components.LineNum.props.align.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chengdu.components.LineNum.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.LineNum.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.LineNum.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

// 色块两档（用户要求的两个模式）：
//   default = 标准示例版式：色块满高（0~64）、宽 25，数字与文字整体上移
//   narrow  = 原来的窄色块 15×52（y=12），其余位置保持原样
const RECT_STYLES = {
  // 默认（宽）：19×52，贴底（y=12）—— 只有宽度比窄档宽
  default: {
    // 宽档：色块和数字/文字之间多留一点空气
    w: 19, h: 52, y: 12, pad: 9,
    numFontLatn: 50, numFontZh: 42, numYLatn: 52, numYZh: 48,
    zhFont: 22, zhY: 32, enFont: 14, enY: 48,
  },
  // 窄：原来的 15×52，贴底（y=12）
  narrow: {
    w: 15, h: 52, y: 12, pad: 5,
    numFontLatn: 50, numFontZh: 42, numYLatn: 52, numYZh: 48,
    zhFont: 22, zhY: 32, enFont: 14, enY: 48,
  },
} as const;

function LineNum({
  num = lineNumDefaultProps.num,
  lineColor = lineNumDefaultProps.lineColor,
  customChinese = lineNumDefaultProps.customChinese,
  customEnglish = lineNumDefaultProps.customEnglish,
  showText = lineNumDefaultProps.showText,
  showRect = lineNumDefaultProps.showRect,
  // 注意：不给默认值 —— 老存档里没有这个字段，要按「窄」渲染（迁移）；
  // 新拖入的组件带着 defaultProps 里的 "default"（宽），不受影响
  rectMode,
  variant = "classic",
  align = lineNumDefaultProps.align,
  foreground = lineNumDefaultProps.foreground ?? colors.foreground,
  background = lineNumDefaultProps.background ?? colors.transparent,
}: LineNumProps) {
  const numRef = useRef<SVGTextElement>(null);
  const textRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const [textOffsetX, setTextOffsetX] = useState(0);
  const [numX, setNumX] = useState(0);
  const [rectX, setRectX] = useState(0);
  const [textAnchor, setTextAnchor] = useState<"start" | "end">("start");

  // 当前色块档位的尺寸/字号
  const RS = RECT_STYLES[rectMode ?? "narrow"];
  // ===== 色块风格（2026）：整块圆角牌面，数字/文字缩小一圈装进去 =====
  // 排法还是「经典」那套（数字 + 号线/Line，字号基线全用 RECT_STYLES），外面套一层整体缩放。
  // 牌高不再按「64 × 缩放比」算 —— 那样内容框上下会白出一大截（用户嫌上下内边距大），
  // 改成按**墨迹高 + 上下留白**贴出来，见下方 BLOCK_H。
  const block = variant === "block";
  const BLOCK_SCALE = 0.9;
  const BLOCK_EN_SCALE = 0.85; // 色块里英文再小一号（只有色块风格吃这个）
  const BLOCK_TEXT_GAP = 10; // 色块里「数字 ↔ 文字」的间隙（比经典版的 5 大一点）
  const BLOCK_PAD = 5; // 牌面内左右留白
  const BLOCK_PAD_Y = 5; // 牌面内上下留白（墨迹到牌边）
  const BLOCK_RADIUS = 0;
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const isChinese = /[\u4e00-\u9fa5]/.test(num);
  const numText = normalizeSvgLine(num);
  const zhText = normalizeSvgLine(customChinese ?? (isChinese ? "线" : "号线"));
  const enText = normalizeSvgLine(customEnglish);
  // 数字为空 且（关闭文字 或 中英文都为空）→ 只保留色块，去掉与文字之间的间距
  // 只有空白的字段按「空」算（但渲染时那串空格照旧保留，见 normalizeSvgLine）
  const numEmpty = !numText.trim();
  const textEmptyBoth = !zhText.trim() && !enText.trim();
  const collapsed = numEmpty && (!showText || textEmptyBoth);

  // 色块风格的牌高/竖向位移：按经典版坐标里的「内容墨迹」算
  // （汉字 ink ≈0.88em、拉丁 cap ≈0.716em、下伸 0.25em）
  const numBadgeSize = isChinese ? RS.numFontZh : RS.numFontLatn;
  const numBadgeBase = isChinese ? RS.numYZh : RS.numYLatn;
  const inkTopBadge = showText
    ? Math.min(numBadgeBase - numBadgeSize * 0.716, RS.zhY - RS.zhFont * 0.88)
    : numBadgeBase - numBadgeSize * 0.716;
  const blockEnFont = RS.enFont * BLOCK_EN_SCALE;
  const inkBottomBadge = showText
    ? Math.max(numBadgeBase, RS.enY + blockEnFont * 0.25)
    : numBadgeBase;
  const inkHBadge = Math.max(1, inkBottomBadge - inkTopBadge);
  const blockInkH = inkHBadge * BLOCK_SCALE; // 缩放后的墨迹高
  const BLOCK_H = blockInkH + BLOCK_PAD_Y * 2; // 牌高 = 墨迹 + 上下留白
  const BLOCK_Y = (64 - BLOCK_H) / 2; // 牌在行内上下居中
  // 内容组位移：让墨迹顶刚好落在牌顶 + BLOCK_PAD_Y
  const BLOCK_CONTENT_Y = BLOCK_Y + BLOCK_PAD_Y - BLOCK_SCALE * inkTopBadge;

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (numRef.current) {
        const numBBox = numRef.current.getBBox();
        const textBBox = textRef.current?.getBBox() ?? { width: 0 };
        const rectWidth = RS.w;
        const pad = RS.pad;
        // 数字和「号线」之间的间距：原来 margin+textGap=10 太散、4 又贴太紧，取中间的 7
        const numTextGap = 7;
        const GAP = 5;

        let totalWidth: number;

        if (block) {
          // 色块风格：内容（数字 + 文字）按无色块的方式从左排起，整组缩 BLOCK_SCALE，
          // 牌宽 = 两侧留白 + 缩放后的内容宽
          const contentW =
            numBBox.width + (showText ? BLOCK_TEXT_GAP + textBBox.width : 0);
          setRectX(0);
          setNumX(0);
          setTextOffsetX(showText ? numBBox.width + BLOCK_TEXT_GAP : 0);
          setTextAnchor("start");
          totalWidth = BLOCK_PAD * 2 + BLOCK_SCALE * contentW;
          setSvgWidth(totalWidth);
          return;
        }

        if (collapsed) {
          totalWidth = showRect ? rectWidth : 0;
        } else if (!showRect) {
          // 无色块：去掉色块及其两侧预留的间隙，按左右对齐把内容贴边排布
          const contentW =
            numBBox.width + (showText ? GAP + textBBox.width : 0);
          if (align === "left") {
            setRectX(0);
            setNumX(0);
            setTextOffsetX(showText ? numBBox.width + GAP : 0);
            setTextAnchor("start");
          } else {
            // 右对齐（成都顺序：数字在左、文字在右）→ 文字贴右缘
            setRectX(0);
            setNumX(showText ? contentW - textBBox.width - GAP - numBBox.width : 0);
            setTextOffsetX(showText ? contentW - textBBox.width : 0);
            setTextAnchor("start");
          }
          totalWidth = contentW;
        } else {
          totalWidth =
            rectWidth +
            pad +
            numBBox.width +
            (showText ? numTextGap + textBBox.width : numTextGap);

          if (align === "left") {
            setRectX(0);
            setNumX(rectWidth + pad);
            setTextOffsetX(rectWidth + pad + numBBox.width + numTextGap);
            setTextAnchor("start");
          } else if (align === "right") {
            setRectX(totalWidth - rectWidth);
            // 在数字和文字之间留一个小间隙
            setTextOffsetX(
              totalWidth - rectWidth - pad - textBBox.width
            );
            setNumX(
              totalWidth -
                rectWidth -
                pad -
                textBBox.width -
                numTextGap -
                numBBox.width
            );
            setTextAnchor("start");
          }
        }

        setSvgWidth(totalWidth);
      }
    };

    // 先量一次（可能是回退字体），字体就绪后再量、之后每次字体加载完再量。
    // 中文字体是 fonts.loli.net 的远程字体：只 await 一次 fonts.ready 的话，
    // 字体若在这之后才加载完，宽度就一直是回退字体的值 —— 盒子比文字宽一截，
    // 放进双行容器就是「右边空一块、没贴紧」（用户反馈过）。
    measure();
    const fonts = document.fonts;
    const onFontsLoadingDone = () => {
      if (mounted) measure();
    };
    fonts?.addEventListener?.("loadingdone", onFontsLoadingDone);
    fonts?.ready.then(() => {
      if (mounted) measure();
    }).catch(() => {});
    const fontRetryTimers = [60, 240, 800].map(ms =>
      window.setTimeout(() => {
        if (mounted) measure();
      }, ms)
    );

    return () => {
      mounted = false;
      fonts?.removeEventListener?.("loadingdone", onFontsLoadingDone);
      fontRetryTimers.forEach(t => {
        window.clearTimeout(t);
      });
    };
  }, [numText, showText, showRect, zhText, enText, align, collapsed, rectMode, variant]);

  if (block) {
    return (
      <div style={{ backgroundColor: background }}>
        <div className="h-16 mr-1.25 ml-1.25" style={{ width: svgWidth }}>
          <svg width={svgWidth} height={64}>
            {/* 牌面：整块线路色圆角矩形 */}
            <rect
              x={0}
              y={BLOCK_Y}
              width={svgWidth}
              height={BLOCK_H}
              rx={BLOCK_RADIUS}
              fill={lineColor}
            />
            {/* 数字 + 文字：经典版那套排法整体缩一圈，上下居中装进牌里 */}
            <g
              transform={`translate(${BLOCK_PAD} ${BLOCK_CONTENT_Y}) scale(${BLOCK_SCALE})`}
            >
              <text
                ref={numRef}
                x={numX}
                y={isChinese ? RS.numYZh : RS.numYLatn}
                fontSize={isChinese ? RS.numFontZh : RS.numFontLatn}
                fontWeight={400}
                style={{ letterSpacing: "-3px" }}
                fill={foreground}
                xmlSpace="preserve">
                {numText}
              </text>
              {showText && (
                <g ref={textRef} transform={`translate(${textOffsetX},0)`}>
                  <text
                    x={0}
                    y={RS.zhY}
                    fontSize={RS.zhFont}
                    textAnchor={textAnchor}
                    fill={foreground}
                    xmlSpace="preserve">
                    {zhText}
                  </text>
                  <text
                    x={0}
                    y={RS.enY}
                    fontSize={blockEnFont}
                    textAnchor={textAnchor}
                    fill={foreground}
                    xmlSpace="preserve">
                    {enText}
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: background }}>
      <div className="h-16 mr-1.25 ml-1.25" style={{ width: svgWidth }}>
        <svg width={svgWidth} height={64}>
          {align === "right" ? (
            // 右对齐顺序：数字、文字、色块
            <>
              {/* 数字 */}
              <text
                ref={numRef}
                x={numX}
                y={isChinese ? RS.numYZh : RS.numYLatn}
                fontSize={isChinese ? RS.numFontZh : RS.numFontLatn}
                fontWeight={400}
                style={{ letterSpacing: "-3px" }}
                fill={foreground}
                xmlSpace="preserve">
                {numText}
              </text>
              {/* 文字组 */}
              {showText && (
                <g ref={textRef} transform={`translate(${textOffsetX},0)`}>
                  <text
                    x={0}
                    y={RS.zhY}
                    fontSize={RS.zhFont}
                    textAnchor={textAnchor}
                    fill={foreground}
                    xmlSpace="preserve">
                    {zhText}
                  </text>
                  <text
                    x={0}
                    y={RS.enY}
                    fontSize={RS.enFont}
                    textAnchor={textAnchor}
                    fill={foreground}
                    xmlSpace="preserve">
                    {enText}
                  </text>
                </g>
              )}
              {/* 色块 */}
              {showRect && <rect width={RS.w} height={RS.h} x={rectX} y={RS.y} fill={lineColor} />}
            </>
          ) : (
            // 左对齐顺序：色块、数字、文字
            <>
              {/* 色块 */}
              {showRect && <rect width={RS.w} height={RS.h} x={rectX} y={RS.y} fill={lineColor} />}
              {/* 数字 */}
              <text
                ref={numRef}
                x={numX}
                y={isChinese ? RS.numYZh : RS.numYLatn}
                fontSize={isChinese ? RS.numFontZh : RS.numFontLatn}
                style={{ letterSpacing: "-3px" }}
                fill={foreground}
                xmlSpace="preserve">
                {numText}
              </text>
              {/* 文字组 */}
              {showText && (
                <g ref={textRef} transform={`translate(${textOffsetX},0)`}>
                  <text
                    x={0}
                    y={RS.zhY}
                    fontSize={RS.zhFont}
                    textAnchor={textAnchor}
                    fill={foreground}
                    xmlSpace="preserve">
                    {zhText}
                  </text>
                  <text
                    x={0}
                    y={RS.enY}
                    fontSize={RS.enFont}
                    textAnchor={textAnchor}
                    fill={foreground}
                    xmlSpace="preserve">
                    {enText}
                  </text>
                </g>
              )}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

LineNum.getEditorConfig = (t: (key: string) => string) =>
  lineNumEditorConfig(t);

export default LineNum;
