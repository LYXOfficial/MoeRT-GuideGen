import { useRef, useState, useEffect } from "react";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, TextArea } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import CustomColorPicker from "../../CustomColorPicker";
import { normalizeSvgLine, normalizeSvgLines } from "../../../utils/svgText";

export interface StationNameProps {
  chinese: string;
  english: string;
  foreground?: string;
  background?: string;
}
export const stationNameDefaultProps: StationNameProps = {
  chinese: "红旗河沟",
  english: "Hongqihegou",
};

export const stationNameEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.chongqing.components.StationName.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chongqing.components.StationName.props.english",
      element: <TextArea />,
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.StationName.props.foreground",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.StationName.props.background",
      element: <CustomColorPicker currentTheme={0} />,
    },
  ],
});

function StationName({
  chinese = stationNameDefaultProps.chinese,
  english = stationNameDefaultProps.english,
  foreground = stationNameDefaultProps.foreground ?? colors.foreground,
  background = stationNameDefaultProps.background ?? colors.background,
}: StationNameProps) {
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

    // 等字体加载完再测量
    document.fonts.ready.then(() => {
      if (mounted) measure();
    });

    return () => {
      mounted = false;
    };
  }, [chinese, english]);

  // 按换行符分割英文
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const zhText = normalizeSvgLine(chinese);
  const englishLines = normalizeSvgLines(english);
  const lineHeight = 14; // 英文行高
  const baseY = englishLines.length > 1 ? 42 : 48;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="h-16 ml-1.25 mr-1.25" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g ref={textGroupRef}>
            <text
              x={svgWidth / 2}
              y={englishLines.length > 1 ? 26 : 32}
              fontSize={24}
              fontWeight="bold"
              textAnchor="middle"
              fill={foreground}
              xmlSpace="preserve"
            >
              {zhText}
            </text>
            <text
              x={svgWidth / 2}
              y={baseY}
              fontSize={englishLines.length > 1 ? 12 : 14}
              fontWeight="bold"
              textAnchor="middle"
              fill={foreground}
              xmlSpace="preserve"
            >
              {englishLines.map((line, idx) => (
                <tspan
                  key={idx}
                  x={svgWidth / 2}
                  dy={idx === 0 ? 0 : lineHeight}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

StationName.getEditorConfig = (t: (key: string) => string) =>
  stationNameEditorConfig(t);

export default StationName;
