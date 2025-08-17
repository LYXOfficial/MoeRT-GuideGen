import type { EditorConfig } from "../../../interfaces/editor";
import colors from "./define/colors";
import CustomColorPicker from "../../CustomColorPicker";

export interface SpacingProps {
  background?: string;
}
export const spacingDefaultProps: SpacingProps = {
  background: colors.background,
};

export const spacingEditorConfig: EditorConfig = {
  forms: [
    {
      key: "background",
      label: "themes.chengdu.components.Spacing.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
};

function Spacing({
  background = spacingDefaultProps.background,
}: SpacingProps) {
  return (
    <div
      className="flex-1 w-full h-full"
      style={{ backgroundColor: background }}
    ></div>
  );
}

Spacing.getEditorConfig = () => spacingEditorConfig;

export default Spacing;
