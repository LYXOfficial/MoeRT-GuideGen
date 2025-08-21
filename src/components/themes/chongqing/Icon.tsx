import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

import Metro from "./icons/metro";
import Exit1 from "./icons/exit1";
import Exit2 from "./icons/exit2";
import CheckIn from "./icons/checkin";
import MonoRail from "./icons/monorail";
import Ticket from "./icons/ticket";
import Train from "./icons/train";
import Bus from "./icons/bus";
import CR from "./icons/cr";
import Coach from "./icons/coach";
import Elevator from "./icons/elevator";
import Parking from "./icons/parking";
import WaitingRoom from "./icons/waitingroom";

export const regicons = [
  {
    label: "themes.chongqing.components.Icon.props.icon.train",
    component: Train,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.exit1",
    component: Exit1,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.exit2",
    component: Exit2,
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
  {
    label: "themes.chongqing.components.Icon.props.icon.bus",
    component: Bus,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.cr",
    component: CR,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.coach",
    component: Coach,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.elevator",
    component: Elevator,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.parking",
    component: Parking,
  },
  {
    label: "themes.chongqing.components.Icon.props.icon.waitingroom",
    component: WaitingRoom,
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

export const iconEditorConfig = (t: (key: string) => string): EditorConfig => ({
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
