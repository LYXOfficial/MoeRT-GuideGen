import { ColorPicker, InputNumber } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";

export interface BlankProps {
  background?: string;
  width?: number;
}
export const blankDefaultProps: BlankProps = {
  background: colors["background"],
  width: 20,
};
export const blankEditorConfig: EditorConfig = {
  forms: [
    {
      key: "width",
      label: "themes.chongqing.components.Blank.props.width",
      element: <InputNumber />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.Blank.props.background",
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
          value={ColorPicker.colorStringToValue(blankDefaultProps.background!)}
        />
      ),
    },
  ],
};

function Blank({
  background = blankDefaultProps.background,
  width = blankDefaultProps.width,
}: BlankProps) {
  return (
    <div
      className="h-full"
      style={{ backgroundColor: background, width: width }}
    ></div>
  );
}

Blank.getEditorConfig = () => blankEditorConfig;

export default Blank;
