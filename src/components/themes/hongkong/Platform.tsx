import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import { normalizeSvgLine } from "../../../utils/svgText";
export interface PlatformProps {
  num: string;
  color?: string;
  background?: string;
}
export const platformDefaultProps: PlatformProps = {
  num: "1",
  color: colors.eastrailline,
  background: colors.transparent,
};
export const platformEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "num",
      label: "themes.hongkong.components.Platform.props.num",
      element: <Input />,
    },
    {
      key: "color",
      label: "themes.hongkong.components.Platform.props.color",
      element: <CustomColorPicker currentTheme={2} />,
    },
    {
      key: "background",
      label: "themes.hongkong.components.Platform.props.background",
      element: <CustomColorPicker currentTheme={2} />,
    },
  ],
});

function Platform({
  num = platformDefaultProps.num,
  color = platformDefaultProps.color,
  background = platformDefaultProps.background,
}: PlatformProps) {
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const numText = normalizeSvgLine(num);
  return (
    <div style={{ background: background }}>
      <div className="h-16 w-12">
        <svg height={64} width={48}>
          <circle cx={24} cy={32} r={20} fill={color} />
          <text
            x={22}
            y={29}
            fontSize={32}
            textAnchor="middle"
            dominantBaseline="central"
            letterSpacing={-3}
            fill={colors.foreground}
            xmlSpace="preserve">
            {numText}
          </text>
        </svg>
      </div>
    </div>
  );
}

Platform.getEditorConfig = (t: (key: string) => string) =>
  platformEditorConfig(t);

export default Platform;
