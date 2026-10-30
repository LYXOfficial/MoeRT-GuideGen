import { Input, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import { weightCss } from "./define/text";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  Background,
  backgroundFormItems,
  foregroundFormItem,
  numberFormItem,
} from "./Background";

/**
 * ExitNum —— 出口编号（**只有数字/字母**）。
 *
 * 不含「出口 / Exit」两段式黑块（那一块用户明确不要）。
 * 大号数字/字母，浅底深字或深底浅字都靠前景/背景色切换；
 * 多出口连写用「1·2」（中间点 U+00B7）。
 * 需要白色圆角底板时放进 `Frame` 容器里。
 */
export interface ExitNumProps {
  /** 编号，如 "1" / "2" / "A2" / "1·2" */
  text: string;
  fontSize?: number;
  weight?: "normal" | "medium" | "bold";
  /** 字距（px，负数收紧） */
  letterSpacing?: number;
  foreground?: string;
  background?: string;
}

export const exitNumDefaultProps: ExitNumProps = {
  text: "1",
  fontSize: 48,
  weight: "bold",
  letterSpacing: -1,
  // 出口编号默认走「出口」那一套配色：黄底 + 黑字
  foreground: colors.exitforeground,
  background: colors.exitbackground,
};

export const exitNumEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "text",
      label: "themes.tokyo-metro.components.ExitNum.props.text",
      element: <Input />,
    },
    numberFormItem("themes.tokyo-metro.components.ExitNum.props", "fontSize", "fontSize"),
    {
      key: "weight",
      label: "themes.tokyo-metro.components.ExitNum.props.weight.displayName",
      element: (
        <Select>
          <Select.Option value="normal">
            {_t("themes.tokyo-metro.common.weight.normal")}
          </Select.Option>
          <Select.Option value="medium">
            {_t("themes.tokyo-metro.common.weight.medium")}
          </Select.Option>
          <Select.Option value="bold">
            {_t("themes.tokyo-metro.common.weight.bold")}
          </Select.Option>
        </Select>
      ),
    },
    numberFormItem(
      "themes.tokyo-metro.components.ExitNum.props",
      "letterSpacing",
      "letterSpacing"
    ),
    foregroundFormItem("themes.tokyo-metro.components.ExitNum.props"),
    ...backgroundFormItems("themes.tokyo-metro.components.ExitNum.props"),
  ],
});

function ExitNum({
  text = exitNumDefaultProps.text,
  fontSize = exitNumDefaultProps.fontSize,
  weight = exitNumDefaultProps.weight,
  letterSpacing = exitNumDefaultProps.letterSpacing,
  foreground = exitNumDefaultProps.foreground,
  background = exitNumDefaultProps.background,
}: ExitNumProps) {
  return (
    <Background
      background={background}
      className="flex h-16 items-center justify-center px-1"
      style={{ color: foreground, fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <span
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: weightCss(weight ?? "bold"),
          fontSize,
          letterSpacing,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </Background>
  );
}

ExitNum.getEditorConfig = (t: (key: string) => string) =>
  exitNumEditorConfig(t);

export default ExitNum;
