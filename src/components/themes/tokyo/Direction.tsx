import { Input, InputNumber } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  Background,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import BadgeGlyph from "./define/BadgeGlyph";
import BadgeListEditor, { type BadgeItem } from "./define/BadgeListEditor";
import { langFormItems } from "./define/textForms";

/**
 * Direction —— 「xx 方面」方向行。
 *
 * 版面（照 2024 年東葉高速線牌）：
 * ```
 * 西船橋方面 東葉高速線・JR線直通        ← 目的地(大) + 「方面」(小) ｜ 经由(中)
 * for Nishi-funabashi                   ← 目的地罗马字
 * [TR][JB] Thru to Toyo Rapid Line, JR Line   ← 徽章 + 英文线路名
 * ```
 * 规则：
 *  - 目的地 / 「方面」后缀 / 经由 三段各自独立字号，字重字距行距也独立；
 *  - **经由（JP）与 英文线路名 允许换行**；
 *  - **目的地 + 方面那一行整行不折**；
 *  - 英文线路名左侧可挂 1–2 枚小号自家徽章；
 *  - 缺省塌陷：没有经由就整段消失，不留空隙。
 */
export interface DirectionProps {
  /** 目的地（如 西船橋） */
  dest: string;
  destSize?: number;
  destWeight?: number;
  destSpacing?: number;
  /** 后缀（如 方面），独立字号 */
  suffix: string;
  suffixSize?: number;
  suffixWeight?: number;
  suffixSpacing?: number;
  /** 经由（日语，可换行），空则塌陷 */
  via: string;
  viaSize?: number;
  viaWeight?: number;
  viaSpacing?: number;
  /** 目的地罗马字 */
  romaji: string;
  romajiSize?: number;
  romajiWeight?: number;
  romajiSpacing?: number;
  /** 英文前缀（默认 for） */
  romajiPrefix?: string;
  /** 英文线路名（可换行），空则塌陷 */
  enVia: string;
  enViaSize?: number;
  enViaWeight?: number;
  enViaSpacing?: number;
  /** 英文线路名前的徽章组（可自由增删；空列表 = 不显示） */
  badges?: BadgeItem[];
  badgeSize?: number;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}

export const directionDefaultProps: DirectionProps = {
  dest: "西船橋",
  destSize: 22,
  destWeight: 700,
  destSpacing: 0,
  suffix: "方面",
  suffixSize: 18,
  suffixWeight: 700,
  suffixSpacing: 0,
  via: "東葉高速線",
  viaSize: 16,
  viaWeight: 700,
  viaSpacing: 0,
  romaji: "Nishi-funabashi",
  romajiSize: 13,
  romajiWeight: 500,
  romajiSpacing: 0,
  romajiPrefix: "for",
  enVia: "Toyo Rapid Line",
  enViaSize: 12,
  enViaWeight: 500,
  enViaSpacing: 0,
  badges: [
    {
      letter: "TR",
      number: "",
      color: "#00a7db",
      shape: "rect",
      thickness: "normal",
    },
    {
      letter: "JB",
      number: "",
      color: "#ffd400",
      shape: "rect",
      thickness: "normal",
    },
  ],
  badgeSize: 14,
  align: "left",
  foreground: "#ffffff",
  background: colors.background,
};

const SCOPE = "themes.tokyo-metro.components.Direction.props";

export const directionEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    // 目的地与「方面」是同一行，不需要行距（只有经由与英文线路名需要）
    // 方向组件没有「行距」这个概念：目的地/方面/经由/罗马字各自一行，
    // 行高由字号决定，所以所有 LineGap 字段一律不出现。
    ...langFormItems(t, SCOPE, "dest").filter(f => !f.key.endsWith("LineGap")),
    ...langFormItems(t, SCOPE, "suffix").filter(
      f => !f.key.endsWith("LineGap")
    ),
    ...langFormItems(t, SCOPE, "via").filter(f => !f.key.endsWith("LineGap")),
    ...langFormItems(t, SCOPE, "romaji").filter(
      f => !f.key.endsWith("LineGap")
    ),
    {
      key: "romajiPrefix",
      label: `${SCOPE}.romajiPrefix`,
      element: <Input />,
    },
    ...langFormItems(t, SCOPE, "enVia").filter(f => !f.key.endsWith("LineGap")),
    {
      key: "badges",
      label: `${SCOPE}.badges`,
      element: (
        <BadgeListEditor
          labels={{
            letter: t(`${SCOPE}.badgeLetter`),
            number: t(`${SCOPE}.badgeNumber`),
            color: t(`${SCOPE}.badgeColor`),
            shape: t(`${SCOPE}.badgeShape`),
            thickness: t(`${SCOPE}.badgeThickness`),
            circle: t(`${SCOPE}.badgeCircle`),
            rect: t(`${SCOPE}.badgeRect`),
            normal: t(`${SCOPE}.badgeNormal`),
            thick: t(`${SCOPE}.badgeThick`),
            add: t(`${SCOPE}.badgeAdd`),
            remove: t(`${SCOPE}.badgeRemove`),
          }}
        />
      ),
    },
    {
      key: "badgeSize",
      label: `${SCOPE}.badgeSize`,
      element: <InputNumber min={10} max={32} />,
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
  ],
});

