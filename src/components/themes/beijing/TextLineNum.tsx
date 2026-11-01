import colors from "./define/colors";
import LineNum, {
  textLineNumEditorConfig,
  type LineNumProps,
} from "./LineNum";
import type { EditorConfig } from "../../../interfaces/editor";

/**
 * 文字线路标（如「房山线 / Fangshan Line」）。
 *
 * 它就是**数字线路标去掉数字**的特化：底板、底部线路色带、字号、颜色、
 * size 档、左右延长全部沿用 LineNum 的那套实测版式 —— 数字留空时 LineNum 本来
 * 就会把中英两行在色块内居中（这套机制早就有），这里只是把它单独拆成一个组件，
 * 让用户在组件列表里一眼能分清「带数字的」和「只有线路名的」。
 */
export type TextLineNumProps = Omit<LineNumProps, "lineId">;

export const textLineNumDefaultProps: TextLineNumProps = {
  colorKey: "linefangshan",
  textZh: "房山线",
  textEn: "Fangshan Line",
  size: "default",
  extendLeft: 10,
  extendRight: 10,
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

export default function TextLineNum(props: TextLineNumProps) {
  // lineId 恒为空串：不渲染数字，且右侧不留数字位
  return <LineNum {...props} lineId="" />;
}

TextLineNum.getEditorConfig = (t: (key: string) => string): EditorConfig =>
  textLineNumEditorConfig(t);
