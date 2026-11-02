import { Input, InputNumber, Switch } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh, lineColor } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 站台号。
 *
 * 实拍（11 号线）：线路色圆，圆内三行——大号数字 / 中文 / 英文。
 * 中英两行**可编辑**（用户 2026-11-03：「站台 platform 应该也能编辑才行」）。
 * ⌀ 实测 = 0.39 × 牌高（灰底 18 号线那块方框版是 0.58，暂不做方框变体）。
 *
 * 用户 2026-11-04：圆底下可以带两行中英文（「外环 / Outer Loop」这种，像羊角竖排）——
 * 带字时**圆缩到 85%** 腾高度，两行字号直接对齐「方向」组件的小字（9 / 5），
 * 颜色走独立的 `captionColor`（默认白，跟圆里的字色分开）。
 */

/** 带圆下中英文字时，圆缩到原来的 85% */
const CAPTION_CIRCLE_SCALE = 0.85;
/** 圆下中英文字号：跟「方向」组件的小字完全一致（9 / 5） */
const CAPTION_ZH_SIZE = 9;
const CAPTION_EN_SIZE = 5;

export interface PlatformNumProps {
  /** 站台编号：**只准一位数**（0–9），渲染时强制截成一位 */
  number?: string;
  /** 圆的直径（px） */
  size?: number;
  /** 中文标签（默认「站台」） */
  labelZh?: string;
  /** 英文标签（默认「Platform」） */
  labelEn?: string;
  /** 圆下面是否带中英文字（如「外环 / Outer Loop」） */
  showCaption?: boolean;
  /** 圆下中文（如「外环」） */
  captionZh?: string;
  /** 圆下英文（如「Outer Loop」） */
  captionEn?: string;
  /** 圆下文字颜色（跟圆里的字色分开，默认白） */
  captionColor?: string;
  /** 圆底色（线路色）。**刻意不叫 background**：那个键会被落板配色覆盖成底板色 */
  color?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 组件背景色（板底衬，落板时按板色固化）；跟圆底色的 `color` 是两回事 */
  background?: string;
  /** 老档遗留：线路代码，`color` 为空时按线路色兜底 */
  line?: string;
}

export const platformNumDefaultProps: PlatformNumProps = {
  number: "1",
  size: 44,
  labelZh: "站台",
  labelEn: "Platform",
  showCaption: false,
  captionZh: "外环",
  captionEn: "Outer Loop",
  captionColor: colors.foreground,
  // 默认圆底 = 1 号线黄，配黑字（用户 2026-11-03）
  color: colors.line1,
  textColor: colors.black,
  background: colors.transparent,
  line: "1",
};

export const platformNumEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "number",
      label: "themes.guangzhou.components.PlatformNum.props.number",
      // 站台编号只准一位数（用户 2026-11-04）
      element: <Input maxLength={1} />,
    },
    {
      key: "labelZh",
      label: "themes.guangzhou.components.PlatformNum.props.labelZh",
      element: <Input />,
    },
    {
      key: "labelEn",
      label: "themes.guangzhou.components.PlatformNum.props.labelEn",
      element: <Input />,
    },
    {
      key: "showCaption",
      label: "themes.guangzhou.components.PlatformNum.props.showCaption.displayName",
      element: <Switch size="small" />,
    },
    {
      key: "captionZh",
      label: "themes.guangzhou.components.PlatformNum.props.captionZh",
      visible: props => props.showCaption === true,
      element: <Input />,
    },
    {
      key: "captionEn",
      label: "themes.guangzhou.components.PlatformNum.props.captionEn",
      visible: props => props.showCaption === true,
      element: <Input />,
    },
    {
      key: "captionColor",
      label: "themes.guangzhou.components.PlatformNum.props.captionColor",
      visible: props => props.showCaption === true,
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "size",
      label: "themes.guangzhou.components.PlatformNum.props.size",
      element: <InputNumber min={16} max={64} />,
    },
    {
      key: "color",
      label: "themes.guangzhou.components.PlatformNum.props.color",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "textColor",
      label: "themes.guangzhou.components.PlatformNum.props.textColor",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.guangzhou.components.PlatformNum.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function PlatformNum({
  number = platformNumDefaultProps.number,
  size = platformNumDefaultProps.size,
  labelZh = platformNumDefaultProps.labelZh,
  labelEn = platformNumDefaultProps.labelEn,
  showCaption = platformNumDefaultProps.showCaption,
  captionZh = platformNumDefaultProps.captionZh,
  captionEn = platformNumDefaultProps.captionEn,
  captionColor = platformNumDefaultProps.captionColor,
  color,
  textColor = platformNumDefaultProps.textColor,
  background = platformNumDefaultProps.background,
  line,
}: PlatformNumProps) {
  const baseD = Math.max(16, Math.min(64, size ?? 44));
  // 圆下面那两行（用户 2026-11-04：像羊角竖排那样，中文上、英文下）
  const capZh = (captionZh ?? "").trim();
  const capEn = (captionEn ?? "").trim();
  const showCap = showCaption === true && (capZh !== "" || capEn !== "");
  // 底下带字时圆缩一圈，把高度让给中英文
  const d = Math.round(baseD * (showCap ? CAPTION_CIRCLE_SCALE : 1));
  // 圆底色只认 color；空则按老档 line 兜底，再退到 1 号线黄
  const bg =
    (color && color !== "" ? color : "") ||
    (line ? lineColor(line) : "") ||
    colors.line1;
  // 只准一位数字（老档存了多位也只画第一位）
  const numText = `${number ?? ""}`.replace(/\D/g, "").slice(0, 1);
  const zh = labelZh ?? "";
  const en = labelEn ?? "";
  return (
    // 左右各留 3px，圆不贴着相邻组件；background 是组件底板，不是圆底色
    <div
      className="h-16 flex items-center"
      style={{ paddingLeft: 3, paddingRight: 3, backgroundColor: background }}
    >
      <div className="flex flex-col items-center">
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: d,
          height: d,
          borderRadius: "50%",
          backgroundColor: bg,
          color: textColor,
          lineHeight: 1,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily: fontFamilyEn,
            fontSize: Math.round(d * 0.7),
            fontWeight: 500,
            lineHeight: 0.7,
          }}
        >
          {numText}
        </span>
        <span
          style={{
            fontFamily: fontFamilyZh,
            fontSize: Math.round(d * 0.16),
            lineHeight: 1,
            marginTop: Math.max(1, Math.round(d * 0.02)),
            whiteSpace: "pre-wrap",
          }}
        >
          {zh}
        </span>
        <span
          style={{
            fontFamily: fontFamilyEn,
            fontSize: Math.round(d * 0.11),
            lineHeight: 1,
            marginTop: Math.max(1, Math.round(d * 0.015)),
            marginBottom: Math.round(d * 0.03),
            whiteSpace: "pre-wrap",
          }}
        >
          {en}
        </span>
      </div>
        {showCap && (
          <div
            className="flex flex-col items-center"
            style={{ marginTop: 1, rowGap: 0, color: captionColor, lineHeight: 1 }}
          >
            {capZh !== "" && (
              <span
                style={{ fontFamily: fontFamilyZh, fontSize: CAPTION_ZH_SIZE, lineHeight: 1.1 }}
              >
                {capZh}
              </span>
            )}
            {capEn !== "" && (
              <span
                style={{ fontFamily: fontFamilyEn, fontSize: CAPTION_EN_SIZE, lineHeight: 1.1 }}
              >
                {capEn}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

PlatformNum.getEditorConfig = (t: (key: string) => string) =>
  platformNumEditorConfig(t);

export default PlatformNum;
