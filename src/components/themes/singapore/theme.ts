import "./fonts/lta-identity.css";

import Arrow, { arrowDefaultProps } from "./Arrow.tsx";
import LineBand, { lineBandDefaultProps } from "./LineBand.tsx";
import PlatformNum, { platformNumDefaultProps } from "./PlatformNum.tsx";
import Text, { textDefaultProps } from "./Text.tsx";
import LineCaplet, { lineCapletDefaultProps } from "./LineCaplet.tsx";
import StationName, { stationNameDefaultProps } from "./StationName.tsx";
import ExitBadge, { exitBadgeDefaultProps } from "./ExitBadge.tsx";
import ModeLogo, { modeLogoDefaultProps } from "./ModeLogo.tsx";
import TransferBlock, { transferBlockDefaultProps } from "./TransferBlock.tsx";
import Icon, { iconDefaultProps } from "./Icon.tsx";
import Spacing, { spacingDefaultProps } from "./Spacing.tsx";
import SpecLine, { specLineDefaultProps } from "./SpecLine.tsx";
import Blank, { blankDefaultProps } from "./Blank.tsx";
import TwoRowContainer, { twoRowContainerDefaultProps } from "./TwoRowContainer.tsx";

import colors, { fontFamilyEn } from "./define/colors.ts";
import type Theme from "../../../interfaces/theme.ts";

/**
 * 新加坡 MRT 主题（LTA 导视体系）。
 *
 * 范围（用户 2026-11-13 拍板）：只做「吊顶多行导向牌 + 站名牌（按行拼）+ 站台门板站名条」，
 * 不做 Board / StationPlate / PlateFrame。共 14 个组件（含可选 SpecLine / Spacing / Blank / 双行容器）；
 * Arrow 一个组件装下官方 14 种箭头。
 * 资料、官方矢量与实测见 docs/singapore/。
 */
const theme: Theme = {
  colors: {
    defaultBackground: colors.panelNavy,
    defaultForeground: colors.foreground,
    defaultBorder: colors.border,
    colors: { ...colors },
  },
  fontFamily: fontFamilyEn,
  components: [
    { displayName: "themes.singapore.components.Arrow", component: Arrow, defaultProps: arrowDefaultProps },
    { displayName: "themes.singapore.components.Text", component: Text, defaultProps: textDefaultProps },
    { displayName: "themes.singapore.components.ModeLogo", component: ModeLogo, defaultProps: modeLogoDefaultProps },
    { displayName: "themes.singapore.components.PlatformNum", component: PlatformNum, defaultProps: platformNumDefaultProps },
    { displayName: "themes.singapore.components.LineCaplet", component: LineCaplet, defaultProps: lineCapletDefaultProps },
    { displayName: "themes.singapore.components.LineBand", component: LineBand, defaultProps: lineBandDefaultProps },
    { displayName: "themes.singapore.components.TransferBlock", component: TransferBlock, defaultProps: transferBlockDefaultProps },
    { displayName: "themes.singapore.components.StationName", component: StationName, defaultProps: stationNameDefaultProps },
    { displayName: "themes.singapore.components.ExitBadge", component: ExitBadge, defaultProps: exitBadgeDefaultProps },
    { displayName: "themes.singapore.components.Icon", component: Icon, defaultProps: iconDefaultProps },
    { displayName: "themes.singapore.components.SpecLine", component: SpecLine, defaultProps: specLineDefaultProps },
    { displayName: "themes.singapore.components.Spacing", component: Spacing, defaultProps: spacingDefaultProps },
    { displayName: "themes.singapore.components.Blank", component: Blank, defaultProps: blankDefaultProps },
    { displayName: "themes.singapore.components.TwoRowContainer", component: TwoRowContainer, defaultProps: twoRowContainerDefaultProps },
  ],
};

export default theme;
