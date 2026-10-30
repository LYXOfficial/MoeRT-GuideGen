import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import type { PropForm } from "../../../../interfaces/editor";

/**
 * 语言块表单工厂：一种语言 = 文本 + 字号 + 字重 + 字距 + 行距。
 * 东京主题的 TextJa / TextJaEn / TextQuad 三件都用它拼表单，
 * 保证「每个语种都能独立调」这件事在编辑器里长得一样。
 *
 * `scope` 例：`themes.tokyo-metro.components.TextQuad.props`，
 * `prefix` 例：`ja` → 键为 `ja` / `jaSize` / `jaWeight` / `jaSpacing` / `jaLineGap`。
 */
export function langFormItems(
  t: (key: string) => string,
  scope: string,
  prefix: string
): PropForm[] {
  return [
    {
      key: prefix,
      label: `${scope}.${prefix}`,
      // 折行宽度已废弃：需要换行的字段直接用多行输入，回车即换行
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: `${prefix}Size`,
      label: `${scope}.${prefix}Size`,
      element: <InputNumber min={6} max={64} />,
    },
    {
      key: `${prefix}Weight`,
      label: `${scope}.${prefix}Weight`,
      element: (
        <Select>
          <Select.Option value={400}>
            {t("themes.tokyo-metro.common.weight.normal")}
          </Select.Option>
          <Select.Option value={500}>
            {t("themes.tokyo-metro.common.weight.medium")}
          </Select.Option>
          <Select.Option value={700}>
            {t("themes.tokyo-metro.common.weight.bold")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: `${prefix}Spacing`,
      label: `${scope}.${prefix}Spacing`,
      element: <InputNumber min={-4} max={16} step={0.5} />,
    },
    {
      key: `${prefix}LineGap`,
      label: `${scope}.${prefix}LineGap`,
      element: <InputNumber min={0} max={32} />,
    },
  ];
}
