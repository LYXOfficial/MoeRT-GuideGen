import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import type { GuideItem } from "../../../interfaces/guide";

export interface TwoRowContainerProps {
  background: string;
  children?: GuideItem[][];
  id: string;
  onChildrenChange?: (newChildren: GuideItem[][]) => void;
  currentTheme: number;
}

export const twoRowContainerDefaultProps = {
  background: colors.background,
  children: [[], []],
};

export const getTwoRowContainerEditorConfig = (
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

interface SortableItemProps {
  item: GuideItem;
  isHalfSize?: boolean;
}

function SortableItem({ item, isHalfSize = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    transformOrigin: "top left",
    height: isHalfSize ? "32px" : "64px",
    cursor: "grab",
    display: "inline-block",
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        style={{
          transform: isHalfSize ? "scale(0.5)" : "scale(1)",
          transformOrigin: "top left",
        }}
      >
        {item.element}
      </div>
    </div>
  );
}

function DroppableRow({
  id,
  items,
  isHalfSize = false,
}: {
  id: string;
  items: GuideItem[];
  isHalfSize?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "two-row-container-row", rowId: id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center min-h-8 transition-colors`}
      style={{
        minHeight: isHalfSize ? "32px" : "64px",
        border: isOver ? "2px dashed #3b82f6" : "2px dashed transparent",
        borderRadius: "4px",
        width: "100%",
      }}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={horizontalListSortingStrategy}
      >
        {items.length === 0 ? (
          <div className="flex-1 text-center text-gray-400 text-xs py-2">
            拖拽组件到此行
          </div>
        ) : (
          items.map(item => (
            <SortableItem key={item.id} item={item} isHalfSize={isHalfSize} />
          ))
        )}
      </SortableContext>
    </div>
  );
}

function TwoRowContainer({
  background = twoRowContainerDefaultProps.background,
  children = [[], []],
  id,
  onChildrenChange: _onChildrenChange,
  currentTheme: _currentTheme,
}: TwoRowContainerProps) {
  const [topItems, setTopItems] = useState<GuideItem[]>(children[0] || []);
  const [bottomItems, setBottomItems] = useState<GuideItem[]>(
    children[1] || []
  );

  useEffect(() => {
    setTopItems(children[0] || []);
    setBottomItems(children[1] || []);
  }, [children]);

  const containerRef = useRef<HTMLDivElement>(null);
  const topRowId = `${id}-top`;
  const bottomRowId = `${id}-bottom`;

  return (
    <div
      ref={containerRef}
      className="inline-flex flex-col h-64px"
      style={{
        backgroundColor: background,
        minWidth: "120px",
      }}
    >
      <DroppableRow id={topRowId} items={topItems} isHalfSize={true} />

      <DroppableRow id={bottomRowId} items={bottomItems} isHalfSize={true} />
    </div>
  );
}

TwoRowContainer.getEditorConfig = (t: (key: string) => string) =>
  getTwoRowContainerEditorConfig(t);

export default TwoRowContainer;
