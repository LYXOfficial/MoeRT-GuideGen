import "./fonts/sourcehansans.css";
import "./fonts/arial.css"

import Text, { textDefaultProps } from "./Text.tsx";
import LineNum, { lineNumDefaultProps } from "./LineNum.tsx";
import Arrow, { arrowDefaultProps } from "./Arrow.tsx";
import TrainDirection, {
  trainDirectionDefaultProps,
} from "./TrainDirection.tsx";
import LoopNextStation, {
  loopNextStationDefaultProps,
} from "./LoopNextStation.tsx";
import DualText, { dualTextDefaultProps } from "./DualText.tsx";
import ExitNum, { exitNumDefaultProps } from "./ExitNum.tsx";
import Icon, { iconDefaultProps } from "./Icon.tsx";
import ExitIcon, { exitIconDefaultProps } from "./ExitIcon.tsx";
import SpecLine, { specLineDefaultProps } from "./SpecLine.tsx";
import Spacing, { spacingDefaultProps } from "./Spacing.tsx";
import Blank, { blankDefaultProps } from "./Blank.tsx";

import colors, { fontFamilyZh } from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts";

/**
 * 北京新版主题（基于 DB11/T 657.2—2024 的改编版 + centralgo vitool 实配色）。
 * 目前为第一阶段：扁平基础组件（Text / SpecLine / Spacing / Blank）。
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
      displayName: "themes.beijing.components.LineNum",
      component: LineNum,
      defaultProps: lineNumDefaultProps,
    },
    {
      displayName: "themes.beijing.components.Text",
      component: Text,
      defaultProps: textDefaultProps,
    },
    {
      displayName: "themes.beijing.components.Arrow",
      component: Arrow,
      defaultProps: arrowDefaultProps,
    },
    {
      displayName: "themes.beijing.components.TrainDirection",
      component: TrainDirection,
      defaultProps: trainDirectionDefaultProps,
    },
    {
      displayName: "themes.beijing.components.LoopNextStation",
      component: LoopNextStation,
      defaultProps: loopNextStationDefaultProps,
    },
    {
      displayName: "themes.beijing.components.DualText",
      component: DualText,
      defaultProps: dualTextDefaultProps,
    },
    {
      displayName: "themes.beijing.components.ExitNum",
      component: ExitNum,
      defaultProps: exitNumDefaultProps,
    },
    {
      displayName: "themes.beijing.components.Icon",
      component: Icon,
      defaultProps: iconDefaultProps,
    },
    {
      displayName: "themes.beijing.components.ExitIcon",
      component: ExitIcon,
      defaultProps: exitIconDefaultProps,
    },
    {
      displayName: "themes.beijing.components.SpecLine",
      component: SpecLine,
      defaultProps: specLineDefaultProps,
    },
    {
      displayName: "themes.beijing.components.Spacing",
      component: Spacing,
      defaultProps: spacingDefaultProps,
    },
    {
      displayName: "themes.beijing.components.Blank",
      component: Blank,
      defaultProps: blankDefaultProps,
    },
  ],
};

export default theme;
