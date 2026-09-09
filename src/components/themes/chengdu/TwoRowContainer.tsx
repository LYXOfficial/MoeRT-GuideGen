import { useMemo, useState, memo, useLayoutEffect, useRef } from "react";
// removed useDndMonitor - will be handled globally in Editor
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableItem from "../../DraggableItem";
import themes from "../themereg";
import type { GuideItem } from "../../../interfaces/guide";
// no type imports needed
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import colors from "./define/colors";

export type TwoRowChildren = GuideItem[][]; // [row1[], row2[]]

export interface TwoRowContainerProps {
  id?: string;
  currentTheme?: number;
  children?: TwoRowChildren; // 作为数据来源（与导出/还原兼容）
  onItemClick?: (e: React.MouseEvent, item: GuideItem) => void;
  background?: string;
  /** 当前被选中（编辑中）的条目 id：命中时给容器内对应条目盖选中遮罩 */
  selectedId?: string;
  /**
   * 预览模式：用于 DragOverlay 里的拖拽副本。
   * 此时不注册可拖放区域、也不复用真身的 DOM id，避免和面板上的容器互相覆盖。
   */
  preview?: boolean;
}

export const twoRowContainerDefaultProps: Partial<TwoRowContainerProps> = {
  children: [[], []],
  background: colors.background,
};

const SCALE = 0.5;

function TwoRowContainer({
  id,
  currentTheme,
  children: initialChildren = [[], []],
  onItemClick,
  background,
  selectedId,
  preview = false,
}: TwoRowContainerProps) {
  const [rawId] = useState(() => id || `tworow-${Math.random().toString(36).slice(2)}`);
  const autoId = preview ? `${rawId}-preview` : rawId;
  const themeIndex = typeof currentTheme === "number" ? currentTheme : 0;
  // 使用传入的 children 而不是本地状态
  const rows = initialChildren;

  const finalBgColor = background ?? themes[themeIndex][1].colors.defaultBackground;

  // 每行的 item id 列表供 SortableContext 使用
  const rowItems = useMemo(
    () => rows.map(r => r.map(it => it.id)),
    [rows]
  );

  // 外层容器 droppable，便于直接拖到容器上（默认落到第0行）
  const {
    setNodeRef: setContainerRef,
    isOver: isOverContainer,
  } = useDroppable({
    id: autoId,
    data: { type: "two-row-container" },
    disabled: preview,
  });
  const containerDomRef = useRef<HTMLDivElement | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  // 合并ref，既传给 dnd droppable，又保留原生DOM引用
  const attachContainerRef = (node: HTMLDivElement | null) => {
    setContainerRef(node);
    containerDomRef.current = node;
  };

  // 在内容变化后测量内部缩放后的可见宽度，并设置为容器宽度（px）
  useLayoutEffect(() => {
    const root = containerDomRef.current;
    if (!root) return;

    const measureWidth = () => {
      const inners = root.querySelectorAll<HTMLDivElement>(".two-row-inner");
      if (!inners.length) {
        setMeasuredWidth(80); // 最小宽度
        return;
      }

      // 用 offsetWidth（不受 scale transform 影响）乘缩放系数得到可见宽度。
      // 之前用 getBoundingClientRect（已被 scale 缩小）再除以 2，导致容器比实际内容窄、
      // 最长行尾部被裁切；且 rect 受拖拽 transform 影响，宽度会闪动、插入动画奇怪。
      let maxW = 0;
      inners.forEach(el => {
        if (el.offsetWidth > 0) {
          maxW = Math.max(maxW, el.offsetWidth);
        }
      });

      const finalWidth = Math.max(80, Math.ceil(maxW * SCALE) + 4);
      setMeasuredWidth(prev =>
        prev === finalWidth ? prev : finalWidth
      );
    };

    // 立即测量一次
    measureWidth();

    // 用 ResizeObserver 持续跟踪内部行的尺寸（增删条目、文字/字体变宽等都会自动触发），
    // 保证容器宽度自动跟随最宽行，不会“丢失”自动调整
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measureWidth);
      root
        .querySelectorAll<HTMLDivElement>(".two-row-inner")
        .forEach(el => {
          ro?.observe(el);
        });
    }

    // 延迟再测量一次，确保拖拽后的布局稳定
    const timer = setTimeout(measureWidth, 100);
    return () => {
      ro?.disconnect();
      clearTimeout(timer);
    };
  }, [rows, finalBgColor]);

  // All drag handling moved to Editor.tsx for unified state management

  return (
    <div
      id={autoId}
      ref={attachContainerRef}
      className="two-row-container"
      style={{
        backgroundColor: finalBgColor,
        border: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: measuredWidth ? `${measuredWidth}px` : "fit-content",
        minWidth: 80,
        height: 64, // 严格固定高度 64
        overflow: "hidden",
        outline: isOverContainer ? "1px dashed #91caff" : undefined,
      }}
    >
      {/* 容器抓手：苹果式居中小灰线。命中原是透明的、始终生效（点/拖 = 选中/拖动整个容器）；
          小灰线颜色跟随「组件虚线框」开关（--guide-item-outline 关掉时为 transparent，线即隐藏）。
          用 guide-item-hint 类标记，导出时会自动被过滤掉 */}
      {!preview && (
        <div
          className="two-row-grab guide-item-hint"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            zIndex: 6,
            cursor: "grab",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
          title="拖拽容器"
        >
          <div
            style={{
              width: 44,
              height: 4,
              borderRadius: 2,
              marginTop: 3,
              background: "var(--guide-item-outline, transparent)",
              opacity: 0.55,
            }}
          />
        </div>
      )}
      {[0, 1].map(rowIdx => (
        <TwoRowRow
          key={`${autoId}-row-${rowIdx}`}
          id={`${autoId}-row-${rowIdx}`}
          items={rowItems[rowIdx]}
          renderItems={rows[rowIdx]}
          onItemClick={onItemClick}
          containerId={autoId}
          rowIndex={rowIdx}
          selectedId={selectedId}
          preview={preview}
        />
      ))}
    </div>
  );
}

