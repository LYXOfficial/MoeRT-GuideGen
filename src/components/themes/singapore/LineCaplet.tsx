import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Input, InputNumber, Select, Button, Typography } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { EDGE_PAD, ROW_H } from "./define/layout";
import { measureText } from "./define/text";
import { capletPath } from "./define/shapes";

/**
 * 线路胶囊（官方几何）：两端半椭圆（rx = 0.286h）、白边 5.5%、多码无缝分段；
 * Tap-Out 出站换乘则是每码独立胶囊、中间加短横线。
 *
 * 用户 2026-11-13：改成「自由增减」，不再固定 2 个码——同成都 StationNumber 的卡片式编辑器。
 * 线路色字段叫 `codes[].color`，绝不叫 background。
 */
export interface LineCapletCode {
  code: string;
  color: string;
}

export interface LineCapletProps {
  codes?: LineCapletCode[];
  mode?: "joined" | "tapOut";
  height?: number;
  /** 胶囊最小宽度（px）；内容更窄时按这个宽度居中撑开 */
  minWidth?: number;
  textColor?: string;
  borderColor?: string;
  background?: string;
}

export const lineCapletDefaultProps: LineCapletProps = {
  codes: [
    { code: "NSL", color: colors.lineNS }
  ],
  mode: "joined",
  height: 33,
  minWidth: 60,
  textColor: colors.foreground,
  borderColor: colors.foreground,
  background: colors.transparent,
};

const MAX_CODES = 4;

/**
 * 卡片式编辑器：每张卡 = 站码 + 线路色。
 * 增减按钮按成都 StationNumber 的做法：**底部两个 + / − 圆钮**（不是每张卡一个「删除」文字钮）。
 */
function CodesEditor({
  value = lineCapletDefaultProps.codes,
  onChange,
}: {
  value?: LineCapletCode[];
  onChange?: (value: LineCapletCode[]) => void;
}) {
  const { t } = useTranslation();
  const codes = Array.isArray(value) ? value : [];

  const update = (index: number, patch: Partial<LineCapletCode>) => {
    onChange?.(codes.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };
  const add = () => {
    if (codes.length >= MAX_CODES) return;
    const next = codes.length + 1;
    onChange?.([...codes, { code: `CC ${next}`, color: colors.lineCC }]);
  };
  const remove = () => {
    onChange?.(codes.slice(0, -1));
  };

  return (
    <div className="space-y-3">
      {codes.map((c, index) => (
        <div
          // key 用索引：内容一变就换 key 会让输入框重挂载 → 打一个字就失焦
          key={index}
          className="border border-solid border-gray-300 p-3 rounded-sm space-y-2"
        >
          {/* 标签在上、控件在下整行铺开：并排会把颜色下拉挤到只剩一个色块 */}
          <div className="space-y-1">
            <Typography.Text size="small">{t("themes.singapore.common.lineCaplet.code")}</Typography.Text>
            <Input
              size="small"
              value={c.code}
              onChange={(v) => update(index, { code: v })}
              placeholder="NE4"
            />
          </div>
          <div className="space-y-1">
            <Typography.Text size="small">{t("themes.singapore.common.lineCaplet.color")}</Typography.Text>
            <CustomColorPicker
              currentTheme={THEME_INDEX}
              value={c.color || colors.lineCC}
              onChange={(color) => update(index, { color })}
            />
          </div>
        </div>
      ))}
      <div className="flex gap-2 items-center justify-center">
        <Button
          type="primary"
          size="small"
          onClick={add}
          disabled={codes.length >= MAX_CODES}
        >
          +
        </Button>
        {codes.length > 1 && (
          <Button type="danger" size="small" onClick={remove}>
            −
          </Button>
        )}
      </div>
    </div>
  );
}

const SCOPE = "themes.singapore.components.LineCaplet.props";

export const lineCapletEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    { key: "codes", label: `${SCOPE}.codes`, element: <CodesEditor /> },
    {
      key: "mode",
      label: `${SCOPE}.mode`,
      element: (
        <Select>
          <Select.Option value="joined">{t("themes.singapore.common.lineCaplet.joined")}</Select.Option>
          <Select.Option value="tapOut">{t("themes.singapore.common.lineCaplet.tapOut")}</Select.Option>
        </Select>
      ),
    },
    { key: "height", label: `${SCOPE}.height`, element: <InputNumber min={16} max={64} /> },
    { key: "minWidth", label: `${SCOPE}.minWidth`, element: <InputNumber min={0} max={400} /> },
    { key: "textColor", label: `${SCOPE}.textColor`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "borderColor", label: `${SCOPE}.borderColor`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
    { key: "background", label: `${SCOPE}.background`, element: <CustomColorPicker currentTheme={THEME_INDEX} /> },
  ],
});

