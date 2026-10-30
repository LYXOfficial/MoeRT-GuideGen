import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { InputNumber } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import DraggableItem from "../../DraggableItem";
import themes from "../themereg";
import type { GuideItem } from "../../../interfaces/guide";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import colors from "./define/colors";

/**
 * Frame —— 白色圆角矩形「框」，往里面塞图标/数字。
 *
 * 容器行为**刻意复用成都 `TwoRowContainer` 的数据契约**（这是关键）：
 * 外层 droppable 用 `type: "two-row-container"`，行 droppable 用
 * `type: "two-row-container-row"` 且 `rowIndex` 恒为 0，子条目带
 * `context: "two-row"`。这样 Editor 里那一整套踩过坑的落点/插入序/
 * 跨容器搬运逻辑原样生效，不需要另写一份（双行容器那串坑见 AGENTS.md §7）。
 *
 * 与双行容器的差别：
 *  - 只有一行，行高就是整行 64px，所以**不缩放**（SCALE = 1）；
 *  - 竖向可以整体上下偏移（offsetY），用来对齐牌面里的内容；
 *  - 背景是圆角矩形（默认白），不是整行铺底色。
 */

export type FrameChildren = GuideItem[][];

export interface FrameProps {
  id?: string;
  currentTheme?: number;
  /** 子条目（数据源，与导出/还原兼容）；只用第 0 行 */
  children?: FrameChildren;
  onItemClick?: (e: React.MouseEvent, item: GuideItem) => void;
  /** 框底色（默认白）——这是「白牌子」的色，不是底板色 */
  plateColor?: string;
  /** 外框最小宽度（px）；内容更宽时以内容为准 */
  minWidth?: number;
  /** 左右内边距（px） */
  paddingX?: number;
  /** 内容整体上下偏移（px，正数向下） */
  offsetY?: number;
  /** 圆角（px） */
  radius?: number;
  /** 左右外侧留白（px）：白牌子离邻居的间距 */
  marginX?: number;
  /** 框高（px），默认 64 = 整行；调小则框浮在行中 */
  height?: number;
  selectedId?: string;
  preview?: boolean;
  /** 框外那一圈底色（= 底板色，落板会被固化；默认主题底板色） */
  background?: string;
}

const MIN_WIDTH_FLOOR = 20;

export const frameDefaultProps: Partial<FrameProps> = {
  children: [[]],
  plateColor: "#ffffff",
  minWidth: 40,
  paddingX: 4,
  offsetY: 0,
  radius: 6,
  // 默认比整行小一圈（现场白牌子四周都露底板）
  height: 48,
  marginX: 4,
  background: colors.background,
};

