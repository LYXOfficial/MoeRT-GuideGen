import { useRef, useState, useEffect } from "react";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input } from "@douyinfe/semi-ui";
import colors from "./define/colors";

export interface StationNameProps {
  chinese: string;
  english: string;
}
export const stationNameDefaultProps: StationNameProps = {
  chinese: "驷马桥",
  english: "Simaqiao",
};

export const stationNameEditorConfig: EditorConfig = {
  forms: [
    {
      key: "chinese",
      label: "themes.chengdu.components.StationName.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chengdu.components.StationName.props.english",
      element: <Input />,
    },
  ],
};

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

  return (
    <div style={{ backgroundColor: colors.background }}>
      <div className="h-64px ml-5px mr-5px" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g ref={textGroupRef}>
            <text
              x={svgWidth / 2}
              y={32}
              fontSize={24}
              fontWeight="bold"
              textAnchor="middle"
              fill={colors.foreground}
            >
              {chinese}
            </text>
            <text
              x={svgWidth / 2}
              y={48}
              fontSize={14}
              fontWeight="bold"
              textAnchor="middle"
              fill={colors.foreground}
            >
              {english}
            </text>
          </g>
        </svg>
      </div>{" "}
    </div>
  );
}

StationName.getEditorConfig = () => stationNameEditorConfig;

export default StationName;
