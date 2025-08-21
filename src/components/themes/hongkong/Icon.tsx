import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

import Airplane from "./icons/airplane.png";
import AirportExpress from "./icons/airport_express.png";
import AirportTransfer from "./icons/airport_transfer.png";
import BaggageClaim from "./icons/baggage_claim.png";
import Boat from "./icons/boat.png";
import CableCar from "./icons/cable_car.png";
import CheckIn from "./icons/check_in.png";
import Cross from "./icons/cross.png";
import CustomerServiceCentre from "./icons/customer_service_centre.png";
import EmergencyExit from "./icons/emergency_exit.png";
import Escalator from "./icons/escalator.png";
import Exit1 from "./icons/exit_1.png";
import Exit2 from "./icons/exit_2.png";
import Exit3 from "./icons/exit_3.png";
import Female from "./icons/female.png";
import Lift1 from "./icons/lift_1.png";
import Lift2 from "./icons/lift_2.png";
import LightRail1 from "./icons/light_rail_1.png";
import LightRail2 from "./icons/light_rail_2.png";
import LightRail3 from "./icons/light_rail_3.png";
import LightRail4 from "./icons/light_rail_4.png";
import Male from "./icons/male.png";
import MTR from "./icons/mtr.png";
import SP1900 from "./icons/sp1900.png";
import StairsDown from "./icons/stairs_down.png";
import StairsUp from "./icons/stairs_up.png";
import Tickets from "./icons/tickets.png";
import Toilets from "./icons/toilets.png";
import Train from "./icons/train.png";
import TrainOld from "./icons/train_old.png";
import Wheelchair from "./icons/wheelchair.png";
import Wifi from "./icons/wifi.png";
import XRL1 from "./icons/xrl_1.png";
import XRL2 from "./icons/xrl_2.png";
import YellowHead1 from "./icons/yellow_head_1.png";
import YellowHead2 from "./icons/yellow_head_2.png";

export const regicons = [
  {
    label: "themes.hongkong.components.Icon.props.icon.airplane",
    icon: Airplane,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.airport_express",
    icon: AirportExpress,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.airport_transfer",
    icon: AirportTransfer,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.baggage_claim",
    icon: BaggageClaim,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.boat",
    icon: Boat,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.cable_car",
    icon: CableCar,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.check_in",
    icon: CheckIn,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.cross",
    icon: Cross,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.customer_service_centre",
    icon: CustomerServiceCentre,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.emergency_exit",
    icon: EmergencyExit,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.escalator",
    icon: Escalator,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.exit_1",
    icon: Exit1,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.exit_2",
    icon: Exit2,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.exit_3",
    icon: Exit3,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.female",
    icon: Female,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.lift_1",
    icon: Lift1,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.lift_2",
    icon: Lift2,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.light_rail_1",
    icon: LightRail1,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.light_rail_2",
    icon: LightRail2,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.light_rail_3",
    icon: LightRail3,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.light_rail_4",
    icon: LightRail4,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.male",
    icon: Male,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.mtr",
    icon: MTR,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.sp1900",
    icon: SP1900,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.stairs_down",
    icon: StairsDown,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.stairs_up",
    icon: StairsUp,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.tickets",
    icon: Tickets,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.toilets",
    icon: Toilets,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.train",
    icon: Train,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.train_old",
    icon: TrainOld,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.wheelchair",
    icon: Wheelchair,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.wifi",
    icon: Wifi,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.xrl_1",
    icon: XRL1,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.xrl_2",
    icon: XRL2,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.yellow_head_1",
    icon: YellowHead1,
  },
  {
    label: "themes.hongkong.components.Icon.props.icon.yellow_head_2",
    icon: YellowHead2,
  }
];

export interface IconProps {
  rotation: "0" | "45" | "90" | "135" | "180" | "225" | "270" | "315";
  icon: string;
  background?: string;
}
export const iconDefaultProps: IconProps = {
  rotation: "0",
  icon: "themes.hongkong.components.Icon.props.icon.train",
  background: colors.background,
};

export const iconEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "rotation",
      label: "themes.hongkong.components.Icon.props.rotation",
      element: (
        <Select>
          <Select.Option value="0">0°</Select.Option>
          <Select.Option value="45">45°</Select.Option>
          <Select.Option value="90">90°</Select.Option>
          <Select.Option value="135">135°</Select.Option>
          <Select.Option value="180">180°</Select.Option>
          <Select.Option value="225">225°</Select.Option>
          <Select.Option value="270">270°</Select.Option>
          <Select.Option value="315">315°</Select.Option>
        </Select>
      ),
    },
    {
      key: "icon",
      label: "themes.hongkong.components.Icon.props.icon.displayName",
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
      key: "background",
      label: "themes.hongkong.components.Icon.props.background",
      element: <CustomColorPicker currentTheme={2} />,
    },
  ],
});

function Icon({
  rotation = iconDefaultProps.rotation,
  icon = iconDefaultProps.icon,
  background = iconDefaultProps.background,
}: IconProps) {
  const iconsrc = regicons.find(i => i.label === icon)?.icon;

  return (
    <div
      className="h-64px w-64px p-10px"
      style={{ backgroundColor: background }}
    >
      <img style={{transform: `rotate(${rotation}deg)`}} src={iconsrc}/>
    </div>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
