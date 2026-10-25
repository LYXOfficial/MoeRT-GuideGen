import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import { Input, Button, Typography } from "@douyinfe/semi-ui";

// LineArrayEditor 组件，专门用于 StationNumber
function LineArrayEditor({
  value = stationNumberDefaultProps.lines,
  onChange,
}: {
  value?: any;
  onChange?: (value: any) => void;
}) {
  const lines = Array.isArray(value) ? value : [];

  const handleLineChange = (index: number, field: string, newValue: string) => {
    const newLines = lines.map((line: any, i: number) =>
      i === index ? { ...line, [field]: newValue } : line
    );
    onChange?.(newLines);
  };

  const handleAddLine = () => {
    if (lines.length >= 4) return; // 最多4个线路
    // 新条目不要照抄「1 / 01」：以前每次都复制相同的一行，
    // key 撞在一起（React 报 duplicate key）→ 新胶囊根本画不出来，看起来像「+ 点了没反应」
    const next = lines.length + 1;
    const newLine = {
      lineNum: String(next),
      stationNum: String(next).padStart(2, "0"),
      color: colors.line1,
    };
    onChange?.([...lines, newLine]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = lines.filter((_: any, i: number) => i !== index);
    onChange?.(newLines);
  };

  return (
    <div className="space-y-3">
      {lines.map((line: any, index: number) => (
        <div
          key={index}
          className="border border-solid border-gray-300 p-3 rounded-sm"
        >
          {/* 第一行：颜色选择器 */}
          <div className="mb-2">
            <CustomColorPicker
              currentTheme={1}
              value={line.color || colors.line1}
              onChange={color => handleLineChange(index, "color", color)}
            />
          </div>

          {/* 第二行：线路编号 */}
          <div className="flex items-center mb-2">
            <Typography.Text size="small" className="w-16 mr-2">
              线路号
            </Typography.Text>
            <Input
              size="small"
              value={line.lineNum}
              onChange={val => handleLineChange(index, "lineNum", val)}
              placeholder="如: 1"
            />
          </div>

          {/* 第三行：站点编号 */}
          <div className="flex items-center">
            <Typography.Text size="small" className="w-16 mr-2">
              站点号
            </Typography.Text>
            <Input
              size="small"
              value={line.stationNum}
              onChange={val => handleLineChange(index, "stationNum", val)}
              placeholder="如: 01"
            />
          </div>
        </div>
      ))}

      {/* 底部增减按钮 */}
      <div className="flex gap-2 align-center justify-center">
        <Button
          type="primary"
          size="small"
          onClick={handleAddLine}
          disabled={lines.length >= 4}
        >
          +
        </Button>
        {lines.length > 0 && (
          <Button
            type="danger"
            size="small"
            onClick={() => handleRemoveLine(lines.length - 1)}
          >
            -
          </Button>
        )}
      </div>
    </div>
  );
}

export interface StationNumberProps {
  lines: Line[];
  foreground?: string;
  background?: string;
}
export interface Line {
  lineNum: string;
  stationNum: string;
  color: string;
}
export const stationNumberDefaultProps: StationNumberProps = {
  lines: [
    {
      lineNum: "1",
      stationNum: "01",
      color: colors.line1,
    },
  ],
  foreground: colors.foreground,
  background: colors.background,
};

export const stationNumberEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "lines",
      label: "themes.chengdu.components.StationNumber.props.lines",
      element: <LineArrayEditor />,
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.StationNumber.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.StationNumber.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

export default function StationNumber({
  lines = stationNumberDefaultProps.lines,
  foreground = stationNumberDefaultProps.foreground ?? colors.foreground,
  background = stationNumberDefaultProps.background ?? colors.background,
}: StationNumberProps) {
  // 一行能竖着排几个：胶囊 15 高 + 行距 5，上下只留 4px 内边距（64 - 8 = 56 → 3 个刚好 55）
  // 以前上下各 10px 内边距，只剩 44 可用，装满 3 个就会挤成两列（用户反馈「三个站分两列很别扭」）。
  // 所以 1~3 个一律竖着一列，超过 3 个才换第二列，列数按 3 个/列算宽度。
  const ROWS_PER_COLUMN = 3;
  const PILL_W = 35;
  const PILL_H = 15;
  const PILL_GAP = 5;
  const PAD_X = 20;
  const columns = Math.max(1, Math.ceil(lines.length / ROWS_PER_COLUMN));
  // 一个列里塞到 3 个时，纵向整体缩一点（胶囊高度和行距一起收），
  // 否则 3×15 + 2×5 = 55 几乎顶满 64，看着挤成一坨、上下没留白
  const vScale = lines.length >= ROWS_PER_COLUMN ? 0.85 : 1;
  const pillH = PILL_H * vScale;
  const rowGap = PILL_GAP * vScale;

  return (
    <div className="h-16 flex" style={{ backgroundColor: background }}>
      <div
        className="h-16 mt-auto mb-auto py-1 px-2.5 flex flex-col flex-wrap items-center justify-center"
        style={{
          width: columns * PILL_W + (columns - 1) * PILL_GAP + PAD_X,
          gap: rowGap,
        }}
      >
        {lines.map((line, index) => (
          <div
            className="w-8.75 border-[1.4px] rounded-[10px] border-solid flex items-center justify-center"
            style={{
              height: pillH,
              borderColor: line.color,
              backgroundColor: foreground,
              fontFamily: "'Segoe UI', Helvetica, sans-serif",
            }}
            // 带上下标：两三行填成一样的号（1/01）时也不会撞 key
            key={`${line.lineNum}-${line.stationNum}-${index}`}
          >
            <div
              style={{
                width: 17,
                textAlign: "center",
                color: line.color,
                fontSize: 10,
                lineHeight: "11px",
              }}
            >
              {line.lineNum}
            </div>
            {/* 分隔线 = 本格的 1px 左边框：与胶囊描边同为 border stroke，
               任何缩放下粗细一致；align-self:stretch 拉满内高，贴合上下边框 */}
            <div
              style={{
                width: 17,
                textAlign: "center",
                color: line.color,
                fontSize: 10,
                lineHeight: "11px",
                alignSelf: "stretch",
                borderLeft: `1.4px solid ${line.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {line.stationNum}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 添加静态方法
StationNumber.getEditorConfig = (t: (key: string) => string) =>
  stationNumberEditorConfig(t);
