import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
export interface ExitProps {
  letter: string;
  background?: string;
}
export const exitDefaultProps: ExitProps = {
  letter: "A",
  background: colors.background,
};
export const exitEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "letter",
      label: "themes.hongkong.components.Exit.props.letter",
      element: <Input maxLength={1} />,
    },
    {
      key: "background",
      label: "themes.hongkong.components.Exit.props.background",
      element: <CustomColorPicker currentTheme={2} />,
    },
  ],
});

function Exit({
  letter = exitDefaultProps.letter,
  background = exitDefaultProps.background,
}: ExitProps) {
  return (
    <div style={{ background: background }}>
      <div className="h-64px w-52px">
        <svg width={52} height={64}>
          <rect width={42} height={42} x={5} y={11} fill={colors.exitletter} />
          <text
            x={13}
            y={46}
            fontSize={42}
            letterSpacing={-3}
            fill={colors.foreground}
          >
            {letter}
          </text>
        </svg>
      </div>
    </div>
  );
}

Exit.getEditorConfig = (t: (key: string) => string) => exitEditorConfig(t);

export default Exit;
