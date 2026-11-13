import type { CSSProperties, FC, ReactNode } from "react";
import { Input, InputNumber } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import type { PropForm } from "../../../interfaces/editor";

/** 组件背景：单色 div（新加坡：深藏青 / 深绿 / 深色，不做上下分色） */
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
      style={{ position: "relative", backgroundColor: background, ...style }}
    >
      {children}
    </div>
  );
}

/**
 * 本主题在 themereg 中的下标（0 重庆 / 1 成都 / 2 香港 / 3 北京 / 4 北京旧 /
 * 5 东京 / 6 上海 / 7 广州 / 8 新加坡）。顺序变了这里必须同步。
 */
export const THEME_INDEX = 8;

export const backgroundFormItems = (scope: string): PropForm[] => [
  {
    key: "background",
    label: `${scope}.background`,
    element: <CustomColorPicker currentTheme={THEME_INDEX} />,
  },
];

export const colorFormItem = (scope: string, key: string): PropForm => ({
  key,
  label: `${scope}.${key}`,
  element: <CustomColorPicker currentTheme={THEME_INDEX} />,
});

export const numberFormItem = (
  scope: string,
  key: string,
  _label: string,
  min = 0,
  max = 200,
  step = 1,
): PropForm => ({
  key,
  label: `${scope}.${key}`,
  element: <InputNumber min={min} max={max} step={step} />,
});

export const textFormItem = (scope: string, key: string): PropForm => ({
  key,
  label: `${scope}.${key}`,
  element: <Input />,
});

export const BackgroundBoxFC: FC<{ background?: string; children?: ReactNode }> = ({
  background,
  children,
}) => <BackgroundBox background={background}>{children}</BackgroundBox>;
