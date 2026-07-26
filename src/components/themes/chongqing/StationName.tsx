import { useRef, useState, useEffect } from "react";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, TextArea } from "@douyinfe/semi-ui";
import colors from "./define/colors";

export interface StationNameProps {
  chinese: string;
  english: string;
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
  ],
});

function StationName({
  chinese = stationNameDefaultProps.chinese,
  english = stationNameDefaultProps.english,
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
  const englishLines = english.split(/\r?\n/);
  const lineHeight = 14; // 英文行高
  const baseY = englishLines.length > 1 ? 42 : 48;

  return (
    <div style={{ backgroundColor: colors.background }}>
      <div className="h-64px ml-5px mr-5px" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g ref={textGroupRef}>
            <text
              x={svgWidth / 2}
              y={englishLines.length > 1 ? 26 : 32}
              fontSize={24}
              fontWeight="bold"
              textAnchor="middle"
              fill={colors.foreground}
            >
              {chinese}
            </text>
            <text
              x={svgWidth / 2}
              y={baseY}
              fontSize={englishLines.length > 1 ? 12 : 14}
              fontWeight="bold"
              textAnchor="middle"
              fill={colors.foreground}
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
