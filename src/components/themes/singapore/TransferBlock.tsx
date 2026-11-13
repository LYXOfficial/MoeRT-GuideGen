import { Input, InputNumber, Switch } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { EDGE_PAD, ROW_H } from "./define/layout";
import { capletPath } from "./define/shapes";

/** 换乘提示块：Transfer at / 小 Caplet + 站名 / (Platform B) */
export interface TransferBlockProps {
  station?: string;
  code?: string;
  lineColor?: string;
  platform?: string;
  showPlatform?: boolean;
  size?: number;
  textColor?: string;
  background?: string;
}

export const transferBlockDefaultProps: TransferBlockProps = {
  station: "Promenade",
  code: "CC 4",
  lineColor: colors.lineCC,
  platform: "B",
  showPlatform: true,
  size: 12,
  textColor: colors.foreground,
  background: colors.transparent,
};

const SCOPE = "themes.singapore.components.TransferBlock.props";

export const transferBlockEditorConfig = (_t: (key: string) => string): EditorConfig => ({
  forms: [
    { key: "station", label: `${SCOPE}.station`, element: <Input /> },
    { key: "code", label: `${SCOPE}.code`, element: <Input /> },
    { key: "lineColor", label: `${SCOPE}.lineColor`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "platform", label: `${SCOPE}.platform`, element: <Input /> },
    { key: "showPlatform", label: `${SCOPE}.showPlatform`, element: <Switch size="small" /> },
    { key: "size", label: `${SCOPE}.size`, element: <InputNumber min={8} max={32} /> },
    { key: "textColor", label: `${SCOPE}.textColor`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

function TransferBlock({
  station = transferBlockDefaultProps.station,
  code = transferBlockDefaultProps.code,
  lineColor = transferBlockDefaultProps.lineColor,
  platform = transferBlockDefaultProps.platform,
  showPlatform = transferBlockDefaultProps.showPlatform,
  size = transferBlockDefaultProps.size,
  textColor = transferBlockDefaultProps.textColor,
  background = transferBlockDefaultProps.background,
}: TransferBlockProps) {
  const s = size ?? 14;
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          fontFamily: fontFamilyEn,
          fontSize: s,
          color: textColor,
          lineHeight: 1.15,
        }}
      >
        <span>Transfer at</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {(() => {
            // 换乘提示里的线路胶囊，几何与 LineCaplet 完全一致：
            // 椭圆端（rx = 0.286h）+ 白色描边（5.5%）+ 白字 LTA Identity
            // 跟旧版一样小、紧凑：胶囊高 ≈1.2 倍字号，字几乎撑满
            const ch = s * 1.2;
            const b = ch * 0.055;
            const fs = ch * 0.72;
            // 左右更紧凑：只留 0.3 倍胶囊高的余量（椭圆端本身已占一点）
            const cw = Math.max(ch * 0.9, String(code ?? "").length * fs * 0.62 + ch * 0.3);
            return (
              <svg
                width={cw}
                height={ch}
                viewBox={`0 0 ${cw} ${ch}`}
                style={{ display: "block" }}
              >
                <path d={capletPath(cw, ch)} fill={colors.foreground} />
                <path
                  d={capletPath(cw - 2 * b, ch - 2 * b)}
                  transform={`translate(${b} ${b})`}
                  fill={lineColor}
                />
                <text
                  x={cw / 2}
                  y={ch / 2}
                  fill={colors.foreground}
                  fontFamily={fontFamilyEn}
                  fontSize={fs}
                  textAnchor="middle"
                  dominantBaseline="central"
                  letterSpacing={ch * 0.02}
                >
                  {code}
                </text>
              </svg>
            );
          })()}
          <span>{station}</span>
        </span>
        {showPlatform && <span>(Platform {platform})</span>}
      </div>
    </div>
  );
}

TransferBlock.getEditorConfig = (t: (key: string) => string) =>
  transferBlockEditorConfig(t);

export default TransferBlock;
