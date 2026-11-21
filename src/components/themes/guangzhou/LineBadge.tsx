import { Input, InputNumber, Select } from "@douyinfe/semi-ui";
import { measureInk, normalizeSvgLine, useFontsReady } from "./define/text";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 线路标。
 *
 * 两种版式共用中英文字段：传统版把号码放在中文行内，下沉版把号码放在两行左侧。
 * 线路号仍写在中文开头（「6 号线」），英文写「Line 6」；线路色由 `color` 指定。
 *
 * 旧要求仍然有效：不自动切文字颜色（`textColor` 手选）、左右内边距同一个值（`paddingX`）、
 * 圆角写死。
 */

/** 圆角写死（用户 2026-11-04：不给调，编辑器里没有这个字段） */
const RADIUS = 4;
const SCOPE = "themes.guangzhou.components.LineBadge";

export interface LineBadgeProps {
  /** 下沉版让开头的线路号跨中英两行。 */
  variant?: "classic" | "sunken";
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
  variant: "classic",
  textZh: "8 号线",
  textEn: "Line 8",
  size: 40,
  paddingX: 8,
  color: colors.line8,
  textColor: colors.foreground,
  background: colors.transparent,
};

function VariantSelect({
  t,
  value = lineBadgeDefaultProps.variant,
  onChange,
}: {
  t: (key: string) => string;
  value?: LineBadgeProps["variant"];
  onChange?: (value: NonNullable<LineBadgeProps["variant"]>) => void;
}) {
  return (
    <Select
      value={value}
      onChange={next => {
        if (next === "classic" || next === "sunken") onChange?.(next);
      }}
      optionList={[
        { value: "classic", label: t(`${SCOPE}.variants.classic`) },
        { value: "sunken", label: t(`${SCOPE}.variants.sunken`) },
      ]}
    />
  );
}

export const lineBadgeEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "variant",
      label: `${SCOPE}.props.variant`,
      element: <VariantSelect t={t} />,
    },
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

interface SunkenBadgeProps {
  number: string;
  zh: string;
  en: string;
  height: number;
  padding: number;
}

function SunkenBadge({ number, zh, en, height, padding }: SunkenBadgeProps) {
  // 实拍色块高约 128px：数字墨迹 84px，中文 44px，英文 26px。
  // 统一按墨迹定位，避免字体基线导致左侧数字和右侧两行看起来偏心。
  useFontsReady();
  const measure = (text: string, ratio: number, weight: number, tracking = 0) => {
    const fontSize = height * ratio;
    return {
      text,
      fontSize,
      weight,
      tracking,
      ...measureInk(text, `${weight} ${fontSize}px ${fontFamilyEn}`, tracking, fontSize),
    };
  };
  const digit = measure(number, 0.9, 400);
  const chinese = measure(zh, 0.4, 700, 0.12);
  const english = measure(en, 0.29, 700);
  const hasLabels = zh !== "" || en !== "";
  const gap = number !== "" && hasLabels ? height * 0.16 : 0;
  const labelWidth = Math.max(chinese.inkWidth, english.inkWidth);
  const labelLeft = padding + digit.inkWidth + gap;
  const width = Math.max(1, labelLeft + labelWidth + padding);
  const draw = (ink: typeof digit, left: number, center: number) =>
    ink.text !== "" && (
      <text
        x={left + ink.inkLeft}
        y={height * center + (ink.inkAscent - ink.inkDescent) / 2}
        fontFamily={fontFamilyEn}
        fontSize={ink.fontSize}
        fontWeight={ink.weight}
        letterSpacing={`${ink.tracking}em`}
        xmlSpace="preserve"
      >
        {ink.text}
      </text>
    );

  return (
    <svg width={width} height={height} fill="currentColor">
      {draw(digit, padding, 0.5)}
      {draw(chinese, labelLeft, en ? 0.35 : 0.5)}
      {draw(english, labelLeft, zh ? 0.74 : 0.5)}
    </svg>
  );
}

function LineBadge({
  variant = lineBadgeDefaultProps.variant,
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
  const sunken = variant === "sunken";

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
          paddingLeft: sunken ? 0 : padX,
          paddingRight: sunken ? 0 : padX - 1,
          borderRadius: sunken ? boxH * 0.14 : RADIUS,
          backgroundColor: bg,
          color: textColor,
          rowGap,
        }}
      >
        {sunken && (
          <SunkenBadge
            number={numText}
            zh={normalizeSvgLine(zhText)}
            en={normalizeSvgLine(lower)}
            height={boxH}
            padding={padX}
          />
        )}
        {!sunken && upper !== "" && (
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
        {!sunken && lower !== "" && (
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
