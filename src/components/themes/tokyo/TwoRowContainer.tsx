// 通用双行容器（theme-kit），这里绑定东京地铁色板（5）与 i18n 前缀。
import {
  createTwoRowContainer,
  type TwoRowContainerProps,
} from "../../theme-kit/TwoRowContainer";

export type { TwoRowContainerProps };
export type TwoRowChildren = import("../../theme-kit/TwoRowContainer").TwoRowChildren;

const { component, defaultProps } = createTwoRowContainer(5, "themes.tokyo-metro");

export const twoRowContainerDefaultProps = defaultProps;
export default component;
