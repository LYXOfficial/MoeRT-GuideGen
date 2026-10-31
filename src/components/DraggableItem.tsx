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
import BeijingOldSpecLine from "./themes/beijing-old/SpecLine";
import TokyoSpecLine from "./themes/tokyo/SpecLine";
import ChongqingSpacing from "./themes/chongqing/Spacing";
import ChengduSpacing from "./themes/chengdu/Spacing";
import HongkongSpacing from "./themes/hongkong/Spacing";
import BeijingSpacing from "./themes/beijing/Spacing";
import BeijingOldSpacing from "./themes/beijing-old/Spacing";
import TokyoSpacing from "./themes/tokyo/Spacing";

export default function DraggableItem({
  id,
  children,
  onClick,
  data,
  zoom = 1,
  selected = false,
  flushLeft = false,
  flushRight = false,
}: {
  id: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  data?: Record<string, any>;
  // 当前编辑区缩放，用于修正 dnd 在缩放容器内的位移
  zoom?: number;
  // 选中态：点击后在组件上盖一层淡淡的遮罩
  selected?: boolean;
  /** 行内第一个 / 最后一个：取消该侧 -1px 的接缝负边距 */
  flushLeft?: boolean;
  flushRight?: boolean;
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
  const childType = isValidElement(children) ? (children as ReactElement).type : null;
  // 优先按条目 type 字符串判断（"themes.<主题>.components.Spacing"）：
  // 画板的子元素可能被包一层（如 BoardItemContent），childType 就不再是
  // Spacing 组件本身，只靠 childType 判断会让间距丢掉 flex:1、完全不撑开
  const boardItemType: string | undefined = (data as any)?.boardItem?.type;
  const isSpacing =
    (typeof boardItemType === "string" && boardItemType.includes("Spacing")) ||
    childType === ChengduSpacing ||
    childType === ChongqingSpacing ||
    childType === HongkongSpacing ||
    childType === BeijingSpacing ||
    childType === BeijingOldSpacing ||
    childType === TokyoSpacing;
  const isSpecLine =
    (typeof boardItemType === "string" && boardItemType.includes("SpecLine")) ||
    childType === ChengduSpecLine ||
    childType === ChongqingSpecLine ||
    childType === HongkongSpecLine ||
    childType === BeijingSpecLine ||
    childType === BeijingOldSpecLine ||
    childType === TokyoSpecLine;

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
  // offsetWidth 是「布局 px」，而编辑区/双行容器都会整体缩放，
  // 所以要先换算成屏幕上看到的宽度再和 HIT_TARGET 比，否则在缩小显示时
  // 明明只有几像素宽的间距会被当成「够宽」而不补热区（间距/空格点不着的主因之一）。
  const screenBoxWidth = (hitBoxWidth ?? 0) * (zoom || 1);
  const hitPad =
    isSpecLine || (hitBoxWidth != null && screenBoxWidth < HIT_TARGET)
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
    // 灰虚线框不再用 outline：北京新主题的组件背景是「绝对定位的整块背景」，
    // 那种定位元素会画在父级 outline 之上，把框整个盖住（用户实测）。
    // 改成和粉色框同款的覆盖层 span（见下方 guide-item-frame-line），
    // z-index 高于组件内容，任何主题都盖不住。
    // 拖拽中的蓝色高亮仍用 outline（一次性视觉，不碰接缝）。
    outline: isDragging ? "2px solid #66ccff" : undefined,
    outlineOffset: isDragging ? "-2px" : undefined,
    display: "inline-flex",
    alignItems: "center",
    cursor: "grab",
    // 拖拽中的底色用变量下发：深色模式换成深灰（global.css 里定义）
    background: isDragging
      ? "var(--guide-item-drag-bg, #f0f0f0)"
      : "transparent",
    zIndex: isDragging ? 9999 : selected ? 40 : isSpecLine ? 10 : 1,
    // 间距组件永远可以被拉伸（双行容器里也是）：以前在容器内强制 0 0 auto，
    // 于是双行容器里的「间距」完全不工作。行的宽度由容器给定
    // （TwoRowContainer 会把每行撑到容器宽度），所以 flex:1 在这里是安全的；
    // 行还是 fit-content（首帧、还没测出宽度）时间距自然收成 0，不会撑歪。
    flex: isSpacing ? "1" : "0 0 auto",
    width: (data && (data as any).parentWidth) || undefined,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
    position: "relative" as const,
    // 只在**真的在拖**的时候提升合成层。常驻 will-change 会让每个组件各自成为
    // 一个合成层、缓存 1× 位图，画板放大时整片糊着放大（点一下才重绘=用户看到的「模糊」）
    willChange: isDragging ? "transform" : "auto",
    // -1px 是为了和相邻组件互相压住接缝（避免中间露 1px 板底色）。
    // 但行首 / 行尾那一侧没有邻居可压，负边距只会把组件顶出行外、
    // 被 overflow:hidden 裁掉 1px —— 组件自己设了跟底板不同的背景色时，
    // 那条缝就会露出底板的默认背景色（用户反馈「左右各有一条很小的缝」）。
    margin: `0 ${flushRight ? 0 : -1}px 0 ${flushLeft ? 0 : -1}px`,
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
      // 标记弹性间距：双行容器量「自然宽度」时要把它排除掉，
      // 否则间距撑开后会被算进内容宽度，容器越撑越宽（死循环）
      data-guide-spacing={isSpacing ? "true" : undefined}
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
      className={`guide-item-frame${hitPad > 0 ? " guide-item-hit-expand" : ""}${isDragging ? " is-dragging" : ""}`}
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
      {/* 「组件虚线框」开关的灰框：画在最上层（覆盖层），避免被组件背景盖住 */}
      {!isSpecLine && (
        <span
          className="guide-item-frame-line"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed var(--guide-item-outline, transparent)",
            borderRadius: 2,
            pointerEvents: "none",
            zIndex: 21,
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
