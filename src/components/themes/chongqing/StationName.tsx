import { useRef, useState, useEffect } from "react";

export default function StationName({
  chinese,
  english,
}: {
  chinese: string;
  english: string;
}) {
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
