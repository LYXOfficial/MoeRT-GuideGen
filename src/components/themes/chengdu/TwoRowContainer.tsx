// 双行容器已抽成通用实现（src/components/theme-kit/TwoRowContainer.tsx），
// 这里只做「成都主题」的绑定：色板 = 1、i18n 前缀 = themes.chengdu。
import {
  createTwoRowContainer,
  type TwoRowContainerProps,
} from "../../theme-kit/TwoRowContainer";

export type { TwoRowContainerProps };
export type TwoRowChildren = import("../../theme-kit/TwoRowContainer").TwoRowChildren;

const { component, defaultProps } = createTwoRowContainer(1, "themes.chengdu");

export const twoRowContainerDefaultProps = defaultProps;
export default component;
