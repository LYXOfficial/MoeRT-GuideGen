import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
export interface NumAlphabetProps {
  text: string;
  foreground?: string;
  background?: string;
  type?: "block" | "fit";
}
export const numAlphabetDefaultProps: NumAlphabetProps = {
  text: "A",
  foreground: colors["foreground"],
  background: colors["background"],
  type: "fit",
};
export const numAlphabetEditorConfig: EditorConfig = {
  forms: [
    {
      key: "text",
      label: "themes.chengdu.components.NumAlphabet.props.text",
      element: <Input />,
    },
    {
      key: "type",
      label: "themes.chengdu.components.NumAlphabet.props.type.displayName",
      element: (
        <Select>
          <Select.Option value="block">Block</Select.Option>
          <Select.Option value="fit">Fit</Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.NumAlphabet.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.NumAlphabet.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
};

function NumAlphabet({
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

NumAlphabet.getEditorConfig = () => numAlphabetEditorConfig;

export default NumAlphabet;
