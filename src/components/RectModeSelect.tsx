import { Select } from "@douyinfe/semi-ui";

/**
 * 色块宽度选择器（「数字线路」「文字线路」共用）。
 *
 * 为什么单独包一层：老存档里没有 `rectMode` 字段，而编辑器是直接
 * `value={props[key]}` 往下发的（undefined），面板会显示成空白。
 * 组件渲染侧的兜底是「窄」，所以面板也要显示「窄」才对得上 —— 用默认参数接住 undefined。
 */
export default function RectModeSelect({
  value = "narrow",
  onChange,
  labelDefault,
  labelNarrow,
}: {
  value?: "default" | "narrow";
  onChange?: (value: any) => void;
  labelDefault: string;
  labelNarrow: string;
}) {
  return (
    <Select value={value} onChange={onChange}>
      <Select.Option value="default">{labelDefault}</Select.Option>
      <Select.Option value="narrow">{labelNarrow}</Select.Option>
    </Select>
  );
}
