import "./fonts/notosansjp.css";
import "./fonts/futura.css";

import LineBadge, { lineBadgeDefaultProps } from "./LineBadge.tsx";
import Route, { routeDefaultProps } from "./Route.tsx";
import OperatorLogo, { operatorLogoDefaultProps } from "./OperatorLogo.tsx";
import Arrow, { arrowDefaultProps } from "./Arrow.tsx";
import Icon, { iconDefaultProps } from "./Icon.tsx";
import ExitTip, { exitTipDefaultProps } from "./ExitTip.tsx";
import ExitNum, { exitNumDefaultProps } from "./ExitNum.tsx";
import StationName, { stationNameDefaultProps } from "./StationName.tsx";
import Direction, { directionDefaultProps } from "./Direction.tsx";
import TextJa, { textJaDefaultProps } from "./TextJa.tsx";
import TextJaEn, { textJaEnDefaultProps } from "./TextJaEn.tsx";
import TextQuad, { textQuadDefaultProps } from "./TextQuad.tsx";
import SpecLine, { specLineDefaultProps } from "./SpecLine.tsx";
import Spacing, { spacingDefaultProps } from "./Spacing.tsx";
import Blank, { blankDefaultProps } from "./Blank.tsx";
import Frame, { frameDefaultProps } from "./Frame.tsx";

import colors from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts";

/**
 * 東京メトロ（长条横幅）主题。
 * 组件顺序即侧栏顺序；i18n 前缀 `themes.tokyo-metro`，THEME_INDEX = 5。
 */
const theme: Theme = {
  colors: {
    defaultBackground: colors.background,
    defaultForeground: colors.foreground,
    defaultBorder: colors.border,
    colors,
  },
  fontFamily: "Helvetica, sans-serif",
  components: [
    {
      displayName: "themes.tokyo-metro.components.LineBadge",
      component: LineBadge,
      defaultProps: lineBadgeDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.Route",
      component: Route,
      defaultProps: routeDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.OperatorLogo",
      component: OperatorLogo,
      defaultProps: operatorLogoDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.Arrow",
      component: Arrow,
      defaultProps: arrowDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.Icon",
      component: Icon,
      defaultProps: iconDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.ExitTip",
      component: ExitTip,
      defaultProps: exitTipDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.ExitNum",
      component: ExitNum,
      defaultProps: exitNumDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.StationName",
      component: StationName,
      defaultProps: stationNameDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.Direction",
      component: Direction,
      defaultProps: directionDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.TextJa",
      component: TextJa,
      defaultProps: textJaDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.TextJaEn",
      component: TextJaEn,
      defaultProps: textJaEnDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.TextQuad",
      component: TextQuad,
      defaultProps: textQuadDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.SpecLine",
      component: SpecLine,
      defaultProps: specLineDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.Spacing",
      component: Spacing,
      defaultProps: spacingDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.Blank",
      component: Blank,
      defaultProps: blankDefaultProps,
    },
    {
      displayName: "themes.tokyo-metro.components.Frame",
      component: Frame,
      defaultProps: frameDefaultProps,
    },
  ],
};

export default theme;
