import "./fonts/frutiger.css";
import "./fonts/helvetica.css";

import LineNum from "./LineNum.tsx";
import LineText from "./LineText.tsx";
import Arrow from "./Arrow.tsx";
import Icon from "./Icon.tsx";
import NumAlphabet from "./NumAlphabet.tsx";
import Spacing from "./Spacing.tsx";
import Text from "./Text.tsx";
import StationName from "./StationName.tsx"
import SpecLine from "./SpecLine.tsx";
import Blank from "./Blank.tsx";

import colors from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts"

const theme:Theme = {
  colors: {
    defaultBackground: colors["background"],
    defaultForeground: colors["foreground"],
    defaultBorder: colors["border"],
  },
  fontFamily: "Frutiger, Helvetica, sans-serif",
  components: [
    {
      displayName: "themes.chongqing.LineNum",
      component: LineNum,
    },
    {
      displayName: "themes.chongqing.LineText",
      component: LineText,
    },
    {
      displayName: "themes.chongqing.Arrow",
      component: Arrow,
    },
    {
      displayName: "themes.chongqing.Icon",
      component: Icon,
    },
    {
      displayName: "themes.chongqing.NumAlphabet",
      component: NumAlphabet,
    },
    {
      displayName: "themes.chongqing.Spacing",
      component: Spacing,
    },
    {
      displayName: "themes.chongqing.StationName",
      component: StationName,
    },
    {
      displayName: "themes.chongqing.Text",
      component: Text,
    },
    {
      displayName: "themes.chongqing.SpecLine",
      component: SpecLine,
    },
    {
      displayName: "themes.chongqing.Blank",
      component: Blank,
    }
  ]
};

export default theme;