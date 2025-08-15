import "./fonts/frutiger.css";
import "./fonts/helvetica.css";

import LineNum, { lineNumDefaultProps } from "./LineNum.tsx";
import LineText, { lineTextDefaultProps } from "./LineText.tsx";
import Arrow, { arrowDefaultProps } from "./Arrow.tsx";
import Icon from "./Icon.tsx";
import NumAlphabet, { numAlphabetDefaultProps } from "./NumAlphabet.tsx";
import Spacing, { spacingDefaultProps } from "./Spacing.tsx";
import Text, { textDefaultProps } from "./Text.tsx";
import StationName, { stationNameDefaultProps } from "./StationName.tsx";
import SpecLine, { specLineDefaultProps } from "./SpecLine.tsx";
import Blank, { blankDefaultProps } from "./Blank.tsx";

import colors from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts";

const theme: Theme = {
  colors: {
    defaultBackground: colors["background"],
    defaultForeground: colors["foreground"],
    defaultBorder: colors["border"],
  },
  fontFamily: "Frutiger, Helvetica, sans-serif",
  components: [
    {
      displayName: "themes.chongqing.components.LineNum",
      component: LineNum,
      defaultProps: lineNumDefaultProps,
    },
    {
      displayName: "themes.chongqing.components.LineText",
      component: LineText,
      defaultProps: lineTextDefaultProps,
    },
    {
      displayName: "themes.chongqing.components.Arrow",
      component: Arrow,
      defaultProps: arrowDefaultProps,
    },
    {
      displayName: "themes.chongqing.components.Icon",
      component: Icon,
      // defaultProps: iconDefaultProps
      defaultProps: {},
    },
    {
      displayName: "themes.chongqing.components.Text",
      component: Text,
      defaultProps: textDefaultProps,
    },
    {
      displayName: "themes.chongqing.components.NumAlphabet",
      component: NumAlphabet,
      defaultProps: numAlphabetDefaultProps,
    },
    {
      displayName: "themes.chongqing.components.StationName",
      component: StationName,
      defaultProps: stationNameDefaultProps,
    },
    {
      displayName: "themes.chongqing.components.SpecLine",
      component: SpecLine,
      defaultProps: specLineDefaultProps,
    },
    {
      displayName: "themes.chongqing.components.Spacing",
      component: Spacing,
      defaultProps: spacingDefaultProps,
    },
    {
      displayName: "themes.chongqing.components.Blank",
      component: Blank,
      defaultProps: blankDefaultProps,
    },
  ],
};

export default theme;
