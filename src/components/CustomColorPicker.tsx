import React, { useCallback } from "react";
import { ColorPicker as SemiColorPicker, Select } from "@douyinfe/semi-ui";
import themes from "./themes/themereg";
import { useTranslation } from "react-i18next";
interface CustomColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  currentTheme: number;
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  value,
  onChange,
  currentTheme,
}) => {
  const colors = themes[currentTheme][1].colors.colors;
  const { t } = useTranslation();
  // ColorPicker 的内部值
  const [colorPickerValue, setColorPickerValue] = React.useState(value);

  // 当外部 value 改变时，更新 ColorPicker
  React.useEffect(() => {
    setColorPickerValue(value);
  }, [value]);

  const handleColorPickerChange = useCallback(
    ({ hex }: { hex: string }) => {
      setColorPickerValue(hex);
      onChange?.(hex);
    },
    [onChange]
  );

  const handleSelectChange = useCallback(
    (value: any) => {
      if (value in colors) {
        const newColor = colors[value];
        setColorPickerValue(newColor);
        onChange?.(newColor);
      }
    },
    [onChange]
  );

  return (
    <div className="flex gap-2 items-center w-full">
      <SemiColorPicker
        alpha={false}
        value={SemiColorPicker.colorStringToValue(
          colorPickerValue || "#ffffff"
        )}
        onChange={handleColorPickerChange}
        usePopover={true}
        eyeDropper={true}
      />
      <Select
        value={
          Object.entries(colors).find(
            ([_, v]) => v === colorPickerValue
          )?.[0] || ""
        }
        onChange={handleSelectChange}
        placeholder="选择颜色变量"
        className="flex-1"
      >
        {Object.entries(colors).map(([key, colorValue]) => (
          <Select.Option key={key} value={key}>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded"
                style={{ backgroundColor: colorValue }}
              />
              {t(`${themes[currentTheme][0]}.colors.${key}`)}
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default CustomColorPicker;
