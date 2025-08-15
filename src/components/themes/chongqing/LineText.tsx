import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import { ColorPicker, Input, Select } from "@douyinfe/semi-ui";
import type { EditorConfig } from "../../../interfaces/editor";

export interface LineTextProps {
  lineColor: string;
  chinese?: string;
  english?: string;
  align?: string;
}

export const lineTextDefaultProps: LineTextProps = {
  lineColor: colors["linebitong"],
  chinese: "璧铜线",
  english: "Bitong Line",
  align: "left",
};

export const lineTextEditorConfig: EditorConfig = {
  forms: [
    {
      key: "lineColor",
      label: "themes.chongqing.components.LineText.props.lineColor",
      element: (
        <ColorPicker
          alpha={false}
          onChange={() => {}}
          usePopover={true}
          style={{
            border: "1px solid #ccc",
          }}
          value={ColorPicker.colorStringToValue(
            lineTextDefaultProps.lineColor!
          )}
          width={200}
          height={200}
        />
      ),
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
          <Select.Option value="left">left</Select.Option>
          <Select.Option value="right">right</Select.Option>
        </Select>
      ),
    },
  ],
};

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

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        const totalWidth = rectWidth + margin + bbox.width;
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

  // 矩形位置
  const rectX = align === "left" ? 0 : svgWidth - rectWidth;

  // 文字组位置
  const textTranslateX =
    align === "left" ? rectWidth + margin : svgWidth - rectWidth - margin; // 让文字紧挨矩形左边

  return (
    <div className="h-64px ml-5px mr-5px" style={{ width: svgWidth }}>
      <svg className="h-full" width={svgWidth} height={64}>
        {/* 矩形 */}
        <rect width={rectWidth} height={52} x={rectX} y={12} fill={lineColor} />

        {/* 文字组 */}
        <g
          ref={textGroupRef}
          transform={`translate(${textTranslateX}, 0)`}
          textAnchor={align === "right" ? "end" : "start"}
        >
          <text x={0} y={32} fontSize={20}>
            {chinese}
          </text>
          <text x={0} y={48} fontSize={12}>
            {english}
          </text>
        </g>
      </svg>
    </div>
  );
}

LineText.getEditorConfig = () => lineTextEditorConfig;
export default LineText;
