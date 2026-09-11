import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  numberFormItem,
} from "./Background";

export interface BlankProps {
  width?: number;
  background?: string;
  background2?: string;
}

export const blankDefaultProps: BlankProps = {
  width: 20,
  background: colors.background,
  background2: colors.background,
};

export const blankEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    numberFormItem("themes.beijing.components.Blank.props", "width", "width", 10),
    ...backgroundFormItems("themes.beijing.components.Blank.props"),
  ],
});

function Blank({
  width = blankDefaultProps.width,
  background = blankDefaultProps.background,
  background2 = blankDefaultProps.background2,
}: BlankProps) {
  return (
    <MultiRowBackground
      background={background}
      background2={background2}
      className="h-full"
      style={{ width: width ?? 20 }}
    />
  );
}

Blank.getEditorConfig = (t: (key: string) => string) => blankEditorConfig(t);

export default Blank;
