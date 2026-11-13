// 通用双行容器（theme-kit），这里绑定新加坡色板（8）与 i18n 前缀。
import {
  createTwoRowContainer,
  type TwoRowContainerProps,
} from "../../theme-kit/TwoRowContainer";

export type { TwoRowContainerProps };
export type TwoRowChildren = import("../../theme-kit/TwoRowContainer").TwoRowChildren;

const { component, defaultProps } = createTwoRowContainer(8, "themes.singapore");

export const twoRowContainerDefaultProps = defaultProps;
export default component;
