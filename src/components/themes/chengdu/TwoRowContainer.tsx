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
}: TwoRowContainerProps) {
  const [autoId] = useState(() => id || `tworow-${Math.random().toString(36).slice(2)}`);
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
  } = useDroppable({ id: autoId, data: { type: "two-row-container" } });
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
    const inners = root.querySelectorAll<HTMLDivElement>(".two-row-inner");
    if (!inners.length) return;
    let maxW = 0;
    inners.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > maxW) maxW = rect.width;
    });
    if (maxW > 0) setMeasuredWidth(Math.ceil(maxW));
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
        width: measuredWidth ? `${measuredWidth}px` : "fit-content",
        minWidth: 80,
        height: 64, // 严格固定高度 64
        overflow: "hidden",
        outline: isOverContainer ? "1px dashed #91caff" : undefined,
      }}
    >
      {[0, 1].map(rowIdx => (
        <TwoRowRow
          key={`${autoId}-row-${rowIdx}`}
          id={`${autoId}-row-${rowIdx}`}
          items={rowItems[rowIdx]}
          renderItems={rows[rowIdx]}
          onItemClick={onItemClick}
          containerId={autoId}
          rowIndex={rowIdx}
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
}: {
  id: string;
  items: string[];
  renderItems: GuideItem[];
  onItemClick?: (e: React.MouseEvent, item: GuideItem) => void;
  containerId: string;
  rowIndex: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { 
      type: "two-row-container-row", 
      containerId,
      rowIndex,
      rowId: id 
    },
  });
  return (
    <div
      id={id}
      ref={setNodeRef}
      className="two-row-container-row"
      style={{
        width: "fit-content",
        height: 32, // 每行布局高度 32
        overflow: isOver ? "visible" : "hidden", // 悬停时显示完整内容以便看到高亮
        background: isOver ? "#e6f7ff66" : undefined,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          width: "fit-content",
          minHeight: 64, // 内容原始高度 64
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          background: isOver ? "#e6f7ff33" : undefined, // 内层也显示高亮
          borderRadius: isOver ? "4px" : undefined,
        }}
        className="two-row-inner"
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          {renderItems.map(item => (
            <DraggableItem
              key={item.id}
              id={item.id}
              zoom={SCALE}
              onClick={e => onItemClick?.(e, item)}
            >
              {item.element}
            </DraggableItem>
          ))}
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
