import { ColorPicker } from "@douyinfe/semi-ui";
import type { EditorConfig } from "../../../interfaces/editor";
import colors from "./define/colors";

export interface SpecLineProps {
  foreground?: string;
  background?: string;
}
export const specLineDefaultProps = {
  foreground: colors["specline"],
  background: colors["background"],
};

export const specLineEditorConfig: EditorConfig = {
  forms: [
    {
      key: "foreground",
      label: "themes.chongqing.components.SpecLine.props.foreground",
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
          value={ColorPicker.colorStringToValue(specLineDefaultProps.foreground!)}
        />
      ),
    },
    {
      key: "background",
      label: "themes.chongqing.components.SpecLine.props.background",
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
          value={ColorPicker.colorStringToValue(specLineDefaultProps.background!)}
        />
      ),
    },
  ],
};

function SpecLine({
  background = specLineDefaultProps.background,
  foreground = specLineDefaultProps.foreground,
}: SpecLineProps) {
  return (
    <svg className="z-10" height={64} width={2} style={{ backgroundColor: background }}>
      <path d="M 0 10 L 2 10 L 2 54 L 0 54 Z" fill={foreground} />
    </svg>
  );
}

SpecLine.getEditorConfig = () => specLineEditorConfig;

export default SpecLine;