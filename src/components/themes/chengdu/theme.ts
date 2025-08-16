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
    colors,
  },
  fontFamily: "Frutiger, Helvetica, sans-serif",
  components: [
    {
      displayName: "themes.chengdu.components.LineNum",
      component: LineNum,
      defaultProps: lineNumDefaultProps,
    },
    {
      displayName: "themes.chengdu.components.LineText",
      component: LineText,
      defaultProps: lineTextDefaultProps,
    },
    {
      displayName: "themes.chengdu.components.Arrow",
      component: Arrow,
      defaultProps: arrowDefaultProps,
    },
    {
      displayName: "themes.chengdu.components.Icon",
      component: Icon,
      // defaultProps: iconDefaultProps
      defaultProps: {},
    },
    {
      displayName: "themes.chengdu.components.Text",
      component: Text,
      defaultProps: textDefaultProps,
    },
    {
      displayName: "themes.chengdu.components.NumAlphabet",
      component: NumAlphabet,
      defaultProps: numAlphabetDefaultProps,
    },
    {
      displayName: "themes.chengdu.components.StationName",
      component: StationName,
      defaultProps: stationNameDefaultProps,
    },
    {
      displayName: "themes.chengdu.components.SpecLine",
      component: SpecLine,
      defaultProps: specLineDefaultProps,
    },
    {
      displayName: "themes.chengdu.components.Spacing",
      component: Spacing,
      defaultProps: spacingDefaultProps,
    },
    {
      displayName: "themes.chengdu.components.Blank",
      component: Blank,
      defaultProps: blankDefaultProps,
    },
  ],
};

export default theme;

//todo:站编号胶囊,保存
//fixs:拖动追加bug，体验优化，空白组件（spacing blank）提示，导出字体