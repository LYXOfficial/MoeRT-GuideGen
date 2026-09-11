import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { MultiRowBackground, backgroundFormItems } from "./Background";

export interface SpacingProps {
  background?: string;
  background2?: string;
}

export const spacingDefaultProps: SpacingProps = {
  background: colors.background,
  background2: colors.background,
};

export const spacingEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [...backgroundFormItems("themes.beijing.components.Spacing.props")],
});

function Spacing({
  background = spacingDefaultProps.background,
  background2 = spacingDefaultProps.background2,
}: SpacingProps) {
  return (
    <MultiRowBackground
      background={background}
      background2={background2}
      className="flex-1 w-full h-full"
    />
  );
}

Spacing.getEditorConfig = (t: (key: string) => string) =>
  spacingEditorConfig(t);

export default Spacing;
