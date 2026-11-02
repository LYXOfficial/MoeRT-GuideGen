import { InputNumber, Select, Switch } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import RamHorn from "./icons/ramhorn";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 广州地铁标志（羊角 + 标准字），三种排布（用户 2026-11-03 / 2026-11-04）：
 *
 *  - `stacked`：站口那种——标志在上，下面两行小字「广州地铁 / Guangzhou Metro」；
 *  - `inline`：出口门楣那种——标志在左，右边两行字并排；
 *  - `none`：**无文字**，只有羊角（追加在排布方式最后）。
 *
 * 中英文**写死**，编辑器不给改（用户 2026-11-04：「羊角的中英文写死不准改」），
 * 但可以用「显示中英文」开关整块关掉。
 */

/** 写死的中英文（不读 props，老存档改过的值也按这个显示） */
const LOGO_TEXT_ZH = "广州地铁";
const LOGO_TEXT_EN = "Guangzhou Metro";
export interface OperatorLogoProps {
  variant?: "stacked" | "inline" | "none";
  /** 是否显示中英文（默认显示；文字本身写死不可改） */
  showText?: boolean;
  /** 老档遗留：旧的可编辑文案，渲染层已忽略 */
  textZh?: string;
  textEn?: string;
  /** 标志高度（px） */
  size?: number;
  /** 标志与文字的距离（px） */
  gap?: number;
  /** 标志（羊角）颜色 */
  fill?: string;
  /** 文字颜色（与标志色分开） */
  foreground?: string;
  background?: string;
}

export const operatorLogoDefaultProps: OperatorLogoProps = {
  variant: "stacked",
  showText: true,
  size: 34,
  gap: 2,
  fill: colors.brandRed,
  foreground: colors.foreground,
  background: colors.transparent,
};

export const operatorLogoEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "variant",
      label: "themes.guangzhou.components.OperatorLogo.props.variant.displayName",
      element: (
        <Select>
          <Select.Option value="stacked">
            {t("themes.guangzhou.common.logoVariant.stacked")}
          </Select.Option>
          <Select.Option value="inline">
            {t("themes.guangzhou.common.logoVariant.inline")}
          </Select.Option>
          <Select.Option value="none">
            {t("themes.guangzhou.common.logoVariant.none")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "showText",
      label: "themes.guangzhou.components.OperatorLogo.props.showText.displayName",
      // 只有「上下」排布才需要这个开关：横排想不要文字直接选「无文字」
      visible: props => (props.variant ?? "stacked") === "stacked",
      element: <Switch size="small" />,
    },
    {
      key: "size",
      label: "themes.guangzhou.components.OperatorLogo.props.size",
      element: <InputNumber min={12} max={64} />,
    },
    {
      key: "gap",
      label: "themes.guangzhou.components.OperatorLogo.props.gap",
      element: <InputNumber min={0} max={16} />,
    },
    {
      key: "fill",
      label: "themes.guangzhou.components.OperatorLogo.props.fill",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "foreground",
      label: "themes.guangzhou.components.OperatorLogo.props.foreground",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.guangzhou.components.OperatorLogo.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function OperatorLogo({
  variant = operatorLogoDefaultProps.variant,
  showText = operatorLogoDefaultProps.showText,
  size = operatorLogoDefaultProps.size,
  gap = operatorLogoDefaultProps.gap,
  fill = operatorLogoDefaultProps.fill,
  foreground = operatorLogoDefaultProps.foreground,
  background = operatorLogoDefaultProps.background,
}: OperatorLogoProps) {
  const h = Math.max(12, Math.min(64, size ?? 34));
  // 标志本身宽高比 0.84
  const w = Math.round(h * 0.84);
  // 竖排：标志在上、小字在下（站口那种）
  const zhSize = Math.max(7, Math.round(h * 0.2));
  const enSize = Math.max(5, Math.round(h * 0.15));
  // 平铺（flat）：文字要大得多、粗体、左对齐
  const flatZh = Math.max(10, Math.round(h * 0.55));
  const flatEn = Math.max(8, Math.round(h * 0.2));

  const stackedText = (
    <div
      className="flex flex-col items-center"
      style={{ rowGap: 1, whiteSpace: "pre-wrap" }}
    >
      <span
        style={{
          fontFamily: fontFamilyZh,
          fontSize: zhSize,
          lineHeight: 1.1,
          whiteSpace: "pre-wrap",
        }}
      >
        {LOGO_TEXT_ZH}
      </span>
      <span
        style={{
          fontFamily: fontFamilyEn,
          fontSize: enSize,
          lineHeight: 1.1,
          whiteSpace: "pre-wrap",
        }}
      >
        {LOGO_TEXT_EN}
      </span>
    </div>
  );

  const flatText = (
    <div
      className="flex flex-col items-start"
      style={{ rowGap: 0, textAlign: "left", whiteSpace: "pre-wrap" }}
    >
      <span
        style={{
          fontFamily: fontFamilyZh,
          fontSize: flatZh,
          fontWeight: 700,
          lineHeight: 1.2,
          whiteSpace: "pre-wrap",
        }}
      >
        {LOGO_TEXT_ZH}
      </span>
      <span
        style={{
          fontFamily: fontFamilyEn,
          fontSize: flatEn,
          fontWeight: 700,
          lineHeight: 1.1,
          whiteSpace: "pre-wrap",
          letterSpacing: 0.2,
        }}
      >
        {LOGO_TEXT_EN}
      </span>
    </div>
  );

  return (
    <div
      className="h-16 flex items-center justify-center"
      style={{ backgroundColor: background, color: foreground }}
    >
      {variant === "inline" ? (
        <div className="flex items-center" style={{ columnGap: gap }}>
          <div style={{ width: w, height: h, color: fill }}>
            <RamHorn />
          </div>
          {showText !== false && flatText}
        </div>
      ) : (
        <div className="flex flex-col items-center" style={{ rowGap: gap }}>
          <div style={{ width: w, height: h, color: fill }}>
            <RamHorn />
          </div>
          {variant !== "none" && showText !== false && stackedText}
        </div>
      )}
    </div>
  );
}

OperatorLogo.getEditorConfig = (t: (key: string) => string) =>
  operatorLogoEditorConfig(t);

export default OperatorLogo;
