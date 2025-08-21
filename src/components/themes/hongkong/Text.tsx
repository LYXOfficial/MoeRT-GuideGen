import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface TextProps {
  chinese: string;
  english: string;
  align?: "left" | "center" | "right";
  fontsize?: "small" | "large";
  foreground?: string;
  background?: string;
}
export const textDefaultProps: TextProps = {
  align: "center",
  chinese: "皇后大道東",
  english: "Queen's Road East",
  fontsize: "large",
  foreground: colors.foreground,
  background: colors.background,
};

export const textEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.hongkong.components.Text.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.hongkong.components.Text.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.hongkong.components.Text.props.align.displayName",
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
      key: "fontsize",
      label: "themes.hongkong.components.Text.props.fontsize.displayName",
      element: (
        <Select>
          <Select.Option value="small">
            {t("themes.hongkong.components.Text.props.fontsize.small")}
          </Select.Option>
          <Select.Option value="large">
            {t("themes.hongkong.components.Text.props.fontsize.large")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.hongkong.components.Text.props.foreground",
      element: <CustomColorPicker currentTheme={2} />,
    },
    {
      key: "background",
      label: "themes.hongkong.components.Text.props.background",
      element: <CustomColorPicker currentTheme={2} />,
    },
  ],
});

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  fontsize = textDefaultProps.fontsize,
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
            <text
              x={0}
              y={34}
              fontSize={fontsize === "large" ? 28 : 22}
              fill={foreground}
            >
              {chinese}
            </text>
            <text
              x={0}
              y={fontsize === "large" ? 52 : 48}
              fontSize={fontsize === "large" ? 14 : 12}
              fill={foreground}
            >
              {english}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
