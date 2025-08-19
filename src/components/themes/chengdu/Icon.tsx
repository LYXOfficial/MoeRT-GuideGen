import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

import Exit from "./icons/exit";
import CheckIn from "./icons/checkin";
import Ticket from "./icons/ticket";
import Train from "./icons/train";

export const regicons = [
  {
    label: "themes.chengdu.components.Icon.props.icon.train",
    component: Train,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.exit",
    component: Exit,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.ticket",
    component: Ticket,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.checkin",
    component: CheckIn,
  },
];

export interface IconProps {
  rotation: "0" | "90" | "180" | "270";
  icon: string;
  foreground?: string;
  background?: string;
}
export const iconDefaultProps: IconProps = {
  rotation: "0",
  icon: "themes.chengdu.components.Icon.props.icon.exit",
  foreground: colors.exitforeground,
  background: colors.exitbackground,
};

export const iconEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "rotation",
      label: "themes.chengdu.components.Icon.props.rotation",
      element: (
        <Select>
          <Select.Option value="0">0°</Select.Option>
          <Select.Option value="90">90°</Select.Option>
          <Select.Option value="180">180°</Select.Option>
          <Select.Option value="270">270°</Select.Option>
        </Select>
      ),
    },
    {
      key: "icon",
      label: "themes.chengdu.components.Icon.props.icon.displayName",
      element: (
        <Select>
          {regicons.map(icon => {
            return (
              <Select.Option value={icon.label} key={icon.label}>
                {t(icon.label)}
              </Select.Option>
            );
          })}
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.Icon.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.Icon.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

function Icon({
  rotation = iconDefaultProps.rotation,
  icon = iconDefaultProps.icon,
  foreground = iconDefaultProps.foreground,
  background = iconDefaultProps.background,
}: IconProps) {
  const IconComponent = regicons.find(i => i.label === icon)?.component;

  return (
    <div
      className="h-64px w-64px p-10px"
      style={{ backgroundColor: background }}
    >
      {IconComponent ? (
        <IconComponent
          background={background}
          foreground={foreground}
          rotation={Number(rotation)}
        />
      ) : null}
    </div>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
