import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

export interface DirectionProps {
  tochinese: string;
  toenglish: string;
  viachinese: string;
  viaenglish: string;
  align?: "left" | "right";
  foreground?: string;
  background?: string;
}
export const directionDefaultProps: DirectionProps = {
  tochinese: "往 龙泉驿",
  toenglish: "To Longquanyi",
  viachinese: "经 天府广场 牛王庙",
  viaenglish: "Via Tianfu Square, Niuwangmiao",
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
};

export const directionEditorConfig: EditorConfig = {
  forms: [
    {
      key: "tochinese",
      label: "themes.chengdu.components.Direction.props.tochinese",
      element: <Input />,
    },
    {
      key: "toenglish",
      label: "themes.chengdu.components.Direction.props.toenglish",
      element: <Input />,
    },
    {
      key: "viachinese",
      label: "themes.chengdu.components.Direction.props.viachinese",
      element: <Input />,
    },
    {
      key: "viaenglish",
      label: "themes.chengdu.components.Direction.props.viaenglish",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chengdu.components.Direction.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">left</Select.Option>
          <Select.Option value="right">right</Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.Direction.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.Direction.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
};

export default function Direction({
  tochinese = directionDefaultProps.tochinese,
  toenglish = directionDefaultProps.toenglish,
  viachinese = directionDefaultProps.viachinese,
  viaenglish = directionDefaultProps.viaenglish,
  align = directionDefaultProps.align,
  foreground = directionDefaultProps.foreground,
  background = directionDefaultProps.background,
}: DirectionProps) {
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
  }, [tochinese, toenglish, viachinese, viaenglish]);

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
            <text x={0} y={24} fontSize={17} fill={foreground}>
              {tochinese}
            </text>
            <text x={0} y={35} fontSize={10} fill={foreground}>
              {toenglish}
            </text>
            <text x={0} y={48} fontSize={12} fill={foreground}>
              {viachinese}
            </text>
            <text x={0} y={57} fontSize={8} fill={foreground}>
              {viaenglish}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Direction.getEditorConfig = () => directionEditorConfig;
