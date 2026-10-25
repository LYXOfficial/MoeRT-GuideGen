import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface LineProps {
  lineColor: string;
  chinese: string;
  english: string;
  foreground?: string;
  background?: string;
  align?: "left" | "center" | "right"; // 添加对齐选项
}

export const lineDefaultProps: LineProps = {
  lineColor: colors.tsuenwanline,
  chinese: "荃灣綫",
  english: "Tsuen Wan Line",
  foreground: colors.foreground,
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
      key: "foreground",
      label: "themes.hongkong.components.Line.props.foreground",
      element: <CustomColorPicker currentTheme={2} />,
    },
    {
      key: "background",
      label: "themes.hongkong.components.Line.props.background",
      element: <CustomColorPicker currentTheme={2} />,
    },
  ],
});

/**
 * 字体未就绪时的临时估宽：汉字 ≈1em、拉丁/数字 ≈0.55em。
 * 就绪后再用 getBBox 精确重测，避免加载期组件缩成窄条。
 */
const estimateWidth = (zh: string, en: string, zhSize: number, enSize: number) =>
  // 简单粗暴：统一 0.6 倍系数（估宽只是预加载兜底，宁可明显偏小也不溢出）
  ([...zh].length * zhSize + [...en].length * enSize) * 0.35;

export default function Line({
  chinese = lineDefaultProps.chinese,
  english = lineDefaultProps.english,
  lineColor = lineDefaultProps.lineColor,
  foreground = lineDefaultProps.foreground ?? colors.foreground,
  background = lineDefaultProps.background ?? colors.background,
  align = lineDefaultProps.align,
}: LineProps) {
  const lineGroupRef = useRef<SVGGElement>(null);
  // 字体未就绪时先给临时估宽，加载完成后 getBBox 精确重测
  const [svgWidth, setSvgWidth] = useState(() =>
    estimateWidth(chinese ?? "", english ?? "", 22, 10)
  );

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
      await Promise.all([
        document.fonts.load('16px "MTR Sung"'),
        document.fonts.load('16px "Noto Serif"'),
        document.fonts.ready,
      ]);
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
      <div className="ml-1.25 mr-1.25" style={{ width: totalWidth }}>
        <svg className="h-full" width={totalWidth} height={64}>
          {/* 隐藏的测量组 */}
          <g ref={measureGroupRef} visibility="hidden">
            <text x={0} y={34} fontSize={22}>
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
            <text x={0} y={34} fontSize={22} fill={foreground}>
              {chinese}
            </text>
            <text x={0} y={48} fontSize={10} fill={foreground}>
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
