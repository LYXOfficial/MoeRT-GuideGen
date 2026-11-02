import { Input, Select, Switch } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 下站方向（悬挂牌左右两半的核心文字块）。
 *
 * 实拍（11 号线）四行，其实是**两列**：
 *      下站   大冲口
 *      Next   Dachongkou
 *      外环   沙涌 芳村方向
 *      Outer Circle  Towards Shachong, Fangcun
 * 「下站 / Next」与站名**各自一列、各自左对齐**（右半面板则各自右对齐）。
 *
 * 用户 2026-11-03：
 *  - 字号写死，不给调；
 *  - 「下站」与站名**同字号**；
 *  - 站名与「下站」要能各自对齐（两列布局）；
 *  - 需要「显示下站」开关，关掉后下站相关字段在编辑器里一并隐藏。
 *
 * 用户 2026-11-04：**永久去掉「外环 / Outer Circle」**（那只属于屏蔽门那一套），
 * 左侧只剩「下站 / Next」，第三、四行只有途经方向；`loopZh / loopEn` 字段已删。
 */
export interface DirectionProps {
  showNext?: boolean;
  nextLabelZh?: string;
  nextLabelEn?: string;
  stationZh?: string;
  stationEn?: string;
  viaZh?: string;
  viaEn?: string;
  align?: "left" | "right";
  fill?: string;
  background?: string;
}

/** 写死：中文 18 / 英文 9（64px 行高下的实测比例） */
const ZH_SIZE = 22;
const EN_SIZE = 11;
const SMALL_ZH = 9;
const SMALL_EN = 5;

export const directionDefaultProps: DirectionProps = {
  showNext: true,
  nextLabelZh: "下站",
  nextLabelEn: "Next",
  stationZh: "大冲口",
  stationEn: "Dachongkou",
  viaZh: "沙涌 芳村方向",
  viaEn: "Towards Shachong, Fangcun",
  align: "left",
  fill: colors.foreground,
  background: colors.transparent,
};

export const directionEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "showNext",
      label: "themes.guangzhou.components.Direction.props.showNext.displayName",
      element: <Switch size="small" />,
    },
    {
      key: "nextLabelZh",
      label: "themes.guangzhou.components.Direction.props.nextLabelZh",
      visible: props => props.showNext !== false,
      element: <Input />,
    },
    {
      key: "nextLabelEn",
      label: "themes.guangzhou.components.Direction.props.nextLabelEn",
      visible: props => props.showNext !== false,
      element: <Input />,
    },
    {
      key: "stationZh",
      label: "themes.guangzhou.components.Direction.props.stationZh",
      element: <Input />,
    },
    {
      key: "stationEn",
      label: "themes.guangzhou.components.Direction.props.stationEn",
      element: <Input />,
    },
    {
      key: "viaZh",
      label: "themes.guangzhou.components.Direction.props.viaZh",
      element: <Input />,
    },
    {
      key: "viaEn",
      label: "themes.guangzhou.components.Direction.props.viaEn",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.guangzhou.components.Direction.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.guangzhou.common.align.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.guangzhou.common.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "fill",
      label: "themes.guangzhou.components.Direction.props.fill",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.guangzhou.components.Direction.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function Direction({
  showNext = directionDefaultProps.showNext,
  nextLabelZh = directionDefaultProps.nextLabelZh,
  nextLabelEn = directionDefaultProps.nextLabelEn,
  stationZh = directionDefaultProps.stationZh,
  stationEn = directionDefaultProps.stationEn,
  viaZh = directionDefaultProps.viaZh,
  viaEn = directionDefaultProps.viaEn,
  align = directionDefaultProps.align,
  fill = directionDefaultProps.fill,
  background = directionDefaultProps.background,
}: DirectionProps) {
  // 空格原样保留（用户 2026-11-03）：只 trim 判空，渲染用原文
  const keep = (v?: string) => {
    const raw = v ?? "";
    return raw.trim() !== "" ? raw : "";
  };
  const zh = keep(stationZh);
  const en = keep(stationEn);
  const viaZ = keep(viaZh);
  const viaE = keep(viaEn);
  const on = showNext !== false;
  const isRight = align === "right";

  // 两列：左列 = 下站 / Next，右列 = 站名 / 英文；途经两行横跨整行、贴左（右对齐时贴右）
  const columns = on ? "auto auto" : "auto";
  const justify = isRight ? "end" : "start";
  const textAlign = isRight ? "right" : "left";
  // 横跨所有列，起点跟「下站 / Next」对齐，不留左列的空
  const spanAll = "1 / -1";

  return (
    <div
      className="h-16 flex items-center"
      style={{ backgroundColor: background, color: fill, paddingLeft: 3, paddingRight: 3 }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: columns,
          columnGap: 8,
          rowGap: 1,
          justifyItems: justify,
          textAlign,
        }}
      >
        {/* ① 下站 / 站名（同字号） */}
        {on && (
          <span
            style={{
              fontFamily: fontFamilyZh,
              fontSize: ZH_SIZE,
              lineHeight: 1.1,
              whiteSpace: "pre-wrap",
            }}
          >
            {(nextLabelZh ?? "").trim() !== "" ? nextLabelZh : "下站"}
          </span>
        )}
        <span
          style={{
            fontFamily: fontFamilyZh,
            fontSize: ZH_SIZE,
            lineHeight: 1.1,
            whiteSpace: "pre-wrap",
          }}
        >
          {zh}
        </span>

        {/* ② Next / 英文名 */}
        {on && (
          <span
            style={{
              fontFamily: fontFamilyEn,
              fontSize: EN_SIZE,
              lineHeight: 1.1,
              whiteSpace: "pre-wrap",
            }}
          >
            {keep(nextLabelEn)}
          </span>
        )}
        <span
          style={{
            fontFamily: fontFamilyEn,
            fontSize: EN_SIZE,
            lineHeight: 1.1,
            whiteSpace: "pre-wrap",
          }}
        >
          {en}
        </span>

        {/* ③ 途经（中文）+ ④ Towards（英文）：横跨整行、贴齐左边缘 */}
        <span
          style={{
            gridColumn: spanAll,
            fontFamily: fontFamilyZh,
            fontSize: SMALL_ZH,
            lineHeight: 1.1,
            whiteSpace: "pre-wrap",
          }}
        >
          {viaZ}
        </span>
        <span
          style={{
            gridColumn: spanAll,
            fontFamily: fontFamilyEn,
            fontSize: SMALL_EN,
            lineHeight: 1.1,
            whiteSpace: "pre-wrap",
          }}
        >
          {viaE}
        </span>
      </div>
    </div>
  );
}

Direction.getEditorConfig = (t: (key: string) => string) =>
  directionEditorConfig(t);

export default Direction;
