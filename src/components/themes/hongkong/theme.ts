import "./fonts/mtrsung.css";
import "./fonts/notoserif.css";

// import Line, { lineDefaultProps } from "./Line.tsx";
import Arrow, { arrowDefaultProps } from "./Arrow.tsx";
import Icon, { iconDefaultProps } from "./Icon.tsx";
import Spacing, { spacingDefaultProps } from "./Spacing.tsx";
import Text, { textDefaultProps } from "./Text.tsx";
import SpecLine, { specLineDefaultProps } from "./SpecLine.tsx";
import Blank, { blankDefaultProps } from "./Blank.tsx";
// import Exit, { exitDefaultProps } from "./Exit.tsx";

import colors from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts";

const theme: Theme = {
  colors: {
    defaultBackground: colors.background,
    defaultForeground: colors.foreground,
    defaultBorder: colors.border,
    colors,
  },
  fontFamily: "'MTR Sung', 'Noto Serif TC', 'Noto Serif SC', serif, sans-serif",
  components: [
    // {
    //   displayName: "themes.hongkong.components.Line",
    //   component: Line,
    //   defaultProps: lineDefaultProps,
    // },
    {
      displayName: "themes.hongkong.components.Arrow",
      component: Arrow,
      defaultProps: arrowDefaultProps,
    },
    {
      displayName: "themes.hongkong.components.Icon",
      component: Icon,
      defaultProps: iconDefaultProps,
    },
    {
      displayName: "themes.hongkong.components.Text",
      component: Text,
      defaultProps: textDefaultProps,
    },
    // {
    //   displayName: "themes.hongkong.components.Exit",
    //   component: Exit,
    //   defaultProps: exitDefaultProps,
    // },
    {
      displayName: "themes.hongkong.components.SpecLine",
      component: SpecLine,
      defaultProps: specLineDefaultProps,
    },
    {
      displayName: "themes.hongkong.components.Spacing",
      component: Spacing,
      defaultProps: spacingDefaultProps,
    },
    {
      displayName: "themes.hongkong.components.Blank",
      component: Blank,
      defaultProps: blankDefaultProps,
    },
  ],
};

export default theme;
