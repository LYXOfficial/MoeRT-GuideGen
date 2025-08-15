import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactElement } from "react";
import Spacing from "./themes/chongqing/Spacing";

export default function DraggableItem({
  id,
  children,
  onClick,
  data,
}: {
  id: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  data?: Record<string, any>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease, opacity 200ms ease',
    outline: isDragging ? "2px dashed #66ccff" : "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    cursor: "grab",
    background: isDragging ? "#f0f0f0" : "transparent",
    zIndex: isDragging ? 9999 : 1,
    flex: (children as ReactElement).type === Spacing ? "1" : "0 0 auto",
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
    position: "relative" as const,
    willChange: "transform",
    margin: "0 -1px"
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onMouseUp={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick?.(e);
        }
      }}
      className={onClick ? 'hover:outline-blue-500 hover:outline-2 hover:outline-dashed' : ''}
    >
      {children}
    </div>
  );
}
