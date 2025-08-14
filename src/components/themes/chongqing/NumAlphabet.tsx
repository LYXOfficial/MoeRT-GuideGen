import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
export interface NumAlphabetProps {
  text: string;
  foreground?: string;
  background?: string;
  type?: "block" | "fit";
}
export const numAlphabetDefaultProps: NumAlphabetProps = {
  text: "2",
  foreground: colors.foreground,
  background: colors.background,
  type: "fit",
};

export default function NumAlphabet({
  text = numAlphabetDefaultProps.text,
  foreground = numAlphabetDefaultProps.foreground,
  background = numAlphabetDefaultProps.background,
  type = numAlphabetDefaultProps.type,
}: NumAlphabetProps) {
  const numRef = useRef<SVGTextElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (numRef.current) {
        const numBBox = numRef.current.getBBox();
        setSvgWidth(numBBox.width);
      }
    };

    // 等字体加载完再测量
    document.fonts.ready.then(() => {
      if (mounted) measure();
    });

    return () => {
      mounted = false;
    };
  }, [text]);

  return (
    <div style={{ background: background }}>
      <div
        className="h-64px"
        style={{
          width: svgWidth,
          marginLeft: type == "fit" ? 5 : 24,
          marginRight: type == "fit" ? 5 : 24,
        }}
      >
        <svg width={svgWidth} height={64}>
          <text
            ref={numRef}
            x={0}
            y={52}
            fontSize={56}
            letterSpacing={-3}
            fill={foreground}
          >
            {text}
          </text>
        </svg>
      </div>
    </div>
  );
}
