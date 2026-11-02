import { InputNumber, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import ArrowIcon, { type ArrowDirection } from "./icons/arrow";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX, colorFormItem } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

export type ArrowType = ArrowDirection;

export interface ArrowProps {
  type: ArrowType;
  /** 图形边长（px）。广州比重庆（44）小一圈，默认 36 */
  size?: number;
  fill?: string;
  background?: string;
}

export const arrowDefaultProps: ArrowProps = {
  type: "right",
  size: 36,
  fill: colors.foreground,
  background: colors.transparent,
};

const ARROW_TYPES: ArrowType[] = [
  "up",
  "down",
  "left",
  "right",
  "up-left",
  "up-right",
  "down-left",
  "down-right",
];

export const arrowEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "type",
      label: "themes.guangzhou.components.Arrow.props.type.displayName",
      element: (
        <Select>
          {ARROW_TYPES.map(v => (
            <Select.Option key={v} value={v}>
              {t(`themes.guangzhou.components.Arrow.props.type.${v}`)}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "size",
      label: "themes.guangzhou.components.Arrow.props.size",
      element: <InputNumber min={16} max={64} step={1} />,
    },
    colorFormItem("themes.guangzhou.components.Arrow.props", "fill"),
    {
      key: "background",
      label: "themes.guangzhou.components.Arrow.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function Arrow({
  type = arrowDefaultProps.type,
  size = arrowDefaultProps.size,
  fill = arrowDefaultProps.fill ?? colors.foreground,
  background = arrowDefaultProps.background ?? colors.transparent,
}: ArrowProps) {
  const glyph = Math.max(16, Math.min(64, size ?? 36));
  return (
    <div
      className="h-16 flex items-center justify-center"
      style={{
        width: glyph + 8,
        height: 64,
        backgroundColor: background,
        color: fill,
      }}
    >
      <div style={{ width: glyph, height: glyph }} className="block">
        <ArrowIcon type={type} />
      </div>
    </div>
  );
}

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);

export default Arrow;
