import { useMemo } from "react";
import { TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  colorFormItem,
} from "./Background";
import { ROW_H } from "./define/layout";
import { measureText, useFontsReady, weightCss } from "./define/text";
import { normalizeSvgLine } from "../../../utils/svgText";

/**
 * 文字线路标（附录 A 右列「线路名称及识别色在深灰底色上的表达」）。
 *
 * 版式全部锁死（用户要求：这些参数没必要开放调整，按标准图写死）：
 *  - 牌高 44.5、圆角 3、白描边 1
 *  - 中文 21px / 英文 10px（Helvetica）、左右内边距 10、中英间距 4
 *  - 磁浮线是上下两段色（青绿 / 橙），所以底色支持双色；两段同色即单色
 *  - 左右各留 6px 透明边（用户要求比数字线路标的 3px 再多一点）
 */
export interface TextLineNumProps {
  chinese: string;
  english: string;
  /** 上段 / 单色线路色 */
  color1: string;
  /** 下段线路色（磁浮为橙色；填成和上段一样就是单色） */
  color2?: string;
  /** 文字颜色（独立于全局「默认前景色」，不会被它覆盖） */
  textColor?: string;
  /** 描边色 */
  border?: string;
  background?: string;
}

/** 锁死的版式（来自标准附录 A 线路名称牌实测） */
const PLATE_H = 40.5;
const RADIUS = 3;
const BORDER_W = 1;
const ZH_SIZE = 20;
const EN_SIZE = 9;
const PAD_X = 8;
const GAP = 4;
const GAP_X = 6;

export const textLineNumDefaultProps: TextLineNumProps = {
  chinese: "磁浮线",
  english: "Maglev Line",
  color1: colors.maglev1,
  color2: colors.maglev2,
  textColor: colors.white,
  border: colors.white,
  background: colors.background,
};

const SCOPE = "themes.shanghai.components.TextLineNum.props";

export const textLineNumEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: `${SCOPE}.chinese`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 1 }} />,
    },
    {
      key: "english",
      label: `${SCOPE}.english`,
      element: <TextArea autosize={{ minRows: 1, maxRows: 2 }} />,
    },
    colorFormItem(SCOPE, "color1"),
    colorFormItem(SCOPE, "color2"),
    colorFormItem(SCOPE, "textColor"),
    colorFormItem(SCOPE, "border"),
    ...backgroundFormItems(SCOPE),
  ],
});

export default function TextLineNum({
  chinese = textLineNumDefaultProps.chinese,
  english = textLineNumDefaultProps.english,
  color1 = textLineNumDefaultProps.color1,
  color2 = textLineNumDefaultProps.color2,
  textColor = textLineNumDefaultProps.textColor,
  border = textLineNumDefaultProps.border,
  background = textLineNumDefaultProps.background,
}: TextLineNumProps) {
  const fontsReady = useFontsReady();
  const weightValue = weightCss("medium");
  const zh = normalizeSvgLine(chinese);
  const en = normalizeSvgLine(english);
  const zhFont = `${weightValue} ${ZH_SIZE}px ${fontFamilyZh}`;
  const enFont = `${weightValue} ${EN_SIZE}px ${fontFamilyEn}`;
  const plateW = useMemo(
    () =>
      Math.ceil(Math.max(measureText(zh, zhFont), measureText(en, enFont))) +
      PAD_X * 2,
    [zh, en, zhFont, enFont, fontsReady]
  );
  const boxW = plateW + GAP_X * 2;
  const top = (ROW_H - PLATE_H) / 2;
  const zhInk = ZH_SIZE * 0.88;
  const enCap = EN_SIZE * 0.716;
  const enDesc = EN_SIZE * 0.25;
  const inkH = zhInk + GAP + enCap + enDesc;
  const contentTop = top + (PLATE_H - inkH) / 2;
  const zhBaseline = contentTop + zhInk - top;
  const enBaseline = zhBaseline + GAP + enCap;

  const bands = color2 && color2 !== color1 ? [color1, color2] : [color1];
  const bg =
    bands.length === 1
      ? bands[0]
      : `linear-gradient(to bottom, ${bands[0]} 0% 50%, ${bands[1]} 50% 100%)`;

  return (
    <BackgroundBox
      background={background}
      style={{ height: ROW_H, width: boxW }}
    >
      <div
        style={{
          position: "absolute",
          left: GAP_X,
          right: GAP_X,
          top,
          height: PLATE_H,
          borderRadius: RADIUS,
          border: `${BORDER_W}px solid ${border}`,
          background: bg,
          overflow: "hidden",
        }}
      >
        <svg width={plateW} height={PLATE_H} style={{ display: "block" }}>
          <text
            x={PAD_X}
            y={zhBaseline}
            fontSize={ZH_SIZE}
            fontWeight={weightValue}
            fill={textColor}
            fontFamily={fontFamilyZh}
            xmlSpace="preserve"
          >
            {zh}
          </text>
          <text
            x={PAD_X}
            y={enBaseline}
            fontSize={EN_SIZE}
            fontWeight={weightValue}
            fill={textColor}
            fontFamily={fontFamilyEn}
            xmlSpace="preserve"
          >
            {en}
          </text>
        </svg>
      </div>
    </BackgroundBox>
  );
}

TextLineNum.getEditorConfig = (t: (key: string) => string) =>
  textLineNumEditorConfig(t);
