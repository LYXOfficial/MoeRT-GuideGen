import { Input, InputNumber, Select } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilySans } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { EDGE_PAD, ROW_H } from "./define/layout";

/**
 * 站台编号（官方称 travel direction number）。
 *
 * 两种形态（用户 2026-11-13）：
 *  - `circle`：线路色圆 + 白数字（对应 LTA 方向编号圆圈）；
 *  - `square`：**方形圆角牌 + 白描边 + 白字母/数字**（对应 DP 牌上的站台牌，牌面实拍是绿底白字 A/B）。
 */
export interface PlatformNumProps {
  number?: string;
  shape?: "circle" | "square";
  /** identity = LTA Identity（默认）/ sans = Segoe UI */
  font?: "identity" | "sans";
  color?: string;
  textColor?: string;
  borderColor?: string;
  size?: number;
  background?: string;
}

export const platformNumDefaultProps: PlatformNumProps = {
  number: "1",
  shape: "circle",
  font: "identity",
  color: colors.lineEW,
  textColor: colors.foreground,
  borderColor: colors.foreground,
  size: 44,
  background: colors.transparent,
};

const SCOPE = "themes.singapore.components.PlatformNum.props";

/** 方形牌左右边距（圆形用通用 EDGE_PAD=3） */
const SQUARE_EDGE_PAD = 8;

export const platformNumEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "number",
      label: `${SCOPE}.number`,
      // 只允许一个字母或数字
      element: <Input maxLength={1} />,
    },
    {
      key: "shape",
      label: `${SCOPE}.shape`,
      element: (
        <Select>
          <Select.Option value="circle">{t("themes.singapore.common.platform.circle")}</Select.Option>
          <Select.Option value="square">{t("themes.singapore.common.platform.square")}</Select.Option>
        </Select>
      ),
    },
    {
      key: "font",
      label: `${SCOPE}.font`,
      element: (
        <Select>
          <Select.Option value="identity">{t("themes.singapore.common.font.identity")}</Select.Option>
          <Select.Option value="sans">{t("themes.singapore.common.font.sans")}</Select.Option>
        </Select>
      ),
    },
    { key: "color", label: `${SCOPE}.color`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "textColor", label: `${SCOPE}.textColor`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    {
      key: "borderColor",
      label: `${SCOPE}.borderColor`,
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
      visible: (props) => props.shape === "square",
    },
    { key: "size", label: `${SCOPE}.size`, element: <InputNumber min={20} max={64} /> },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

function PlatformNum({
  number = platformNumDefaultProps.number,
  shape = platformNumDefaultProps.shape,
  font = platformNumDefaultProps.font,
  color = platformNumDefaultProps.color,
  textColor = platformNumDefaultProps.textColor,
  borderColor = platformNumDefaultProps.borderColor,
  size = platformNumDefaultProps.size,
  background = platformNumDefaultProps.background,
}: PlatformNumProps) {
  const d = size ?? 44;
  const circle = shape !== "square";
  // 兜底：老存档/粘贴进来的多字符只取第一个
  const glyph = String(number ?? "").slice(0, 1);
  const family = font === "sans" ? fontFamilySans : fontFamilyEn;
  // Segoe UI 同字号看起来更大，用它时整体缩 0.86
  const fontScale = font === "sans" ? 0.86 : 1;

  return (
    <div
      className="h-full"
      style={{
        height: ROW_H,
        display: "flex",
        alignItems: "center",
        background,
        // 方形牌左右留 8px（圆形仍 3px，用户 2026-11-13）
        paddingLeft: shape === "square" ? SQUARE_EDGE_PAD : EDGE_PAD,
        paddingRight: shape === "square" ? SQUARE_EDGE_PAD : EDGE_PAD,
      }}
    >
      {circle ? (
        <div
          style={{
            width: d,
            height: d,
            borderRadius: "50%",
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: family,
              fontSize: d * 0.8 * fontScale,
              lineHeight: 1,
              color: textColor,
            }}
          >
            {glyph}
          </span>
        </div>
      ) : (
        // 方形（实为竖版牌）：官方比例 宽 0.7H、白描边 0.031H、字母 cap 0.44H、字母下一条白横杠
        (() => {
          const H = d;
          const W = H * 0.7;
          const b = Math.max(1.5, H * 0.031);
          const barW = W * 0.755;
          const barH = H * 0.094;
          const barY = H - b - H * 0.11 - barH;
          return (
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
              <rect x={0} y={0} width={W} height={H} rx={H * 0.045} fill={borderColor} />
              <rect
                x={b}
                y={b}
                width={W - b * 2}
                height={H - b * 2}
                rx={H * 0.02}
                fill={color}
              />
              <text
                x={W / 2}
                y={H * 0.65}
                fill={textColor}
                fontFamily={family}
                fontSize={H * 0.72 * fontScale}
                textAnchor="middle"
              >
                {glyph}
              </text>
              <rect
                x={(W - barW) / 2}
                y={barY}
                width={barW}
                height={barH}
                fill={textColor}
              />
            </svg>
          );
        })()
      )}
    </div>
  );
}

PlatformNum.getEditorConfig = (t: (key: string) => string) => platformNumEditorConfig(t);

export default PlatformNum;
