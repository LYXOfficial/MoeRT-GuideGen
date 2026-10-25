import React, { useCallback } from "react";
import { ColorPicker as SemiColorPicker, Select } from "@douyinfe/semi-ui";
import themes from "./themes/themereg";
import { useTranslation } from "react-i18next";
interface CustomColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  currentTheme: number;
}

/**
 * ColorPicker 弹出面板的大致高度（px，实测 296×344，alpha=false 时）。
 * 只用来判断"往下弹得下吗"，估大一点更安全。
 */
const PANEL_HEIGHT = 352;

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  value,
  onChange,
  currentTheme,
}) => {
  const colors = themes[currentTheme][1].colors.colors;
  const { t } = useTranslation();
  // ColorPicker 的内部值
  const [colorPickerValue, setColorPickerValue] = React.useState(value);

  // 弹出方向自己算：编辑弹窗常常贴着屏幕下沿，面板约 344px 高，
  // 往下弹会被视口裁掉一半；Semi 的 autoAdjustOverflow 以 body 为容器判断溢出，
  // body 比视口高，所以它永远认为"放得下"，不会翻转（Select 有自己的一套逻辑，没这问题）。
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = React.useState<"bottomLeft" | "topLeft">(
    "bottomLeft"
  );

  // 面板 296 宽，窄屏（手机 390）时会被弹到视口外一截，右边（hex / 吸管）看不见。
  // Semi 自己不会救（autoAdjustOverflow 以 body 为容器判，永远觉得放得下），
  // 而且它会在入场动画结束之后再定位一次，所以不能只量一次 —— 这里连跟 ~90 帧
  // （≈1.5s，面板消失就停），每次都用 CSS 的独立 `translate` 属性把它推回视口内。
  // 不用 transform：Semi 的入场动画在 transform 上，fill-mode: forwards 会盖住内联样式。
  const nudgePanelIntoView = React.useCallback(() => {
    let frames = 0;
    const step = () => {
      const panel = document.querySelector<HTMLElement>(
        ".semi-colorPicker-popover"
      );
      if (panel) {
        const margin = 8;
        // 先清掉自己上一次写的偏移再量，否则量到的是「已经纠偏后」的位置，
        // 下一帧算出 0 又把它推回去 —— 来回振荡，最后停在没纠偏的状态
        panel.style.translate = "";
        const rect = panel.getBoundingClientRect();
        let dx = 0;
        let dy = 0;
        if (rect.right > window.innerWidth - margin) {
          dx = window.innerWidth - margin - rect.right;
        }
        if (rect.left + dx < margin) dx = margin - rect.left;
        if (rect.bottom > window.innerHeight - margin) {
          dy = window.innerHeight - margin - rect.bottom;
        }
        if (rect.top + dy < margin) dy = margin - rect.top;
        panel.style.translate = dx || dy ? `${dx}px ${dy}px` : "";
      }
      frames += 1;
      if (frames < 90) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  /** 打开前先定方向，并排几次定时纠偏（面板是异步挂载的，onVisibleChange 靠不住） */
  const updatePlacement = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const next: "bottomLeft" | "topLeft" =
      spaceBelow >= PANEL_HEIGHT + 8
        ? "bottomLeft"
        : spaceAbove >= PANEL_HEIGHT + 8
          ? "topLeft"
          : spaceBelow >= spaceAbove
            ? "bottomLeft"
            : "topLeft";
    setPlacement(prev => (prev === next ? prev : next));
    nudgePanelIntoView();
  }, [nudgePanelIntoView]);

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
    <div
      ref={wrapRef}
      className="flex gap-2 items-center w-full"
      // 打开前先量一次：pointerdown 早于 Popover 的点击展开，方向不会先弹错再跳
      onPointerDown={updatePlacement}
      onFocus={updatePlacement}
    >
      <SemiColorPicker
        alpha={false}
        value={SemiColorPicker.colorStringToValue(
          colorPickerValue || "#ffffff"
        )}
        onChange={handleColorPickerChange}
        usePopover={true}
        eyeDropper={true}
        popoverProps={{
          position: placement,
          autoAdjustOverflow: true,
          rePosKey: placement,
        }}
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
            <div className="flex min-w-0 items-center gap-2">
              {/* shrink-0：颜色名较长时色块不能被压扁 */}
              <span
                className="inline-block h-4 w-4 shrink-0 rounded-sm"
                style={{ backgroundColor: colorValue }}
              />
              <span className="truncate">
                {t(`${themes[currentTheme][0]}.colors.${key}`)}
              </span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default CustomColorPicker;
