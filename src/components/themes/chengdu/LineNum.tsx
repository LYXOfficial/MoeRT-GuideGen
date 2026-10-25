import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select, Switch } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface LineNumProps {
  num: string;
  lineColor: string;
  customChinese?: string;
  customEnglish?: string;
  showText?: boolean;
  showRect?: boolean;
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
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
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

function LineNum({
  num = lineNumDefaultProps.num,
  lineColor = lineNumDefaultProps.lineColor,
  customChinese = lineNumDefaultProps.customChinese,
  customEnglish = lineNumDefaultProps.customEnglish,
  showText = lineNumDefaultProps.showText,
  showRect = lineNumDefaultProps.showRect,
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

  const isChinese = /[\u4e00-\u9fa5]/.test(num);
  // 数字为空 且（关闭文字 或 中英文都为空）→ 只保留色块，去掉与文字之间的间距
  const numEmpty = !(num ?? "").trim();
  const textEmptyBoth =
    !(customChinese ?? "").trim() && !(customEnglish ?? "").trim();
  const collapsed = numEmpty && (!showText || textEmptyBoth);

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (numRef.current) {
        const numBBox = numRef.current.getBBox();
        const textBBox = textRef.current?.getBBox() ?? { width: 0 };
        const rectWidth = 15;
        const margin = 5;
        const textGap = 5; // 数字和文字之间的间隙
        const GAP = 5;

        let totalWidth: number;

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
            numBBox.width +
            (showText ? margin + textBBox.width + textGap : margin);

          if (align === "left") {
            setRectX(0);
            setNumX(rectWidth + 5);
            setTextOffsetX(rectWidth + numBBox.width + margin + textGap); // 添加间隙
            setTextAnchor("start");
          } else if (align === "right") {
            setRectX(totalWidth - rectWidth);
            // 在数字和文字之间留一个小间隙
            setNumX(
              totalWidth -
                rectWidth -
                margin -
                textBBox.width -
                textGap -
                numBBox.width
            );
            setTextOffsetX(totalWidth - rectWidth - margin - textBBox.width);
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
  }, [num, showText, showRect, customChinese, customEnglish, align, collapsed]);

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
                y={isChinese ? 48 : 52}
                fontSize={isChinese ? 42 : 50}
                fontWeight={400}
                style={{ letterSpacing: "-3px" }}
                fill={foreground}
              >
                {num}
              </text>
              {/* 文字组 */}
              {showText && (
                <g ref={textRef} transform={`translate(${textOffsetX},0)`}>
                  <text
                    x={0}
                    y={32}
                    fontSize={22}
                    textAnchor={textAnchor}
                    fill={foreground}
                  >
                    {customChinese ?? (isChinese ? "线" : "号线")}
                  </text>
                  <text
                    x={0}
                    y={48}
                    fontSize={14}
                    textAnchor={textAnchor}
                    fill={foreground}
                  >
                    {customEnglish}
                  </text>
                </g>
              )}
              {/* 色块 */}
              {showRect && <rect width={15} height={52} x={rectX} y={12} fill={lineColor} />}
            </>
          ) : (
            // 左对齐顺序：色块、数字、文字
            <>
              {/* 色块 */}
              {showRect && <rect width={15} height={52} x={rectX} y={12} fill={lineColor} />}
              {/* 数字 */}
              <text
                ref={numRef}
                x={numX}
                y={isChinese ? 48 : 52}
                fontSize={isChinese ? 42 : 50}
                style={{ letterSpacing: "-3px" }}
                fill={foreground}
              >
                {num}
              </text>
              {/* 文字组 */}
              {showText && (
                <g ref={textRef} transform={`translate(${textOffsetX},0)`}>
                  <text
                    x={0}
                    y={32}
                    fontSize={22}
                    textAnchor={textAnchor}
                    fill={foreground}
                  >
                    {customChinese ?? (isChinese ? "线" : "号线")}
                  </text>
                  <text
                    x={0}
                    y={48}
                    fontSize={14}
                    textAnchor={textAnchor}
                    fill={foreground}
                  >
                    {customEnglish}
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
