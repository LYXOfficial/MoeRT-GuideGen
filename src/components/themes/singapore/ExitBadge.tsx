import { useTranslation } from "react-i18next";
import { Button, Input, InputNumber, Select, Switch, Typography } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilySans } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { EDGE_PAD, ROW_H } from "./define/layout";
import { exitDoorPath } from "./define/shapes";

/**
 * 出口标识（三种变体，几何以官方矢量 9.1 / 7.5.17 为准，单位 = 黄块边长 S）：
 *
 * - `door`：黄块 + ∩ 形门框（左/上/右、底部开口）+ 出口码。
 *   **只有这个变体可以自由增减出口码**；每个码独占一个门框，框宽按自己的字符数算，
 *   所以 `3-6` 只会让自己那一格变宽。可选在牌面上方加 `Exit` 贴纸。
 * - `closed`：黄块 + 闭合深色框 + 单个字母/数字（旧式），可关白框。
 * - `wayout`：单个方牌 + 一个门框，里面写 WAY OUT。**不画出口码**（避免切换后残留）。
 */
export interface ExitBadgeProps {
  variant?: "door" | "closed" | "wayout";
  /** door：出口码列表 */
  codes?: string[];
  /** closed：单个字母/数字 */
  text?: string;
  size?: number;
  color?: string;
  textColor?: string;
  showBorder?: boolean;
  showExitLabel?: boolean;
  labelColor?: string;
  background?: string;
}

export const exitBadgeDefaultProps: ExitBadgeProps = {
  variant: "door",
  codes: ["1"],
  text: "C",
  size: 38,
  color: colors.sunYellow,
  textColor: colors.ink,
  showBorder: false,
  showExitLabel: false,
  labelColor: colors.sunYellow,
  background: colors.transparent,
};

const MAX_CODES = 4;

/** 出口码列表编辑器：卡片 + 底部 +/−（同 Caplet / 成都 StationNumber） */
function CodesEditor({
  value = exitBadgeDefaultProps.codes,
  onChange,
}: {
  value?: string[];
  onChange?: (v: string[]) => void;
}) {
  const { t } = useTranslation();
  const codes = Array.isArray(value) ? value : [];
  return (
    <div className="space-y-3">
      {codes.map((c, i) => (
        // key 用索引：内容一变就换 key 会让输入框重挂载 → 打一个字就失焦
        <div key={i} className="border border-solid border-gray-300 p-3 rounded-sm space-y-1">
          <Typography.Text size="small">{t("themes.singapore.common.exit.code")}</Typography.Text>
          <Input
            size="small"
            value={c}
            onChange={(v) => onChange?.(codes.map((x, j) => (j === i ? v : x)))}
            placeholder="1 / A / 1-6"
          />
        </div>
      ))}
      <div className="flex gap-2 items-center justify-center">
        <Button
          type="primary"
          size="small"
          disabled={codes.length >= MAX_CODES}
          onClick={() => onChange?.([...codes, "1"])}
        >
          +
        </Button>
        {codes.length > 1 && (
          <Button type="danger" size="small" onClick={() => onChange?.(codes.slice(0, -1))}>
            −
          </Button>
        )}
      </div>
    </div>
  );
}

const SCOPE = "themes.singapore.components.ExitBadge.props";

export const exitBadgeEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "variant",
      label: `${SCOPE}.variant`,
      element: (
        <Select>
          <Select.Option value="door">{t("themes.singapore.common.exit.door")}</Select.Option>
          <Select.Option value="closed">{t("themes.singapore.common.exit.closed")}</Select.Option>
          <Select.Option value="wayout">{t("themes.singapore.common.exit.wayout")}</Select.Option>
        </Select>
      ),
    },
    {
      key: "codes",
      label: `${SCOPE}.codes`,
      element: <CodesEditor />,
      visible: (props) => props.variant === "door",
    },
    {
      key: "text",
      label: `${SCOPE}.text`,
      element: <Input />,
      visible: (props) => props.variant === "closed",
    },
    {
      key: "showExitLabel",
      label: `${SCOPE}.showExitLabel`,
      element: <Switch size="small" />,
      visible: (props) => props.variant === "door",
    },
    {
      key: "showBorder",
      label: `${SCOPE}.showBorder`,
      element: <Switch size="small" />,
      visible: (props) => props.variant === "closed",
    },
    { key: "size", label: `${SCOPE}.size`, element: <InputNumber min={16} max={96} /> },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