function Frame({
  id,
  currentTheme,
  children: initialChildren = [[]],
  onItemClick,
  plateColor,
  background,
  minWidth = 40,
  paddingX = 4,
  offsetY = 0,
  radius = 6,
  height = 48,
  marginX = 4,
  selectedId,
  preview = false,
}: FrameProps) {
  const { t } = useTranslation();
  const [rawId] = useState(
    () => id || `frame-${Math.random().toString(36).slice(2)}`
  );
  const autoId = preview ? `${rawId}-preview` : rawId;
  const themeIndex = typeof currentTheme === "number" ? currentTheme : 5;
  const items = useMemo(() => initialChildren?.[0] ?? [], [initialChildren]);
  const itemIds = useMemo(() => items.map(it => it.id), [items]);

  // 白牌子的色（局部默认）与底板色（全局，落板固化）分开
  const finalPlate = plateColor ?? "#ffffff";
  const finalOuter =
    background ?? themes[themeIndex]?.[1]?.colors?.defaultBackground ?? colors.background;

  const rowId = `${autoId}-row-0`;
  // 整个白框就是「这一行」的投放目标：不再额外注册 two-row-container 层，
  // 否则两个 droppable 矩形完全重合，指针命中的那个可能是「容器本身」，
  // Editor 拿不到 rowIndex 就会静默退回主行（拖不进框的根因）。
  const { setNodeRef: setContainerRef, isOver: isOverContainer } = useDroppable({
    id: rowId,
    data: { type: "two-row-container-row", containerId: autoId, rowIndex: 0, rowId },
    disabled: preview,
  });
  const containerDomRef = useRef<HTMLDivElement | null>(null);
  // 框内子组件是 64 高的整行模块，这里按 (框高/64) 整体等比缩小；
  // 不缩就会直接顶出白框（用户实测「拖进去尺寸没变小」）
  const childScale = Math.max(0.2, Math.min(1, (height ?? 64) / 64));
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  /** 未缩放布局下的内容自然宽度（内层用这个宽度，绝不能反过来从框宽推） */
  const [contentWidth, setContentWidth] = useState<number | null>(null);

  const attachContainerRef = (node: HTMLDivElement | null) => {
    setContainerRef(node);
    containerDomRef.current = node;
  };

  // 量内层自然宽度：直接用子元素实际占据的区间，并**扣掉间距撑开的部分**
  // （同双行容器的血泪：不扣会「量宽 → 间距更宽 → 再量」每周期涨 1px）。
  useLayoutEffect(() => {
    const root = containerDomRef.current;
    if (!root) return;

    const measureWidth = () => {
      const inner = root.querySelector<HTMLDivElement>(".frame-inner");
      if (!inner) {
        setMeasuredWidth(Math.max(MIN_WIDTH_FLOOR, minWidth));
        return;
      }
      let minLeft = Number.POSITIVE_INFINITY;
      let maxRight = Number.NEGATIVE_INFINITY;
      let spacingTotal = 0;
      Array.from(inner.children).forEach(child => {
        if (!(child instanceof HTMLElement)) return;
        if (child.dataset.guideSpacing === "true") {
          spacingTotal += child.offsetWidth;
          return;
        }
        const left = child.offsetLeft;
        const right = left + child.offsetWidth;
        if (left < minLeft) minLeft = left;
        if (right > maxRight) maxRight = right;
      });
      const content =
        Number.isFinite(minLeft) && Number.isFinite(maxRight)
          ? Math.max(0, maxRight - Math.min(minLeft, 0) - spacingTotal)
          : 0;
      // 先记「未缩放」的内容自然宽度：内层必须用它当宽度，
      // 否则 (框宽 - padding) / scale 两次取整后内层会比内容窄，最后一项被裁、间距撑不开。
      setContentWidth(prev => (prev === content ? prev : content));
      const finalWidth = Math.max(
        MIN_WIDTH_FLOOR,
        minWidth,
        Math.ceil(content * childScale) + paddingX * 2 + 1
      );
      setMeasuredWidth(prev => (prev === finalWidth ? prev : finalWidth));
    };

    measureWidth();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measureWidth);
      const inner = root.querySelector<HTMLDivElement>(".frame-inner");
      if (inner) {
        ro.observe(inner);
        Array.from(inner.children).forEach(child => {
          if (child instanceof HTMLElement) ro?.observe(child);
        });
      }
    }
    const timer = setTimeout(measureWidth, 100);
    return () => {
      ro?.disconnect();
      clearTimeout(timer);
    };
  }, [items, finalPlate, minWidth, paddingX, childScale]);

  const containerWidth = Math.max(MIN_WIDTH_FLOOR, minWidth, measuredWidth ?? 0);

  return (
    <div
      className="flex h-16 items-center justify-start"
      style={{
        backgroundColor: finalOuter,
        paddingLeft: marginX,
        paddingRight: marginX,
        boxSizing: "border-box",
        // 有间距时像主行的间距一样吃掉剩余宽度
        flex: "0 0 auto",
        minWidth: 0,
      }}
    >
      <div
        id={rowId}
        data-frame-id={autoId}
        ref={attachContainerRef}
        className="frame-container"
        style={{
          width: measuredWidth ? `${measuredWidth}px` : "fit-content",
          minWidth: containerWidth,
          height,
          backgroundColor: finalPlate,
          borderRadius: radius,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          marginTop: offsetY * 2,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          // 内容靠左排（不擅自居中）
          justifyContent: "flex-start",
          overflow: "hidden",
          position: "relative",
          outline: isOverContainer ? "1px dashed #91caff" : undefined,
        }}
      >
        {/* 行 droppable 必须是**真实包住内层的布局元素**（跟成都双行容器的
            `.two-row-container-row` 同构）。之前用透明覆盖层时 dnd-kit 命不中，
            新组件会静默退回主行；而且 Editor 的插入位计算靠
            `[id=rowId] .two-row-inner`，覆盖层里没有内层同样取不到。 */}
        <FrameRow>
        <div
          // 同时挂 two-row-inner：Editor 的插入位计算/落点指示线都按
          // `[id=rowId] .two-row-inner` 选内层，Frame 复用这套逻辑就不用改 Editor
          className="frame-inner two-row-inner"
          style={{
            display: "flex",
            // 与主行/双行容器一致：拉伸 + 左起排，间距 flex:1 才能吃掉剩余空间
            alignItems: "stretch",
            justifyContent: "flex-start",
            gap: 0,
            height: 64,
            maxHeight: 64,
            width: contentWidth != null ? `${contentWidth}px` : "fit-content",
            minWidth: 20,
            transform: `scale(${childScale})`,
            // 左上为原点：缩放后内容贴着框的左上，尺寸所见即所得
            transformOrigin: "top left",
          }}
        >
          <SortableContext items={itemIds} strategy={horizontalListSortingStrategy}>
            {items.length > 0 ? (
              items.map((item, index) =>
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
                    zoom={childScale}
                    flushLeft={index === 0}
                    flushRight={index === items.length - 1}
                    selected={selectedId === item.id}
                    data={{
                      context: "two-row",
                      rowId,
                      containerId: autoId,
                      rowIndex: 0,
                      boardItem: item,
                      scale: childScale,
                    }}
                    onClick={e => onItemClick?.(e, item)}
                  >
                    {item.element}
                  </DraggableItem>
                )
              )
            ) : (
              <div
                className="guide-item-hint"
                style={{
                  minWidth: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.35,
                  fontSize: 11,
                  color: "#999",
                  pointerEvents: "none",
                }}
              >
                {t("board.twoRowEmpty")}
              </div>
            )}
          </SortableContext>
        </div>
        </FrameRow>
      </div>
    </div>
  );
}

