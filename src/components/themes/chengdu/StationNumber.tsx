import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

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
    {
      lineNum: "2",
      stationNum: "02",
      color: colors.line2,
    },
    {
      lineNum: "S3",
      stationNum: "03",
      color: colors.lines3,
    },
  ],
};

export const stationNumberEditorConfig: EditorConfig = {
  forms: [],
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
            20
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