function Direction({
  dest = directionDefaultProps.dest,
  destSize = directionDefaultProps.destSize,
  destWeight = directionDefaultProps.destWeight,
  destSpacing = directionDefaultProps.destSpacing,
  suffix = directionDefaultProps.suffix,
  suffixSize = directionDefaultProps.suffixSize,
  suffixWeight = directionDefaultProps.suffixWeight,
  suffixSpacing = directionDefaultProps.suffixSpacing,
  via = directionDefaultProps.via,
  viaSize = directionDefaultProps.viaSize,
  viaWeight = directionDefaultProps.viaWeight,
  viaSpacing = directionDefaultProps.viaSpacing,
  romaji = directionDefaultProps.romaji,
  romajiSize = directionDefaultProps.romajiSize,
  romajiWeight = directionDefaultProps.romajiWeight,
  romajiSpacing = directionDefaultProps.romajiSpacing,
  romajiPrefix = directionDefaultProps.romajiPrefix,
  enVia = directionDefaultProps.enVia,
  enViaSize = directionDefaultProps.enViaSize,
  enViaWeight = directionDefaultProps.enViaWeight,
  enViaSpacing = directionDefaultProps.enViaSpacing,
  badges = directionDefaultProps.badges,
  badgeSize = directionDefaultProps.badgeSize,
  align = "left",
  foreground = directionDefaultProps.foreground,
  background = directionDefaultProps.background,
}: DirectionProps) {
  // 折行宽度已整体砍掉：多行靠 TextArea 里手动回车
  const wrapStyle: React.CSSProperties = { whiteSpace: "nowrap" };
  const hasVia = (via ?? "").trim().length > 0;
  const hasEnVia = (enVia ?? "").trim().length > 0;
  const hasRomaji = (romaji ?? "").trim().length > 0;
  const alignItems =
    align === "center"
      ? "center"
      : align === "right"
        ? "flex-end"
        : "flex-start";

  return (
    <Background
      background={background}
      className="flex h-16 flex-col justify-center px-2"
      style={{ color: foreground, alignItems, lineHeight: 1 }}
    >
      {/* 第一行：目的地 + 方面（整行不折） + 经由（可折） */}
      <div
        className="flex items-baseline"
        style={{
          gap: 6,
          flexWrap: "nowrap",
          lineHeight: 1,
          height: destSize ?? 22 + 8,
          overflow: "visible",
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>
          <span
            style={{
              fontFamily: fontFamilyZh,
              fontSize: destSize,
              fontWeight: destWeight,
              letterSpacing: destSpacing,
              marginRight: 2,
            }}
          >
            {dest}
          </span>
          <span
            style={{
              fontFamily: fontFamilyZh,
              fontSize: suffixSize,
              fontWeight: suffixWeight,
              letterSpacing: suffixSpacing,
            }}
          >
            {suffix}
          </span>
        </span>
        {hasVia && (
          <span
            style={{
              fontFamily: fontFamilyZh,
              fontSize: viaSize,
              fontWeight: viaWeight,
              letterSpacing: viaSpacing,
              ...wrapStyle,
            }}
          >
            {via}
          </span>
        )}
      </div>

      {/* 第二行：目的地罗马字 */}
      {hasRomaji && (
        <div
          style={{
            fontFamily: fontFamilyEn,
            fontSize: romajiSize,
            fontWeight: romajiWeight,
            letterSpacing: romajiSpacing,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            height: romajiSize,
            overflow: "visible",
          }}
        >
          {romajiPrefix ? `${romajiPrefix} ` : ""}
          {romaji}
        </div>
      )}

      {/* 第三行：徽章 + 英文线路名 */}
      {hasEnVia && (
        <div
          className="flex items-center"
          style={{
            flexWrap: "nowrap",
            lineHeight: 1,
            height: Math.max(badgeSize ?? 14, enViaSize ?? 9),
            overflow: "visible",
            // 徽章之间按尺寸留白（成都那种「一组徽章成串但不粘连」的观感）
            gap: Math.max(4, Math.round((badgeSize ?? 14) * 0.3)),
          }}
        >
          {(badges ?? [])
            .filter(b => (b.letter ?? "").trim().length > 0)
            .map((b, i) => (
              <BadgeGlyph
                key={i}
                size={badgeSize ?? 14}
                letter={b.letter}
                number={b.number ?? ""}
                color={b.color ?? "#00a7db"}
                foreground="#1a1a1a"
                shape={b.shape ?? "circle"}
                thickness={b.thickness ?? "normal"}
              />
            ))}
          <span
            style={{
              fontFamily: fontFamilyEn,
              fontSize: enViaSize,
              fontWeight: enViaWeight,
              letterSpacing: enViaSpacing,
              lineHeight: 1,
              ...wrapStyle,
            }}
          >
            {enVia}
          </span>
        </div>
      )}
    </Background>
  );
}

Direction.getEditorConfig = (t: (key: string) => string) =>
  directionEditorConfig(t);

export default Direction;