const TwoRowRow = memo(function TwoRowRow({
  id,
  items,
  renderItems,
  onItemClick,
  containerId,
  rowIndex,
  selectedId,
  preview = false,
}: {
  id: string;
  items: string[];
  renderItems: GuideItem[];
  onItemClick?: (e: React.MouseEvent, item: GuideItem) => void;
  containerId: string;
  rowIndex: number;
  selectedId?: string;
  preview?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "two-row-container-row",
      containerId,
      rowIndex,
      rowId: id
    },
    disabled: preview,
  });
  return (
    <div
      id={id}
      ref={setNodeRef}
      className="two-row-container-row"
      style={{
        width: "fit-content", // 宽度跟随内部内容
        minWidth: 80,
        height: 32, // 每行布局高度 32
        overflow: "visible", // 始终显示完整内容，避免拖拽时被裁剪
        background: isOver ? "#e6f7ff66" : undefined,
        position: "relative",
        border: isOver ? "1px dashed #91caff" : "1px dashed transparent", // 显示拖拽边界
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          width: "fit-content",
          minWidth: 40, // 确保空行也有最小宽度
          minHeight: 64, // 内容原始高度 64
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          background: isOver ? "#e6f7ff33" : undefined, // 内层也显示高亮
          borderRadius: isOver ? "4px" : undefined,
        }}
        className="two-row-inner"
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          {renderItems.length > 0 ? (
            renderItems.map(item =>
              // 预览副本里只画静态内容，不再注册可拖拽项，
              // 否则会和面板上真身的同名元素抢注册
              preview ? (
                <div
                  key={item.id}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  {item.element}
                </div>
              ) : (
                <DraggableItem
                  key={item.id}
                  id={item.id}
                  zoom={SCALE}
                  selected={selectedId === item.id}
                  data={{
                    context: "two-row",
                    rowId: id,
                    containerId,
                    rowIndex,
                    boardItem: item,
                    // 容器内部额外缩放，DragOverlay 需要据此还原视觉尺寸
                    scale: SCALE,
                  }}
                  onClick={e => onItemClick?.(e, item)}
                >
                  {item.element}
                </DraggableItem>
              )
            )
          ) : (
            // 空行占位符，确保有可拖拽的区域
            <div
              style={{
                minWidth: 40,
                minHeight: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.3,
                fontSize: "12px",
                color: "#999",
                pointerEvents: "none",
              }}
            >
              空行
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
});

const MemoTwoRowContainer = memo(TwoRowContainer);
export default MemoTwoRowContainer;

// Editor config to edit background color
export const twoRowContainerEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "background",
      label: "themes.chengdu.components.TwoRowContainer.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

// Attach getter for editor config on the exported memo component
// to match how theme registry reads component.getEditorConfig
(MemoTwoRowContainer as any).getEditorConfig = (t: (key: string) => string) =>
  twoRowContainerEditorConfig(t);
