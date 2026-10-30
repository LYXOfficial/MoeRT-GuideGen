import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Background, backgroundFormItems } from "./Background";

export interface SpacingProps {
  background?: string;
}

export const spacingDefaultProps: SpacingProps = {
  background: colors.transparent,
};

export const spacingEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [...backgroundFormItems("themes.tokyo-metro.components.Spacing.props")],
});

function Spacing({
  background = spacingDefaultProps.background,
}: SpacingProps) {
  return (
    <Background
      background={background}
      className="flex-1 w-full h-full"
    />
  );
}

Spacing.getEditorConfig = (t: (key: string) => string) =>
  spacingEditorConfig(t);

export default Spacing;
