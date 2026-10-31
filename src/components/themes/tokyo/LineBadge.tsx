import { Input, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import { Background, backgroundFormItems } from "./Background";
import BadgeGlyph from "./define/BadgeGlyph";

/**
 * LineBadge —— 线路标（站号徽章）。
 *
 * 徽章本体见 `define/BadgeGlyph.tsx`（CI 指南 P8 的几何）。
 * 徽章外面可以再垫一层底板，三选一：
 *  - `none`   透明（= 关掉，直接贴板）
 *  - `rect`   圆角矩形
 *  - `circle` 大一圈的圆
 * 大号 52 / 小号 30 两档；小号用于换乘行与 Direction 的线路徽章。
 */
export type BadgePlate = "none" | "rect" | "circle";
/** 徽章本体形状：圆环 / 圆角方环 */
export type BadgeRingShape = "circle" | "rect";
/** 环厚两档：单字母无数字时现场更粗 */
export type BadgeThickness = "normal" | "thick";
export type BadgeSize = "large" | "small";

export interface LineBadgeProps {
  /** 线路字母（1–3 个，超宽自动缩字号） */
  letter: string;
  /** 徽章本体：圆环 / 圆角方环 */
  shape?: BadgeRingShape;
  /** 环厚：标准 / 加粗 */
  thickness?: BadgeThickness;
  /** 站号数字，留空则只显示字母 */
  number?: string;
  color?: string;
  size?: BadgeSize;
  plate?: BadgePlate;
  plateColor?: string;
  /** 底板相对徽章的外扩（px） */
  platePadding?: number;
  foreground?: string;
  background?: string;
}

export const lineBadgeDefaultProps: LineBadgeProps = {
  letter: "G",
  number: "19",
  color: colors.lineG,
  size: "large",
  plate: "rect",
  plateColor: "#ffffff",
  platePadding: 4,
  foreground: "#1a1a1a",
  background: colors.background,
  shape: "circle",
  thickness: "normal",
};

/** 徽章直径（px） */
const DIAMETER: Record<BadgeSize, number> = { large: 52, small: 36 };

export const lineBadgeEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "letter",
      label: "themes.tokyo-metro.components.LineBadge.props.letter",
      element: <Input maxLength={3} />,
    },
    {
      key: "number",
      label: "themes.tokyo-metro.components.LineBadge.props.number",
      element: <Input maxLength={2} />,
    },
    {
      key: "color",
      label: "themes.tokyo-metro.components.LineBadge.props.color",
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "shape",
      label: "themes.tokyo-metro.components.LineBadge.props.shape.displayName",
      element: (
        <Select>
          <Select.Option value="circle">
            {_t("themes.tokyo-metro.components.LineBadge.props.shape.circle")}
          </Select.Option>
          <Select.Option value="rect">
            {_t("themes.tokyo-metro.components.LineBadge.props.shape.rect")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "thickness",
      label: "themes.tokyo-metro.components.LineBadge.props.thickness.displayName",
      element: (
        <Select>
          <Select.Option value="normal">
            {_t("themes.tokyo-metro.components.LineBadge.props.thickness.normal")}
          </Select.Option>
          <Select.Option value="thick">
            {_t("themes.tokyo-metro.components.LineBadge.props.thickness.thick")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "size",
      label: "themes.tokyo-metro.components.LineBadge.props.size.displayName",
      element: (
        <Select>
          <Select.Option value="large">
            {_t("themes.tokyo-metro.components.LineBadge.props.size.large")}
          </Select.Option>
          <Select.Option value="small">
            {_t("themes.tokyo-metro.components.LineBadge.props.size.small")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "plate",
      label: "themes.tokyo-metro.components.LineBadge.props.plate.displayName",
      element: (
        <Select>
          <Select.Option value="none">
            {_t("themes.tokyo-metro.components.LineBadge.props.plate.none")}
          </Select.Option>
          <Select.Option value="rect">
            {_t("themes.tokyo-metro.components.LineBadge.props.plate.rect")}
          </Select.Option>
          <Select.Option value="circle">
            {_t("themes.tokyo-metro.components.LineBadge.props.plate.circle")}
          </Select.Option>
        </Select>
      ),
    },
    ...backgroundFormItems("themes.tokyo-metro.components.LineBadge.props"),
  ],
});

function LineBadge({
  letter = lineBadgeDefaultProps.letter,
  shape = "circle",
  thickness = "normal",
  number = lineBadgeDefaultProps.number,
  color = lineBadgeDefaultProps.color,
  size = lineBadgeDefaultProps.size,
  plate = lineBadgeDefaultProps.plate,
  plateColor = lineBadgeDefaultProps.plateColor,
  platePadding = lineBadgeDefaultProps.platePadding,
  foreground = lineBadgeDefaultProps.foreground,
  background = lineBadgeDefaultProps.background,
}: LineBadgeProps) {
  const d = DIAMETER[size ?? "large"];
  const pad = plate === "none" ? 0 : Math.max(0, platePadding ?? 0);
  const plateSize = d + pad * 2;
  const radius = plate === "circle" ? plateSize / 2 : Math.round(d * 0.22);

  return (
    <Background
      background={background}
      className="flex h-16 items-center justify-center px-1"
    >
      <div
        style={{
          width: plateSize,
          height: plateSize,
          borderRadius: plate === "none" ? undefined : radius,
          backgroundColor: plate === "none" ? undefined : plateColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BadgeGlyph
          size={d}
          letter={letter}
          number={number}
          color={color ?? colors.lineG}
          foreground={foreground}
          shape={shape}
          thickness={thickness}
        />
      </div>
    </Background>
  );
}

LineBadge.getEditorConfig = (t: (key: string) => string) =>
  lineBadgeEditorConfig(t);

export default LineBadge;
