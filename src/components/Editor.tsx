import { useRef, useState } from "react";
import ComponentsList from "./ComponentsList";
import GuideBoardCols, { type GuideBoardRef } from "./GuideBoard";
import type { GuideItem } from "../interfaces/guide";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import themes from "./themes/themereg";

export default function Editor() {
  const guideBoardRef = useRef<GuideBoardRef>(null);
  const [activeItem, setActiveItem] = useState<GuideItem | null>(null);
  const [currentTheme, setCurrentTheme] = useState(0);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedItem = event.active.data.current?.item as GuideItem;
    if (draggedItem) {
      setActiveItem(draggedItem);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const draggedItem = active.data.current?.item;
    const sourceRowId = active.data.current?.rowId;
    
    const overId = over.id.toString();
    let overRowId = over.data.current?.rowId;
    if (!overRowId && overId.startsWith('row')) {
      overRowId = overId;
    }
    if (!overRowId) return;

    // 从组件列表拖入
    if (draggedItem && !sourceRowId && overRowId) {
      const newId = `${draggedItem.type || "item"}-${Math.random().toString(36).substring(2)}`;
      const rowNumber = overRowId.match(/^row(\d+)/);
      if (!rowNumber) return;

      const newItem: GuideItem = {
        ...draggedItem,
        id: newId,
      };
      
      guideBoardRef.current?.addItemToRow(`row${rowNumber[1]}`, newItem);
      return;
    }
    // 行内和跨行拖拽
    if (sourceRowId && overRowId) {
      if (sourceRowId === overRowId) {
        if (active.id !== over.id) {
          const oldIndex = guideBoardRef.current?.getItemIndex(
            sourceRowId,
            active.id.toString()
          );
          const newIndex = guideBoardRef.current?.getItemIndex(
            overRowId,
            over.id.toString()
          );

          if (
            typeof oldIndex === "number" &&
            typeof newIndex === "number" &&
            oldIndex !== -1 &&
            newIndex !== -1
          ) {
            guideBoardRef.current?.reorderRow(sourceRowId, oldIndex, newIndex);
          }
        }
      } else {
        // 跨行移动
        const rowNumber = overRowId.match(/^row(\d+)/);
        if (!rowNumber) return;
        
        const item = guideBoardRef.current?.removeItemFromRow(
          sourceRowId,
          active.id.toString()
        );
        if (item) {
          guideBoardRef.current?.addItemToRow(`row${rowNumber[1]}`, { ...item });
        }
      }
    }
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedItem = active.data.current?.item;
    const sourceRowId = active.data.current?.rowId;
    const overRowId = over.id.toString().split('-')[0];

    // 如果是从组件列表拖入，我们不需要预览重排序
    if (!sourceRowId || !draggedItem) return;

    // 确保 overRowId 是正确的格式
    const rowNumber = overRowId.match(/^row(\d+)/);
    if (!rowNumber) return;

    const targetRowId = `row${rowNumber[1]}`;

    // 获取鼠标位置
    let pointerX = 0;
    if ("clientX" in event.activatorEvent) {
      pointerX = event.activatorEvent.clientX as number;
    } else if (
      "touches" in event.activatorEvent &&
      (event.activatorEvent.touches as Array<any>).length > 0
    ) {
      pointerX = (event.activatorEvent.touches as Array<any>)[0].clientX;
    } else {
      return;
    }

    // 获取拖拽元素在源行中的索引
    const oldIndex = guideBoardRef.current?.getItemIndex(
      sourceRowId,
      active.id.toString()
    );

    if (typeof oldIndex !== "number" || oldIndex === -1) return;

    // 只在同一行内进行预览重排序
    if (sourceRowId === targetRowId) {
      // 获取当前行所有元素的 DOMRect
      const rowContainer = document.querySelector(`[data-row="${targetRowId}"]`);
      if (!rowContainer) return;

      const children = Array.from(rowContainer.children) as HTMLElement[];
      let newIndex = children.length;

      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        if (pointerX < rect.left + rect.width / 2) {
          newIndex = i;
          break;
        }
      }

      // 如果位置发生变化，进行重排序
      if (newIndex !== oldIndex) {
        guideBoardRef.current?.reorderRow(targetRowId, oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      collisionDetection={closestCenter}
    >
      <div className="flex h-0 flex-1">
        <ComponentsList 
          currentTheme={currentTheme} 
          onThemeChange={(theme) => {
            setCurrentTheme(theme);
            guideBoardRef.current?.clearBoard();
          }} 
        />
        <div className="m-auto">
          <GuideBoardCols ref={guideBoardRef} currentTheme={currentTheme} />
        </div>
      </div>
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeItem ? (
          <div
            style={{
              transform: "scale(1.05)",
              boxShadow: "0 0 8px rgba(0,0,0,0.12)",
              background: "white",
              cursor: "grabbing",
              opacity: 0.9,
              fontFamily: themes[currentTheme][1].fontFamily,
            }}
          >
            {activeItem.element}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
