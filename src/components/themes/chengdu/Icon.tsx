import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

import Exit1 from "./icons/exit1";
import CheckIn from "./icons/checkin";
import Ticket from "./icons/ticket";
import Train from "./icons/train";
import Bus from "./icons/bus";
import CR from "./icons/cr";
import Coach from "./icons/coach";
import Elevator from "./icons/elevator";
import Exit2 from "./icons/exit2";
import Parking from "./icons/parking";
import WaitingRoom from "./icons/waitingroom";
import Men from "./icons/men";
import Women from "./icons/women";
import Toilet from "./icons/toilet";
import ThirdToilet from "./icons/thirdtoilet";
import MenColor from "./icons/men-color";
import WomenColor from "./icons/women-color";
import ToiletColor from "./icons/toilet-color";
import ThirdToiletColor from "./icons/thirdtoilet-color";

export const regicons = [
  {
    label: "themes.chengdu.components.Icon.props.icon.train",
    component: Train,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.exit1",
    component: Exit1,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.exit2",
    component: Exit2,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.ticket",
    component: Ticket,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.checkin",
    component: CheckIn,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.bus",
    component: Bus,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.cr",
    component: CR,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.coach",
    component: Coach,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.elevator",
    component: Elevator,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.parking",
    component: Parking,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.waitingroom",
    component: WaitingRoom,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.men",
    component: Men,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.women",
    component: Women,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.toilet",
    component: Toilet,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.thirdtoilet",
    component: ThirdToilet,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.men_color",
    component: MenColor,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.women_color",
    component: WomenColor,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.toilet_color",
    component: ToiletColor,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.thirdtoilet_color",
    component: ThirdToiletColor,
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
  icon: "themes.chengdu.components.Icon.props.icon.exit2",
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
