import { createContext } from "react";

/**
 * 当前正在编辑的组件的 props。
 *
 * 编辑弹窗里的表单元素（比如图标下拉框的预览）需要跟随组件的实时配色，
 * 但这些元素是在 getEditorConfig 里一次性建好的，Semi 又会把 option 的
 * children 缓存成同一个元素引用 —— 元素引用不变时 React 会跳过整棵子树，
 * 把颜色写死在元素里就更新不了。走 context 则不受影响：context 变化一定
 * 会让消费它的组件重新渲染。
 */
export const EditingPropsContext = createContext<Record<string, any>>({});
