import { InputNumber, Select, Switch, Input } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import { Background, backgroundFormItems, foregroundFormItem } from "./Background";
import BadgeGlyph from "./define/BadgeGlyph";
import { langFormItems } from "./define/textForms";

/**
 * StationName —— 站名（站名汉字 + 假名 + 罗马字），可选前面挂一枚自家站号徽章。
 *
 * 三行各自独立 字号/字重/字距/行距；假名与罗马字留空即塌陷。
 */
export interface StationNameProps {
  name: string;
  nameSize?: number;
  nameWeight?: number;
  nameSpacing?: number;
  nameLineGap?: number;
  kana: string;
  kanaSize?: number;
  kanaWeight?: number;
  kanaSpacing?: number;
  kanaLineGap?: number;
  en: string;
  enSize?: number;
  enWeight?: number;
  enSpacing?: number;
  enLineGap?: number;
  /** 站号徽章 */
  showBadge?: boolean;
  badgeLetter?: string;
  badgeNumber?: string;
  badgeColor?: string;
  badgeSize?: number;
  /** 徽章本体形状 */
  badgeShape?: "circle" | "rect";
  /** 环厚 */
  badgeThickness?: "normal" | "thick";
  /** 徽章底板：无 / 圆 / 圆角矩形（现场默认圆形白底） */
  badgePlate?: "none" | "circle" | "rect";
  badgePlateColor?: string;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}

export const stationNameDefaultProps: StationNameProps = {
  name: "新宿三丁目",
  nameSize: 26,
  nameWeight: 700,
  nameSpacing: 0,
  nameLineGap: 2,
  kana: "しんじゅくさんちょうめ",
  kanaSize: 10,
  kanaWeight: 500,
  kanaSpacing: 0,
  kanaLineGap: 1,
  en: "Shinjuku-sanchome",
  enSize: 11,
  enWeight: 500,
  enSpacing: 0,
  enLineGap: 1,
  showBadge: true,
  badgeLetter: "F",
  badgeNumber: "13",
  badgeColor: colors.lineF,
  badgeSize: 40,
  badgeShape: "circle",
  badgeThickness: "normal",
  badgePlate: "circle",
  badgePlateColor: "#ffffff",
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
};

const SCOPE = "themes.tokyo-metro.components.StationName.props";

