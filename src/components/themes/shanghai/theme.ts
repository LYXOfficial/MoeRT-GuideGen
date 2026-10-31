import "./fonts/sourcehansans.css";
import "./fonts/helvetica.css";

import Text, { textDefaultProps } from "./Text.tsx";
import BigZh, { bigZhDefaultProps } from "./BigZh.tsx";
import BigEn, { bigEnDefaultProps } from "./BigEn.tsx";
import NumAlphabet, { numAlphabetDefaultProps } from "./NumAlphabet.tsx";
import DualText, { dualTextDefaultProps } from "./DualText.tsx";
import LineNum, { lineNumDefaultProps } from "./LineNum.tsx";
import TextLineNum, { textLineNumDefaultProps } from "./TextLineNum.tsx";
import Arrow, { arrowDefaultProps } from "./Arrow.tsx";
import Icon, { iconDefaultProps } from "./Icon.tsx";
import SpecLine, { specLineDefaultProps } from "./SpecLine.tsx";
import Spacing, { spacingDefaultProps } from "./Spacing.tsx";
import Blank, { blankDefaultProps } from "./Blank.tsx";

import colors, { fontFamilyZh } from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts";

/**
 * 上海地铁主题（依据 DB31/T 1104《城市轨道交通导向标识系统设计规范》修订稿）。
 *
 * 底色是标准 6.4.1 的内发光牌深灰（C0 M0 Y0 K92-95），信息白、出站黄；
 * 线路色、申通红、磁浮双色全部来自标准附录 A 与正文的 CMYK，未凭空调色。
 * 素材与换算过程见 docs/shanghai/。
 */
const theme: Theme = {
  colors: {
    defaultBackground: colors.background,
    defaultForeground: colors.foreground,
    defaultBorder: colors.border,
    colors,
  },
  fontFamily: fontFamilyZh,
  components: [
    {
      displayName: "themes.shanghai.components.LineNum",
      component: LineNum,
      defaultProps: lineNumDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.TextLineNum",
      component: TextLineNum,
      defaultProps: textLineNumDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.Text",
      component: Text,
      defaultProps: textDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.BigZh",
      component: BigZh,
      defaultProps: bigZhDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.BigEn",
      component: BigEn,
      defaultProps: bigEnDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.NumAlphabet",
      component: NumAlphabet,
      defaultProps: numAlphabetDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.DualText",
      component: DualText,
      defaultProps: dualTextDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.Arrow",
      component: Arrow,
      defaultProps: arrowDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.Icon",
      component: Icon,
      defaultProps: iconDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.SpecLine",
      component: SpecLine,
      defaultProps: specLineDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.Spacing",
      component: Spacing,
      defaultProps: spacingDefaultProps,
    },
    {
      displayName: "themes.shanghai.components.Blank",
      component: Blank,
      defaultProps: blankDefaultProps,
    },
  ],
};

export default theme;
