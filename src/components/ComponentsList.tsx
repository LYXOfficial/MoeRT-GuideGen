import { useTranslation } from "react-i18next";
import { Card, Typography, Select, Modal, Checkbox } from "@douyinfe/semi-ui";
import themes from "./themes/themereg";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GuideItem } from "../interfaces/guide";
import type { PropForm } from "../interfaces/editor";
import { getVisibleClientRect } from "../utils/visibleRect";
import CustomColorPicker from "./CustomColorPicker";
import { excludeColorKeysFor } from "../utils/colorKeys";

interface ComponentsListProps {
  currentTheme: number;
  onThemeChange: (theme: number) => void;
  /** 移动端底部抽屉：占满整宽、去掉右侧分隔线 */
  fullWidth?: boolean;
  /** 底板背景色覆盖（null/undefined = 跟随主题默认），值在 GuideBoard 里 */
  boardBackground?: string | null;
  onBoardBackgroundChange?: (color: string | null) => void;
  /** 默认前景色覆盖（null/undefined = 跟随主题默认），值在 GuideBoard 里 */
  boardForeground?: string | null;
  onBoardForegroundChange?: (color: string | null) => void;
  /** 「组件虚线框」开关：给侧栏预览窗加和画板一致的同款虚线框 */
  showItemFrame?: boolean;
  onShowItemFrameChange?: (show: boolean) => void;
}

interface ComponentItemProps {
  name: string;
  Component: React.ComponentType<any>;
  type: string;
  props?: Record<string, any>;
  currentTheme: number;
  /** 卡片底色 / 文字色跟随底板背景色 / 默认前景色覆盖 */
  cardBackground?: string | null;
  cardForeground?: string | null;
  /** 「组件虚线框」开关：给预览窗加和画板一致的同款虚线框 */
  showItemFrame?: boolean;
}

// React.memo：画布平移时 Editor 全树重渲染，卡片 props 不变就整卡跳过
// （否则每帧对每张卡片跑 getEditorConfig + 重建组件预览，平移会巨卡）
const DraggableComponentItem = React.memo(function DraggableComponentItem({
  name,
  Component,
  type,
  props = {},
  currentTheme,
  cardBackground,
  cardForeground,
  showItemFrame,
}: ComponentItemProps) {
  const { t } = useTranslation();
  const [id] = useState(
    () => `${type}-${Math.random().toString(36).substring(2)}`
  );

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: {
      type,
      // 拖拽数据保持「干净」的默认 props（配色留空）——
      // 底板配色覆盖由 GuideBoard 渲染层实时解析，见下方的 previewProps
      item: {
        id,
        type,
        props,
        element: <Component {...props} />,
      } as GuideItem,
    },
  });

  // 侧栏预览用的配色：底板背景色/默认前景色覆盖时，卡片里的组件示例
  // 也跟着变色（只注入组件支持的属性，按编辑表单判断）。拖拽数据不带。
  const previewComponentProps = useMemo(() => {
    // 只有重庆主题的组件背景跟随底板配色；其余主题的背景不跟底板走
    if (currentTheme !== 0) return props;
    if (cardBackground == null && cardForeground == null) return props;
    const forms =
      (Component as any).getEditorConfig?.(t)?.forms ?? [];
    const keys = new Set(forms.map((f: PropForm) => f.key));
    return {
      ...props,
      ...(cardBackground != null && keys.has("background")
        ? { background: cardBackground }
        : {}),
      ...(cardForeground != null && keys.has("foreground")
        ? { foreground: cardForeground }
        : {}),
    };
  }, [props, Component, t, cardBackground, cardForeground]);
  // 间距/空格：侧栏里没有内容宽度，按 80px 宽渲染
  const isSpacingLike = type.includes("Spacing") || type.includes("Blank");

  // 跟随指针的是 DragOverlay，卡片本身留在原地当占位，
  // 否则卡片会被拖出侧栏，撑出横向滚动条。
  // touch-action: pan-y 让列表能上下滚动；触屏拖拽因此走 TouchSensor 的长按通道
  // （见 Editor 的 sensors，150ms），按住后竖直方向也能直接拖出来。
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ touchAction: "pan-y" }}
      className={`cursor-grab select-none w-full ${isDragging ? "opacity-50" : ""}`}
    >
      <Card
        className="mb-2 min-w-0"
        style={{
          backgroundColor:
            cardBackground ??
            themes[currentTheme][1].colors.defaultBackground,
        }}
      >
        <div
          className="h-16 flex items-center justify-center w-full overflow-hidden"
          style={{
            fontFamily: themes[currentTheme][1].fontFamily,
          }}
        >
          {/* 间距在侧栏里按 80px 宽渲染（撑满箭头）；空格 20px。
              它们没有固有内容宽度，不给定宽度会塌成不可见的一點。
              wrapper 撑满高度，间距/空格的 h-full 才有高度可撑 */}
          <div
            style={{
              position: "relative",
              height: "100%",
              ...(isSpacingLike
                ? { width: type.includes("Spacing") ? 80 : 20 }
                : {}),
            }}
          >
            {/* 双行容器要用预览模式，否则侧栏里的这份示例也会注册可拖放区域，
                把拖到侧栏的元件抢过去 */}
            {type.includes("TwoRowContainer") ? (
              <Component {...previewComponentProps} preview />
            ) : (
              <Component {...previewComponentProps} />
            )}
            {/* 侧栏预览窗的虚线：间距/空格常显（没有内容宽度的组件需要框
                指示可拖区域），其余组件受「组件虚线框」开关控制。
                分割线（3px 宽）除外：太窄根本渲染不对头 */}
            {(isSpacingLike || showItemFrame) && !type.includes("SpecLine") && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  border: `2px dashed ${themes[currentTheme][1].colors.defaultBorder}`,
                  pointerEvents: "none",
                }}
              />
            )}
            {/* 间距：撑满整个宽度的双向箭头——不跟随「组件虚线框」开关，
                否则关闭时 80px 的透明块什么都看不见，不知道拖的是间距 */}
            {isSpacingLike && type.includes("Spacing") && (
              <div
                style={{
                  position: "absolute",
                  left: 3,
                  right: 3,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                  color: themes[currentTheme][1].colors.defaultBorder,
                }}
              >
                <span
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                    borderRight: "6px solid currentColor",
                  }}
                />
                <span style={{ flex: 1, height: 2, background: "currentColor" }} />
                <span
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                    borderLeft: "6px solid currentColor",
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <Typography.Text
          className="text-center block mt-2 font-sans"
          style={{
            color:
              cardForeground ??
              themes[currentTheme][1].colors.defaultForeground,
          }}
        >
          {t(`${name}.displayName`)}
        </Typography.Text>
      </Card>
    </div>
  );
});

