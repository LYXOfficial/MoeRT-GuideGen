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

export const textEditorConfig = (t: (key: string) => string): EditorConfig => ({
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
          <Select.Option value="left">
            {t("themes.chongqing.components.Text.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.chongqing.components.Text.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chongqing.components.Text.props.align.right")}
          </Select.Option>
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
});

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  foreground = textDefaultProps.foreground,
  background = textDefaultProps.background,
}: TextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  // 供 JSX 内嵌闭包安全使用
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const chineseText = normalizeSvgLine(chinese ?? textDefaultProps.chinese);
  const englishText = normalizeSvgLine(english);

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
  }, [chineseText, englishText]);

  // 汉字里的数字分段出来，单独放大 + dy 偏移；dy 会累积，
  // 因此逐段维护偏移并给每段显式 dy，避免越排越歪。
  const DIGIT_DY = 1; // 数字基线相对普通文字的偏移（与 LineText 一致）
  const chineseSegs = (() => {
    let offset = 0;
    return chineseText
      .split(/(\d+)/)
      .filter(Boolean)
      .map(seg => {
        const isDigit = /^\d+$/.test(seg);
        const desired = isDigit ? DIGIT_DY : 0;
        const dy = desired - offset;
        offset = desired;
        return { seg, isDigit, dy };
      });
  })();

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
            <text x={0} y={32} fontSize={22} fill={foreground} xmlSpace="preserve">
              {chineseSegs.map((seg, idx) =>
                seg.isDigit ? (
                  <tspan
                    key={idx}
                    dy={seg.dy}
                    fontSize={30}
                    fill={foreground}
                    fontFamily="Frutiger, Helvetica, sans-serif"
                  >
                    {seg.seg}
                  </tspan>
                ) : (
                  <tspan key={idx} dy={seg.dy} fill={foreground}>
                    {seg.seg}
                  </tspan>
                )
              )}
            </text>
            <text x={0} y={48} fontSize={14} fill={foreground} xmlSpace="preserve">
              {englishText}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
