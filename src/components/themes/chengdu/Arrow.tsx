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
      label: "themes.chengdu.components.Arrow.props.type.displayName",
      element: (
        <Select>
          {ARROW_TYPES.map(v => (
            <Select.Option key={v} value={v}>
              {t(`themes.chengdu.components.Arrow.props.type.${v}`)}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.Arrow.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.Arrow.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

function Arrow({
  type = arrowDefaultProps.type,
  foreground = arrowDefaultProps.foreground,
  background = arrowDefaultProps.background,
}: ArrowProps) {
  return (
    <div
      className="h-16 w-16 p-2.5"
      style={{ backgroundColor: background, color: foreground }}
    >
      <ArrowIcon type={type} />
    </div>
  );
}

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);

export default Arrow;
