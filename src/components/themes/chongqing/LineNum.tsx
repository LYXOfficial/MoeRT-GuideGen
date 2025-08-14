import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";

export default function LineNum() {
  const groupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    if (groupRef.current) {
      const bbox = groupRef.current.getBBox();
      // 给左侧矩形和右侧文字留点边距
      setSvgWidth(bbox.width + bbox.x);
    }
  }, []);

  return (
    <div className="h-64px mr-5px ml-5px" style={{ width: svgWidth }}>
      <svg
        className="h-full"
        width={svgWidth}
        height={64}
      >
        <rect
          width={15}
          height={48}
          x={0}
          y={12}
          fill={colors["line3"]}
        />
        <g ref={groupRef}>
          <text x={20} y={52} fontSize={56}>3</text>
          <text x={50} y={30} fontSize={20}>号线</text>
          <text x={50} y={46} fontSize={16}>Line</text>
        </g>
      </svg>
    </div>
  );
}
