import { Button, Input, Select, Typography } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../../CustomColorPicker";
import { excludeColorKeysFor } from "../../../../utils/colorKeys";
import themeColors from "../define/colors";

/** 一枚小徽章（Direction 用）：字母 / 数字 / 颜色 / 形状 / 环厚 */
export interface BadgeItem {
  letter: string;
  number?: string;
  color?: string;
  shape?: "circle" | "rect";
  thickness?: "normal" | "thick";
}

export interface BadgeListLabels {
  letter: string;
  number: string;
  color: string;
  shape: string;
  thickness: string;
  circle: string;
  rect: string;
  normal: string;
  thick: string;
  add: string;
  remove: string;
}

/**
 * 徽章列表编辑器 —— **照成都 StationNumber 的那套增减 UI**：
 * 每一枚徽章是一张带边框的小卡片（颜色 / 字母 / 数字 / 形状 / 环厚各一行），
 * 卡片下方居中放一对 `+` / `-`：`+` 追加一枚，`-` 删掉最后一枚。
 */
export default function BadgeListEditor({
  value,
  onChange,
  labels,
}: {
  value?: BadgeItem[];
  onChange?: (next: BadgeItem[]) => void;
  labels: BadgeListLabels;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (i: number, patch: Partial<BadgeItem>) =>
    onChange?.(list.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const add = () =>
    onChange?.([
      ...list,
      // 新增的徽章给个能看见的默认值（空字母会渲染成 0 宽的死件）
      { letter: "A", number: "", color: "#00a7db", shape: "circle", thickness: "normal" },
    ]);
  const removeLast = () => onChange?.(list.slice(0, -1));

  const rowCls = "flex items-center mb-2";
  const labelCls = "w-16 mr-2 shrink-0";

  return (
    <div className="w-full space-y-3">
      {list.map((b, i) => (
        <div
          key={i}
          className="rounded-sm border border-solid border-gray-300 p-3 dark:border-[#3a3b42]"
        >
          <div className="mb-2">
            <CustomColorPicker
              currentTheme={5}
              value={b.color || "#00a7db"}
              // 徽章色属于「底色类」：按铁律不列任何 *前景色* 常量
              excludeKeys={excludeColorKeysFor(themeColors, "background")}
              onChange={(color: string) => update(i, { color })}
            />
          </div>

          <div className={rowCls}>
            <Typography.Text size="small" className={labelCls}>
              {labels.letter}
            </Typography.Text>
            <Input
              size="small"
              value={b.letter ?? ""}
              onChange={(v: string) => update(i, { letter: String(v ?? "").toUpperCase() })}
            />
          </div>

          <div className={rowCls}>
            <Typography.Text size="small" className={labelCls}>
              {labels.number}
            </Typography.Text>
            <Input
              size="small"
              value={b.number ?? ""}
              onChange={(v: string) => update(i, { number: String(v ?? "") })}
            />
          </div>

          <div className={rowCls}>
            <Typography.Text size="small" className={labelCls}>
              {labels.shape}
            </Typography.Text>
            <Select
              size="small"
              value={b.shape ?? "circle"}
              style={{ width: "100%" }}
              onChange={(v: any) => update(i, { shape: v as "circle" | "rect" })}
            >
              <Select.Option value="circle">{labels.circle}</Select.Option>
              <Select.Option value="rect">{labels.rect}</Select.Option>
            </Select>
          </div>

          <div className="flex items-center">
            <Typography.Text size="small" className={labelCls}>
              {labels.thickness}
            </Typography.Text>
            <Select
              size="small"
              value={b.thickness ?? "normal"}
              style={{ width: "100%" }}
              onChange={(v: any) => update(i, { thickness: v as "normal" | "thick" })}
            >
              <Select.Option value="normal">{labels.normal}</Select.Option>
              <Select.Option value="thick">{labels.thick}</Select.Option>
            </Select>
          </div>
        </div>
      ))}

      {/* 底部增减按钮：与成都 StationNumber 一致 */}
      <div className="flex items-center justify-center gap-2">
        <Button type="primary" size="small" onClick={add} title={labels.add}>
          +
        </Button>
        {list.length > 0 && (
          <Button type="danger" size="small" onClick={removeLast} title={labels.remove}>
            -
          </Button>
        )}
      </div>
    </div>
  );
}
