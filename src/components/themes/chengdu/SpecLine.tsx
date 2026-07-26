import type { EditorConfig } from "../../../interfaces/editor";
import colors from "./define/colors";
import CustomColorPicker from "../../CustomColorPicker";

export interface SpecLineProps {
  foreground?: string;
  background?: string;
}
export const specLineDefaultProps = {
  foreground: colors.specline,
  background: colors.background,
};

export const specLineEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "foreground",
      label: "themes.chengdu.components.SpecLine.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.SpecLine.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

function SpecLine({
  background = specLineDefaultProps.background,
  foreground = specLineDefaultProps.foreground,
}: SpecLineProps) {
  return (
    <svg
      className="z-100"
      height={64}
      width={2}
      style={{ backgroundColor: background }}
    >
      <path d="M 0 10 L 2 10 L 2 54 L 0 54 Z" fill={foreground} />
    </svg>
  );
}

SpecLine.getEditorConfig = (t: (key: string) => string) =>
  specLineEditorConfig(t);

export default SpecLine;
