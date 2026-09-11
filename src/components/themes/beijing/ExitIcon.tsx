import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import { ExitAGlyph, ExitBGlyph } from "./icons/exit-real";
import { ExitLongAGlyph } from "./icons/exit-long-real";
import {
  ExitEmergencyGlyph,
  ExitSpecialCGlyph,
} from "./icons/exit-special-real";
import type { FC } from "react";
import type { EditorConfig } from "../../../interfaces/editor";
import { MultiRowBackground, backgroundFormItems } from "./Background";

/**
 * 出口图标（M6）：出口A / 出口B / 出口C / 出口长A / 出口长B / 紧急出口。
 *
 * 图形取自 visys.pdf 矢量图层（P3「出口A / 出口B」、P4「出口特殊样式A/B/C / 紧急出口」），
 * 每种形态的底板与图形配色都写在下面的配置表里：
 *  - **不提供前景色选项**：图形内容色按形态固定（A/B/C/长A 白，长B 绿，紧急出口亮绿）；
 *    无边距（padding = none）时图形自带底板，前景色本来也盖不到任何地方。
 *  - 图形自带底板与内容色（素材原色，固定）；background / background2 只作为
 *    「组件自身的两行背景」，与图标配色**解耦**（有边距时才会露出来）。
 *  - 每个形态按自身宽高比出宽度（出口C / 出口长A / 出口长B / 紧急出口是横长条）；
 *    出口长B = 出口长A 把底色与内容色互换（绿底白字 ⇄ 白底绿字），两条带子完全同尺寸、同字形。
 */
export type ExitIconVariant =
  | "exitA"
  | "exitB"
  | "exitC"
  | "exitLongA"
  | "exitLongB"
  | "emergency";

interface ExitVariantSpec {
  glyph: FC<any>;
  /** 图形自身宽高比（宽 / 高，官方素材实测） */
  aspect: number;
  /** 图形内容色（固定） */
  content: string;
  /** 底板默认色 */
  plate: string;
}

const EXIT_GREEN = colors.exit; // rgb(14.33,66.49,25.33%) = #25AA41
const EMERGENCY_PLATE = "#213f25"; // 深绿 rgb(13.10,24.84,14.52%)
const EMERGENCY_CONTENT = "#59c134"; // 亮绿 rgb(35.00,75.53,20.39%)

export const EXIT_VARIANTS: Record<ExitIconVariant, ExitVariantSpec> = {
  exitA: {
    glyph: ExitAGlyph,
    aspect: 0.734,
    content: colors.white,
    plate: EXIT_GREEN,
  },
  exitB: {
    glyph: ExitBGlyph,
    aspect: 0.867,
    content: colors.white,
    plate: EXIT_GREEN,
  },
  exitC: {
    glyph: ExitSpecialCGlyph,
    aspect: 2.0,
    content: colors.white,
    plate: EXIT_GREEN,
  },
  /**
   * 出口特殊样式A：整条绿色长条 + 白色「出 / EXIT」（内容居中）
   */
  exitLongA: {
    glyph: ExitLongAGlyph,
    aspect: 3.0,
    content: colors.white,
    plate: EXIT_GREEN,
  },
  /**
   * 出口特殊样式B：= 出口长A 的底色与内容色互换 —— 白色长条 + 绿色「出 / EXIT」。
   * 复用长A 的几何（同一条 3:1 带、同一位置同一字号的图形），只换两个颜色。
   * （素材里 B 那版绿字是长A 白字的 4/3 倍、占满整条带高，这里按「就是 A 换色」的要求不用它。）
   */
  exitLongB: {
    glyph: ExitLongAGlyph,
    aspect: 3.0,
    content: EXIT_GREEN,
    plate: colors.white,
  },
  emergency: {
    glyph: ExitEmergencyGlyph,
    aspect: 1.833,
    content: EMERGENCY_CONTENT,
    plate: EMERGENCY_PLATE,
  },
};

export interface ExitIconProps {
  variant?: ExitIconVariant;
  /** none = 图形贴满 64px 行；inset = 四周留 6px */
  padding?: "none" | "inset";
  /** 底板色 */
  background?: string;
  background2?: string;
}

export const exitIconDefaultProps: ExitIconProps = {
  variant: "exitA",
  padding: "none",
  // background / background2 只作为「组件自身的两行背景」（有边距时看得到）；
  // 图形自带的底板与内容色是素材原色，固定不受这两个背景色影响。
  background: colors.background,
  background2: colors.background,
};

export const exitIconEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijing.components.ExitIcon.props";
  return {
    forms: [
      {
        key: "variant",
        label: `${scope}.variant.displayName`,
        element: (
          <Select>
            {(Object.keys(EXIT_VARIANTS) as ExitIconVariant[]).map(v => (
              <Select.Option key={v} value={v}>
                {t(`themes.beijing.common.exitVariant.${v}`)}
              </Select.Option>
            ))}
          </Select>
        ),
      },
      {
        key: "padding",
        label: `${scope}.padding.displayName`,
        element: (
          <Select>
            <Select.Option value="none">
              {t("themes.beijing.common.padding.none")}
            </Select.Option>
            <Select.Option value="inset">
              {t("themes.beijing.common.padding.inset")}
            </Select.Option>
          </Select>
        ),
      },
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
/** 有边距时四周留白：上下 6px，左右 5px */
const INSET = 6;
const INSET_X = 5;

function ExitIcon({
  variant = exitIconDefaultProps.variant,
  padding = exitIconDefaultProps.padding,
  background = exitIconDefaultProps.background,
  background2 = exitIconDefaultProps.background2,
}: ExitIconProps) {
  const style = variant ?? "exitA";
  const spec = EXIT_VARIANTS[style] ?? EXIT_VARIANTS.exitA;
  const isInset = padding === "inset";
  // 组件盒固定 64 高、背景两行始终铺满整盒；
  // 图形按 padding 决定大小：none = 铺满整盒；inset = 四周留白（上下 6px、左右 5px）。
  // 图形自带底板（长A 绿底 / 长B 白底），所以宽度就是图形宽高比。
  const boxH = ROW_H;
  const iconH = ROW_H - (isInset ? INSET * 2 : 0);
  const iconW = Math.round(iconH * spec.aspect);
  const boxW = iconW + (isInset ? INSET_X * 2 : 0);
  const Glyph = spec.glyph;

  return (
    <MultiRowBackground
      background={background}
      background2={background2}
      style={{ height: boxH, width: boxW }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div style={{ width: iconW, height: iconH }}>
          {/* 图形用素材原色（固定），背景色只作用于组件自身的两行背景 */}
          <Glyph color={spec.content} ground={spec.plate} />
        </div>
      </div>
    </MultiRowBackground>
  );
}

ExitIcon.getEditorConfig = (t: (key: string) => string) =>
  exitIconEditorConfig(t);

export default ExitIcon;
