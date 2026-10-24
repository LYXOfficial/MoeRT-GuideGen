import type { CSSProperties, FC, ReactNode } from "react";
import {
  ColorPicker,
  Input,
  InputNumber,
  Select,
} from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import themeColors from "./define/colors";
import type { PropForm } from "../../../interfaces/editor";

/**
 * 背景渲染器：旧版没有「上下分色」的双行背景，这里只按 background
 * 单色铺满（保留 MultiRowBackground 的名字与 hard-stop 渐变实现，
 * background2 不传即单色，避免动所有组件的调用结构）。
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
 * 重庆 0 / 成都 1 / 香港 2 / 北京 3 / 北京旧版 4 —— 若调整 themereg 顺序，这里必须同步。
 */
export const THEME_INDEX = 4;

/**
 * 供各组件复用的「背景色」编辑器表单项。
 * 旧版不做双行背景：编辑器只给一项背景色（组件内的 background2
 * 入参保留但不进表单，永远与 background 同色）。
 * @param scope i18n 前缀，例如 "themes.beijingOld.components.Text.props"
 */
export const backgroundFormItems = (scope: string): PropForm[] => [
  {
    key: "background",
    label: `${scope}.background`,
    element: <CustomColorPicker currentTheme={THEME_INDEX} />,
  },
];

/** 供各组件复用的「前景色」编辑器表单项 */
export const foregroundFormItem = (scope: string): PropForm => ({
  key: "foreground",
  label: `${scope}.foreground`,
  element: <CustomColorPicker currentTheme={THEME_INDEX} />,
});

/**
 * 可空颜色编辑器表单项：值可以是色板色 / 任意 hex / 空串（=「无」）。
 * 用于「方块颜色 / 描边颜色」这类允许不画的属性（ToTrain 等）。
 */
export const NullableColorField: FC<{
  value?: string;
  onChange?: (value: string) => void;
  t: (key: string) => string;
}> = ({ value, onChange, t }) => (
  <div className="flex w-full items-center gap-2">
    <ColorPicker
      alpha={false}
      value={ColorPicker.colorStringToValue(value || "#ffffff")}
      onChange={({ hex }: { hex: string }) => onChange?.(hex)}
      usePopover
    />
    <Select
      value={value ?? ""}
      onChange={(v: any) => onChange?.(String(v ?? ""))}
      className="flex-1"
    >
      <Select.Option value="">
        {t("themes.beijingOld.common.none")}
      </Select.Option>
      {Object.entries(themeColors).map(([key, colorValue]) => (
        <Select.Option key={key} value={colorValue}>
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="inline-block h-4 w-4 shrink-0 rounded-sm"
              style={{ backgroundColor: colorValue }}
            />
            <span className="truncate">
              {t(`themes.beijingOld.colors.${key}`)}
            </span>
          </div>
        </Select.Option>
      ))}
    </Select>
  </div>
);

/** 可空颜色表单项（label 规则同其它表单工厂） */
export const nullableColorFormItem = (
  t: (key: string) => string,
  scope: string,
  key: string
): PropForm => ({
  key,
  label: `${scope}.${key}`,
  element: <NullableColorField t={t} />,
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
 * 字重下拉。字重文案全主题共用（themes.beijingOld.common.weight.*），
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
        {t("themes.beijingOld.common.weight.normal")}
      </Select.Option>
      <Select.Option value="medium">
        {t("themes.beijingOld.common.weight.medium")}
      </Select.Option>
      <Select.Option value="bold">
        {t("themes.beijingOld.common.weight.bold")}
      </Select.Option>
    </Select>
  ),
});

/**
 * 通用下拉：选项文案取自 `themes.beijingOld.common.<group>.<value>`，
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
          {t(`themes.beijingOld.common.${group}.${value}`)}
        </Select.Option>
      ))}
    </Select>
  ),
});
