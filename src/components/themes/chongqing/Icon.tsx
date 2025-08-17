import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import { t } from "i18next";

import Metro from "./icons/metro";
import Exit from "./icons/exit";
import CheckIn from "./icons/checkin";
import MonoRail from "./icons/monorail";
import Ticket from "./icons/ticket";
import Train from "./icons/train";

export const regicons = [
  {
    label: "themes.chongqing.components.Icon.props.icon.train",
    component: Train,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.exit",
    component: Exit,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.metro",
    component: Metro,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.monorail",
    component: MonoRail,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.ticket",
    component: Ticket,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.checkin",
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
  icon: "themes.chongqing.components.Icon.props.icon.train",
  foreground: colors.foreground,
  background: colors.background,
};

export const iconEditorConfig: EditorConfig = {
  forms: [
    {
      key: "rotation",
      label: "themes.chongqing.components.Icon.props.rotation",
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
      label: "themes.chongqing.components.Icon.props.icon.displayName",
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
      label: "themes.chongqing.components.Icon.props.foreground",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.Icon.props.background",
      element: <CustomColorPicker currentTheme={0} />,
    },
  ],
};

function Icon({
  rotation = iconDefaultProps.rotation,
  icon = iconDefaultProps.icon,
  foreground = iconDefaultProps.foreground,
  background = iconDefaultProps.background,
}: IconProps) {
  const IconComponent = regicons.find(i => i.label === icon)?.component;

  return (
    <div className="h-64px w-64px p-10px">
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

Icon.getEditorConfig = () => iconEditorConfig;

export default Icon;
