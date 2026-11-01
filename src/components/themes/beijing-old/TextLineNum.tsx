import colors from "./define/colors";
import Line, { textLineNumEditorConfig, type LineProps } from "./Line";
import type { EditorConfig } from "../../../interfaces/editor";

/**
 * 文字线路标（经典样式，如「八通线 / Batong Line」）。
 *
 * 它就是**数字线路标去掉数字**的特化：牌面尺寸、圆角、字号、文字栏居中都沿用
 * Line 的那套实测版式（数字留空时 Line 本来就把两行文字在牌内居中），
 * 单独拆成组件只是为了在组件列表里一眼分清「带数字的」和「只有线路名的」。
 */
export type TextLineNumProps = Omit<LineProps, "lineId">;

export const textLineNumDefaultProps: TextLineNumProps = {
  colorKey: "lineyizhuang",
  textZh: "亦庄线",
  textEn: "Yizhuang Line",
  foreground: colors.foreground,
  background: colors.transparent,
};

export default function TextLineNum(props: TextLineNumProps) {
  // lineId 恒为空串：不渲染数字，牌面宽度只由文字决定
  return <Line {...props} lineId="" />;
}

TextLineNum.getEditorConfig = (t: (key: string) => string): EditorConfig =>
  textLineNumEditorConfig(t);
