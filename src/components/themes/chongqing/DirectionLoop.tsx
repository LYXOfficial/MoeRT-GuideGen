import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import { normalizeSvgLine } from "../../../utils/svgText";

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

export const directionEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
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
          <Select.Option value="left">
            {t("themes.chongqing.components.DirectionLoop.props.align.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chongqing.components.DirectionLoop.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.DirectionLoop.props.foreground",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.DirectionLoop.props.background",
      element: <CustomColorPicker currentTheme={0} />,
    },
  ],
});

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
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const tipZh = normalizeSvgLine(tipchinese);
  const tipEn = normalizeSvgLine(tipenglish);
  const toZh = normalizeSvgLine(tochinese);
  const toEn = normalizeSvgLine(toenglish);

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
  }, [toZh, toEn, tipZh, tipEn]);

  // 对齐时的起始 x 坐标
  let groupX = 0;
  if (align === "right") groupX = svgWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-1.25 mr-1.25" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g
            ref={directionGroupRef}
            transform={`translate(${groupX}, 0)`}
            textAnchor={align === "right" ? "end" : "start"}
          >
            <text x={0} y={15} fontSize={12} fill={foreground} xmlSpace="preserve">
              {tipZh}
            </text>
            <text x={0} y={23} fontSize={8} fill={foreground} xmlSpace="preserve">
              {tipEn}
            </text>
            <text x={0} y={42} fontSize={20} fill={foreground} xmlSpace="preserve">
              {toZh}
            </text>
            <text x={0} y={57} fontSize={14} fill={foreground} xmlSpace="preserve">
              {toEn}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
DirectionLoop.getEditorConfig = (t: (key: string) => string) =>
  directionEditorConfig(t);
