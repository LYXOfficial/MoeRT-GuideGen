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
}

export const lineNumDefaultProps: LineNumProps = {
  num: "6",
  lineColor: colors.line6,
  customChinese: "号线",
  customEnglish: "Line",
  showText: true,
  showRect: true,
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
        </Select>
      ),
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
        const margin = 10;
        const GAP = 5; // 数字/文字之间以及色块与数字之间的间隙

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
            // 右对齐（重庆顺序：文字在左、数字在右）→ 数字贴右缘
            setRectX(0);
            setNumX(contentW - numBBox.width);
            setTextOffsetX(showText ? contentW - numBBox.width - GAP : 0);
            setTextAnchor("end");
          }
          totalWidth = contentW;
        } else {
          totalWidth =
            rectWidth +
            numBBox.width +
            (showText ? margin + textBBox.width : margin / 2);

          if (align === "left") {
            setRectX(0);
            setNumX(rectWidth + 5);
            setTextOffsetX(rectWidth + numBBox.width + margin);
            setTextAnchor("start");
          } else {
            setRectX(totalWidth - rectWidth);
            setNumX(totalWidth - rectWidth - numBBox.width - 5);
            setTextOffsetX(totalWidth - rectWidth - numBBox.width - margin);
            setTextAnchor("end");
          }
        }

        setSvgWidth(totalWidth);
      }
    };

    document.fonts.ready.then(() => {
      if (mounted) measure();
    });

    return () => {
      mounted = false;
    };
  }, [num, showText, showRect, customChinese, customEnglish, align, collapsed]);

  return (
    <div style={{ backgroundColor: colors.background }}>
      <div className="h-16 mr-1.25 ml-1.25" style={{ width: svgWidth }}>
        <svg width={svgWidth} height={64}>
          {/* 矩形 */}
          {showRect && <rect width={15} height={52} x={rectX} y={12} fill={lineColor} />}

          {/* 数字 */}
          <text
            ref={numRef}
            x={numX}
            y={isChinese ? 48 : 52}
            fontSize={isChinese ? 42 : 56}
            style={{ letterSpacing: "-3px" }}
            fill={colors.foreground}
            fontFamily={isChinese ? undefined : "Frutiger, Helvetica, sans-serif"}
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
                fill={colors.foreground}
              >
                {customChinese ?? (isChinese ? "线" : "号线")}
              </text>
              <text
                x={0}
                y={48}
                fontSize={14}
                textAnchor={textAnchor}
                fill={colors.foreground}
              >
                {customEnglish}
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
