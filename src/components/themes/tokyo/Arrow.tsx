import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import ArrowIcon, { type ArrowDirection } from "./icons/arrow";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

export type ArrowType = ArrowDirection;

export interface ArrowProps {
  type: ArrowType;
  foreground?: string;
  background?: string;
}
export const arrowDefaultProps: ArrowProps = {
  type: "up",
  foreground: colors.foreground,
  background: colors.background,
};

// 平铺的全部方向（基础八向 + 前方向左/右、左/右行向后）
const ARROW_TYPES: ArrowType[] = [
  "up",
  "down",
  "left",
  "right",
  "up-left",
  "up-right",
  "down-left",
  "down-right",
  "ahead-left",
  "ahead-right",
  "back-left",
  "back-right",
];

export const arrowEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "type",
      label: "themes.tokyo-metro.components.Arrow.props.type.displayName",
      element: (
        <Select>
          {ARROW_TYPES.map(v => (
            <Select.Option key={v} value={v}>
              {t(`themes.tokyo-metro.components.Arrow.props.type.${v}`)}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.tokyo-metro.components.Arrow.props.foreground",
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "background",
      label: "themes.tokyo-metro.components.Arrow.props.background",
      element: <CustomColorPicker currentTheme={5} />,
    },
  ],
});

function Arrow({
  type = arrowDefaultProps.type,
  foreground = arrowDefaultProps.foreground ?? colors.foreground,
  background = arrowDefaultProps.background ?? colors.background,
}: ArrowProps) {
  return (
    <div
      // 比重庆（p-2.5 → 44px）大一圈：内边距 6px → 箭头 52px，更贴板子
      className="h-16 w-16 p-1.5"
      style={{ backgroundColor: background, color: foreground }}
    >
      <ArrowIcon type={type} />
    </div>
  );
}

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);

export default Arrow;