export const stationNameEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    ...langFormItems(t, SCOPE, "name"),
    ...langFormItems(t, SCOPE, "kana"),
    ...langFormItems(t, SCOPE, "en"),
    {
      key: "showBadge",
      label: `${SCOPE}.showBadge`,
      element: <Switch size="small" />,
    },
    {
      key: "badgeLetter",
      // 关掉徽章后，这一组参数一起隐藏（条件表单）
      visible: (p: Record<string, any>) => !!p.showBadge,
      label: `${SCOPE}.badgeLetter`,
      element: <Input maxLength={3} />,
    },
    {
      key: "badgeNumber",
      visible: (p: Record<string, any>) => !!p.showBadge,
      label: `${SCOPE}.badgeNumber`,
      element: <Input maxLength={2} />,
    },
    {
      key: "badgeColor",
      visible: (p: Record<string, any>) => !!p.showBadge,
      label: `${SCOPE}.badgeColor`,
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "badgeSize",
      visible: (p: Record<string, any>) => !!p.showBadge,
      label: `${SCOPE}.badgeSize`,
      element: <InputNumber min={16} max={56} />,
    },
    {
      key: "badgeShape",
      label: "themes.tokyo-metro.components.StationName.props.badgeShape.displayName",
      visible: (p: Record<string, any>) => !!p.showBadge,
      element: (
        <Select>
          <Select.Option value="circle">
            {t("themes.tokyo-metro.components.StationName.props.badgeShape.circle")}
          </Select.Option>
          <Select.Option value="rect">
            {t("themes.tokyo-metro.components.StationName.props.badgeShape.rect")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "badgeThickness",
      label: "themes.tokyo-metro.components.StationName.props.badgeThickness.displayName",
      visible: (p: Record<string, any>) => !!p.showBadge,
      element: (
        <Select>
          <Select.Option value="normal">
            {t("themes.tokyo-metro.components.StationName.props.badgeThickness.normal")}
          </Select.Option>
          <Select.Option value="thick">
            {t("themes.tokyo-metro.components.StationName.props.badgeThickness.thick")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "badgePlate",
      label: "themes.tokyo-metro.components.StationName.props.badgePlate.displayName",
      visible: (p: Record<string, any>) => !!p.showBadge,
      element: (
        <Select>
          <Select.Option value="none">
            {t("themes.tokyo-metro.components.StationName.props.badgePlate.none")}
          </Select.Option>
          <Select.Option value="circle">
            {t("themes.tokyo-metro.components.StationName.props.badgePlate.circle")}
          </Select.Option>
          <Select.Option value="rect">
            {t("themes.tokyo-metro.components.StationName.props.badgePlate.rect")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "badgePlateColor",
      label: "themes.tokyo-metro.components.StationName.props.badgePlateColor",
      visible: (p: Record<string, any>) => !!p.showBadge,
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "align",
      label: `${SCOPE}.align.displayName`,
      element: (
        <Select>
          <Select.Option value="left">{t(`${SCOPE}.align.left`)}</Select.Option>
          <Select.Option value="center">
            {t(`${SCOPE}.align.center`)}
          </Select.Option>
          <Select.Option value="right">
            {t(`${SCOPE}.align.right`)}
          </Select.Option>
        </Select>
      ),
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
  ],
});

function StationName({
  name = stationNameDefaultProps.name,
  nameSize = stationNameDefaultProps.nameSize,
  nameWeight = stationNameDefaultProps.nameWeight,
  nameSpacing = stationNameDefaultProps.nameSpacing,
  nameLineGap = stationNameDefaultProps.nameLineGap,
  kana = stationNameDefaultProps.kana,
  kanaSize = stationNameDefaultProps.kanaSize,
  kanaWeight = stationNameDefaultProps.kanaWeight,
  kanaSpacing = stationNameDefaultProps.kanaSpacing,
  kanaLineGap = stationNameDefaultProps.kanaLineGap,
  en = stationNameDefaultProps.en,
  enSize = stationNameDefaultProps.enSize,
  enWeight = stationNameDefaultProps.enWeight,
  enSpacing = stationNameDefaultProps.enSpacing,
  enLineGap = stationNameDefaultProps.enLineGap,
  showBadge = stationNameDefaultProps.showBadge,
  badgeLetter = stationNameDefaultProps.badgeLetter,
  badgeNumber = stationNameDefaultProps.badgeNumber,
  badgeColor = stationNameDefaultProps.badgeColor,
  badgeSize = stationNameDefaultProps.badgeSize,
  badgeShape = "circle",
  badgeThickness = "normal",
  badgePlate = "circle",
  badgePlateColor = "#ffffff",
  align = "left",
  foreground = stationNameDefaultProps.foreground,
  background = stationNameDefaultProps.background,
}: StationNameProps) {
  const lines = [
    { text: name, size: nameSize ?? 30, weight: nameWeight ?? 700, spacing: nameSpacing ?? 0, gap: nameLineGap ?? 2, family: "zh" },
    { text: kana, size: kanaSize ?? 11, weight: kanaWeight ?? 500, spacing: kanaSpacing ?? 0, gap: kanaLineGap ?? 1, family: "zh" },
    { text: en, size: enSize ?? 13, weight: enWeight ?? 500, spacing: enSpacing ?? 0, gap: enLineGap ?? 1, family: "en" },
  ].filter(l => (l.text ?? "").trim().length > 0);

  return (
    <Background
      background={background}
      className="flex h-16 items-center gap-1.5 px-1"
      style={{
        color: foreground,
        justifyContent:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
      }}
    >
      {showBadge && badgeLetter && (
        // 站名牌上的徽章默认带**圆形白底板**（现场常见），尺寸 = 徽章 + 外扩
        <div
          style={{
            width: (badgeSize ?? 40) + (badgePlate === "none" ? 0 : 10),
            height: (badgeSize ?? 40) + (badgePlate === "none" ? 0 : 10),
            borderRadius:
              badgePlate === "circle"
                ? "999px"
                : badgePlate === "rect"
                  ? Math.round((badgeSize ?? 40) * 0.22)
                  : undefined,
            backgroundColor:
              badgePlate === "none" ? undefined : badgePlateColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <BadgeGlyph
            size={badgeSize ?? 40}
            letter={badgeLetter}
            number={badgeNumber}
            color={badgeColor ?? colors.lineF}
            // 徽章里是白底黑字，跟组件前景色无关（前景色是站名文字的颜色）
            foreground="#1a1a1a"
            shape={badgeShape}
            thickness={badgeThickness}
          />
        </div>
      )}
      <div
        className="flex flex-col"
        style={{ alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: l.family === "en" ? fontFamilyEn : fontFamilyZh,
              fontSize: l.size,
              fontWeight: l.weight,
              letterSpacing: l.spacing,
              lineHeight: `${l.size + l.gap}px`,
              whiteSpace: "nowrap",
            }}
          >
            {l.text}
          </div>
        ))}
      </div>
    </Background>
  );
}

StationName.getEditorConfig = (t: (key: string) => string) =>
  stationNameEditorConfig(t);

export default StationName;
