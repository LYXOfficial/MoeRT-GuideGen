import type { CSSProperties, FC, ReactNode } from "react";
import { Input, InputNumber, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import type { PropForm } from "../../../interfaces/editor";

/**
 * 组件背景：一层普通 div，直接铺背景色（广州同上海：单色背景，不做上下分色（三套预设靠换背景色实现））。
 */
export function BackgroundBox({
  background,
  className,
  style,
  children,
}: {
  background?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={className}
      // relative：站名等绝对定位元素需要这一层当定位基准
      style={{ position: "relative", backgroundColor: background, ...style }}
    >
      {children}
    </div>
  );
}

/**
 * 本主题在 src/components/themes/themereg.ts 中的下标。
 * CustomColorPicker 依赖它读取「本主题」的色板与颜色名 i18n：
 * 重庆 0 / 成都 1 / 香港 2 / 北京 3 / 北京旧 4 / 东京 5 / 上海 6 / 广州 7
 * —— 若调整 themereg 顺序，这里必须同步。
 */
export const THEME_INDEX = 7;

/**
 * 供各组件复用的「背景色（可两行）」编辑器表单项。
 * @param scope i18n 前缀，例如 "themes.guangzhou.components.Text.props"
 */
export const backgroundFormItems = (scope: string): PropForm[] => [
  {
    key: "background",
    label: `${scope}.background`,
    element: <CustomColorPicker currentTheme={THEME_INDEX} />,
  },
  // 广州同样不做上下分行分色：组件 props 里没有 background2。
];

/** 任意颜色字段（线路色、边框色等）：表单项标题取 `<scope>.<key>` */
export const colorFormItem = (scope: string, key: string): PropForm => ({
  key,
  label: `${scope}.${key}`,
  element: <CustomColorPicker currentTheme={THEME_INDEX} />,
});

/** 供各组件复用的「前景色」编辑器表单项 */
export const foregroundFormItem = (scope: string): PropForm => ({
  key: "foreground",
  label: `${scope}.foreground`,
  element: <CustomColorPicker currentTheme={THEME_INDEX} />,
});

/** 数值输入表单项的小工具 */
export const numberFormItem = (
  scope: string,
  key: string,
  label: string,
  step = 1
): PropForm => ({
  key,
  label: `${scope}.${label}`,
  element: <InputNumber step={step} />,
});

/**
 * 纯数字输入（受控）：只保留数字并限制最大位数。
 * 编辑器的 value/onChange 由 GuideBoard 注入，所以在组件内部做过滤，
 * 而不是给表单元素挂 onChange（那会被 GuideBoard 的注入覆盖）。
 */
export const DigitInput: FC<{
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
}> = ({ value = "", onChange, maxLength = 2 }) => (
  <Input
    value={value}
    maxLength={maxLength}
    onChange={next =>
      onChange?.(
        String(next ?? "")
          .replace(/\D/g, "")
          .slice(0, maxLength)
      )
    }
  />
);

/** 纯数字表单项：只允许数字、最多 maxLength 位 */
export const digitFormItem = (
  scope: string,
  key: string,
  maxLength = 2
): PropForm => ({
  key,
  label: `${scope}.${key}`,
  element: <DigitInput maxLength={maxLength} />,
});

/** 文本输入表单项的小工具 */
export const textFormItem = (
  scope: string,
  key: string,
  label = key
): PropForm => ({
  key,
  label: `${scope}.${label}`,
  element: <Input />,
});

/**
 * 字重下拉。字重文案全主题共用（themes.guangzhou.common.weight.*），
 * 避免 11 个组件 × 5 语言重复登记同一批选项。
 */
export const weightFormItem = (
  t: (key: string) => string,
  scope: string,
  key: string
): PropForm => ({
  key,
  label: `${scope}.${key}.displayName`,
  element: (
    <Select>
      <Select.Option value="normal">
        {t("themes.guangzhou.common.weight.normal")}
      </Select.Option>
      <Select.Option value="medium">
        {t("themes.guangzhou.common.weight.medium")}
      </Select.Option>
      <Select.Option value="bold">
        {t("themes.guangzhou.common.weight.bold")}
      </Select.Option>
    </Select>
  ),
});

/**
 * 通用下拉：选项文案取自 `themes.guangzhou.common.<group>.<value>`，
 * 表单项标题取自 `<scope>.<key>.displayName`。
 */
export const commonSelectFormItem = (
  t: (key: string) => string,
  scope: string,
  key: string,
  group: string,
  values: string[]
): PropForm => ({
  key,
  label: `${scope}.${key}.displayName`,
  element: (
    <Select>
      {values.map(value => (
        <Select.Option key={value} value={value}>
          {t(`themes.guangzhou.common.${group}.${value}`)}
        </Select.Option>
      ))}
    </Select>
  ),
});
