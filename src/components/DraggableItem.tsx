import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";

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
    data,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease, opacity 200ms ease",
    outline: isDragging ? "2px dashed #66ccff" : "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    cursor: "grab",
    background: isDragging ? "#f0f0f0" : "transparent",
    zIndex: isDragging
      ? 9999
      : (children as any).type.name === "SpecLine"
        ? 10
        : 1,
    flex: (children as any).type.name === "Spacing" ? "1" : "0 0 auto",
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
    position: "relative" as const,
    willChange: "transform",
    margin: "0 -1px",
  };

  const [mouseDownTime, setMouseDownTime] = useState<number>(0);
  const mouseDownRef = useRef<{ x: number; y: number } | null>(null);

  const [hasMoved, setHasMoved] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={e => {
        setMouseDownTime(Date.now());
        mouseDownRef.current = { x: e.clientX, y: e.clientY };
        setHasMoved(false);
      }}
      onMouseMove={e => {
        if (mouseDownRef.current) {
          const moveDistance = Math.sqrt(
            (e.clientX - mouseDownRef.current.x) ** 2 +
              (e.clientY - mouseDownRef.current.y) ** 2
          );
          if (moveDistance > 5) {
            setHasMoved(true);
          }
        }
      }}
      onMouseUp={e => {
        const mouseUpTime = Date.now();
        const timeElapsed = mouseUpTime - mouseDownTime;

        // 只有在没有移动且时间短的情况下才触发点击
        if (!hasMoved && timeElapsed < 200 && !isDragging) {
          e.stopPropagation();
          onClick?.(e);
        }

        mouseDownRef.current = null;
        setHasMoved(false);
      }}
      className={
        onClick
          ? "hover:outline-blue-500 hover:outline-2 hover:outline-dashed"
          : ""
      }
    >
      {children}
    </div>
  );
}
