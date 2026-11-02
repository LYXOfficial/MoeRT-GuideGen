import "./fonts/sourcehansans.css";
import "./fonts/arial.css";
import "./fonts/serif.css";

import Text, { textDefaultProps } from "./Text.tsx";
import StationName, { stationNameDefaultProps } from "./StationName.tsx";
import LineBadge, { lineBadgeDefaultProps } from "./LineBadge.tsx";
import PlatformNum, { platformNumDefaultProps } from "./PlatformNum.tsx";
import StationNum, { stationNumDefaultProps } from "./StationNum.tsx";
import Direction, { directionDefaultProps } from "./Direction.tsx";
import Arrow, { arrowDefaultProps } from "./Arrow.tsx";
import OperatorLogo, { operatorLogoDefaultProps } from "./OperatorLogo.tsx";
import ExitNum, { exitNumDefaultProps } from "./ExitNum.tsx";
import Icon, { iconDefaultProps } from "./Icon.tsx";
import SpecLine, { specLineDefaultProps } from "./SpecLine.tsx";
import Spacing, { spacingDefaultProps } from "./Spacing.tsx";
import Blank, { blankDefaultProps } from "./Blank.tsx";

import colors, { fontFamilyZh } from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts";

/**
 * 广州地铁主题（悬挂吊顶导向牌）。
 *
 * 只做「悬挂导视牌」这一族（用户 2026-11-02 纠正过范围：站名牌墙、屏蔽门盖板、
 * 导向柱、柱面立体字都不算）。三套配色只换前后景色，不新增组件：
 * 默认（近黑 `#252225`）/ 出口（红 `#D41627`）/ 18 号线（灰 `#9E9F95`）。
 *
 * 线路色来自官方线网接口快照，箭头几何直接复用重庆（用户明确要求）。
 * 资料与实测见 docs/guangzhou/。
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
      displayName: "themes.guangzhou.components.LineBadge",
      component: LineBadge,
      defaultProps: lineBadgeDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.PlatformNum",
      component: PlatformNum,
      defaultProps: platformNumDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.StationNum",
      component: StationNum,
      defaultProps: stationNumDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.Direction",
      component: Direction,
      defaultProps: directionDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.StationName",
      component: StationName,
      defaultProps: stationNameDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.Text",
      component: Text,
      defaultProps: textDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.OperatorLogo",
      component: OperatorLogo,
      defaultProps: operatorLogoDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.ExitNum",
      component: ExitNum,
      defaultProps: exitNumDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.Icon",
      component: Icon,
      defaultProps: iconDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.Arrow",
      component: Arrow,
      defaultProps: arrowDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.SpecLine",
      component: SpecLine,
      defaultProps: specLineDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.Spacing",
      component: Spacing,
      defaultProps: spacingDefaultProps,
    },
    {
      displayName: "themes.guangzhou.components.Blank",
      component: Blank,
      defaultProps: blankDefaultProps,
    },
  ],
};

export default theme;
