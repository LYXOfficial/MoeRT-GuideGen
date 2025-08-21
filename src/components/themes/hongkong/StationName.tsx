import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface StationNameProps {
  chinese: string;
  english: string;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}
export const stationNameDefaultProps: StationNameProps = {
  align: "center",
  chinese: "中環",
  english: "Central",
  foreground: colors.foreground,
  background: colors.background,
};

export const stationNameEditorConfig = (t: (key: string) => string): EditorConfig => ({
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

export default function StationName({
  chinese = stationNameDefaultProps.chinese,
  english = stationNameDefaultProps.english,
  align = stationNameDefaultProps.align,
  foreground = stationNameDefaultProps.foreground,
  background = stationNameDefaultProps.background,
}: StationNameProps) {
  const chineseRef = useRef<SVGTextElement>(null);
  const englishRef = useRef<SVGTextElement>(null);
  const [chineseWidth, setChineseWidth] = useState(0);
  const [englishWidth, setEnglishWidth] = useState(0);

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
      await document.fonts.ready;
      if (mounted) measure();
    })();

    return () => {
      mounted = false;
    };
  }, [chinese, english]);

  const totalWidth = chineseWidth + englishWidth + 10;
  let groupX = 0;
  if (align === "right") groupX = totalWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-5px mr-5px" style={{ width: totalWidth }}>
        <svg className="h-full" width={totalWidth} height={64}>
          <g
            transform={`translate(${groupX}, 0)`}
            textAnchor={align === "right" ? "end" : "start"}
          >
            <text
              ref={chineseRef}
              x={0}
              y={36}
              fontSize={36}
              fill={foreground}
              dominantBaseline="middle"
            >
              {chinese}
            </text>
            <text
              ref={englishRef}
              x={chineseWidth + 10}
              y={42}
              fontSize={20}
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
StationName.getEditorConfig = (t: (key: string) => string) => stationNameEditorConfig(t);
