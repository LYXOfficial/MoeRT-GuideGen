import { InputNumber, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";
import { ARROWS } from "./icons/arrows";
import { ARROW_DIRS, type ArrowDir } from "./define/shapes";
import { ARROW_EDGE_PAD, ROW_H } from "./define/layout";

/**
 * 箭头：官方 16 种（LTA Manual §7.5），一个组件全部装下。
 * 几何直接来自手册 PDF 矢量，禁止手改坐标。
 */
export interface ArrowProps {
  dir?: ArrowDir;
  /** 箭头高度（px） */
  size?: number;
  color?: string;
  background?: string;
}

export const arrowDefaultProps: ArrowProps = {
  dir: "left",
  size: 36,
  color: colors.foreground,
  background: colors.transparent,
};

const DIR_KEYS = Object.keys(ARROW_DIRS) as ArrowDir[];

export const arrowEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "dir",
      label: "themes.singapore.components.Arrow.props.dir",
      element: (
        <Select>
          {DIR_KEYS.map((d) => (
            <Select.Option key={d} value={d}>
              {t(`themes.singapore.common.dir.${d}`)}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "size",
      label: "themes.singapore.components.Arrow.props.size",
      element: <InputNumber min={12} max={120} />,
    },
    {
      key: "color",
      label: "themes.singapore.components.Arrow.props.color",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.singapore.components.Arrow.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

function Arrow({
  dir = arrowDefaultProps.dir,
  size = arrowDefaultProps.size,
  color = arrowDefaultProps.color,
  background = arrowDefaultProps.background,
}: ArrowProps) {
  const asset = ARROWS[ARROW_DIRS[dir as ArrowDir] ?? ARROW_DIRS.left];
  const [x, y, w, h] = asset.viewBox.split(" ").map(Number);
  const height = size ?? 42;
  const width = (height * w) / h;
  return (
    <div
      className="h-full"
      style={{
        height: ROW_H,
        display: "flex",
        alignItems: "center",
        background,
        paddingLeft: ARROW_EDGE_PAD,
        paddingRight: ARROW_EDGE_PAD,
      }}
    >
      <svg
        viewBox={asset.viewBox}
        width={width}
        height={height}
        style={{ display: "block" }}
        aria-hidden
      >
        <title>{`${x},${y}`}</title>
        <path d={asset.d} fill={color} />
      </svg>
    </div>
  );
}

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);

export default Arrow;
