import { Input, InputNumber, Select } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilySerif, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 站名（宋体大字）。
 *
 * 用户要求（2026-11-02）：「图二是出口布局，这里的站名用的是巨大宋体，
 * 所以给站名单独开一个组件吧，宋体中文大字」。
 *
 * 实测（出口门楣，牌高 73px）：汉字墨迹高 34px = 0.466 × 牌高，
 * 英文 cap 高 14px = 0.41 × 汉字；中英 ink 间距 3px ≈ 0.09 × 汉字。
 * 换算 64px 行高：汉字 ≈ 30px、英文 ≈ 12px。
 *
 * 不复用通用 Text：它的字号关系（汉字 0.47 牌高、英文 0.41 汉字）与基线是固定的。
 */
export interface StationNameProps {
  chinese?: string;
  english?: string;
  /** 字体：serif（宋体，默认）/ sans（黑体） */
  fontFamily?: "serif" | "sans";
  fontSizeZh?: number;
  fontSizeEn?: number;
  /** 中英间距（px） */
  gap?: number;
  fill?: string;
  background?: string;
}

export const stationNameDefaultProps: StationNameProps = {
  chinese: "同和站",
  english: "Tonghe",
  fontFamily: "serif",
  fontSizeZh: 30,
  fontSizeEn: 12,
  gap: 3,
  fill: colors.foreground,
  background: colors.transparent,
};

export const stationNameEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.guangzhou.components.StationName.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.guangzhou.components.StationName.props.english",
      element: <Input />,
    },
    {
      key: "fontFamily",
      label: "themes.guangzhou.components.StationName.props.fontFamily.displayName",
      element: (
        <Select>
          <Select.Option value="serif">
            {t("themes.guangzhou.common.fontFamily.serif")}
          </Select.Option>
          <Select.Option value="sans">
            {t("themes.guangzhou.common.fontFamily.sans")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "fontSizeZh",
      label: "themes.guangzhou.components.StationName.props.fontSizeZh",
      element: <InputNumber min={12} max={56} />,
    },
    {
      key: "fontSizeEn",
      label: "themes.guangzhou.components.StationName.props.fontSizeEn",
      element: <InputNumber min={8} max={40} />,
    },
    {
      key: "gap",
      label: "themes.guangzhou.components.StationName.props.gap",
      element: <InputNumber min={0} max={24} />,
    },
    {
      key: "fill",
      label: "themes.guangzhou.components.StationName.props.fill",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.guangzhou.components.StationName.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function StationName({
  chinese = stationNameDefaultProps.chinese,
  english = stationNameDefaultProps.english,
  fontFamily = stationNameDefaultProps.fontFamily,
  fontSizeZh = stationNameDefaultProps.fontSizeZh,
  fontSizeEn = stationNameDefaultProps.fontSizeEn,
  gap = stationNameDefaultProps.gap,
  fill = stationNameDefaultProps.fill,
  background = stationNameDefaultProps.background,
}: StationNameProps) {
  // 空格必须原样保留（用户 2026-11-03 指出）：只 trim 用来判空，渲染用原文
  const zhRaw = chinese ?? "";
  const enRaw = english ?? "";
  const zh = zhRaw.trim() !== "" ? zhRaw : "";
  const en = enRaw.trim() !== "" ? enRaw : "";
  const zhFamily = fontFamily === "serif" ? fontFamilySerif : fontFamilyZh;
  // 站名定死居中（用户 2026-11-03：「站名默认且定死居中」）
  const alignItems = "center";

  return (
    <div
      className="h-16 flex flex-col justify-center"
      style={{
        alignItems,
        textAlign: "center",
        backgroundColor: background,
        color: fill,
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      {zh !== "" && (
        <span
          style={{
            fontFamily: zhFamily,
            fontSize: Math.max(12, Math.min(56, fontSizeZh ?? 30)),
            lineHeight: 1.06,
            whiteSpace: "pre-wrap",
          }}
        >
          {zh}
        </span>
      )}
      {en !== "" && (
        <span
          style={{
            fontFamily: fontFamilyEn,
            fontSize: Math.max(8, Math.min(40, fontSizeEn ?? 12)),
            lineHeight: 1.1,
            marginTop: Math.max(0, gap ?? 3),
            whiteSpace: "pre-wrap",
          }}
        >
          {en}
        </span>
      )}
    </div>
  );
}

StationName.getEditorConfig = (t: (key: string) => string) =>
  stationNameEditorConfig(t);

export default StationName;
