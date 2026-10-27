import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import { normalizeSvgLine } from "../../../utils/svgText";

export interface ExitNameProps {
  line1chinese: string;
  line1english: string;
  line2chinese: string;
  line2english: string;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}
export const exitNameDefaultProps: ExitNameProps = {
  align: "left",
  line1chinese: "羽丘女子学园",
  line1english: "Haneoka Girls' Academy",
  line2chinese: "花咲川女子学园",
  line2english: "Hanasakigawa Girls' Academy",
  foreground: colors.exitforeground,
  background: colors.exitbackground,
};

export const exitNameEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "line1chinese",
      label: "themes.chongqing.components.ExitName.props.line1chinese",
      element: <Input />,
    },
    {
      key: "line1english",
      label: "themes.chongqing.components.ExitName.props.line1english",
      element: <Input />,
    },
    {
      key: "line2chinese",
      label: "themes.chongqing.components.ExitName.props.line2chinese",
      element: <Input />,
    },
    {
      key: "line2english",
      label: "themes.chongqing.components.ExitName.props.line2english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chongqing.components.ExitName.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chongqing.components.ExitName.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.chongqing.components.ExitName.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chongqing.components.ExitName.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.ExitName.props.foreground",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.ExitName.props.background",
      element: <CustomColorPicker currentTheme={0} />,
    },
  ],
});

export default function ExitName({
  line1chinese = exitNameDefaultProps.line1chinese,
  line1english = exitNameDefaultProps.line1english,
  line2chinese = exitNameDefaultProps.line2chinese,
  line2english = exitNameDefaultProps.line2english,
  align = exitNameDefaultProps.align,
  foreground = exitNameDefaultProps.foreground,
  background = exitNameDefaultProps.background,
}: ExitNameProps) {
  const exitNameGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const l1zh = normalizeSvgLine(line1chinese);
  const l1en = normalizeSvgLine(line1english);
  const l2zh = normalizeSvgLine(line2chinese);
  const l2en = normalizeSvgLine(line2english);

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (exitNameGroupRef.current) {
        const bbox = exitNameGroupRef.current.getBBox();
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
  }, [l1zh, l1en, l2zh, l2en]);

  // 对齐时的起始 x 坐标
  let groupX = 0;
  if (align === "center") groupX = svgWidth / 2;
  if (align === "right") groupX = svgWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-1.25 mr-1.25" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g
            ref={exitNameGroupRef}
            transform={`translate(${groupX}, 0)`}
            textAnchor={
              align === "center"
                ? "middle"
                : align === "right"
                  ? "end"
                  : "start"
            }
          >
            <text x={0} y={20} fontSize={14} fill={foreground} xmlSpace="preserve">
              {l1zh}
            </text>
            <text x={0} y={29} fontSize={7} fill={foreground} xmlSpace="preserve">
              {l1en}
            </text>
            <text x={0} y={47} fontSize={14} fill={foreground} xmlSpace="preserve">
              {l2zh}
            </text>
            <text x={0} y={56} fontSize={7} fill={foreground} xmlSpace="preserve">
              {l2en}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
ExitName.getEditorConfig = (t: (key: string) => string) =>
  exitNameEditorConfig(t);
