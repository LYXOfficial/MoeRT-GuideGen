import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface StationNameProps {
  chinese: string;
  english: string;
  align?: "left" | "right";
  foreground?: string;
  background?: string;
}
export const stationNameDefaultProps: StationNameProps = {
  align: "left",
  chinese: "中環",
  english: "Central",
  foreground: colors.foreground,
  background: colors.background,
};

export const stationNameEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.hongkong.components.StationName.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.hongkong.components.StationName.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.hongkong.components.StationName.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.hongkong.components.StationName.props.align.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.hongkong.components.StationName.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.hongkong.components.StationName.props.foreground",
      element: <CustomColorPicker currentTheme={2} />,
    },
    {
      key: "background",
      label: "themes.hongkong.components.StationName.props.background",
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

export default function StationName({
  chinese = stationNameDefaultProps.chinese,
  english = stationNameDefaultProps.english,
  align = stationNameDefaultProps.align,
  foreground = stationNameDefaultProps.foreground,
  background = stationNameDefaultProps.background,
}: StationNameProps) {
  const chineseRef = useRef<SVGTextElement>(null);
  const englishRef = useRef<SVGTextElement>(null);
  // 字体未就绪时先给临时估宽，加载完成后 getBBox 精确重测
  const [chineseWidth, setChineseWidth] = useState(() =>
    estimateWidth(chinese ?? "", "", 36, 22)
  );
  const [englishWidth, setEnglishWidth] = useState(() =>
    estimateWidth("", english ?? "", 36, 22)
  );

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (chineseRef.current && englishRef.current) {
        const chineseBbox = chineseRef.current.getBBox();
        const englishBbox = englishRef.current.getBBox();
        setChineseWidth(chineseBbox.width);
        setEnglishWidth(englishBbox.width);
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

  const totalWidth = chineseWidth + englishWidth + 10;
  let groupX = 0;
  if (align === "right") groupX = totalWidth;

  // 根据对齐方式计算 x 坐标
  const chineseX = align === "right" ? 0 : 0;
  const englishX = align === "right" ? -chineseWidth - 10 : chineseWidth + 10;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-1.25 mr-1.25" style={{ width: totalWidth }}>
        <svg className="h-full" width={totalWidth} height={64}>
          <g
            transform={`translate(${groupX}, 0)`}
            textAnchor={align === "right" ? "end" : "start"}
          >
            <text
              ref={chineseRef}
              x={chineseX}
              y={36}
              fontSize={36}
              fill={foreground}
              dominantBaseline="middle"
            >
              {chinese}
            </text>
            <text
              ref={englishRef}
              x={englishX}
              y={42}
              fontSize={22}
              fill={foreground}
              dominantBaseline="middle"
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
StationName.getEditorConfig = (t: (key: string) => string) =>
  stationNameEditorConfig(t);