function ExitBadge({
  variant = exitBadgeDefaultProps.variant,
  codes = exitBadgeDefaultProps.codes,
  text = exitBadgeDefaultProps.text,
  size = exitBadgeDefaultProps.size,
  showBorder = exitBadgeDefaultProps.showBorder,
  showExitLabel = exitBadgeDefaultProps.showExitLabel,
  background = exitBadgeDefaultProps.background,
}: ExitBadgeProps) {
  const s = size ?? 38;
  // 用户 2026-11-13：黄色与门框色写死，不在编辑器里开放
  const yellow = colors.sunYellow;
  const ink = colors.ink;
  const codes$ = (codes ?? []).filter((c) => String(c).trim() !== "");

  const wrap = (children: React.ReactNode) => (
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
      {children}
    </div>
  );

  // ---------- closed（旧式闭合框） ----------
  if (variant === "closed") {
    return wrap(
      <div
        style={{
          width: s,
          height: s,
          backgroundColor: yellow,
          borderRadius: s * 0.06,
          border: showBorder ? `2px solid ${colors.foreground}` : "none",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: s * (showBorder ? 0.73 : 0.85),
            height: s * (showBorder ? 0.73 : 0.85),
            border: `${Math.max(2, s * (showBorder ? 0.055 : 0.075))}px solid ${ink}`,
            borderRadius: s * 0.06,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: fontFamilyEn,
              fontSize: s * (showBorder ? 0.56 : 0.62),
              lineHeight: 1,
              color: ink,
            }}
          >
            {text}
          </span>
        </div>
      </div>
    );
  }

  const padX = s * 0.118;
  const frameY = s * 0.118;
  const frameH = s * 0.803;
  const gap = s * 0.06;
  const digitFs = frameH * 0.75; // 官方 digit cap ≈ 0.556 框高 → 字号 ≈ 0.75 框高（cap≈0.72em）
  const labelFs = s * 0.25;

  // ---------- wayout（单方牌 + 一个门框 + WAY OUT，无出口码） ----------
  if (variant === "wayout") {
    return wrap(
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "block" }}>
        <rect x={0} y={0} width={s} height={s} rx={s * 0.08} fill={yellow} />
        <g transform={`translate(${padX} ${frameY})`}>
          <path d={exitDoorPath(s - padX * 2, frameH)} fill={ink} fillRule="evenodd" />
        </g>
        <text
          x={s / 2}
          y={s * 0.576}
          fill={ink}
          fontFamily={fontFamilySans}
          fontWeight={600}
          fontSize={s * 0.24}
          letterSpacing={s * 0.008}
          textAnchor="middle"
        >
          WAY
        </text>
        <text
          x={s / 2}
          y={s * 0.843}
          fill={ink}
          fontFamily={fontFamilySans}
          fontWeight={600}
          fontSize={s * 0.24}
          letterSpacing={s * 0.008}
          textAnchor="middle"
        >
          OUT
        </text>
      </svg>
    );
  }

  // ---------- door（黄板 + n 个并排门框） ----------
  const cells = codes$.length ? codes$ : [""];
  const frameWs = cells.map((c) =>
    Math.max(s * 0.764, String(c).length * digitFs * 0.62 + s * 0.3)
  );
  const plateW = padX * 2 + frameWs.reduce((a, v) => a + v, 0) + gap * (cells.length - 1);

  return wrap(
    // 贴纸用绝对定位压在牌面正上方：**不参与布局**，开关它不会让整块牌上下位移
    <div style={{ position: "relative", width: plateW, height: ROW_H }}>
      {showExitLabel && (
        <span
          style={{
            position: "absolute",
            left: 0,
            width: plateW,
            textAlign: "center",
            bottom: `calc(50% + ${s / 2}px)`,
            fontFamily: fontFamilyEn,
            fontSize: labelFs,
            lineHeight: 1,
            color: yellow,
            whiteSpace: "nowrap",
          }}
        >
          Exit
        </span>
      )}
      <svg
        width={plateW}
        height={s}
        viewBox={`0 0 ${plateW} ${s}`}
        style={{
          display: "block",
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <rect x={0} y={0} width={plateW} height={s} rx={s * 0.08} fill={yellow} />
        {cells.map((code, i) => {
          const fx = padX + frameWs.slice(0, i).reduce((a, v) => a + v, 0) + i * gap;
          const frameW = frameWs[i];
          return (
            <g key={i}>
              <g transform={`translate(${fx} ${frameY})`}>
                <path d={exitDoorPath(frameW, frameH)} fill={ink} fillRule="evenodd" />
              </g>
              <text
                x={fx + frameW / 2}
                y={frameY + frameH * 0.9}
                fill={ink}
                fontFamily={fontFamilyEn}
                fontSize={digitFs}
                textAnchor="middle"
              >
                {code}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

ExitBadge.getEditorConfig = (t: (key: string) => string) => exitBadgeEditorConfig(t);

export default ExitBadge;
