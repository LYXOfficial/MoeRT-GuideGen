import { InputNumber } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

export interface BlankProps {
  background?: string;
  width?: number;
}
export const blankDefaultProps: BlankProps = {
  background: colors.background,
  width: 20,
};
export const blankEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "width",
      label: "themes.chongqing.components.Blank.props.width",
      element: <InputNumber />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.Blank.props.background",
      element: <CustomColorPicker currentTheme={0} />,
    },
  ],
});

function Blank({
  background = blankDefaultProps.background,
  width = blankDefaultProps.width,
}: BlankProps) {
  return (
    <div
      className="h-full"
      style={{ backgroundColor: background, width: width }}
    ></div>
  );
}

Blank.getEditorConfig = (t: (key: string) => string) => blankEditorConfig(t);

export default Blank;
