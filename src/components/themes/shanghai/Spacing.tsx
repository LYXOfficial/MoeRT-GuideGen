import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { MultiRowBackground, backgroundFormItems } from "./Background";

export interface SpacingProps {
  background?: string;
}

export const spacingDefaultProps: SpacingProps = {
  background: colors.transparent,
};

export const spacingEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [...backgroundFormItems("themes.shanghai.components.Spacing.props")],
});

function Spacing({
  background = spacingDefaultProps.background,
}: SpacingProps) {
  return (
    <MultiRowBackground
      background={background}
      className="flex-1 w-full h-full"
    />
  );
}

Spacing.getEditorConfig = (t: (key: string) => string) =>
  spacingEditorConfig(t);

export default Spacing;
