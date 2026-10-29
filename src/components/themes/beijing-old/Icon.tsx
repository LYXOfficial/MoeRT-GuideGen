import { useContext, type FC } from "react";
import { Select, Switch } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import { EditingPropsContext } from "../../EditingPropsContext";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  Background,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";

/**
 * 图形符号（经典样式）。
 *
 * 全部为带方框的白色系列（visys.pdf 第 5 页「车站设施及服务·暗底色」
 * 第 13–29 格：右向白扶梯 ～ 携带行李，docs/beijing/raw/jobs-p5-old.json 提取），
 * 图形自带圆角方框描边，**跟随前景色** —— 暗底（深蓝底白图形）与亮底
 * （白底深蓝图形）复用同一套图标，只靠前景色 / 背景色切换，不做两套。
 * 背景色由 background / background2 决定，图标本身不画底板。
 */
interface IconEntry {
  /** i18n 键后缀，同时决定 props.icon 的默认值 */
  key: string;
  glyph: FC<any>;
}

import {
  EscalatorRightGlyph,
  StairsRightGlyph,
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
  AccessibilityWhiteGlyph,
  ElderlyGlyph,
  StrollerGlyph,
  PregnantGlyph,
  LuggageGlyph,
} from "./icons/facilities-real";
import {
  CrossGlyph,
  FramedCrossGlyph,
  GateArrowDownGlyph,
} from "./icons/gate-real";

const COLOR_SCOPE = "themes.beijingOld.components.Icon.props.icon";
/** 图标块尺寸与默认图形尺寸（与新版一致：四周各留 10px） */
const GLYPH_SIZE = 44;

const ENTRIES: IconEntry[] = [
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
  // 自助设施通行（向下箭头）/ 禁止通行（叉形）：前景色指定，无固定配色
  { key: "gate_arrow_down", glyph: GateArrowDownGlyph },
  { key: "no_entry_cross", glyph: CrossGlyph },
  // 带框禁止：叉固定红，方框描边跟随前景色
  { key: "no_entry_cross_framed", glyph: FramedCrossGlyph },
];

export const regicons = ENTRIES.map(entry => ({
  key: entry.key,
  label: `${COLOR_SCOPE}.${entry.key}`,
  entry,
}));

export interface IconProps {
  icon?: string;
  foreground?: string;
  background?: string;
  rotation?: "0" | "90" | "180" | "270";
  flipH?: boolean;
  flipV?: boolean;
}

export const iconDefaultProps: IconProps = {
  icon: `${COLOR_SCOPE}.escalator_right`,
  foreground: colors.foreground,
  background: colors.transparent,
  rotation: "0",
  flipH: false,
  flipV: false,
};

const findEntry = (icon?: string): IconEntry | undefined =>
  ENTRIES.find(e => `${COLOR_SCOPE}.${e.key}` === icon || e.key === icon);

/** 下拉框里的图标预览：弹层是白底，用黑色画（同新版 MONO 的做法） */
function OptionPreview({ entry }: { entry: IconEntry }) {
  const editing = useContext(EditingPropsContext);
  const previewBg = editing.background ?? iconDefaultProps.background;
  const Glyph = entry.glyph;
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
      <Glyph color="#000000" secondary="#ffffff" ground={previewBg} />
    </span>
  );
}

export const iconEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijingOld.components.Icon.props";
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
  rotation = iconDefaultProps.rotation,
  flipH = iconDefaultProps.flipH,
  flipV = iconDefaultProps.flipV,
}: IconProps) {
  const entry = findEntry(icon);
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.transparent;

  if (!entry) {
    return (
      <Background
        background={bg}
          className="h-16 w-16"
      />
    );
  }

  const Glyph = entry.glyph;

  const transform = [
    rotation && rotation !== "0" ? `rotate(${rotation}deg)` : "",
    flipH ? "scaleX(-1)" : "",
    flipV ? "scaleY(-1)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Background
      background={bg}
      className="h-16 w-16"
    >
      <div
        className="flex h-16 w-16 flex-col items-center justify-center"
        style={{ transform: transform || undefined }}
      >
        <div style={{ width: GLYPH_SIZE, height: GLYPH_SIZE }}>
          <Glyph color={fg} secondary={bg} ground={bg} />
        </div>
      </div>
    </Background>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
