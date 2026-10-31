import { InputNumber, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import { ROW_H } from "./define/layout";
import { ICON_GLYPHS } from "./icons/icon-registry";

/**
 * 图标（图形符号）。
 *
 * 图形全部来自 DB31/T 1104 附录 B（`icons/pictograms-real.tsx`，由原始位图描摹）
 * 与官方标志（`icons/logo-real.tsx`）：
 *  - 单色：形状跟随前景色、底板由 background/background2 决定（没有写死色值）
 *  - 自带圆角/直角细框（标准里外框属于图形本身）
 *  - 可 90° 整数倍旋转
 *  - 左右留一点间距（paddingX，默认 2px），既能和别的元素分开，又不会太散
 */
export interface IconProps {
  icon: string;
  /** 图形边长（px） */
  size?: number;
  /** 旋转角度：0 / 90 / 180 / 270 */
  rotation?: number;
  /** 左右留白（px） */
  paddingX?: number;
  foreground?: string;
  background?: string;
  background2?: string;
}

export const iconDefaultProps: IconProps = {
  icon: "gate_in",
  size: 44,
  rotation: 0,
  paddingX: 2,
  foreground: colors.foreground,
  background: colors.transparent,
  background2: colors.transparent,
};

const SCOPE = "themes.shanghai.components.Icon.props";
const ICON_KEY_SCOPE = `${SCOPE}.icon`;
const SIZE_MIN = 16;
const SIZE_MAX = 72;

export const iconEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "icon",
      label: `${ICON_KEY_SCOPE}.displayName`,
      element: (
        <Select filter style={{ width: "100%" }}>
          {ICON_GLYPHS.map(entry => (
            <Select.Option key={entry.key} value={entry.key}>
              {t(`${ICON_KEY_SCOPE}.${entry.key}`)}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "size",
      label: `${SCOPE}.size`,
      element: <InputNumber step={1} min={SIZE_MIN} max={SIZE_MAX} />,
    },
    {
      key: "rotation",
      label: `${SCOPE}.rotation`,
      element: (
        <Select>
          <Select.Option value={0}>0°</Select.Option>
          <Select.Option value={90}>90°</Select.Option>
          <Select.Option value={180}>180°</Select.Option>
          <Select.Option value={270}>270°</Select.Option>
        </Select>
      ),
    },
    {
      key: "paddingX",
      label: `${SCOPE}.paddingX`,
      element: <InputNumber step={1} min={0} max={24} />,
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
  ],
});

export default function Icon({
  icon = iconDefaultProps.icon,
  size = iconDefaultProps.size,
  rotation = iconDefaultProps.rotation,
  paddingX = iconDefaultProps.paddingX,
  foreground = iconDefaultProps.foreground,
  background = iconDefaultProps.background,
  background2 = iconDefaultProps.background2,
}: IconProps) {
  const entry =
    ICON_GLYPHS.find(item => item.key === icon) ?? ICON_GLYPHS[0];
  const Glyph = entry.glyph;
  const side = Math.min(SIZE_MAX, Math.max(SIZE_MIN, Number(size) || 44));
  const pad = Math.max(0, Number(paddingX) || 0);
  const angle = ((Number(rotation) || 0) % 360 + 360) % 360;
  const boxW = side + pad * 2;

  return (
    <MultiRowBackground
      background={background}
      background2={background2}
      style={{ height: ROW_H, width: boxW }}
    >
      <div
        style={{
          height: ROW_H,
          width: boxW,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: side,
            height: side,
            transform: angle ? `rotate(${angle}deg)` : undefined,
          }}
        >
          <Glyph color={foreground ?? colors.foreground} />
        </div>
      </div>
    </MultiRowBackground>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);
