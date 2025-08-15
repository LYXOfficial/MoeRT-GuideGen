import { useRef, useState, useEffect } from "react";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input } from "@douyinfe/semi-ui";

export interface StationNameProps {
  chinese: string;
  english: string;
}
export const stationNameDefaultProps: StationNameProps = {
  chinese: "红旗河沟",
  english: "Hongqihegou",
};

export const stationNameEditorConfig: EditorConfig = {
  forms: [
    {
      key: "chinese",
      label: "themes.chongqing.components.StationName.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chongqing.components.StationName.props.english",
      element: <Input />,
    }
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
    <div className="h-64px ml-5px mr-5px" style={{ width: svgWidth }}>
      <svg className="h-full" width={svgWidth} height={64}>
        <g ref={textGroupRef}>
          <text
            x={svgWidth / 2}
            y={32}
            fontSize={24}
            fontWeight="bold"
            textAnchor="middle"
          >
            {chinese}
          </text>
          <text
            x={svgWidth / 2}
            y={48}
            fontSize={14}
            fontWeight="bold"
            textAnchor="middle"
          >
            {english}
          </text>
        </g>
      </svg>
    </div>
  );
}

StationName.getEditorConfig = () => stationNameEditorConfig;

export default StationName;
