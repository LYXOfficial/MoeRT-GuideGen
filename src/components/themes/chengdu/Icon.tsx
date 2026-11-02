import { useContext, type FC } from "react";
import { Input, Select, Switch } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import { EditingPropsContext } from "../../EditingPropsContext";

import Exit1 from "./icons/exit1";
import CheckIn from "./icons/check-in";
import TicketMachine from "./icons/ticket-machine";
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
import EmergencyExit from "./icons/emergency-exit";
import Escalator from "./icons/escalator";
import NoEntry from "./icons/no-entry";
import NursingRoom from "./icons/nursing-room";
import Stairs from "./icons/stairs";
import Taxi from "./icons/taxi";
import Tickets from "./icons/tickets";
import Airport from "./icons/airport";

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
    label: "themes.chengdu.components.Icon.props.icon.ticket_machine",
    component: TicketMachine,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.check_in",
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
  {
    label: "themes.chengdu.components.Icon.props.icon.emergency_exit",
    component: EmergencyExit,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.escalator",
    component: Escalator,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.no_entry",
    component: NoEntry,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.nursing_room",
    component: NursingRoom,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.stairs",
    component: Stairs,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.taxi",
    component: Taxi,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.tickets",
    component: Tickets,
  },
  {
    label: "themes.chengdu.components.Icon.props.icon.airport",
    component: Airport,
  }
];

export interface IconProps {
  icon?: string;
  /** 底衬：图标方块周围那一圈（透明 = 露出底板） */
  background?: string;
  /** 图形色：图标里画图形的那一笔（SVG 里挖空的那块） */
  iconFill?: string;
  /** 底板色：图标方块的底色 */
  foreground?: string;
  rotation?: "0" | "90" | "180" | "270";
  /** 显示图标下方的小字（开＝图形整体缩小，下面留出中英双行） */
  showText?: boolean;
  textZh?: string;
  textEn?: string;
}

export const iconDefaultProps: IconProps = {
  icon: "themes.chengdu.components.Icon.props.icon.exit2",
  // background / iconFill 必须分开：
  //  · background 是图标外圈那层底衬（透明就跟底板走）；
  //  · iconFill 才是图形本身（SVG 里 `fill` 挖空的那一块）。
  // 以前一个 background 同时当这两件事用，一旦被固化成 transparent，
  // 挖空处就露出下面那层底板 → 整个图标变成一块纯色方块。
  background: colors.transparent,
  iconFill: colors.exitbackground,
  foreground: colors.exitforeground,
  rotation: "0",
  showText: false,
  textZh: "",
  textEn: "",
};

// 下拉框里的图标预览：颜色取自正在编辑的那个组件（没有则用默认值）
function OptionPreview({ component }: { component: FC<any> }) {
  const editing = useContext(EditingPropsContext);
  const Component = component;
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
      <Component
        background={editing.iconFill ?? iconDefaultProps.iconFill}
        foreground={editing.foreground ?? iconDefaultProps.foreground}
      />
    </span>
  );
}

export const iconEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "showText",
      label: "themes.chengdu.components.Icon.props.showText",
      element: <Switch />,
    },
    {
      key: "textZh",
      label: "themes.chengdu.components.Icon.props.textZh",
      element: <Input />,
      visible: props => props.showText === true,
    },
    {
      key: "textEn",
      label: "themes.chengdu.components.Icon.props.textEn",
      element: <Input />,
      visible: props => props.showText === true,
    },
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
          {regicons.map(icon => (
            <Select.Option value={icon.label} key={icon.label}>
              <span className="flex items-center gap-2 leading-none">
                <OptionPreview component={icon.component as FC<any>} />
                <span className="truncate">{t(icon.label)}</span>
              </span>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.Icon.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "iconFill",
      label: "themes.chengdu.components.Icon.props.iconFill",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.Icon.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

/** 显示小字时图形缩到这一档，给下面两行字腾地方 */
const ICON_BOX_WITH_TEXT = 36;
/** 图形与下面小字之间的间距 */
const CAPTION_GAP = 2;

function Icon({
  icon = iconDefaultProps.icon,
  background = iconDefaultProps.background,
  iconFill = iconDefaultProps.iconFill,
  foreground = iconDefaultProps.foreground,
  rotation = iconDefaultProps.rotation,
  showText = iconDefaultProps.showText,
  textZh = iconDefaultProps.textZh,
  textEn = iconDefaultProps.textEn,
}: IconProps) {
  const IconComponent = regicons.find(i => i.label === icon)?.component as FC<IconProps>;
  const withText = showText === true;
  const boxSize = withText ? ICON_BOX_WITH_TEXT : 64;
  const zh = (textZh ?? "").trim();
  const en = (textEn ?? "").trim();

  return (
    <div
      // 不带小字时保持 64×64 方块；带小字时宽度收成内容宽（不然图标两侧空一大截，
      // 虚线框还会跟上面图标对不齐）
      // 带小字时宽度收成「内容 + 两侧各 6px」，既不空一大截、也不至于贴着边框
      className={`flex h-16 flex-col items-center justify-center ${withText ? "px-1.5" : "w-16"}`}
      style={{ backgroundColor: background }}
    >
      <div
        className={withText ? "" : "p-2.5"}
        style={{ width: boxSize, height: boxSize }}
      >
        {IconComponent ? (
          <IconComponent
            icon={icon}
            background={iconFill}
            foreground={foreground}
            rotation={rotation}
          />
        ) : null}
      </div>
      {withText ? (
        // 图标下方的小字：中英双行、居中，颜色跟随前景色（跟图标底板同色）。
        // 与图标的间距用 CAPTION_GAP（别贴着图形），中英两行之间紧一点（lineHeight 只比字号大 1px）。
        <div
          className="flex flex-col items-center leading-none"
          style={{ color: foreground, marginTop: CAPTION_GAP }}
        >
          {zh ? (
            <span style={{ fontSize: 8, lineHeight: "9px", whiteSpace: "pre" }}>{zh}</span>
          ) : null}
          {en ? (
            <span style={{ fontSize: 6, lineHeight: "7px", whiteSpace: "pre" }}>{en}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
