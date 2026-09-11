import { useContext, type FC } from "react";
import { Select, Switch } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import { EditingPropsContext } from "../../EditingPropsContext";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";

/**
 * 图形符号（M5）。
 *
 * 所有图形均来自 visys.pdf 的矢量图层（docs/beijing/raw 下的提取脚本产出），
 * 不是手绘近似形：路径坐标、填充规则、配色角色都与原始印刷文件一致。
 * 三组：
 *  A 彩色组：定色（浅蓝 / 女卫粉 / 出口绿 / 禁止红 / AED 红），改前景色无效
 *  B 白色组：跟随前景色（电梯、卫生间、票务、安检、无障碍、老幼病残孕、禁止通行暗/亮底）
 *  C 其他：毛笔北京、城门剪影、北京地铁 A/B、禁止
 * 背景色由 background/background2 决定（支持上下两行），图标本身不画底板。
 */
interface IconEntry {
  /** i18n 键后缀，同时决定 props.icon 的默认值 */
  key: string;
  glyph: FC<any>;
  /** 彩色组：固定配色（colors 的键），忽略前景色；ground 用于固定"挖空/图形"色 */
  fixed?: { color: string; secondary?: string; ground?: string };
  /** 全尺寸贴边：图形铺满 64×64 块（默认四周留 10px） */
  fullBleed?: boolean;
}

import {
  EscalatorLeftGlyph,
  EscalatorRightGlyph,
  StairsLeftGlyph,
  StairsRightGlyph,
  ElevatorGlyph,
  ElevatorAccessibleGlyph,
  RestroomGlyph,
  RestroomAccessibleGlyph,
  RestroomThirdGlyph,
  RestroomMenGlyph,
  RestroomWomenGlyph,
  NursingRoomGlyph,
  AedGlyph,
  GuideDogGlyph,
  TicketVendingGlyph,
  TicketServiceGlyph,
  InquiryGlyph,
  CustomerServiceGlyph,
  PoliceGlyph,
  HelpButtonGlyph,
  SecurityCheckGlyph,
  LuggageCheckGlyph,
  RampGlyph,
  LiftingPlatformGlyph,
  AccessibilityGlyph,
  AccessibilityWhiteGlyph,
  ElderlyGlyph,
  StrollerGlyph,
  PregnantGlyph,
  LuggageGlyph,
} from "./icons/facilities-real";
import { NoEntryDarkGlyph } from "./icons/noentry-real";
import { NoEntryLightGlyph } from "./icons/noentry-light-real";
import { ProhibitedGlyph } from "./icons/prohibited-real";
import {
  BrushBeijingGlyph,
  CityGateGlyph,
  MetroAGlyph,
  MetroBGlyph,
} from "./icons/city-real";

const COLOR_SCOPE = "themes.beijing.components.Icon.props.icon";
/** 图标块尺寸与默认图形尺寸（四周各留 10px） */
const BOX = 64;
const GLYPH_SIZE = 44;

/**
 * 彩色图标（本体就是彩色：设施浅蓝 / 女卫粉 / AED 红 / 禁止红）——**定色**，不随前景色。
 * 每个图形只保留一个条目（原来同一图形既有"定色"又有"跟随前景色"的两份，已去掉重复）。
 */
