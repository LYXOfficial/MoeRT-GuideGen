import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface TextProps {
  chinese: string;
  english: string;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}
export const textDefaultProps: TextProps = {
  align: "left",
  chinese: "乘车",
  english: "Train",
  foreground: colors.foreground,
  background: colors.background,
};

export const textEditorConfig: EditorConfig = {
  forms: [
    {
      key: "chinese",
      label: "themes.chongqing.components.Text.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chongqing.components.Text.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chongqing.components.Text.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">left</Select.Option>
          <Select.Option value="center">center</Select.Option>
          <Select.Option value="right">right</Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.Text.props.foreground",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.Text.props.background",
      element: <CustomColorPicker currentTheme={0} />,
    },
  ],
};

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  foreground = textDefaultProps.foreground,
  background = textDefaultProps.background,
}: TextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        setSvgWidth(bbox.width);
      }
    };

    (async () => {
      await document.fonts.ready; // 等字体加载完成
      if (mounted) measure();
    })();

    return () => {
      mounted = false;
    };
  }, [chinese, english]);

  // 对齐时的起始 x 坐标
  let groupX = 0;
  if (align === "center") groupX = svgWidth / 2;
  if (align === "right") groupX = svgWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-5px mr-5px" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g
            ref={textGroupRef}
            transform={`translate(${groupX}, 0)`}
            textAnchor={
              align === "center"
                ? "middle"
                : align === "right"
                  ? "end"
                  : "start"
            }
          >
            <text x={0} y={32} fontSize={20} fill={foreground}>
              {chinese}
            </text>
            <text x={0} y={48} fontSize={14} fill={foreground}>
              {english}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Text.getEditorConfig = () => textEditorConfig;
