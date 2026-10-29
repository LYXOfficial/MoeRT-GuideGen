import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  Background,
  backgroundFormItems,
  numberFormItem,
} from "./Background";

export interface BlankProps {
  width?: number;
  background?: string;
}

export const blankDefaultProps: BlankProps = {
  width: 20,
  background: colors.transparent,
};

export const blankEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    numberFormItem("themes.beijingOld.components.Blank.props", "width", "width", 10),
    ...backgroundFormItems("themes.beijingOld.components.Blank.props"),
  ],
});

function Blank({
  width = blankDefaultProps.width,
  background = blankDefaultProps.background,
}: BlankProps) {
  return (
    <Background
      background={background}
      className="h-full"
      style={{ width: width ?? 20 }}
    />
  );
}

Blank.getEditorConfig = (t: (key: string) => string) => blankEditorConfig(t);

export default Blank;
