import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  isValidElement,
} from "react";
import ChongqingSpecLine from "./themes/chongqing/SpecLine";
import ChengduSpecLine from "./themes/chengdu/SpecLine";
import HongkongSpecLine from "./themes/hongkong/SpecLine";
import BeijingSpecLine from "./themes/beijing/SpecLine";
import ChongqingSpacing from "./themes/chongqing/Spacing";
import ChengduSpacing from "./themes/chengdu/Spacing";
import HongkongSpacing from "./themes/hongkong/Spacing";
import BeijingSpacing from "./themes/beijing/Spacing";

export default function DraggableItem({
  id,
  children,
  onClick,
  data,
  zoom = 1,
  selected = false,
}: {
  id: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  data?: Record<string, any>;
  // 当前编辑区缩放，用于修正 dnd 在缩放容器内的位移
  zoom?: number;
  // 选中态：点击后在组件上盖一层淡淡的遮罩
  selected?: boolean;
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

  // 画板上的组件只保留「移动 8px 才算拖」这条通道：
  // TouchSensor 的长按激活是给可滚动的组件列表用的（见 Editor 的 sensors），
  // 在画板上却会让「点一下」（稍慢的点击）直接被当成按住拖拽，菜单根本打不开，
  // 所以这里把 onTouchStart 摘掉——画板组件的 touch-action 本来就是 none，
  // 触屏下照样能拖，只是必须真的移动一点才开始。
  const dragListeners = (() => {
    if (!listeners) return listeners;
    if (!(data as Record<string, any> | undefined)?.boardItem) return listeners;
    const { onTouchStart: _onTouchStart, ...rest } = listeners as Record<
      string,
      unknown
    >;
    return rest;
  })();

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
  // 尺寸/缩放一变就立刻重量（编辑区缩放、双行容器的 0.5、跨行重挂后的新节点）。
  // 必须用 useLayoutEffect：要在这一帧绘制之前量好，否则跨行重挂的第一帧会沿用
  // 上一次的缩放，位移比例算错，看上去就是「手拖很远、元素只挪一点点/抖动」。
  useLayoutEffect(() => {
    const el = domRef.current;
    if (!el) return;
    const measure = () => {
      if (!el.offsetWidth) return;
      const measured = el.getBoundingClientRect().width / el.offsetWidth;
      if (Number.isFinite(measured) && measured > 0.1 && measured < 8) {
        scaleRef.current = measured;
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [zoom]);
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
  const isSpacing =
    childType === ChengduSpacing ||
    childType === ChongqingSpacing ||
    childType === HongkongSpacing ||
    childType === BeijingSpacing;
  const isSpecLine =
    childType === ChengduSpecLine ||
    childType === ChongqingSpecLine ||
    childType === HongkongSpecLine ||
    childType === BeijingSpecLine;

  // 组件之间为了压住 1px 接缝做了 -1px 相互挤压，而 hover / 选中又会把组件抬到邻居之上。
  // 命中测试同样按层级走，于是 1~3px 的分割线会被邻居整个盖住、基本点不到。
  // 解决：给这类「小到点不中」的组件补一圈透明热区（补到至少 HIT_TARGET 宽，随编辑区缩放放大），
  // 并把它们恒定压在邻居的 hover / 选中态之上（z-index 见 global.css 的 .guide-item-hit-expand）。
  const HIT_TARGET = 14;
  const MAX_HIT_PAD = 10;
  const [hitBoxWidth, setHitBoxWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = domRef.current;
    if (!el) return;
    const measure = () => setHitBoxWidth(el.offsetWidth || 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const hitPad =
    isSpecLine || (hitBoxWidth != null && hitBoxWidth > 0 && hitBoxWidth < HIT_TARGET)
      ? Math.min(
          MAX_HIT_PAD,
          Math.max(
            0,
            Math.ceil((HIT_TARGET / (zoom || 1) - (hitBoxWidth ?? 0)) / 2)
          )
        )
      : 0;

  const style = {
    transform: CSS.Transform.toString(adjustedTransform as any),
    // dnd-kit 会在需要「无动画地重置位置」时返回 0ms 过渡，必须原样使用；
    // 只有它没有给出过渡（且元素不是正在跟随指针的源元素）时才用默认值。
    transition:
      transition ??
      (isDragging ? undefined : "transform 200ms ease, opacity 200ms ease"),
    // outline 不参与布局，不会把组件撑宽；颜色由编辑区的 CSS 变量控制
    outline: isDragging
      ? "2px solid #66ccff"
      : "2px dashed var(--guide-item-outline, transparent)",
    display: "inline-flex",
    alignItems: "center",
    cursor: "grab",
    background: isDragging ? "#f0f0f0" : "transparent",
    zIndex: isDragging ? 9999 : selected ? 40 : isSpecLine ? 10 : 1,
    flex: inTwoRow ? "0 0 auto" : isSpacing ? "1" : "0 0 auto",
    width: (data && (data as any).parentWidth) || undefined,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
    position: "relative" as const,
    willChange: "transform",
    margin: "0 -1px",
  };

  // 点按 = 选中/开编辑菜单；拖动 = 搬走。判定必须用 pointer 事件：
  // 触屏拖完之后浏览器还会补发一对「兼容性鼠标事件」（mousedown+mouseup 几乎同时），
  // 用它判定时 hasMoved 永远为 false，于是刚拖完就会误开菜单。
  // pointer 事件没有这个问题（兼容性鼠标事件不会再产生 pointer 事件）。
  const pressPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);

  return (
    <div
      ref={attachRef}
      style={style}
      {...attributes}
      {...dragListeners}
      // 注意：只能用 capture 变体。dnd-kit 的激活监听是通过 {...listeners}
      // 传进来的 onPointerDown / onTouchStart，直接写同名 prop 会把它覆盖掉、彻底拖不动。
      onPointerDownCapture={e => {
        pressPointRef.current = { x: e.clientX, y: e.clientY };
        hasMovedRef.current = false;
      }}
      onPointerMoveCapture={e => {
        const start = pressPointRef.current;
        if (!start) return;
        const moveDistance = Math.sqrt(
          (e.clientX - start.x) ** 2 + (e.clientY - start.y) ** 2
        );
        // 阈值取 10px：拖拽是 8px 启动的，手指轻微抖动（几 px）不该把点按判成拖动
        if (moveDistance > 10) {
          hasMovedRef.current = true;
        }
      }}
      onPointerUpCapture={e => {
        const moved = hasMovedRef.current;
        // 是否真的被拖走过：长按激活拖拽但一直没移动时 transform 仍是空的，
        // 这种情况松手应该照旧弹菜单（不然手慢一点就永远点不开）
        const dragged =
          transform != null &&
          (Math.abs(transform.x) > 1 || Math.abs(transform.y) > 1);
        pressPointRef.current = null;
        hasMovedRef.current = false;
        // 只有「按下后没动过、也没被真的拖走」才算点按
        if (moved || dragged) return;
        // 注意：这里绝对不能 stopPropagation —— dnd-kit 的 PointerSensor 是在 document 上
        // 等 pointerup 来结束「按下待命」状态的，掐断它会让传感器一直停在待命态，
        // 之后鼠标随便动几像素就激活拖拽（PC 上表现为「点一下就开始拖」）。
        onClick?.(e);
      }}
      onPointerCancelCapture={() => {
        pressPointRef.current = null;
        hasMovedRef.current = false;
      }}
      onContextMenu={e => {
        // 右键与左键一致：弹出组件编辑菜单，屏蔽浏览器默认菜单
        e.preventDefault();
        e.stopPropagation();
        // 触屏长按拖拽时，浏览器还会补一个 contextmenu；
        // 这时候弹菜单就会「拖到一半蹦出编辑框」，所以拖拽中（或刚拖过）一律忽略
        if (isDragging || isSorting || hasMovedRef.current) return;
        onClick?.(e);
      }}
      className={`${onClick ? "guide-item-frame hover:outline-blue-500 hover:outline-2 hover:outline-dashed" : "guide-item-frame"}${hitPad > 0 ? " guide-item-hit-expand" : ""}${isDragging ? " is-dragging" : ""}`}
    >
      {hitPad > 0 && (
        // 透明热区：只吃指针，不画东西（分割线等小到点不中的组件靠它才点得着）
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: -hitPad,
            right: -hitPad,
          }}
        />
      )}
      <span
        className={`guide-item-dashed-frame ${selected ? "is-visible" : ""}`}
        aria-hidden
      />
      <span
        className={`guide-item-selected-mask ${selected ? "is-visible" : ""}`}
        aria-hidden
      />
      {children}
      {/* 间距组件：画一条拉到两端的双向箭头，和灰框一样只是编辑辅助，导出时不显示 */}
      {isSpacing && !isDragging && (
        <span
          className="guide-item-hint"
          style={{
            position: "absolute",
            left: 3,
            right: 3,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            // 跟随灰框的开关：关掉时变成 transparent，整个箭头自然隐藏
            color: "var(--guide-item-outline, transparent)",
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
        </span>
      )}
    </div>
  );
}
