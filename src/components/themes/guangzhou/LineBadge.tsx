import { Input, InputNumber } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 线路标。
 *
 * 用户 2026-11-04：**没有「主文字 / 数字突出」这回事，只有中文 + 英文两行**。
 * 线路号就写在中文里（「6 号线」），英文写「Line 6」，两行居中；底色直接选颜色（`color`）。
 *
 * 旧要求仍然有效：不自动切文字颜色（`textColor` 手选）、左右内边距同一个值（`paddingX`）、
 * 圆角写死。
 */

/** 圆角写死（用户 2026-11-04：不给调，编辑器里没有这个字段） */
const RADIUS = 4;

export interface LineBadgeProps {
  /** 中文（如「6 号线」「广佛线」） */
  textZh?: string;
  /** 英文（如「Line 6」「Guangfo Line」） */
  textEn?: string;
  /** 方块高度（px），宽度自适应 */
  size?: number;
  /** 左右内边距（px，左右同一个值） */
  paddingX?: number;
  /** 底色（线路色）。**刻意不叫 background**：那个键会被落板配色覆盖成底板色 */
  color?: string;
  /** 文字颜色：用户指定，不做自动反白 */
  textColor?: string;
  /** 组件背景色（板底衬，落板时按板色固化）；跟徽章底色 `color` 是两回事 */
  background?: string;
}

export const lineBadgeDefaultProps: LineBadgeProps = {
  textZh: "8 号线",
  textEn: "Line 8",
  size: 40,
  paddingX: 8,
  color: colors.line8,
  textColor: colors.foreground,
  background: colors.transparent,
};

export const lineBadgeEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "textZh",
      label: "themes.guangzhou.components.LineBadge.props.textZh",
      element: <Input />,
    },
    {
      key: "textEn",
      label: "themes.guangzhou.components.LineBadge.props.textEn",
      element: <Input />,
    },
    {
      key: "size",
      label: "themes.guangzhou.components.LineBadge.props.size",
      element: <InputNumber min={16} max={64} />,
    },
    {
      key: "paddingX",
      label: "themes.guangzhou.components.LineBadge.props.paddingX",
      element: <InputNumber min={0} max={24} />,
    },
    {
      key: "color",
      label: "themes.guangzhou.components.LineBadge.props.color",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "textColor",
      label: "themes.guangzhou.components.LineBadge.props.textColor",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.guangzhou.components.LineBadge.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function LineBadge({
  textZh = lineBadgeDefaultProps.textZh,
  textEn = lineBadgeDefaultProps.textEn,
  size = lineBadgeDefaultProps.size,
  paddingX = lineBadgeDefaultProps.paddingX,
  color,
  textColor = lineBadgeDefaultProps.textColor,
  background,
}: LineBadgeProps) {
  const boxH = Math.max(16, Math.min(64, size ?? 36));
  const padX = Math.max(0, Math.min(24, paddingX ?? 3));
  // 徽章底色只认 color（线路色），空则退回 1 号线黄；background 是组件底板
  const bg = (color && color !== "" ? color : "") || colors.line1;

  // 用户 2026-11-04：数字单独拆出来，**只比汉字大一点点**（约 +3px），同一基线。
  const zhSize = Math.round(boxH * 0.45);
  const numSize = Math.round(boxH * 0.55);
  const enSize = Math.round(boxH * 0.3);
  const rowGap = Math.max(1, Math.round(boxH * 0.02));

  const upper = (textZh ?? "").trim();
  const lower = (textEn ?? "").trim();
  // 把开头那串线路号（「6」「11」「2,5」「18-1」）拆出来单独放大，剩下的汉字照常
  const matched = upper.match(
    /^([0-9]+(?:\s*[,、，/·-]\s*[0-9]+)*)\s*([\s\S]*)$/
  );
  const numText = matched ? matched[1] : "";
  const zhText = matched ? matched[2] : upper;

  return (
    // 整块徽章在板子上左右各留 3px，别贴着相邻组件
    <div
      className="h-16 flex items-center"
      style={{ paddingLeft: 3, paddingRight: 3, backgroundColor: background }}
    >
      <div
        className="flex flex-col justify-center"
        style={{
          height: boxH,
          paddingLeft: padX,
          paddingRight: padX - 1,
          borderRadius: RADIUS,
          backgroundColor: bg,
          color: textColor,
          rowGap,
        }}
      >
        {upper !== "" && (
          <span
            className="flex items-baseline"
            style={{
              fontFamily: fontFamilyEn,
              fontWeight: 700,
              lineHeight: 1,
              transform: `translateY(-1px)`,
            }}
          >
            {numText !== "" && (
              <span
                style={{
                  fontSize: numSize,
                  whiteSpace: "pre",
                  transform: `translateY(1px)`,
                }}
              >
                {numText}
              </span>
            )}
            {zhText !== "" && (
              <span
                style={{
                  fontSize: zhSize,
                  whiteSpace: "pre",
                  letterSpacing: 1,
                  marginLeft:
                    numText !== "" ? Math.max(1, Math.round(boxH * 0.07)) : 0,
                }}
              >
                {zhText}
              </span>
            )}
          </span>
        )}
        {lower !== "" && (
          <span
            style={{
              fontFamily: fontFamilyEn,
              fontSize: enSize,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: 0.5,
              whiteSpace: "pre",
            }}
          >
            {lower}
          </span>
        )}
      </div>
    </div>
  );
}

LineBadge.getEditorConfig = (t: (key: string) => string) =>
  lineBadgeEditorConfig(t);

export default LineBadge;
