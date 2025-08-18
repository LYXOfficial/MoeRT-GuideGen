import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";

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
  line1chinese: "天府红",
  line1english: "Tianfuhong",
  line2chinese: "成都东站",
  line2english: "Chengdu East Railway Station",
  foreground: colors.exitforeground,
  background: colors.exitbackground,
};

export const exitNameEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "line1chinese",
      label: "themes.chengdu.components.ExitName.props.line1chinese",
      element: <Input />,
    },
    {
      key: "line1english",
      label: "themes.chengdu.components.ExitName.props.line1english",
      element: <Input />,
    },
    {
      key: "line2chinese",
      label: "themes.chengdu.components.ExitName.props.line2chinese",
      element: <Input />,
    },
    {
      key: "line2english",
      label: "themes.chengdu.components.ExitName.props.line2english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chengdu.components.ExitName.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chengdu.components.ExitName.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.chengdu.components.ExitName.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chengdu.components.ExitName.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.ExitName.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.ExitName.props.background",
      element: <CustomColorPicker currentTheme={1} />,
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
  }, [line1chinese, line1english, line2chinese, line2english]);

  // 对齐时的起始 x 坐标
  let groupX = 0;
  if (align === "center") groupX = svgWidth / 2;
  if (align === "right") groupX = svgWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-5px mr-5px" style={{ width: svgWidth }}>
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
            <text x={0} y={20} fontSize={14} fill={foreground}>
              {line1chinese}
            </text>
            <text x={0} y={29} fontSize={7} fill={foreground}>
              {line1english}
            </text>
            <text x={0} y={47} fontSize={14} fill={foreground}>
              {line2chinese}
            </text>
            <text x={0} y={56} fontSize={7} fill={foreground}>
              {line2english}
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
