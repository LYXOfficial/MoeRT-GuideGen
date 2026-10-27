import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import { normalizeSvgLine } from "../../../utils/svgText";
export interface NumAlphabetProps {
  text: string;
  foreground?: string;
  background?: string;
  type?: "block" | "fit";
}
export const numAlphabetDefaultProps: NumAlphabetProps = {
  text: "A",
  foreground: colors.foreground,
  background: colors.background,
  type: "fit",
};
export const numAlphabetEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
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
          <Select.Option value="block">
            {t("themes.chengdu.components.NumAlphabet.props.type.block")}
          </Select.Option>
          <Select.Option value="fit">
            {t("themes.chengdu.components.NumAlphabet.props.type.fit")}
          </Select.Option>
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
});

function NumAlphabet({
  text = numAlphabetDefaultProps.text,
  foreground = numAlphabetDefaultProps.foreground,
  background = numAlphabetDefaultProps.background,
  type = numAlphabetDefaultProps.type,
}: NumAlphabetProps) {
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const numText = normalizeSvgLine(text);
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
  }, [numText]);

  return (
    <div style={{ background: background }}>
      <div
        className="h-16"
        style={{
          width: svgWidth,
          marginLeft: type === "fit" ? 5 : 24,
          marginRight: type === "fit" ? 5 : 24,
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
            xmlSpace="preserve">
            {numText}
          </text>
        </svg>
      </div>
    </div>
  );
}

NumAlphabet.getEditorConfig = (t: (key: string) => string) =>
  numAlphabetEditorConfig(t);

export default NumAlphabet;
