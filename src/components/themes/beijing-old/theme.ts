import "./fonts/simhei.css";
import "./fonts/sourcehansans.css";
import "./fonts/arial.css";

import Text, { textDefaultProps } from "./Text.tsx";
import Line, { lineDefaultProps } from "./Line.tsx";
import Arrow, { arrowDefaultProps } from "./Arrow.tsx";
import ToTrain, { toTrainDefaultProps } from "./ToTrain.tsx";
import DualText, { dualTextDefaultProps } from "./DualText.tsx";
import StationSign, { stationSignDefaultProps } from "./StationSign.tsx";
import ExitLetter, { exitLetterDefaultProps } from "./ExitLetter.tsx";
import Icon, { iconDefaultProps } from "./Icon.tsx";
import ExitIcon, { exitIconDefaultProps } from "./ExitIcon.tsx";
import SpecLine, { specLineDefaultProps } from "./SpecLine.tsx";
import Spacing, { spacingDefaultProps } from "./Spacing.tsx";
import Blank, { blankDefaultProps } from "./Blank.tsx";

import colors, { fontFamilyZh } from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts";

/**
 * 北京旧版主题（2015 / 经典样式）。
 * 图形素材取自 visys.pdf 第 7 页「Classic Style」+ 第 5 页白色方框系列，
 * 底色 #092f52（vitool 经典模式画板色），线路色沿用 vitool 官方色板。
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
      displayName: "themes.beijingOld.components.Line",
      component: Line,
      defaultProps: lineDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.Text",
      component: Text,
      defaultProps: textDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.Arrow",
      component: Arrow,
      defaultProps: arrowDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.ToTrain",
      component: ToTrain,
      defaultProps: toTrainDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.DualText",
      component: DualText,
      defaultProps: dualTextDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.StationSign",
      component: StationSign,
      defaultProps: stationSignDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.ExitLetter",
      component: ExitLetter,
      defaultProps: exitLetterDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.Icon",
      component: Icon,
      defaultProps: iconDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.ExitIcon",
      component: ExitIcon,
      defaultProps: exitIconDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.SpecLine",
      component: SpecLine,
      defaultProps: specLineDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.Spacing",
      component: Spacing,
      defaultProps: spacingDefaultProps,
    },
    {
      displayName: "themes.beijingOld.components.Blank",
      component: Blank,
      defaultProps: blankDefaultProps,
    },
  ],
};

export default theme;
