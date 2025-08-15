import { ColorPicker, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import ArrowIcon from "./icons/arrow";
import type { EditorConfig } from "../../../interfaces/editor";

export interface ArrowProps {
  type:
    | "up"
    | "down"
    | "left"
    | "right"
    | "up-left"
    | "up-right"
    | "down-left"
    | "down-right";
  foreground?: string;
  background?: string;
}
export const arrowDefaultProps: ArrowProps = {
  type: "up",
  foreground: colors["foreground"],
  background: colors["background"],
};

export const arrowEditorConfig: EditorConfig = {
  forms: [
    {
      key: "type",
      label: "themes.chongqing.components.Arrow.props.type.displayName",
      element: (
        <Select>
          <Select.Option value="up">Up</Select.Option>
          <Select.Option value="down">Down</Select.Option>
          <Select.Option value="left">Left</Select.Option>
          <Select.Option value="right">Right</Select.Option>
          <Select.Option value="up-left">Left-Up</Select.Option>
          <Select.Option value="up-right">Right-Up</Select.Option>
          <Select.Option value="down-left">Left-Down</Select.Option>
          <Select.Option value="down-right">Right-Down</Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.Arrow.props.foreground",
      element: (
        <ColorPicker
          alpha={false}
          onChange={() => {}}
          usePopover={true}
          width={200}
          height={200}
          style={{
            border: "1px solid #ccc"
          }}
          value={ColorPicker.colorStringToValue(arrowDefaultProps.foreground!)}
        />
      ),
    },
    {
      key: "background",
      label: "themes.chongqing.components.Arrow.props.background",
      element: (
        <ColorPicker
          alpha={false}
          onChange={() => {}}
          usePopover={true}
          width={200}
          height={200}
          style={{
            border: "1px solid #ccc"
          }}
          value={ColorPicker.colorStringToValue(arrowDefaultProps.background!)}
        />
      ),
    },
  ],
};

function Arrow({
  type = arrowDefaultProps.type,
  foreground = arrowDefaultProps.foreground,
  background = arrowDefaultProps.background,
}: ArrowProps) {
  return (
    <div
      className="h-64px w-64px p-10px"
      style={{ backgroundColor: background, color: foreground }}
    >
      <ArrowIcon
        rotation={
          type === "up"
            ? 0
            : type === "down"
              ? 180
              : type === "left"
                ? 270
                : type === "right"
                  ? 90
                  : type === "up-left"
                    ? 315
                    : type === "up-right"
                      ? 45
                      : type === "down-left"
                        ? 225
                        : 135
        }
      />
    </div>
  );
}

Arrow.getEditorConfig = () => arrowEditorConfig;

export default Arrow;