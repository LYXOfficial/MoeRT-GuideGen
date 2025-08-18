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
    const newLine = {
      lineNum: "1",
      stationNum: "01",
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
          className="border border-solid border-gray-300 p-3 rounded"
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
};

export const stationNumberEditorConfig: EditorConfig = {
  forms: [
    {
      key: "lines",
      label: "themes.chengdu.components.StationNumber.props.lines",
      element: <LineArrayEditor />,
    },
  ],
};

export default function StationNumber({
  lines = stationNumberDefaultProps.lines,
}: StationNumberProps) {
  return (
    <div className="h-64px flex" style={{ backgroundColor: colors.background }}>
      <div
        className="h-64px mt-auto mb-auto p-10px flex flex-col flex-wrap gap-5px align-center justify-center"
        style={{
          width:
            (35 * (lines.length + (lines.length % 2))) / 2 +
            (5 * (lines.length - (lines.length % 2))) / 2 +
            20,
        }}
      >
        {lines.map(line => (
          <div
            className="w-35px h-15px border-1px rounded-10px border-solid flex align-center justify-center"
            style={{
              borderColor: line.color,
              backgroundColor: colors.foreground,
              fontFamily: "Helvetica, sans-serif",
            }}
            key={`${line.lineNum}${line.stationNum}`}
          >
            <div
              style={{
                width: 17,
                textAlign: "center",
                color: line.color,
                fontSize: 11,
                lineHeight: "12px",
              }}
            >
              {line.lineNum}
            </div>
            <div
              style={{ width: 1, height: 15, backgroundColor: line.color }}
            ></div>
            <div
              style={{
                width: 17,
                textAlign: "center",
                color: line.color,
                fontSize: 11,
                lineHeight: "12px",
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
StationNumber.getEditorConfig = () => stationNumberEditorConfig;
