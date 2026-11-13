import { Input, InputNumber, Switch } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyTa, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { EDGE_PAD, ROW_H } from "./define/layout";
import { weightCss, type TextWeight } from "./define/text";

/** 三语站名：英 + 中 + 泰米尔（马来文可选，默认关） */
export interface StationNameProps {
  en?: string;
  zh?: string;
  ta?: string;
  showZh?: boolean;
  showTa?: boolean;
  sizeEn?: number;
  sizeZh?: number;
  sizeTa?: number;
  weight?: TextWeight;
  color?: string;
  background?: string;
}

export const stationNameDefaultProps: StationNameProps = {
  en: "Marine Parade",
  zh: "马林百列",
  ta: "மரீன் பரேட்",
  showZh: true,
  showTa: true,
  sizeEn: 30,
  sizeZh: 12,
  sizeTa: 12,
  weight: "normal",
  color: colors.foreground,
  background: colors.transparent,
};

const SCOPE = "themes.singapore.components.StationName.props";

export const stationNameEditorConfig = (_t: (key: string) => string): EditorConfig => ({
  forms: [
    { key: "en", label: `${SCOPE}.en`, element: <Input /> },
    { key: "zh", label: `${SCOPE}.zh`, element: <Input /> },
    { key: "ta", label: `${SCOPE}.ta`, element: <Input /> },
    { key: "showZh", label: `${SCOPE}.showZh`, element: <Switch size="small" /> },
    { key: "showTa", label: `${SCOPE}.showTa`, element: <Switch size="small" /> },
    { key: "sizeEn", label: `${SCOPE}.sizeEn`, element: <InputNumber min={10} max={72} /> },
    { key: "sizeZh", label: `${SCOPE}.sizeZh`, element: <InputNumber min={6} max={40} /> },
    { key: "sizeTa", label: `${SCOPE}.sizeTa`, element: <InputNumber min={6} max={40} /> },
    { key: "color", label: `${SCOPE}.color`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

function StationName({
  en = stationNameDefaultProps.en,
  zh = stationNameDefaultProps.zh,
  ta = stationNameDefaultProps.ta,
  showZh = stationNameDefaultProps.showZh,
  showTa = stationNameDefaultProps.showTa,
  sizeEn = stationNameDefaultProps.sizeEn,
  sizeZh = stationNameDefaultProps.sizeZh,
  sizeTa = stationNameDefaultProps.sizeTa,
  weight = stationNameDefaultProps.weight,
  color = stationNameDefaultProps.color,
  background = stationNameDefaultProps.background,
}: StationNameProps) {
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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: fontFamilyEn,
            fontSize: sizeEn,
            fontWeight: weightCss(weight ?? "normal"),
            color,
            lineHeight: 1,
            whiteSpace: "pre",
          }}
        >
          {en}
        </span>
        <span style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          {showZh && (
            <span style={{ fontFamily: fontFamilyZh, fontSize: sizeZh, color, whiteSpace: "pre" }}>
              {zh}
            </span>
          )}
          {showTa && (
            <span style={{ fontFamily: fontFamilyTa, fontSize: sizeTa, color, whiteSpace: "pre" }}>
              {ta}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

StationName.getEditorConfig = (t: (key: string) => string) =>
  stationNameEditorConfig(t);

export default StationName;
