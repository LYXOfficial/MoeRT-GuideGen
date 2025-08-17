import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface DirectionLoopProps {
  tochinese: string;
  toenglish: string;
  tipchinese: string;
  tipenglish: string;
  align?: "left" | "right";
  foreground?: string;
  background?: string;
}
export const directionLoopDefaultProps: DirectionLoopProps = {
  tochinese: "四公里方向",
  toenglish: "To Sigongli",
  tipchinese: "内环",
  tipenglish: "Clockwise Loop",
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
};

export const directionEditorConfig: EditorConfig = {
  forms: [
    {
      key: "tochinese",
      label: "themes.chongqing.components.DirectionLoop.props.tochinese",
      element: <Input />,
    },
    {
      key: "toenglish",
      label: "themes.chongqing.components.DirectionLoop.props.toenglish",
      element: <Input />,
    },
    {
      key: "tipchinese",
      label: "themes.chongqing.components.DirectionLoop.props.tipchinese",
      element: <Input />,
    },
    {
      key: "tipenglish",
      label: "themes.chongqing.components.DirectionLoop.props.tipenglish",
      element: <Input />,
    },
    {
      key: "align",
      label:
        "themes.chongqing.components.DirectionLoop.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">left</Select.Option>
          <Select.Option value="right">right</Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.DirectionLoop.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.DirectionLoop.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
};

export default function DirectionLoop({
  tochinese = directionLoopDefaultProps.tochinese,
  toenglish = directionLoopDefaultProps.toenglish,
  tipchinese = directionLoopDefaultProps.tipchinese,
  tipenglish = directionLoopDefaultProps.tipenglish,
  align = directionLoopDefaultProps.align,
  foreground = directionLoopDefaultProps.foreground,
  background = directionLoopDefaultProps.background,
}: DirectionLoopProps) {
  const directionGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (directionGroupRef.current) {
        const bbox = directionGroupRef.current.getBBox();
        setSvgWidth(bbox.width);
      }
    };

    (async () => {
      await document.fonts.ready; // 等字体加载完成
      if (mounted) measure();
    })();

    return () => {
      mounted = false;
    };
  }, [tochinese, toenglish, tipchinese, tipenglish]);

  // 对齐时的起始 x 坐标
  let groupX = 0;
  if (align === "right") groupX = svgWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-5px mr-5px" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g
            ref={directionGroupRef}
            transform={`translate(${groupX}, 0)`}
            textAnchor={align === "right" ? "end" : "start"}
          >
            <text x={0} y={15} fontSize={12} fill={foreground}>
              {tipchinese}
            </text>
            <text x={0} y={23} fontSize={8} fill={foreground}>
              {tipenglish}
            </text>
            <text x={0} y={42} fontSize={20} fill={foreground}>
              {tochinese}
            </text>
            <text x={0} y={57} fontSize={14} fill={foreground}>
              {toenglish}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
DirectionLoop.getEditorConfig = () => directionEditorConfig;
