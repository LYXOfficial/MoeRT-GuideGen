import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import ArrowIcon from "./icons/arrow";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

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
  foreground: colors.foreground,
  background: colors.background,
};

export const arrowEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "type",
      label: "themes.chengdu.components.Arrow.props.type.displayName",
      element: (
        <Select>
          <Select.Option value="up">
            {t("themes.chengdu.components.Arrow.props.type.up")}
          </Select.Option>
          <Select.Option value="down">
            {t("themes.chengdu.components.Arrow.props.type.down")}
          </Select.Option>
          <Select.Option value="left">
            {t("themes.chengdu.components.Arrow.props.type.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chengdu.components.Arrow.props.type.right")}
          </Select.Option>
          <Select.Option value="up-left">
            {t("themes.chengdu.components.Arrow.props.type.up-left")}
          </Select.Option>
          <Select.Option value="up-right">
            {t("themes.chengdu.components.Arrow.props.type.up-right")}
          </Select.Option>
          <Select.Option value="down-left">
            {t("themes.chengdu.components.Arrow.props.type.down-left")}
          </Select.Option>
          <Select.Option value="down-right">
            {t("themes.chengdu.components.Arrow.props.type.down-right")}
          </Select.Option>
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

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);

export default Arrow;