export default function ComponentsList({
  currentTheme,
  onThemeChange,
  fullWidth = false,
  boardBackground,
  onBoardBackgroundChange,
  boardForeground,
  onBoardForegroundChange,
  showItemFrame,
  onShowItemFrameChange,
}: ComponentsListProps) {
  const { t, i18n } = useTranslation();
  const theme = themes[currentTheme][1];
  const components = theme.components;
  const [themeChangeVisible, setThemeChangeVisible] = useState(false);
  const [nextTheme, setNextTheme] = useState(0);

  // 组件栏同时是「删除区」：把面板上的元件拖回来就删掉
  const { setNodeRef, isOver } = useDroppable({
    id: "components-trash",
    data: { type: "trash" },
  });
  const { active } = useDndContext();
  // 只有从面板上拖出来的元件才能删除（新组件拖回来只是取消）
  const canDelete = Boolean(active?.data?.current?.boardItem);
  const showDeleteHint = isOver && canDelete;

  // 遮罩只盖住列表在屏幕上露出来的那块（列表可滚动、移动端还在抽屉里，
  // 整块 inset-0 会盖到屏幕外，看着像铺满了整个列表）。
  // 同一块矩形也是 Editor 里删除区的命中范围（靠 data-trash-root 识别）。
  const rootRef = useRef<HTMLDivElement | null>(null);
  const attachRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );
  const [hintRect, setHintRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    if (!showDeleteHint) {
      setHintRect(null);
      return;
    }
    const update = () => {
      const el = rootRef.current;
      if (!el) return;
      const visible = getVisibleClientRect(el);
      const box = el.getBoundingClientRect();
      setHintRect({
        top: Math.round(visible.top - box.top),
        left: Math.round(visible.left - box.left),
        width: Math.round(visible.width),
        height: Math.round(visible.height),
      });
    };
    update();
    window.addEventListener("resize", update);
    // 捕获阶段才能收到内层滚动容器的 scroll
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [showDeleteHint]);

  // 等量好可见矩形再显示，避免第一帧用 inset:0 闪一下整块遮罩
  const hintVisible = showDeleteHint && hintRect != null;

  // 处理主题选择 - 添加防抖逻辑
  const handleThemeSelect = (themeIndex: number) => {
    if (themeIndex !== currentTheme) {
      setNextTheme(themeIndex);
      setThemeChangeVisible(true);
    }
  };

  // 确认切换主题
  const confirmThemeChange = () => {
    onThemeChange(nextTheme);
    setThemeChangeVisible(false);
  };

  return (
    <div
      ref={attachRootRef}
      data-trash-root="true"
      className={`${
        fullWidth
          ? "w-full border-t-0"
          : "w-75 border-r border-gray-200 dark:border-[#2e2e35]"
      } h-full relative overflow-hidden`}
    >
      <div
        className={`absolute z-20 box-border flex items-center justify-center border-2 border-dashed border-[#eb5050] bg-black/30 pointer-events-none transition-opacity duration-300 ${
          showDeleteHint && hintVisible ? "opacity-100" : "opacity-0"
        }`}
        style={
          hintRect
            ? {
                top: hintRect.top,
                left: hintRect.left,
                width: hintRect.width,
                height: hintRect.height,
              }
            : { inset: 0 }
        }
      >
        <span className="font-sans select-none px-4 text-center text-base font-semibold text-white">
          {t("componentsList.dropToDelete")}
        </span>
      </div>
      <div className="p-4 overflow-y-auto overflow-x-hidden h-full">
        <div className="mb-4">
          <Typography.Title heading={4} className="font-sans block">
            {t("componentsList.theme")}
          </Typography.Title>
          <Select
            // Semi 的 Select 会把选项列表缓存住：切换语言后其余文案都变了，
            // 这一列主题名还停在首次渲染时的语言（首次渲染时 i18n 资源可能还没到，
            // 拿到的是 zh-CN 兜底值）。语言变了就整只 Select 重挂一次，标签才会跟着刷新。
            key={i18n.language}
            value={currentTheme}
            onChange={value => handleThemeSelect(value as number)}
            className="w-full mt-2"
            size="large"
          >
            {themes.map(([name], index) => (
              <Select.Option key={index} value={index} className="font-sans">
                {t(`${name}.displayName`)}
              </Select.Option>
            ))}
          </Select>
          {/* 「组件虚线框」开关：原来在顶栏，长语言（法/德/俄）把标签挤没了，
              移到主题下面后标签始终完整、也不跟顶栏抢宽度 */}
          <div className="mt-3">
            <Checkbox
              className="font-sans"
              checked={showItemFrame}
              onChange={e => onShowItemFrameChange?.(Boolean(e.target.checked))}
            >
              <span className="font-sans text-sm text-gray-700 dark:text-gray-200">
                {t("board.showItemFrame")}
              </span>
            </Checkbox>
          </div>
          {/* 默认前景色 / 底板背景色：改了之后画板预览和新拖入组件的默认配色都跟着变。
              显式设置后，连自带特殊默认色的组件（出口黄、固定线路色等）也强制跟随 */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <Typography.Text className="font-sans text-sm">
                {t("componentsList.boardForeground")}
              </Typography.Text>
              {boardForeground && (
                <button
                  type="button"
                  className="font-sans text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  onClick={() => onBoardForegroundChange?.(null)}
                >
                  {t("componentsList.boardForegroundReset")}
                </button>
              )}
            </div>
            <div className="mt-1.5">
              <CustomColorPicker
                currentTheme={currentTheme}
                value={boardForeground ?? null}
                fallbackColor={theme.colors.defaultForeground}
                placeholder={t("editor.followTheme")}
                // 默认前景色：不列任何「xx背景色」
                excludeKeys={excludeColorKeysFor(
                  theme.colors.colors,
                  "foreground"
                )}
                onChange={hex => onBoardForegroundChange?.(hex)}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Typography.Text className="font-sans text-sm">
                {t("componentsList.boardBackground")}
              </Typography.Text>
              {boardBackground && (
                <button
                  type="button"
                  className="font-sans text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  onClick={() => onBoardBackgroundChange?.(null)}
                >
                  {t("componentsList.boardBackgroundReset")}
                </button>
              )}
            </div>
            <div className="mt-1.5">
              <CustomColorPicker
                currentTheme={currentTheme}
                // 未设置时传 null（留空显示占位），色块显示主题默认色
                value={boardBackground ?? null}
                fallbackColor={theme.colors.defaultBackground}
                placeholder={t("editor.followTheme")}
                // 底板背景色：不允许「透明」，也不列任何「xx前景色」
                excludeKeys={[
                  "transparent",
                  ...excludeColorKeysFor(theme.colors.colors, "background"),
                ]}
                onChange={hex => onBoardBackgroundChange?.(hex)}
              />
            </div>
          </div>
        </div>

        <Typography.Title heading={4} className="pb-3 font-sans">
          {t("componentsList.title")}
        </Typography.Title>

        {/* 主题切换确认弹窗 */}
        <Modal
          title={t("componentsList.themeChange.title")}
          visible={themeChangeVisible}
          onOk={confirmThemeChange}
          onCancel={() => setThemeChangeVisible(false)}
          okText={t("componentsList.themeChange.dialog.confirm")}
          cancelText={t("componentsList.themeChange.dialog.cancel")}
        >
          <Typography.Text>
            {t("componentsList.themeChange.confirm")}
          </Typography.Text>
        </Modal>

        <div
          className={`grid w-full gap-3 ${
            fullWidth
              ? "grid-cols-1 min-[420px]:grid-cols-2 min-[640px]:grid-cols-3"
              : ""
          }`}
        >
          {components.map(component => (
            <DraggableComponentItem
              key={component.displayName}
              name={component.displayName}
              Component={component.component}
              type={component.displayName}
              // 注意：拖拽数据保持「干净」的默认 props（配色留空），
              // 底板配色覆盖由 GuideBoard 渲染层实时解析（见 boardColorOverrides），
              // 这样设置/重置覆盖时已上板的组件也能实时跟随
              props={component.defaultProps}
              currentTheme={currentTheme}
              cardBackground={boardBackground}
              cardForeground={boardForeground}
              showItemFrame={showItemFrame}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
