import { InputNumber, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import { PICTOGRAMS, pictogramById } from "./icons/icon-registry";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 图标（设施图形符号）。
 *
 * 字形来自 GB/T 10001.1-2012 官方矢量（icons/gb-pictograms.tsx，脚本生成，勿手改）。
 *
 * 用户 2026-11-03：
 *  - 去掉「显示文字 / 文字颜色」两个字段（图标只管图形）；
 *  - 「显示外框 / 外框粗细 / 内缩」不再暴露，分别固定为 **true / 1.5 / 2**；
 *  - 左右各留一点间距（避免贴到相邻组件）。
 */
export interface IconProps {
  icon?: string;
  /** 边长（px） */
  size?: number;
  /** 图形颜色（同时是外框颜色） */
  fill?: string;
  /** 底板填充色：图标那个圆角方块内部的颜色（跟组件「背景色」是两回事） */
  plateColor?: string;
  /** 组件背景色（整行底衬，落板时按板色固化） */
  background?: string;
}

/** 固定值（用户要求不再给调） */
const FRAME_ON = true;
const BORDER_WIDTH = 1.5;
const INNER_PADDING = 2;
/** 左右留白 */
const SIDE_GAP = 4;

export const iconDefaultProps: IconProps = {
  icon: "005",
  size: 42,
  fill: colors.foreground,
  plateColor: colors.transparent,
  background: colors.transparent,
};

export const iconEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "icon",
      label: "themes.guangzhou.components.Icon.props.icon",
      element: (
        <Select filter={false}>
          {PICTOGRAMS.map(entry => {
            const Glyph = entry.glyph;
            const key = `themes.guangzhou.pictograms.${entry.id}`;
            const translated = t(key);
            const name = translated && translated !== key ? translated : entry.nameZh;
            return (
              <Select.Option
                key={entry.id}
                value={entry.id}
                // Semi 的 Option 只认 label，children 会被忽略
                label={
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        display: "inline-flex",
                        color: "var(--semi-color-text-0)",
                      }}
                    >
                      <Glyph color="currentColor" />
                    </span>
                    <span>{name}</span>
                  </div>
                }
              />
            );
          })}
        </Select>
      ),
    },
    {
      key: "size",
      label: "themes.guangzhou.components.Icon.props.size",
      element: <InputNumber min={20} max={64} />,
    },
    {
      key: "fill",
      label: "themes.guangzhou.components.Icon.props.fill",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "plateColor",
      label: "themes.guangzhou.components.Icon.props.plateColor",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.guangzhou.components.Icon.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function Icon({
  icon = iconDefaultProps.icon,
  size = iconDefaultProps.size,
  fill = iconDefaultProps.fill,
  plateColor = iconDefaultProps.plateColor,
  background = iconDefaultProps.background,
}: IconProps) {
  const edge = Math.max(20, Math.min(64, size ?? 44));
  const entry = pictogramById(icon ?? "");
  const Glyph = entry?.glyph;

  return (
    <div
      className="h-16 flex items-center"
      style={{
        paddingLeft: SIDE_GAP,
        paddingRight: SIDE_GAP,
        backgroundColor: background,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: edge,
          height: edge,
          // 圆角方块内部 = 填充色；外层 h-16 那层才是「背景色」
          backgroundColor: plateColor,
          borderRadius: 6,
          boxShadow: FRAME_ON ? `inset 0 0 0 ${BORDER_WIDTH}px ${fill}` : undefined,
        }}
      >
        <div
          style={{
            width: edge - INNER_PADDING * 2,
            height: edge - INNER_PADDING * 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Glyph ? <Glyph color={fill} /> : null}
        </div>
      </div>
    </div>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
