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
  align?: string;
  foreground?: string;
  background?: string;
}

export const lineNumDefaultProps: LineNumProps = {
  num: "6",
  lineColor: colors.line6,
  customChinese: "号线",
  customEnglish: "Line",
  showText: true,
  showRect: true,
  rectMode: "default",
  align: "left",
};

export const lineNumEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "lineColor",
      label: "themes.chongqing.components.LineNum.props.lineColor",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "num",
      label: "themes.chongqing.components.LineNum.props.num",
      element: <Input />,
    },
    {
      key: "customChinese",
      label: "themes.chongqing.components.LineNum.props.customChinese",
      element: <Input />,
    },
    {
      key: "customEnglish",
      label: "themes.chongqing.components.LineNum.props.customEnglish",
      element: <Input />,
    },
    {
      key: "showText",
      label: "themes.chongqing.components.LineNum.props.showText",
      element: <Switch />,
    },
    {
      key: "showRect",
      label: "themes.chongqing.components.LineNum.props.showRect",
      element: <Switch />,
    },
    {
      key: "rectMode",
      label: "themes.chongqing.components.LineNum.props.rectMode.displayName",
      element: (
        <RectModeSelect

          labelDefault={t("themes.chongqing.components.LineNum.props.rectMode.default")}

          labelNarrow={t("themes.chongqing.components.LineNum.props.rectMode.narrow")}

        />
      ),
    },
    {
      key: "align",
      label: "themes.chongqing.components.LineNum.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chongqing.components.LineNum.props.align.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chongqing.components.LineNum.props.align.right")}
          </Select.Option>
          <Select.Option value="right2">
            {t("themes.chongqing.components.LineNum.props.align.right2")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.LineNum.props.foreground",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.LineNum.props.background",
      element: <CustomColorPicker currentTheme={0} />,
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
    numFontLatn: 56, numFontZh: 42, numYLatn: 52, numYZh: 48,
    zhFont: 22, zhY: 32, enFont: 14, enY: 48,
  },
  // 窄：原来的 15×52，贴底（y=12）
  narrow: {
    w: 15, h: 52, y: 12, pad: 5,
    numFontLatn: 56, numFontZh: 42, numYLatn: 52, numYZh: 48,
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
  align = lineNumDefaultProps.align,
  foreground = lineNumDefaultProps.foreground ?? colors.foreground,
  background = lineNumDefaultProps.background ?? colors.background,
}: LineNumProps) {
  const numRef = useRef<SVGTextElement>(null);
  const textRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const [textOffsetX, setTextOffsetX] = useState(0);
  const [numX, setNumX] = useState(0);
  const [rectX, setRectX] = useState(0);
  const [textAnchor, setTextAnchor] = useState<"start" | "end">("start");
  // 文字块宽度（中文/英文取宽的那个）：右（2）时中文和英文都右对齐到它的右缘
  const [textW, setTextW] = useState(0);

  // 当前色块档位的尺寸/字号
  const RS = RECT_STYLES[rectMode ?? "narrow"];
  const isChinese = /[\u4e00-\u9fa5]/.test(num);
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const numText = normalizeSvgLine(num);
  const zhText = normalizeSvgLine(customChinese ?? (isChinese ? "线" : "号线"));
  const enText = normalizeSvgLine(customEnglish);
  // 数字为空 且（关闭文字 或 中英文都为空）→ 只保留色块，去掉与文字之间的间距
  // 只有空白的字段按「空」算（但渲染时那串空格照旧保留，见 normalizeSvgLine）
  const numEmpty = !numText.trim();
  const textEmptyBoth = !zhText.trim() && !enText.trim();
  const collapsed = numEmpty && (!showText || textEmptyBoth);

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (numRef.current) {
        const numBBox = numRef.current.getBBox();
        const textBBox = textRef.current?.getBBox() ?? { width: 0 };
        // 文字组宽度 = 中文/英文里更宽的那个（与锚点无关，左排/右排都是它）
        setTextW(textBBox.width);
        const rectWidth = RS.w;
        const pad = RS.pad;
        // 数字和「号线」之间的间距：原来 10 太散、4 又贴太紧，取中间的 7
        const numTextGap = 7;
        const GAP = 5; // 数字/文字之间以及色块与数字之间的间隙

        let totalWidth: number;

        if (collapsed) {
          totalWidth = showRect ? rectWidth : 0;
        } else if (!showRect) {
          // 无色块：去掉色块及其两侧预留的间隙，按左右对齐把内容贴边排布
          const contentW =
            numBBox.width + (showText ? GAP + textBBox.width : 0);
          if (align === "left" || align === "right2") {
            // 右（2）同成都：数字在左、文字在右
            setRectX(0);
            setNumX(0);
            setTextOffsetX(showText ? numBBox.width + GAP : 0);
            setTextAnchor("start");
          } else {
            // 右（1）（重庆顺序：文字在左、数字在右）→ 数字贴右缘
            setRectX(0);
            setNumX(contentW - numBBox.width);
            setTextOffsetX(showText ? contentW - numBBox.width - GAP : 0);
            setTextAnchor("end");
          }
          totalWidth = contentW;
        } else {
          totalWidth =
            rectWidth +
            pad +
            numBBox.width +
            (showText ? numTextGap + textBBox.width : numTextGap / 2);

          if (align === "left") {
            setRectX(0);
            setNumX(rectWidth + pad);
            setTextOffsetX(rectWidth + pad + numBBox.width + numTextGap);
            setTextAnchor("start");
          } else if (align === "right2") {
            // 右（2）同成都：数字、文字、色块，色块贴右缘
            setRectX(totalWidth - rectWidth);
            setNumX(0);
            setTextOffsetX(numBBox.width + numTextGap);
            setTextAnchor("start");
          } else {
            setRectX(totalWidth - rectWidth);
            setNumX(totalWidth - rectWidth - pad - numBBox.width);
            setTextOffsetX(
              totalWidth - rectWidth - pad - numBBox.width - numTextGap
            );
            setTextAnchor("end");
          }
        }

        setSvgWidth(totalWidth);
      }
    };

    // 字体就绪 + 每次加载完 + 定时重试（远程中文字体晚到会导致按回退字体定宽，文字被裁）
    measure();
    const fonts = document.fonts;
    const onLoadingDone = () => {
      if (mounted) measure();
    };
    fonts?.addEventListener?.("loadingdone", onLoadingDone);
    fonts?.ready
      .then(() => {
        if (mounted) measure();
      })
      .catch(() => {});
    const fontRetryTimers = [60, 240, 800].map(ms =>
      window.setTimeout(() => {
        if (mounted) measure();
      }, ms)
    );

    return () => {
      mounted = false;
      fonts?.removeEventListener?.("loadingdone", onLoadingDone);
      fontRetryTimers.forEach(t => {
        window.clearTimeout(t);
      });
    };
  }, [numText, showText, showRect, zhText, enText, align, collapsed, rectMode]);

  // 右（2）是「数字在左、文字在右」：文字块从数字右边起排，中文/英文统一右对齐到块右缘
  const isRight2 = align === "right2";
  const textAlignX = isRight2 ? textW : 0;
  const textAlignAnchor = isRight2 ? "end" : textAnchor;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="h-16 mr-1.25 ml-1.25" style={{ width: svgWidth }}>
        <svg width={svgWidth} height={64}>
          {/* 矩形 */}
          {showRect && <rect width={RS.w} height={RS.h} x={rectX} y={RS.y} fill={lineColor} />}

          {/* 数字 */}
          <text
            ref={numRef}
            x={numX}
            y={isChinese ? RS.numYZh : RS.numYLatn}
            fontSize={isChinese ? RS.numFontZh : RS.numFontLatn}
            style={{ letterSpacing: "-3px" }}
            fill={foreground}
            fontFamily={isChinese ? undefined : "Frutiger, Helvetica, sans-serif"}
            xmlSpace="preserve"
          >
            {numText}
          </text>

          {/* 文字组 */}
          {showText && (
            <g ref={textRef} transform={`translate(${textOffsetX},0)`}>
              <text
                x={textAlignX}
                y={RS.zhY}
                fontSize={RS.zhFont}
                textAnchor={textAlignAnchor}
                fill={foreground}
                xmlSpace="preserve"
              >
                {zhText}
              </text>
              {/* 右（2）：中文、英文右缘对齐到文字块右缘（textW = 中英较宽者）。
                  锚点取 textW 而不是「中文宽度」，英文比中文长时整块向右长，
                  不会向左压到数字上 */}
              <text
                x={textAlignX}
                y={RS.enY}
                fontSize={RS.enFont}
                textAnchor={textAlignAnchor}
                fill={foreground}
                xmlSpace="preserve"
              >
                {enText}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

LineNum.getEditorConfig = (t: (key: string) => string) =>
  lineNumEditorConfig(t);

export default LineNum;
