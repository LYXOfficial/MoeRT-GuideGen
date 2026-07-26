import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface LineProps {
  lineColor: string;
  chinese: string;
  english: string;
  background?: string;
  align?: "left" | "center" | "right"; // 添加对齐选项
}

export const lineDefaultProps: LineProps = {
  lineColor: colors.tsuenwanline,
  chinese: "荃灣綫",
  english: "Tsuen Wan Line",
  background: colors.background,
  align: "left", // 默认居中对齐
};

export const lineEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.hongkong.components.Line.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.hongkong.components.Line.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.hongkong.components.Line.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.hongkong.components.Text.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.hongkong.components.Text.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.hongkong.components.Text.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "lineColor",
      label: "themes.hongkong.components.Line.props.lineColor",
      element: <CustomColorPicker currentTheme={2} />,
    },
    {
      key: "background",
      label: "themes.hongkong.components.Line.props.background",
      element: <CustomColorPicker currentTheme={2} />,
    },
  ],
});

export default function Line({
  chinese = lineDefaultProps.chinese,
  english = lineDefaultProps.english,
  lineColor = lineDefaultProps.lineColor,
  background = lineDefaultProps.background,
  align = lineDefaultProps.align,
}: LineProps) {
  const lineGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const measureGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (measureGroupRef.current) {
        const bbox = measureGroupRef.current.getBBox();
        setSvgWidth(bbox.width);
      }
    };

    (async () => {
      await document.fonts.ready;
      if (mounted) measure();
    })();

    return () => {
      mounted = false;
    };
  }, [chinese, english]);

  const padding = 8;
  const totalWidth = svgWidth + padding * 2;

  let groupX = padding;
  if (align === "center") groupX = svgWidth / 2 + padding;
  if (align === "right") groupX = svgWidth + padding;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-5px mr-5px" style={{ width: totalWidth }}>
        <svg className="h-full" width={totalWidth} height={64}>
          {/* 隐藏的测量组 */}
          <g ref={measureGroupRef} visibility="hidden">
            <text x={0} y={34} fontSize={20}>
              {chinese}
            </text>
            <text x={0} y={48} fontSize={10}>
              {english}
            </text>
          </g>

          {/* 实际显示的组 */}
          <g
            ref={lineGroupRef}
            transform={`translate(${groupX}, 0)`}
            textAnchor={
              align === "center"
                ? "middle"
                : align === "right"
                  ? "end"
                  : "start"
            }
          >
            <rect
              x={
                align === "center"
                  ? -svgWidth / 2 - padding
                  : align === "right"
                    ? -svgWidth - padding
                    : -padding
              }
              y={12}
              width={svgWidth + padding * 2}
              height={40}
              fill={lineColor}
            />
            <text x={0} y={34} fontSize={20} fill={colors.foreground}>
              {chinese}
            </text>
            <text x={0} y={48} fontSize={10} fill={colors.foreground}>
              {english}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Line.getEditorConfig = (t: (key: string) => string) => lineEditorConfig(t);
