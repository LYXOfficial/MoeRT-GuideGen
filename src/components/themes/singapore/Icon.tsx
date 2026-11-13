import { InputNumber, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { EDGE_PAD, ROW_H } from "./define/layout";
import { AMENITIES } from "./icons/amenities";

/**
 * 设施图记（25 个，官方 §4.5 矢量提取，viewBox 已紧致裁切）。
 *
 * 底板三种：无 / 实心 / **描边**（用户 2026-11-13：实心底板之外还要支持边框）。
 * 宽度按 viewBox 比例自动放宽；底板高度不超过行高。
 */
export type IconPlate = "none" | "solid" | "outline";

export interface IconProps {
  icon?: string;
  size?: number;
  color?: string;
  plate?: IconPlate;
  plateColor?: string;
  borderColor?: string;
  borderWidth?: number;
  background?: string;
}

export const iconDefaultProps: IconProps = {
  icon: "toilets",
  size: 40,
  color: colors.foreground,
  plate: "none",
  plateColor: colors.transparent,
  borderColor: colors.foreground,
  borderWidth: 1,
  background: colors.transparent,
};

const SCOPE = "themes.singapore.components.Icon.props";
const ICON_KEYS = Object.keys(AMENITIES);

export const iconEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "icon",
      label: `${SCOPE}.icon`,
      element: (
        <Select filter={false}>
          {ICON_KEYS.map((k) => (
            <Select.Option key={k} value={k}>
              {t(`themes.singapore.icons.${k}`)}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    { key: "size", label: `${SCOPE}.size`, element: <InputNumber min={12} max={64} /> },
    { key: "color", label: `${SCOPE}.color`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    {
      key: "plate",
      label: `${SCOPE}.plate`,
      element: (
        <Select>
          <Select.Option value="none">{t("themes.singapore.common.plate.none")}</Select.Option>
          <Select.Option value="solid">{t("themes.singapore.common.plate.solid")}</Select.Option>
          <Select.Option value="outline">{t("themes.singapore.common.plate.outline")}</Select.Option>
        </Select>
      ),
    },
    {
      key: "plateColor",
      label: `${SCOPE}.plateColor`,
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
      visible: (props) => props.plate === "solid",
    },
    {
      key: "borderColor",
      label: `${SCOPE}.borderColor`,
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
      visible: (props) => props.plate === "outline",
    },
    {
      key: "borderWidth",
      label: `${SCOPE}.borderWidth`,
      element: <InputNumber min={0.5} max={6} step={0.5} />,
      visible: (props) => props.plate === "outline",
    },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

function Icon({
  icon = iconDefaultProps.icon,
  size = iconDefaultProps.size,
  color = iconDefaultProps.color,
  plate = iconDefaultProps.plate,
  plateColor = iconDefaultProps.plateColor,
  borderColor = iconDefaultProps.borderColor,
  borderWidth = iconDefaultProps.borderWidth,
  background = iconDefaultProps.background,
}: IconProps) {
  const iconKey = (icon ?? ICON_KEYS[0]) as string;
  const asset = AMENITIES[iconKey] ?? AMENITIES[ICON_KEYS[0] as string];

  const s = size ?? 40;
  // 宽度按 viewBox 比例自动放宽（厕所、优先使用者是横向构图，方形画框会把它压小）
  const parts = asset.viewBox.split(/\s+/).map(Number);
  const vbW = parts[2];
  const vbH = parts[3];
  const ratio = vbW > 0 && vbH > 0 ? vbW / vbH : 1;
  const w = s * ratio;

  // 底板（实心/描边）外框：高度不超过行高，宽度跟着内容走
  const plateH = Math.min(s * 1.15, ROW_H);
  const inner = s * (plateH / (s * 1.15));
  const bw = plate === "outline" ? (borderWidth ?? 1.5) : 0;
  const plateW = Math.min(w + s * 0.3, ROW_H * ratio + s * 0.3) + bw * 2;

  const svg = (
    <svg
      width={inner * ratio}
      height={inner}
      viewBox={asset.viewBox}
      style={{ display: "block" }}
    >
      <path d={asset.d} fill={color} fillRule="evenodd" />
    </svg>
  );

  return (
    <div
      className="h-full"
      style={{
        height: ROW_H,
        display: "flex",
        alignItems: "center",
        background,
        paddingLeft: EDGE_PAD,
        paddingRight: EDGE_PAD,
      }}
    >
      {plate === "none" ? (
        svg
      ) : (
        <div
          style={{
            width: plateW,
            height: plateH,
            backgroundColor: plate === "solid" ? plateColor : "transparent",
            border: plate === "outline" ? `${bw}px solid ${borderColor}` : "none",
            boxSizing: "border-box",
            borderRadius: s * 0.16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {svg}
        </div>
      )}
    </div>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
