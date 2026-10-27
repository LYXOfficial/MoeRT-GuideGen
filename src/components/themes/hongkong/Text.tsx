import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import { normalizeSvgLine } from "../../../utils/svgText";

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

/**
 * 字体未就绪时的临时估宽：汉字 ≈1em、拉丁/数字 ≈0.55em。
 * 就绪后再用 getBBox 精确重测，避免加载期组件缩成窄条。
 */
const estimateWidth = (zh: string, en: string, zhSize: number, enSize: number) =>
  // 简单粗暴：统一 0.6 倍系数（估宽只是预加载兜底，宁可明显偏小也不溢出）
  ([...zh].length * zhSize + [...en].length * enSize) * 0.35;

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  fontsize = textDefaultProps.fontsize,
  foreground = textDefaultProps.foreground,
  background = textDefaultProps.background,
}: TextProps) {
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const zhText = normalizeSvgLine(chinese);
  const enText = normalizeSvgLine(english);

  const textGroupRef = useRef<SVGGElement>(null);
  // 字体未就绪时先给临时估宽，加载完成后 getBBox 精确重测
  const [svgWidth, setSvgWidth] = useState(() =>
    estimateWidth(zhText, enText, fontsize === "large" ? 28 : 22, fontsize === "large" ? 14 : 12)
  );

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        setSvgWidth(bbox.width);
      }
    };

    (async () => {
      await Promise.all([
        document.fonts.load('16px "MTR Sung"'),
        document.fonts.load('16px "Noto Serif"'),
        document.fonts.ready,
      ]); // 等字体加载完成
      if (mounted) measure();
    })();

    return () => {
      mounted = false;
    };
  }, [zhText, enText]);

  // 对齐时的起始 x 坐标
  let groupX = 0;
  if (align === "center") groupX = svgWidth / 2;
  if (align === "right") groupX = svgWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-1.25 mr-1.25" style={{ width: svgWidth }}>
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
              xmlSpace="preserve">
              {zhText}
            </text>
            <text
              x={0}
              y={fontsize === "large" ? 52 : 48}
              fontSize={fontsize === "large" ? 14 : 12}
              fill={foreground}
              xmlSpace="preserve">
              {enText}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