const COLORED: IconEntry[] = [
  { key: "escalator_left", glyph: EscalatorLeftGlyph, fixed: { color: "facility" } },
  { key: "stairs_left", glyph: StairsLeftGlyph, fixed: { color: "facility" } },
  { key: "restroom", glyph: RestroomGlyph, fixed: { color: "facility", secondary: "facilityfemale" } },
  { key: "restroom_accessible", glyph: RestroomAccessibleGlyph, fixed: { color: "facility", secondary: "facilityfemale" } },
  { key: "elevator", glyph: ElevatorGlyph, fixed: { color: "facility" } },
  { key: "elevator_accessible", glyph: ElevatorAccessibleGlyph, fixed: { color: "facility" } },
  { key: "accessibility", glyph: AccessibilityGlyph, fixed: { color: "facility" } },
  { key: "nursing_room", glyph: NursingRoomGlyph, fixed: { color: "facility", secondary: "facilityfemale" } },
  { key: "aed", glyph: AedGlyph, fixed: { color: "prohibit", secondary: "white" } },
  { key: "restroom_third", glyph: RestroomThirdGlyph, fixed: { color: "facility", secondary: "facilityfemale" } },
  { key: "restroom_men", glyph: RestroomMenGlyph, fixed: { color: "facility" } },
  { key: "restroom_women", glyph: RestroomWomenGlyph, fixed: { color: "facilityfemale" } },
  { key: "guide_dog", glyph: GuideDogGlyph, fixed: { color: "facility" } },
  // 禁止通行：红盘 + 白横杠/图形，中间的"禁行小人"用固定深色（不随组件背景，避免看着像透明）
  {
    key: "no_entry_dark",
    glyph: NoEntryDarkGlyph,
    fixed: { color: "prohibit", secondary: "white", ground: "background" },
  },
  {
    key: "no_entry_light",
    glyph: NoEntryLightGlyph,
    fixed: { color: "prohibit", secondary: "white", ground: "background" },
    fullBleed: true,
  },
];

/** 非彩色图标（标准里就是白色图形）——**跟随前景色** */
const MONO: IconEntry[] = [
  { key: "escalator_right", glyph: EscalatorRightGlyph },
  { key: "stairs_right", glyph: StairsRightGlyph },
  { key: "ticket_vending", glyph: TicketVendingGlyph },
  { key: "ticket_service", glyph: TicketServiceGlyph },
  { key: "inquiry", glyph: InquiryGlyph },
  { key: "customer_service", glyph: CustomerServiceGlyph },
  { key: "police", glyph: PoliceGlyph },
  { key: "help_button", glyph: HelpButtonGlyph },
  { key: "security_check", glyph: SecurityCheckGlyph },
  { key: "luggage_check", glyph: LuggageCheckGlyph },
  { key: "ramp", glyph: RampGlyph },
  { key: "lifting_platform", glyph: LiftingPlatformGlyph },
  { key: "accessibility_white", glyph: AccessibilityWhiteGlyph },
  { key: "elderly", glyph: ElderlyGlyph },
  { key: "stroller", glyph: StrollerGlyph },
  { key: "pregnant", glyph: PregnantGlyph },
  { key: "luggage", glyph: LuggageGlyph },
];

/** 其他图标（跟随前景色） */
const OTHER: IconEntry[] = [
  { key: "brush_beijing", glyph: BrushBeijingGlyph },
  { key: "city_gate", glyph: CityGateGlyph },
  { key: "metro_a", glyph: MetroAGlyph },
  { key: "metro_b", glyph: MetroBGlyph },
  { key: "prohibited", glyph: ProhibitedGlyph },
];

const ALL: IconEntry[] = [...COLORED, ...MONO, ...OTHER];

export const regicons = ALL.map(entry => ({
  key: entry.key,
  label: `${COLOR_SCOPE}.${entry.key}`,
  entry,
}));

export interface IconProps {
  icon?: string;
  foreground?: string;
  background?: string;
  background2?: string;
  rotation?: "0" | "90" | "180" | "270";
  flipH?: boolean;
  flipV?: boolean;
}

export const iconDefaultProps: IconProps = {
  // 默认取「禁止通行」——去重后旧默认键（restroom_color）已不存在
  icon: `${COLOR_SCOPE}.no_entry_dark`,
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
  rotation: "0",
  flipH: false,
  flipV: false,
};

const findEntry = (icon?: string): IconEntry | undefined =>
  ALL.find(e => `${COLOR_SCOPE}.${e.key}` === icon || e.key === icon);

/** 某个图标在给定前景/底色下实际使用的颜色 */
export const resolveIconColors = (
  entry: IconEntry,
  foreground: string,
  background: string
): { color: string; secondary: string; ground: string } => {
  if (entry.fixed) {
    return {
      color: (colors as Record<string, string>)[entry.fixed.color],
      secondary: entry.fixed.secondary
        ? (colors as Record<string, string>)[entry.fixed.secondary]
        : background,
      // 定色图标可以指定固定的“挖空/图形”色；未指定时跟随组件背景
      ground: entry.fixed.ground
        ? (colors as Record<string, string>)[entry.fixed.ground]
        : background,
    };
  }
  return { color: foreground, secondary: background, ground: background };
};

