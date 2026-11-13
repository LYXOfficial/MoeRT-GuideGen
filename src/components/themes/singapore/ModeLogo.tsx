import { useId } from "react";
import { InputNumber, Switch } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { EDGE_PAD, ROW_H } from "./define/layout";
import { capletPath, PT_SYMBOL } from "./define/shapes";

/**
 * PT 标志（Logotype：「PT Symbol + MRT」）。
 *
 * 几何全部来自 **官方矢量**《Transit Signage Manual》1.2 MRT Logo（p10）：
 *  - 整体 110.27 × 45.03（宽高比 2.449）；
 *  - 黄色描边 1.4（0.031h）；
 *  - 绿窗 67.09 宽（0.608w）、高 h−2b，**椭圆端** rx = 0.313 × 自身高；
 *  - PT Symbol 44.4 × 24（高 0.533h），居中于绿窗；
 *  - MRT 字 cap 11.2（0.249h，字号 ≈ 0.345h），居中于黄块。
 * 不手绘、不按照片估——照片只用于确认配色。
 */
export interface ModeLogoProps {
  height?: number;
  color?: string;
  windowColor?: string;
  textColor?: string;
  showText?: boolean;
  background?: string;
}

export const modeLogoDefaultProps: ModeLogoProps = {
  height: 34,
  color: colors.sunYellow,
  windowColor: colors.rainforest,
  textColor: colors.rainforest,
  showText: true,
  background: colors.transparent,
};

const SCOPE = "themes.singapore.components.ModeLogo.props";

export const modeLogoEditorConfig = (_t: (key: string) => string): EditorConfig => ({
  forms: [
    { key: "height", label: `${SCOPE}.height`, element: <InputNumber min={16} max={80} /> },
    { key: "color", label: `${SCOPE}.color`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "windowColor", label: `${SCOPE}.windowColor`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "textColor", label: `${SCOPE}.textColor`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "showText", label: `${SCOPE}.showText`, element: <Switch size="small" /> },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

const ASPECT = 2.449; // 官方 logotype 110.27 × 45.03
const ASPECT_MARK = 1.537; // 官方 logomark 69.8 × 45.4（只有符号时）
const END_RATIO = 0.313; // 椭圆端 rx = 0.313h（官方矢量实测）
const BORDER_RATIO = 0.031;
const WINDOW_RATIO = 0.608; // 绿窗宽 67.09 / 110.27

function ModeLogo({
  height = modeLogoDefaultProps.height,
  color = modeLogoDefaultProps.color,
  windowColor = modeLogoDefaultProps.windowColor,
  textColor = modeLogoDefaultProps.textColor,
  showText = modeLogoDefaultProps.showText,
  background = modeLogoDefaultProps.background,
}: ModeLogoProps) {
  const h = height ?? 34;
  const w = h * (showText ? ASPECT : ASPECT_MARK);
  const b = h * BORDER_RATIO;
  // 绿窗宽：Logotype 为 0.608W（官方 67.09）；Logomark 铺满内圈（w − 2b）
  const win = showText ? w * WINDOW_RATIO : w - 2 * b;
  const sqH = h * 0.533; // 官方 24 / 45.03
  const sqW = sqH * (397 / 216);
  const clipId = `ml-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
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
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
        {/* 黄色底：与 Caplet 同一套椭圆端几何（rx = 0.286h、ry = 0.5h） */}
        <path d={capletPath(w, h, END_RATIO)} fill={color} />
        {/* 内层绿窗（左侧），右边留黄 */}
        <clipPath id={clipId}>
          <path d={capletPath(win, h - 2 * b, END_RATIO)} transform={`translate(${b} ${b})`} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <rect x={0} y={0} width={win + b} height={h} fill={windowColor} />
        </g>
        {/* PT 标志 */}
        <g transform={`translate(${b + (win - sqW) / 2} ${(h - sqH) / 2})`}>
          <svg width={sqW} height={sqH} viewBox={PT_SYMBOL.viewBox} preserveAspectRatio="xMidYMid meet">
            <g transform={PT_SYMBOL.transform}>
              <path d={PT_SYMBOL.d} fill={color} fillRule="evenodd" />
            </g>
          </svg>
        </g>
        {showText && (
          <text
            x={win + (w - win) / 2}
            y={h / 2}
            fill={textColor}
            fontFamily={fontFamilyEn}
            fontSize={h * 0.345} // cap ≈ 0.249h（官方 11.2 / 45.03）
            textAnchor="middle"
            dominantBaseline="central"
            letterSpacing={h * 0.02}
          >
            MRT
          </text>
        )}
      </svg>
    </div>
  );
}

ModeLogo.getEditorConfig = (t: (key: string) => string) => modeLogoEditorConfig(t);

export default ModeLogo;
