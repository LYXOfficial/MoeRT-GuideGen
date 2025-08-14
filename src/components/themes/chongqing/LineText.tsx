import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";

export default function LineText() {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    if (textGroupRef.current) {
      const bbox = textGroupRef.current.getBBox();
      setSvgWidth(bbox.width+20);
    }
  }, []);

  return (
    <div className="h-64px ml-10px mr-10px" style={{ width: svgWidth }}>
      <svg className="h-full" width={svgWidth} height={64}>
        <rect
          width={15}
          height={48}
          x={0}
          y={12}
          fill={colors["lineinternationexpo"]}
        />
        <g ref={textGroupRef}>
          <text x={20} y={32} fontSize={20}>
            国博线
          </text>
          <text x={20} y={48} fontSize={14}>
            Internation Expo Line
          </text>
        </g>
      </svg>
    </div>
  );
}