/** 下拉框里的图标预览：颜色取自正在编辑的那个组件（没有则用默认值） */
function OptionPreview({ entry }: { entry: IconEntry }) {
  // 候选框是白色弹层，分两种情况预览，保证「看到的就是实际效果」：
  //  1) 定色图标（含禁止通行）：用固定配色 + **当前组件的底色**，
  //     这样挖空（ground）跟实际渲染一致，禁止通行不会再变成"红盘白挖空"。
  //  2) 跟随前景色的图标：弹层背景是白的，直接用前景白会看不见 → 用黑色画在白底上。
  const editing = useContext(EditingPropsContext);
  const previewBg = editing.background ?? iconDefaultProps.background;
  const { color, secondary, ground } = entry.fixed
    ? resolveIconColors(entry, "#000000", previewBg)
    : { color: "#000000", secondary: "#ffffff", ground: "#ffffff" };
  const Glyph = entry.glyph;
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
      <Glyph color={color} secondary={secondary} ground={ground} />
    </span>
  );
}

export const iconEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijing.components.Icon.props";
  return {
    forms: [
      {
        key: "icon",
        label: `${scope}.icon.displayName`,
        element: (
          <Select>
            {regicons.map(item => (
              <Select.Option value={item.label} key={item.label}>
                <span className="flex items-center gap-2 leading-none">
                  <OptionPreview entry={item.entry} />
                  <span className="truncate">{t(item.label)}</span>
                </span>
              </Select.Option>
            ))}
          </Select>
        ),
      },
      {
        key: "rotation",
        label: `${scope}.rotation.displayName`,
        element: (
          <Select>
            <Select.Option value="0">0°</Select.Option>
            <Select.Option value="90">90°</Select.Option>
            <Select.Option value="180">180°</Select.Option>
            <Select.Option value="270">270°</Select.Option>
          </Select>
        ),
      },
      { key: "flipH", label: `${scope}.flipH`, element: <Switch /> },
      { key: "flipV", label: `${scope}.flipV`, element: <Switch /> },
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

function Icon({
  icon = iconDefaultProps.icon,
  foreground = iconDefaultProps.foreground,
  background = iconDefaultProps.background,
  background2 = iconDefaultProps.background2,
  rotation = iconDefaultProps.rotation,
  flipH = iconDefaultProps.flipH,
  flipV = iconDefaultProps.flipV,
}: IconProps) {
  const entry = findEntry(icon);
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.background;

  if (!entry) {
    return (
      <MultiRowBackground
        background={bg}
        background2={background2}
        className="h-16 w-16"
      />
    );
  }

  const { color, secondary, ground } = resolveIconColors(
    entry,
    fg,
    bg
  );
  const Glyph = entry.glyph;

  const transform = [
    rotation && rotation !== "0" ? `rotate(${rotation}deg)` : "",
    flipH ? "scaleX(-1)" : "",
    flipV ? "scaleY(-1)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      className="h-16 w-16"
    >
      <div
        className="flex h-16 w-16 flex-col items-center justify-center"
        style={{ transform: transform || undefined }}
      >
        {/* 默认四周留 10px（44×44）；标记 fullBleed 的图形铺满整块（禁止通行亮底）。
            提取时图形在 24 视框里留了 0.4 的边距（0.4/24），贴边时按 24/23.2 放大补掉这条缝。 */}
        <div
          style={{
            width: entry.fullBleed ? BOX : GLYPH_SIZE,
            height: entry.fullBleed ? BOX : GLYPH_SIZE,
            transform: entry.fullBleed ? "scale(1.0345)" : undefined,
          }}
        >
          <Glyph color={color} secondary={secondary} ground={ground} />
        </div>
      </div>
    </MultiRowBackground>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
