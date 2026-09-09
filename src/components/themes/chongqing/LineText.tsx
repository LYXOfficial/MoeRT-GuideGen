import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import { Input, Select } from "@douyinfe/semi-ui";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

export interface LineTextProps {
  lineColor: string;
  chinese?: string;
  english?: string;
  align?: string;
}

export const lineTextDefaultProps: LineTextProps = {
  lineColor: colors.linebitong,
  chinese: "璧铜线",
  english: "Bitong Line",
  align: "left",
};

export const lineTextEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "lineColor",
      label: "themes.chongqing.components.LineText.props.lineColor",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "chinese",
      label: "themes.chongqing.components.LineText.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chongqing.components.LineText.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chongqing.components.LineText.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chongqing.components.LineText.props.align.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chongqing.components.LineText.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
  ],
});

function LineText({
  lineColor = lineTextDefaultProps.lineColor,
  chinese = lineTextDefaultProps.chinese,
  english = lineTextDefaultProps.english,
  align = lineTextDefaultProps.align,
}: LineTextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const rectWidth = 15;
  const margin = 5; // 矩形和文字的间距
  // 供 JSX 内嵌闭包安全使用
  const chineseText = chinese ?? lineTextDefaultProps.chinese ?? "";
  // 中英文都为空 → 只保留色块，去掉色块与文字之间本应存在的间距
  const textEmpty = !chineseText.trim() && !(english ?? "").trim();

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        const totalWidth =
          rectWidth + (textEmpty ? 0 : margin) + bbox.width;
        setSvgWidth(totalWidth);
      }
    };

    (async () => {
      await document.fonts.ready; // 等字体加载
      if (mounted) measure();
    })();

    return () => {
      mounted = false;
    };
  }, [chinese, english]);

  // 汉字里的数字分段出来，单独放大（fontSize 32、字体 Frutiger）+ dy 偏移；
  // SVG 的 dy 对后续 tspan 是累积的，所以逐段维护偏移、给每段显式 dy：
  // 数字段落到 +DIGIT_DY，普通段回 0，避免“越来越歪”。
  const DIGIT_DY = 1; // 数字基线相对普通文字的偏移
  const chineseSegs = (() => {
    let offset = 0;
    return chineseText
      .split(/(\d+)/)
      .filter(Boolean)
      .map(seg => {
        const isDigit = /^\d+$/.test(seg);
        const desired = isDigit ? DIGIT_DY : 0; // 该段想要落到的基线偏移
        const dy = desired - offset; // 相对当前累积偏移的补偿量
        offset = desired;
        return { seg, isDigit, dy };
      });
  })();

  // 矩形位置
  const rectX = align === "left" ? 0 : svgWidth - rectWidth;

  // 文字组位置
  const textTranslateX =
    align === "left" ? rectWidth + margin : svgWidth - rectWidth - margin; // 让文字紧挨矩形左边

  return (
    <div style={{ backgroundColor: colors.background }}>
      <div className="h-16 ml-1.25 mr-1.25" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          {/* 矩形 */}
          <rect
            width={rectWidth}
            height={52}
            x={rectX}
            y={12}
            fill={lineColor}
          />

          {/* 文字组 */}
          <g
            ref={textGroupRef}
            transform={`translate(${textTranslateX}, 0)`}
            textAnchor={align === "right" ? "end" : "start"}
          >
            <text x={0} y={32} fontSize={22} fill={colors.foreground}>
              {chineseSegs.map((seg, idx) =>
                seg.isDigit ? (
                  <tspan
                    key={idx}
                    dy={seg.dy}
                    fontSize={30}
                    fill={colors.foreground}
                    fontFamily="Frutiger, Helvetica, sans-serif"
                  >
                    {seg.seg}
                  </tspan>
                ) : (
                  <tspan key={idx} dy={seg.dy} fill={colors.foreground}>
                    {seg.seg}
                  </tspan>
                )
              )}
            </text>
            <text x={0} y={48} fontSize={12} fill={colors.foreground}>
              {english}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

LineText.getEditorConfig = (t: (key: string) => string) =>
  lineTextEditorConfig(t);
export default LineText;
