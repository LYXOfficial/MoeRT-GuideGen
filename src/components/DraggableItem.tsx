import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  isValidElement,
} from "react";
import ChongqingSpecLine from "./themes/chongqing/SpecLine";
import ChengduSpecLine from "./themes/chengdu/SpecLine";
import HongkongSpecLine from "./themes/hongkong/SpecLine";
import ChongqingSpacing from "./themes/chongqing/Spacing";
import ChengduSpacing from "./themes/chengdu/Spacing";
import HongkongSpacing from "./themes/hongkong/Spacing";

export default function DraggableItem({
  id,
  children,
  onClick,
  data,
  zoom = 1,
}: {
  id: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  data?: Record<string, any>;
  // 当前编辑区缩放，用于修正 dnd 在缩放容器内的位移
  zoom?: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id,
    data,
    // 始终允许布局动画：元素在行内换位、或被实时移动到另一行时，
    // dnd-kit 默认策略会跳过 FLIP 动画（表现为“向左拖动/跨行没有动画”）。
    animateLayoutChanges: () => true,
  });

  // 在被缩放的容器内（父级 scale(...)），dnd-kit 给出的位移是屏幕像素，
  // 需要按元素真实的屏幕缩放折算回布局像素，才能与指针/相邻元素对齐。
  const domRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(zoom || 1);
  const attachRef = useCallback(
    (node: HTMLDivElement | null) => {
      domRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );
  useEffect(() => {
    // 拖拽开始时量一次：编辑区缩放 × 所在容器的内部缩放
    if (!isSorting) return;
    const el = domRef.current;
    if (!el || !el.offsetWidth) return;
    const measured = el.getBoundingClientRect().width / el.offsetWidth;
    if (Number.isFinite(measured) && measured > 0.01) {
      scaleRef.current = measured;
    }
  }, [isSorting]);
  const scale = isSorting ? scaleRef.current : zoom || 1;

  const adjustedTransform = transform
    ? {
        ...transform,
        x: transform.x / scale,
        y: transform.y / scale,
      }
    : null;
  const inTwoRow = data && (data as any).context === "two-row";
  const childType = isValidElement(children) ? (children as ReactElement).type : null;
  const style = {
    transform: CSS.Transform.toString(adjustedTransform as any),
    // dnd-kit 会在需要「无动画地重置位置」时返回 0ms 过渡，必须原样使用；
    // 只有它没有给出过渡（且元素不是正在跟随指针的源元素）时才用默认值。
    transition:
      transition ??
      (isDragging ? undefined : "transform 200ms ease, opacity 200ms ease"),
    outline: isDragging ? "2px dashed #66ccff" : "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    cursor: "grab",
    background: isDragging ? "#f0f0f0" : "transparent",
    zIndex: isDragging
      ? 9999
      : childType === ChengduSpecLine ||
          childType === ChongqingSpecLine ||
          childType === HongkongSpecLine
        ? 10
        : 1,
    flex: inTwoRow
      ? "0 0 auto"
      : childType === ChengduSpacing ||
        childType === ChongqingSpacing ||
        childType === HongkongSpacing
      ? "1"
      : "0 0 auto",
    width: (data && (data as any).parentWidth) || undefined,
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
      ref={attachRef}
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