/** 行容器：真实布局元素 + droppable，结构与成都双行容器的行完全一致 */
/** 行布局层：只负责把内层撑满，droppable 落在整个白框上 */
function FrameRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="two-row-container-row"
      style={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

const MemoFrame = memo(Frame);
export default MemoFrame;

export const frameEditorConfig = (_t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "minWidth",
      label: "themes.tokyo-metro.components.Frame.props.minWidth",
      element: <InputNumber min={MIN_WIDTH_FLOOR} step={10} />,
    },
    {
      key: "paddingX",
      label: "themes.tokyo-metro.components.Frame.props.paddingX",
      element: <InputNumber min={0} max={40} />,
    },
    {
      key: "offsetY",
      label: "themes.tokyo-metro.components.Frame.props.offsetY",
      element: <InputNumber min={-24} max={24} />,
    },
    {
      key: "height",
      label: "themes.tokyo-metro.components.Frame.props.height",
      element: <InputNumber min={16} max={64} step={4} />,
    },
    {
      key: "marginX",
      label: "themes.tokyo-metro.components.Frame.props.marginX",
      element: <InputNumber min={0} max={24} />,
    },
    {
      key: "radius",
      label: "themes.tokyo-metro.components.Frame.props.radius",
      element: <InputNumber min={0} max={32} />,
    },
    {
      key: "plateColor",
      label: "themes.tokyo-metro.components.Frame.props.plateColor",
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "background",
      label: "themes.tokyo-metro.components.Frame.props.background",
      element: <CustomColorPicker currentTheme={5} />,
    },
  ],
});

/**
 * Frame 是容器件：Editor 用它区分「容器」和普通组件（拖拽时容器不进容器、
 * 也不做普通组件的换色/测量），所以把类型挂在静态属性上，与 TwoRowContainer 一致。
 */
(MemoFrame as unknown as { __isFrameContainer?: boolean }).__isFrameContainer = true;

(MemoFrame as any).getEditorConfig = (t: (key: string) => string) =>
  frameEditorConfig(t);