const segWidth = (code: string, h: number) => {
  const fs = h * 0.62;
  return measureText(code, `400 ${fs}px ${fontFamilyEn}`) + h * 0.36;
};

function Capsule({
  codes,
  h,
  textColor,
  borderColor,
  minWidth = 0,
}: {
  codes: LineCapletCode[];
  h: number;
  textColor: string;
  borderColor: string;
  minWidth?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const b = h * 0.055;
  const widths = codes.map((c) => segWidth(c.code, h));
  let total = widths.reduce((a, v) => a + v, 0);
  // 最小宽度：内容更窄时把差额平均分给每一段（文字仍居中）
  if (minWidth > total) {
    const extra = (minWidth - total) / widths.length;
    for (let i = 0; i < widths.length; i++) widths[i] += extra;
    total = minWidth;
  }
  const fs = h * 0.62;
  let x = 0;
  const centers = widths.map((w) => {
    const v = x + w / 2;
    x += w;
    return v;
  });
  return (
    <svg width={total} height={h} viewBox={`0 0 ${total} ${h}`} style={{ display: "block" }}>
      <path d={capletPath(total, h)} fill={borderColor} />
      <clipPath id={`cap-${uid}`}>
        <path d={capletPath(total - 2 * b, h - 2 * b)} transform={`translate(${b} ${b})`} />
      </clipPath>
      <g clipPath={`url(#cap-${uid})`}>
        {codes.map((c, i) => {
          const start = widths.slice(0, i).reduce((a, v) => a + v, 0);
          return (
            <rect
              key={`${c.code}-${i}`}
              x={start}
              y={0}
              width={widths[i]}
              height={h}
              fill={c.color}
            />
          );
        })}
      </g>
      {codes.map((c, i) => (
        <text
          key={`t-${c.code}-${i}`}
          x={centers[i]}
          y={h / 2}
          fill={textColor}
          fontFamily={fontFamilyEn}
          fontSize={fs}
          textAnchor="middle"
          dominantBaseline="central"
          letterSpacing={h * 0.02}
        >
          {c.code}
        </text>
      ))}
    </svg>
  );
}

function LineCaplet({
  codes = lineCapletDefaultProps.codes,
  mode = lineCapletDefaultProps.mode,
  height = lineCapletDefaultProps.height,
  minWidth = lineCapletDefaultProps.minWidth,
  textColor = lineCapletDefaultProps.textColor,
  borderColor = lineCapletDefaultProps.borderColor,
  background = lineCapletDefaultProps.background,
}: LineCapletProps) {
  const h = height ?? 33;
  const tColor = textColor ?? colors.foreground;
  const bColor = borderColor ?? colors.foreground;
  const list = (codes ?? []).filter((c) => c.code !== "");

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
      {mode === "tapOut" ? (
        <div style={{ display: "flex", alignItems: "center", gap: h * 0.18 }}>
          {list.map((c, i) => (
            <div key={`${c.code}-${i}`} style={{ display: "flex", alignItems: "center", gap: h * 0.18 }}>
              {/* 断开模式：最小宽度作用于**每一枚**子胶囊（用户 2026-11-13） */}
              <Capsule codes={[c]} h={h} textColor={tColor} borderColor={bColor} minWidth={minWidth} />
              {i < list.length - 1 && (
                <div style={{ width: h * 0.42, height: Math.max(2, h * 0.06), backgroundColor: bColor }} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <Capsule codes={list} h={h} textColor={tColor} borderColor={bColor} minWidth={minWidth} />
      )}
    </div>
  );
}

LineCaplet.getEditorConfig = (t: (key: string) => string) => lineCapletEditorConfig(t);

export default LineCaplet;
