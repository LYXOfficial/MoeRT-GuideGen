import type { CSSProperties, FC, ReactNode } from "react";
import { Input, InputNumber, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import type { PropForm } from "../../../interfaces/editor";

/**
 * 多行背景：所有北京组件的背景色都支持「多行」，
 * 例如 background = 6 号线色、background2 = S1 号线色，即上下各占一半。
 */
export const backgroundRows = (
  background?: string,
  background2?: string
): string[] => {
  const rows = [background, background2].filter(
    (c): c is string => typeof c === "string" && c.length > 0
  );
  return rows.length > 0 ? rows : ["transparent"];
};

export function MultiRowBackground({
  background,
  background2,
  className,
  style,
  children,
}: {
  background?: string;
  background2?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const rows = backgroundRows(background, background2);
  // 用「硬停」渐变一次画完多行背景：原来是 flex 子块各占一半，
  // 高度出现小数时（如组件被缩放 0.62，或 65px 高）两行之间会露出 1px 的缝。
  const bgStyle: CSSProperties =
    rows.length === 1
      ? { backgroundColor: rows[0] }
      : {
          background: `linear-gradient(to bottom, ${rows
            .map(
              (color, index) =>
                `${color} ${(index / rows.length) * 100}% ${
                  ((index + 1) / rows.length) * 100
                }%`
            )
            .join(", ")})`,
        };
  return (
    <div className={className} style={{ position: "relative", ...style }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, ...bgStyle }} />
      <div style={{ position: "relative", height: "100%" }}>{children}</div>
    </div>
  );
}

/**
 * 本主题在 src/components/themes/themereg.ts 中的下标。
 * CustomColorPicker 依赖它读取「本主题」的色板与颜色名 i18n：
 * 重庆 0 / 成都 1 / 香港 2 / 北京 3 —— 若调整 themereg 顺序，这里必须同步。
 */
export const THEME_INDEX = 3;

/**
 * 供各组件复用的「背景色（可两行）」编辑器表单项。
 * @param scope i18n 前缀，例如 "themes.beijing.components.Text.props"
 */
export const backgroundFormItems = (scope: string): PropForm[] => [
  {
    key: "background",
    label: `${scope}.background`,
    element: <CustomColorPicker currentTheme={THEME_INDEX} />,
  },
  {
    key: "background2",
    label: `${scope}.background2`,
    element: <CustomColorPicker currentTheme={THEME_INDEX} />,
  },
];

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
 * 字重下拉。字重文案全主题共用（themes.beijing.common.weight.*），
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
        {t("themes.beijing.common.weight.normal")}
      </Select.Option>
      <Select.Option value="medium">
        {t("themes.beijing.common.weight.medium")}
      </Select.Option>
      <Select.Option value="bold">
        {t("themes.beijing.common.weight.bold")}
      </Select.Option>
    </Select>
  ),
});

/**
 * 通用下拉：选项文案取自 `themes.beijing.common.<group>.<value>`，
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
          {t(`themes.beijing.common.${group}.${value}`)}
        </Select.Option>
      ))}
    </Select>
  ),
});
