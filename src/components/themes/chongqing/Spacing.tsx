import { ColorPicker } from "@douyinfe/semi-ui";
import type { EditorConfig } from "../../../interfaces/editor";
import colors from "./define/colors";

export interface SpacingProps {
  background?: string;
}
export const spacingDefaultProps: SpacingProps = {
  background: colors["background"],
};

export const spacingEditorConfig: EditorConfig = {
  forms: [
    {
      key: "background",
      label: "themes.chongqing.components.Spacing.props.background",
      element: (
        <ColorPicker
          alpha={false}
          onChange={() => {}}
          usePopover={true}
          width={200}
          height={200}
          style={{
            border: "1px solid #ccc"
          }}
          value={ColorPicker.colorStringToValue(spacingDefaultProps.background!)}
        />
      ),
    },
  ],
};

function Spacing({
  background = spacingDefaultProps.background,
}: SpacingProps) {
  return (
    <div className="flex-1 w-full h-full" style={{ backgroundColor: background }}></div>
  );
}

Spacing.getEditorConfig = () => spacingEditorConfig;

export default Spacing;