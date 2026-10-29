import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { InputNumber, Button, Typography, Switch, Modal } from "@douyinfe/semi-ui";
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
  Children,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import DraggableItem from "./DraggableItem";
import CustomColorPicker from "./CustomColorPicker";
import { excludeColorKeysFor } from "../utils/colorKeys";
import { EditingPropsContext } from "./EditingPropsContext";
import themes from "./themes/themereg.ts";
import type { PropForm } from "../interfaces/editor.ts";
import type { GuideItem } from "../interfaces/guide";

// 用于还原状态时的精简条目类型（允许可选 children）
type SavedItem = Pick<GuideItem, "id" | "type" | "props">;

export interface BoardState {
  rows: Array<Array<GuideItem>>;
  config: {
    width: number;
    showSpecLine: boolean;
    /** 底板背景色覆盖（用户自选）；null/undefined = 跟随主题默认 */
    boardBackground?: string;
    /** 默认前景色覆盖（用户自选）；null/undefined = 跟随主题默认 */
    boardForeground?: string;
  };
}

export interface GuideBoardRef {
  addItemToRow: (rowId: string, item: GuideItem, insertIndex?: number) => void;
  removeItemFromRow: (rowId: string, itemId: string) => GuideItem | null;
  reorderRow: (rowId: string, oldIndex: number, newIndex: number) => void;
  /** 在两行之间原子地移动元素（拖拽过程中实时预览用，保证一次 setState 完成） */
  moveItemBetweenRows: (
    sourceRowId: string,
    targetRowId: string,
    itemId: string,
    insertIndex?: number
  ) => boolean;
  getItemIndex: (rowId: string, itemId: string) => number;
  addItemToTwoRowContainer: (containerId: string, rowIndex: number, item: GuideItem, insertIndex?: number) => void;
  removeItemFromTwoRowContainer: (containerId: string, rowIndex: number, itemId: string) => GuideItem | null;
  reorderTwoRowContainerRow: (
    containerId: string,
    rowIndex: number,
    oldIndex: number,
    newIndex: number
  ) => void;
  getTwoRowItemIndex: (
    containerId: string,
    rowIndex: number,
    itemId: string
  ) => number;
  clearBoard: () => void;
  getState: () => BoardState;
  restoreState: (state: {
    rows: Array<Array<SavedItem>>;
    config: BoardState["config"];
  }) => void;
}

const DEFAULT_WIDTH = 512;
export function LineEnd({ currentTheme }: { currentTheme: number }) {
  return (
    <span
      className="w-[calc(100%_-_20px)] mt-0.5 mb-0.5 ml-2.5 mr-2.5 box-border h-px"
      style={{ backgroundColor: themes[currentTheme][1].colors.colors.border }}
    />
  );
}
export function GuideBoard({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // 判断是否有内容
  const hasContent = Children.count(children) > 0;

  return (
    <div
      ref={setNodeRef}
      data-row={id}
      className="min-h-16 overflow-hidden h-16 w-full flex align-center relative transition-colors duration-200 ease-in-out"
      style={{
        transition: "all 200ms ease",
        background: isOver ? "#e6f7ff88" : undefined, // 拖拽时高亮
        // 两个方向都 hidden：超出 64px 行的部分直接裁掉（不会出现滚动条，
        // 也不会溢到相邻行上）
        overflow: "hidden",
      }}
    >
      {hasContent ? (
        children
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 40,
            opacity: 0.3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ()
        </div>
      )}
    </div>
  );
}

interface GuideBoardProps {
  currentTheme: number;
  zoom?: number;
  onConfigChange?: (immediate?: boolean) => void;
  /** 底板背景色覆盖（状态提升在 Editor，这里只负责按 props 渲染） */
  boardBackground?: string | null;
  /** 默认前景色覆盖（同上） */
  boardForeground?: string | null;
}

// 单个上板组件的渲染内容：memo 包住，props 全是 zoom 无关的稳定量。
// 缩放滑块每 tick 只会重渲染外层 DraggableItem（换算拖拽位移/热区用），
// 这里的主题 SVG 子树整棵跳过——否则每 tick 重建全树，dev 下直接卡死。
// 注意 getOverrides 是 useCallback（依赖只有配色/currentTheme/t），
// item 是 rows 里的稳定引用：zoom 变化时三者都不变，memo 必中。
const BoardItemContent = memo(function BoardItemContent({
  item,
  selectedId,
  followBackground,
  themeDefaultBackground,
}: {
  item: GuideItem;
  selectedId?: string;
  /** 北京新：底板背景色（组件背景等于主题默认值时跟随它） */
  followBackground?: string | null;
  themeDefaultBackground?: string;
}) {
  if (!React.isValidElement(item.element)) return item.element;
  // 北京新：背景不透明，且默认值应该跟随底板背景色。
  // 只覆盖「仍是主题默认值」的组件，手动指定过别的颜色的保持不动。
  // 北京用 background/background2 做上下分色，两行都要跟（否则只有第一行变色）。
  const followBg: Record<string, string> = {};
  if (followBackground && themeDefaultBackground != null) {
    if (item.props?.background === themeDefaultBackground) {
      followBg.background = followBackground;
    }
    if (
      item.props != null &&
      typeof item.props === "object" &&
      "background2" in item.props &&
      item.props.background2 === themeDefaultBackground
    ) {
      followBg.background2 = followBackground;
    }
  }
  return React.cloneElement(item.element, {
    ...item.props,
    ...followBg,
    // 底板配色在落板那一刻已固化进 props（见 addItemToRow），
    // 全局改动不再回头覆盖已上板的组件
    // 双行容器内部条目被选中时，让它给对应子条目盖遮罩
    ...(item.type?.includes("TwoRowContainer") ? { selectedId } : {}),
  });
});
// memo：平移时 Editor 重渲染（现在手势中已不 render，落账时 render 一次），
// 画板 props 不变就整棵子树跳过
const GuideBoardCols = memo(forwardRef<GuideBoardRef, GuideBoardProps>(
  (
    {
      currentTheme,
      zoom = 1,
      onConfigChange,
      boardBackground,
      boardForeground,
    },
    ref
  ) => {
    const { t } = useTranslation();
    // 动态行数组，每行是 DraggableItem[]
    const [rows, setRows] = useState<GuideItem[][]>([[]]);
    const [boardWidth, setBoardWidth] = useState(DEFAULT_WIDTH);
    const [showDividers, setShowDividers] = useState(true);
    const [isRestoring, setIsRestoring] = useState(false);
    const [editingItem, setEditingItem] = useState<{
      item: GuideItem;
      position: { x: number; y: number };
      /** 触发弹窗的组件矩形：定位时据此决定往左还是往右弹（position 是算出来的结果） */
      anchor?: { left: number; right: number; top: number; bottom: number };
      parentId?: string;
    } | null>(null);
    const configChangeTimeoutRef = useRef<number | null>(null);

    // ===== 递归处理双行容器内部的条目编辑/删除 =====
    // 双行容器里的元件存在容器 props.children 里，顶层行的 map / find
    // 永远匹配不到它们，所以这里递归到 children，并重建被改动条目的 element。
    const themeComponents = themes[currentTheme][1].components;
    const rebuildItemElement = (item: GuideItem): GuideItem => {
      const Comp = themeComponents.find(c => c.displayName === item.type)?.component;
      if (!Comp) return item;
      return {
        ...item,
        element: React.createElement(Comp as React.ElementType, item.props),
      };
    };
    const makeContainerItem = (
      item: GuideItem,
      children: GuideItem[][]
    ): GuideItem => {
      const Comp = themeComponents.find(c => c.displayName === item.type)?.component;
      // 存档时 element 已被剥掉，这里为每个子条目补回（否则刷新后容器内空白）
      const rebuiltChildren = children.map(row =>
        Array.isArray(row)
          ? row.map(c => rebuildItemElement(c))
          : row
      );
      const containerProps: Record<string, any> = {
        ...item.props,
        // id 必须等于容器的 GuideItem.id：TwoRowContainer 内部用它当 autoId，
        // 编辑器拖入时拿 overData.containerId 去 rows 里匹配 rowItem.id，
        // 对不上就找不到容器、东西拖不进去
        id: item.id,
        children: rebuiltChildren,
        currentTheme,
        onItemClick: (e: React.MouseEvent, clicked: GuideItem) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setEditingItem({
            item: clicked,
            position: { x: rect.right, y: rect.top },
            anchor: {
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            },
            parentId: item.id,
          });
        },
      };
      return {
        ...item,
        props: containerProps,
        element: Comp
          ? React.createElement(Comp as React.ElementType, containerProps)
          : item.element,
      };
    };
    const mapChildrenDeep = (
      rows: GuideItem[][],
      id: string,
      updater: (it: GuideItem) => GuideItem
    ): GuideItem[][] => {
      let found = false;
      const next = rows.map(row =>
        row
          .map(item => {
            if (found) return item;
            if (item.id === id) {
              found = true;
              return updater(item);
            }
            const kids = (item.props?.children as GuideItem[][] | undefined) || null;
            if (Array.isArray(kids)) {
              let changed = false;
              const nkids = kids.map(r =>
                Array.isArray(r)
                  ? r.map(c => {
                      if (found) return c;
                      if (c.id === id) {
                        found = true;
                        changed = true;
                        return updater(c);
                      }
                      return c;
                    })
                  : r
              );
              if (changed) return makeContainerItem(item, nkids);
            }
            return item;
          })
          .filter((it): it is GuideItem => it !== null)
      );
      return next;
    };
    const removeItemDeep = (rows: GuideItem[][], id: string): GuideItem[][] => {
      return rows.map(row =>
        row
          .map(item => {
            if (item.id === id) return null;
            const kids = (item.props?.children as GuideItem[][] | undefined) || null;
            if (Array.isArray(kids)) {
              let changed = false;
              const nkids = kids.map(r =>
                Array.isArray(r)
                  ? r.filter(c => {
                      if (c.id === id) {
                        changed = true;
                        return false;
                      }
                      return true;
                    })
                  : r
              );
              if (changed) return makeContainerItem(item, nkids);
            }
            return item;
          })
          .filter((it): it is GuideItem => it !== null)
      );
    };

    // 编辑弹窗全局Delete监听，保证无论焦点在弹窗内哪个元素都能Delete删除组件
    useEffect(() => {
      if (!editingItem) return;
      const handleDelete = (e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Del") {
          const nextRows = removeItemDeep(rows, editingItem.item.id);
          setRows(nextRows);
          setEditingItem(null);
          if (onConfigChange && !isRestoring) {
            // 删除操作立即保存状态，避免被后续操作覆盖
            onConfigChange(true);
          }
        }
      };
      window.addEventListener("keydown", handleDelete);
      return () => {
        window.removeEventListener("keydown", handleDelete);
      };
    }, [editingItem, rows, onConfigChange, isRestoring]);

    // 防抖的配置变化通知，在恢复状态时暂停
    useEffect(() => {
      if (onConfigChange && !isRestoring) {
        // 清除之前的定时器
        if (configChangeTimeoutRef.current) {
          clearTimeout(configChangeTimeoutRef.current);
        }
        // 设置新的定时器，避免频繁调用
        configChangeTimeoutRef.current = window.setTimeout(() => {
          onConfigChange();
        }, 10);
      }
    }, [
      rows,
      boardWidth,
      showDividers,
      boardBackground,
      boardForeground,
      onConfigChange,
      isRestoring,
    ]);

    // ...existing code...
    const boardContentRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    // 处理点击外部关闭编辑框。
    // 用 mousedown 判定（和以前一致）：弹窗是自己的 DOM，点它内部不会被当成「点外部」；
    // 触屏点按后浏览器会补发一对兼容性鼠标事件，其中 mousedown 紧跟在 pointerup 之后，
    // 而菜单正是在 pointerup 里打开的 → 会被自己这次补发的 mousedown 立刻关掉。
    // 所以加一个「刚打开 400ms 内不判外部」的宽限期来挡住它，而不是改用 pointerdown
    //（pointerdown 会绕过 Semi 浮层内部只拦 mousedown 的保护，导致选下拉就把菜单关掉）。
    const POPUP_SELECTOR = [
      ".editing-popup",
      ".semi-portal",
      ".semi-popover",
      ".semi-popover-wrapper",
      ".semi-select-option-list",
      ".semi-colorPicker-popover",
      ".semi-dropdown",
      ".semi-modal",
      ".semi-tooltip-wrapper",
    ].join(",");
    const popupOpenedAtRef = useRef(0);
    useEffect(() => {
      if (editingItem) popupOpenedAtRef.current = Date.now();
    }, [editingItem?.item?.id]);
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element | null;
        if (!editingItem || !target?.closest) return;
        // 刚打开的那一下（含触屏补发的 mousedown）不算「点外部」
        if (Date.now() - popupOpenedAtRef.current < 400) return;
        // 点在编辑弹窗、或它拉出来的任何浮层里：不算「点外部」
        if (target.closest(POPUP_SELECTOR)) return;
        setEditingItem(null);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [editingItem]);

    // 检查并调整编辑弹窗位置
    useEffect(() => {
      // 通知外层当前是否在编辑（用于禁用缩放等）
      try {
        const evt = new CustomEvent("guide-editing-change", {
          detail: { isEditing: !!editingItem },
        });
        window.dispatchEvent(evt);
      } catch {}

      if (editingItem && popupRef.current) {
        const popupEl = popupRef.current;
        const { width, height } = popupEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 16;

        let newX = editingItem.position.x;
        let newY = editingItem.position.y;
        const anchor = editingItem.anchor;

        if (anchor) {
          // 水平：优先贴在组件右侧；右边放不下就翻到左侧。
          // 以前只是把弹窗「夹」回视口，组件靠右时弹窗会被推到最右边、
          // 正好盖住组件本身（用户截图反馈过）。
          const rightX = anchor.right;
          const leftX = anchor.left - width;
          if (rightX + width <= viewportWidth - margin) {
            newX = rightX;
          } else if (leftX >= margin) {
            newX = leftX;
          } else {
            // 两侧都放不下：夹回视口内（此时只能盖住组件，聊胜于无）
            newX = Math.min(Math.max(rightX, margin), viewportWidth - width - margin);
          }

          // 垂直：和组件顶部对齐；下方溢出就整体上移，上移后还越界就贴边
          const maxY = viewportHeight - height - margin;
          if (anchor.top <= maxY) {
            newY = anchor.top;
          } else {
            newY = Math.min(anchor.bottom - height, maxY);
          }
          if (newY < margin) newY = margin;
        } else {
          // 老数据没有 anchor：沿用「夹回视口」的兜底
          if (newX + width > viewportWidth - margin) {
            newX = viewportWidth - width - margin;
          }
          if (newY + height > viewportHeight - margin) {
            newY = viewportHeight - height - margin;
          }
          if (newX < margin) {
            newX = margin;
          }
          if (newY < margin) {
            newY = margin;
          }
        }

        if (
          newX !== editingItem.position.x ||
          newY !== editingItem.position.y
        ) {
          setEditingItem(prev =>
            prev ? { ...prev, position: { x: newX, y: newY } } : null
          );
        }
      }
    }, [editingItem]);

    // imperativeHandle 相关方法
    useImperativeHandle(
      ref,
      () => ({
        clearBoard: () => {
          setRows([[]]);
        },
        getState: () => ({
          rows: rows,
          config: {
            width: boardWidth,
            showSpecLine: showDividers,
            boardBackground: boardBackground ?? undefined,
            boardForeground: boardForeground ?? undefined,
          },
        }),
        restoreState: state => {
          
          // 设置恢复状态标志，暂停配置变化通知
          setIsRestoring(true);
          // 编辑弹窗里存的是旧组件的 props 快照：撤销/重做/切换存档后如果还开着，
          // 改一下属性就会把撤销掉的内容写回去（old props 复活）。直接关掉最安全。
          setEditingItem(null);

          const restoredRows = state.rows.map((row: SavedItem[]) => {
            return row
              .map((item: SavedItem) => {
                // 直接从当前主题中获取组件
                const Component = themes[currentTheme][1].components.find(
                  comp => comp.displayName === item.type
                )?.component;

                if (
                  !Component ||
                  (typeof Component !== "function" &&
                    typeof Component !== "object")
                ) {
                  console.warn(
                    `Component ${item.type} not found in current theme`
                  );
                  return null;
                }

                // 构造 props；TwoRowContainer 的 children 完全放在 props.children 中
                const finalProps: any = {
                  key: item.id,
                  ...item.props,
                  id: item.id,
                  currentTheme,
                };

                // 双行容器需要补 onItemClick，内部条目才能被编辑/删除
                if (item.type?.includes("TwoRowContainer")) {
                  const kids = (item.props?.children as GuideItem[][]) || [
                    [],
                    [],
                  ];
                  return makeContainerItem(item as GuideItem, kids);
                }

                const restoredItem = {
                  ...item,
                  element: React.createElement(
                    Component as React.ElementType,
                    finalProps
                  ),
                } as GuideItem;
                
                return restoredItem;
              })
              .filter((item): item is GuideItem => item !== null)
          });

          setRows(restoredRows);
          // 导入/旧版本的 config 字段可能缺失或畸形（isSaveData 只查到对象级）：
          // 给兜底值，别让 undefined 流进布局计算
          const restoredWidth = Number(state.config.width);
          setBoardWidth(Number.isFinite(restoredWidth) && restoredWidth > 0 ? restoredWidth : DEFAULT_WIDTH);
          setShowDividers(state.config.showSpecLine !== false);
          // 底板背景色/默认前景色覆盖：状态提升在 Editor（applySaveData /
          // applyHistorySnapshot 会 set），这里不再持有内部副本

          // 恢复完成后重新启用配置变化通知
          setTimeout(() => {
            setIsRestoring(false);
          }, 50);
        },
        addItemToRow: (
          rowId: string,
          item: GuideItem,
          insertIndex?: number
        ) => {
          // 统一用主题里的组件重建 element，确保 id/currentTheme/children 正确
          setRows(prev => {
            const idx = Number(rowId.replace("row", "")) - 1;
            if (idx < 0 || idx >= prev.length) return prev;
            const newRows = prev.map(arr => [...arr]);

            const Component = themes[currentTheme][1].components.find(
              comp => comp.displayName === item.type
            )?.component;

            const finalProps: any = {
              ...(item.props || {}),
              id: item.id,
              currentTheme,
            };

            // 落板固化：把「此刻生效的配色」写进 props ——
            // 全局底板配色优先，未设置则保留组件自带的局部默认值。
            // 上板后即视为局部显式指定，之后改全局不再回头覆盖它。
            // 落板配色：
            // - 背景色：重庆(0) / 北京新(3) 固化当前生效色（底板配色优先，
            //   否则组件自带默认值）；其余主题直接给透明，不跟底板走
            // - 前景色：所有主题都跟随「默认前景色」
            if (Component) {
              const forms =
                (Component as any).getEditorConfig?.(t)?.forms ?? [];
              const colorKeys = new Set(
                forms.map((f: { key: string }) => f.key)
              );
              if (colorKeys.has("background")) {
                if (currentTheme === 0) {
                  // 重庆：落板固化（上板即显式指定）
                  if (boardBackground) {
                    finalProps.background = boardBackground;
                  }
                } else if (currentTheme !== 3) {
                  // 成都/香港/北京旧：直接透明
                  finalProps.background = "transparent";
                }
                // 北京新(3)：保持组件自带默认值，由渲染层跟随底板背景色
                // （背景不透明，必须整板跟随，否则只有新拖的行变色）
              }
              if (colorKeys.has("foreground") && boardForeground) {
                finalProps.foreground = boardForeground;
              }
            }

            // 双行容器：children 在 props.children，且要补 onItemClick，
            // 内部条目才能打开编辑/被删除
            const rebuilt: GuideItem =
              item.type?.includes("TwoRowContainer")
                ? makeContainerItem(
                    item,
                    (item.props?.children as GuideItem[][]) || [[], []]
                  )
                : Component
                  ? {
                      ...item,
                      element: React.createElement(
                        Component as React.ElementType,
                        finalProps
                      ),
                      // 同步 props 里也带上 children，避免后续丢失
                      props: { ...finalProps },
                    }
                  : item;

            if (insertIndex !== undefined) {
              newRows[idx].splice(insertIndex, 0, rebuilt);
            } else {
              newRows[idx].push(rebuilt);
            }
            // console.log('addItemToRow 完成，新的 rows:', newRows); // 调试完成
            return newRows;
          });
        },
        removeItemFromRow: (rowId, itemId) => {
          let removed: GuideItem | null = null;
          setRows(prev => {
            const idx = Number(rowId.replace("row", "")) - 1;
            if (idx < 0 || idx >= prev.length) return prev;
            const newRows = prev.map(arr => [...arr]);
            // 额外检查确保 newRows[idx] 存在
            if (!newRows[idx]) {
              console.error(`removeItemFromRow: newRows[${idx}] is undefined, rowId: ${rowId}, prev.length: ${prev.length}`);
              return prev;
            }
            const itemIdx = newRows[idx].findIndex(i => i.id === itemId);
            if (itemIdx !== -1) {
              removed = { ...newRows[idx][itemIdx] };
              newRows[idx].splice(itemIdx, 1);
            }
            return newRows;
          });
          return removed;
        },
        reorderRow: (rowId, oldIndex, newIndex) => {
          setRows(prev => {
            const idx = Number(rowId.replace("row", "")) - 1;
            if (idx < 0 || idx >= prev.length) return prev;
            if (oldIndex === newIndex) return prev;
            const newRows = [...prev];
            newRows[idx] = arrayMove(newRows[idx], oldIndex, newIndex);

            return newRows;
          });
        },
        moveItemBetweenRows: (
          sourceRowId,
          targetRowId,
          itemId,
          insertIndex
        ) => {
          const fromIdx = Number(sourceRowId.replace("row", "")) - 1;
          const toIdx = Number(targetRowId.replace("row", "")) - 1;
          if (
            Number.isNaN(fromIdx) ||
            Number.isNaN(toIdx) ||
            fromIdx < 0 ||
            toIdx < 0 ||
            fromIdx >= rows.length ||
            toIdx >= rows.length ||
            fromIdx === toIdx ||
            rows[fromIdx].findIndex(i => i.id === itemId) === -1
          ) {
            return false;
          }
          // 一次 setState 内完成“移除 + 插入”，避免中间态导致的闪烁/丢失
          setRows(prev => {
            if (fromIdx >= prev.length || toIdx >= prev.length) return prev;
            const itemIdx = prev[fromIdx].findIndex(i => i.id === itemId);
            if (itemIdx === -1) return prev;
            const newRows = prev.map(arr => [...arr]);
            const [moved] = newRows[fromIdx].splice(itemIdx, 1);
            const target = newRows[toIdx];
            const at =
              insertIndex === undefined
                ? target.length
                : Math.max(0, Math.min(insertIndex, target.length));
            target.splice(at, 0, moved);
            return newRows;
          });
          return true;
        },
        getItemIndex: (rowId, itemId) => {
          const idx = Number(rowId.replace("row", "")) - 1;
          if (idx < 0 || idx >= rows.length) return -1;
          return rows[idx].findIndex(i => i.id === itemId);
        },
        addItemToTwoRowContainer: (containerId: string, rowIndex: number, item: GuideItem, insertIndex?: number) => {
          setRows(prev => {
            const newRows = prev.map(row => row.map(rowItem => {
              if (rowItem.id === containerId && rowItem.type?.includes('TwoRowContainer')) {
                // 找到目标容器，更新其 children
                const currentChildren = (rowItem.props?.children as GuideItem[][]) || [[], []];
                const newChildren = [...currentChildren];
                
                // 确保 rowIndex 在范围内
                if (rowIndex >= 0 && rowIndex < newChildren.length) {
                  const targetRow = [...newChildren[rowIndex]];
                  
                  // 重建 item 的 element
                  const Component = themes[currentTheme][1].components.find(
                    comp => comp.displayName === item.type
                  )?.component;
                  
                  const finalProps: any = {
                    ...(item.props || {}),
                    id: item.id,
                    currentTheme,
                  };
                  
                  const rebuiltItem: GuideItem = Component
                    ? {
                        ...item,
                        element: React.createElement(
                          Component as React.ElementType,
                          finalProps
                        ),
                        props: { ...finalProps },
                      }
                    : item;
                  
                  if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= targetRow.length) {
                    targetRow.splice(insertIndex, 0, rebuiltItem);
                  } else {
                    targetRow.push(rebuiltItem);
                  }
                  
                  newChildren[rowIndex] = targetRow;
                  
                  // 重建容器的 element
                  const ContainerComponent = themes[currentTheme][1].components.find(
                    comp => comp.displayName === rowItem.type
                  )?.component;
                  
                  const containerProps = {
                    ...rowItem.props,
                    children: newChildren,
                    currentTheme,
                    onItemClick: (e: React.MouseEvent, clickedItem: GuideItem) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setEditingItem({
                        item: clickedItem,
                        position: { x: rect.right, y: rect.top },
                        anchor: {
                          left: rect.left,
                          right: rect.right,
                          top: rect.top,
                          bottom: rect.bottom,
                        },
                        parentId: containerId,
                      });
                    },
                  };
                  
                  return {
                    ...rowItem,
                    props: containerProps,
                    element: ContainerComponent
                      ? React.createElement(ContainerComponent as React.ElementType, containerProps)
                      : rowItem.element,
                  };
                }
              }
              return rowItem;
            }));
            return newRows;
          });
        },
        removeItemFromTwoRowContainer: (containerId: string, rowIndex: number, itemId: string) => {
          let removed: GuideItem | null = null;
          setRows(prev => {
            const newRows = prev.map(row => row.map(rowItem => {
              if (rowItem.id === containerId && rowItem.type?.includes('TwoRowContainer')) {
                const currentChildren = (rowItem.props?.children as GuideItem[][]) || [[], []];
                const newChildren = [...currentChildren];
                
                if (rowIndex >= 0 && rowIndex < newChildren.length) {
                  const targetRow = [...newChildren[rowIndex]];
                  const itemIndex = targetRow.findIndex(i => i.id === itemId);
                  
                  if (itemIndex !== -1) {
                    removed = { ...targetRow[itemIndex] };
                    targetRow.splice(itemIndex, 1);
                    newChildren[rowIndex] = targetRow;
                    
                    // 重建容器的 element
                    const ContainerComponent = themes[currentTheme][1].components.find(
                      comp => comp.displayName === rowItem.type
                    )?.component;
                    
                    const containerProps = {
                      ...rowItem.props,
                      children: newChildren,
                      currentTheme,
                      onItemClick: (e: React.MouseEvent, clickedItem: GuideItem) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setEditingItem({
                          item: clickedItem,
                          position: { x: rect.right, y: rect.top },
                          anchor: {
                            left: rect.left,
                            right: rect.right,
                            top: rect.top,
                            bottom: rect.bottom,
                          },
                          parentId: containerId,
                        });
                      },
                    };
                    
                    return {
                      ...rowItem,
                      props: containerProps,
                      element: ContainerComponent
                        ? React.createElement(ContainerComponent as React.ElementType, containerProps)
                        : rowItem.element,
                    };
                  }
                }
              }
              return rowItem;
            }));
            return newRows;
          });
          return removed;
        },
        getTwoRowItemIndex: (containerId, rowIndex, itemId) => {
          for (const row of rows) {
            const container = row.find(i => i.id === containerId);
            if (!container) continue;
            const children = (container.props?.children as GuideItem[][]) || [];
            return (children[rowIndex] || []).findIndex(i => i.id === itemId);
          }
          return -1;
        },
        reorderTwoRowContainerRow: (
          containerId,
          rowIndex,
          oldIndex,
          newIndex
        ) => {
          if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;
          setRows(prev =>
            prev.map(row =>
              row.map(rowItem => {
                if (
                  rowItem.id !== containerId ||
                  !rowItem.type?.includes("TwoRowContainer")
                ) {
                  return rowItem;
                }
                const currentChildren =
                  (rowItem.props?.children as GuideItem[][]) || [[], []];
                if (rowIndex < 0 || rowIndex >= currentChildren.length) {
                  return rowItem;
                }
                const targetRow = currentChildren[rowIndex];
                if (
                  oldIndex >= targetRow.length ||
                  newIndex >= targetRow.length
                ) {
                  return rowItem;
                }
                const newChildren = [...currentChildren];
                newChildren[rowIndex] = arrayMove(targetRow, oldIndex, newIndex);

                const ContainerComponent = themes[
                  currentTheme
                ][1].components.find(
                  comp => comp.displayName === rowItem.type
                )?.component;

                const containerProps = {
                  ...rowItem.props,
                  children: newChildren,
                  currentTheme,
                  onItemClick: (e: React.MouseEvent, clickedItem: GuideItem) => {
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    setEditingItem({
                      item: clickedItem,
                      position: { x: rect.right, y: rect.top },
                      anchor: {
                        left: rect.left,
                        right: rect.right,
                        top: rect.top,
                        bottom: rect.bottom,
                      },
                      parentId: containerId,
                    });
                  },
                };

                return {
                  ...rowItem,
                  props: containerProps,
                  element: ContainerComponent
                    ? React.createElement(
                        ContainerComponent as React.ElementType,
                        containerProps
                      )
                    : rowItem.element,
                };
              })
            )
          );
        },
      }),
      [
        rows,
        boardWidth,
        showDividers,
        boardBackground,
        boardForeground,
        currentTheme,
      ]
    );

    // 添加一行
    const handleAddRow = (idx: number) => {
      setRows(prev => {
        const newRows = [...prev];
        newRows.splice(idx + 1, 0, []);
        return newRows;
      });
      // 触发配置变化通知（包含撤销历史保存）
      if (onConfigChange && !isRestoring) {
        // 添加/删除行操作立即保存状态
        onConfigChange(true);
      }
    };

    // 删除某一行
    const handleRemoveRow = (idx: number) => {
      const removeRow = () => {
        setRows(prev =>
          prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
        );
        // 触发配置变化通知（包含撤销历史保存）
        if (onConfigChange && !isRestoring) {
          // 添加/删除行操作立即保存状态
          onConfigChange(true);
        }
      };

      // 空行直接删；行里还有组件时先确认，避免手滑把一整行内容清掉
      if ((rows[idx] ?? []).length === 0) {
        removeRow();
        return;
      }
      Modal.confirm({
        title: t("board.removeRow.title"),
        content: t("board.removeRow.confirm"),
        okText: t("board.removeRow.ok"),
        cancelText: t("board.removeRow.cancel"),
        okButtonProps: { type: "danger" },
        onOk: removeRow,
      });
    };

    return (
      <div className="flex flex-col items-center">
        {/* GuideBoard 区域 */}
        <div
          className="border-2 border-solid flex flex-col guide-board select-none"
          // 以前这里还有 pl-px pr-px：那 1px 内边距会在左右各露出一条底板背景色，
          // 组件自己设了别的背景色时特别明显（用户反馈「左右各有一条很小的缝」）。
          // 行内的接缝靠组件自身 -1px 负边距压住，画板不需要再留这 1px。
          ref={boardContentRef}
          style={{
            width: boardWidth,
            // 深色模式画布很暗，主题自带的深色边框会看不清：
            // 用变量包一层，global.css 里 html.dark 覆盖（不用 !important，
            // 否则会盖过导出时内联的 border:none，把边框漏进导出图）
            borderColor: `var(--guide-board-border-override, ${
              themes[currentTheme][1].colors.defaultBorder
            })`,
            backgroundColor:
              boardBackground ??
              themes[currentTheme][1].colors.defaultBackground,
            color:
              boardForeground ??
              themes[currentTheme][1].colors.defaultForeground,
            fontFamily: themes[currentTheme][1].fontFamily,
            transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {rows.map((row, idx) => (
            <React.Fragment key={`row-wrap-${idx}`}>
              <div className="flex items-center">
                <div className="w-full overflow-hidden">
                  <SortableContext
                    id={`row${idx + 1}`}
                    items={row.map(i => i.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <GuideBoard id={`row${idx + 1}`}>
                      {row.length > 0 ? (
                        row.map((item, itemIndex) => (
                          <DraggableItem
                            key={item.id}
                            id={item.id}
                            zoom={zoom}
                            // 行首/行尾取消那侧的 -1px 负边距：
                            // 否则它会被行容器的 overflow:hidden 裁掉 1px，
                            // 组件背景与底板不同色时就会在边上露出底板色
                            flushLeft={itemIndex === 0}
                            flushRight={itemIndex === row.length - 1}
                            selected={editingItem?.item.id === item.id}
                            data={{
                              type: "guide-item",
                              rowId: `row${idx + 1}`,
                              // 供 DragOverlay 渲染拖拽副本（不能叫 item，
                              // 那是「从组件列表拖入」的标记字段）
                              boardItem: item,
                            }}
                            onClick={e => {
                              const rect = (
                                e.currentTarget as HTMLElement
                              ).getBoundingClientRect();
                              setEditingItem({
                                item,
                                position: {
                                  x: rect.right,
                                  y: rect.top,
                                },
                                anchor: {
                                  left: rect.left,
                                  right: rect.right,
                                  top: rect.top,
                                  bottom: rect.bottom,
                                },
                              });
                            }}
                          >
                            {/* 主题内容 memo 化：zoom 只影响外层 DraggableItem，
                                这里 props 不变就不重建（见 BoardItemContent） */}
                            <BoardItemContent
                              item={item}
                              selectedId={editingItem?.item.id}
                              followBackground={
                                currentTheme === 3 ? boardBackground : null
                              }
                              themeDefaultBackground={
                                themes[currentTheme][1].colors
                                  .defaultBackground
                              }
                            />
                          </DraggableItem>
                        ))
                      ) : (
                        // 虚拟占位项
                        <div
                          key={`empty-${idx}`}
                          id={`empty-${idx}`}
                          style={{
                            flex: 1,
                            minHeight: 40,
                            opacity: 0.6,
                            color:
                              boardForeground ??
                              themes[currentTheme][1].colors
                                .defaultForeground,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none", // 不影响拖拽
                          }}
                        >
                          {t("board.emptyRowHint")}
                        </div>
                      )}
                    </GuideBoard>
                  </SortableContext>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginLeft: 8,
                    marginRight: -48,
                  }}
                >
                  {/* 只要不是只剩一行，每行（含第一行）都能删 */}
                  {rows.length > 1 && (
                    <Button
                      type="danger"
                      size="small"
                      onClick={() => handleRemoveRow(idx)}
                      className="operation-btn"
                    >
                      -
                    </Button>
                  )}
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleAddRow(idx)}
                    className="operation-btn"
                  >
                    +
                  </Button>
                </div>
              </div>
              {showDividers && idx < rows.length - 1 && (
                <LineEnd currentTheme={currentTheme} />
              )}
            </React.Fragment>
          ))}
        </div>
        {/* 主题选择器和宽度调节器，居中显示 */}
        <div
          style={{
            width: boardWidth,
            margin: "24px auto 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div className="flex items-center gap-2">
            <Typography.Text className="font-sans">
              {t("board.width")}
            </Typography.Text>
            <InputNumber
              min={256}
              max={1920}
              step={32}
              className="font-sans"
              value={boardWidth}
              onChange={val => {
                let num = Number(val);
                if (Number.isNaN(num)) num = 256;
                if (num < 256) num = 256;
                if (num > 1920) num = 1920;
                setBoardWidth(num);
              }}
              style={{ width: 120 }}
              suffix="px"
              size="large"
            />
          </div>
          <div className="flex items-center gap-2">
            <Typography.Text className="font-sans">
              {t("board.showDividers")}
            </Typography.Text>
            <Switch
              disabled={rows.length === 1}
              checked={showDividers}
              onChange={val => {
                setShowDividers(val);
              }}
            />
          </div>
        </div>
        {/* 编辑悬浮框 */}
        {editingItem &&
          createPortal(
            <div
              className="editing-popup bg-white dark:bg-[#232429]"
              onClick={e => e.stopPropagation()}
              ref={el => {
                //@ts-ignore
                popupRef.current = el;
              }}
              tabIndex={-1}
              style={{
                position: "fixed",
                left: editingItem.position.x,
                top: editingItem.position.y,
                zIndex: 114,
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                borderRadius: "16px",
                width: 200,
                // 弹窗内容可能比视口还高（如站点编号的卡片列表），
                // 翻转/贴边都救不了「本身放不下」的情况：封顶后内部滚动。
                // 用 dvh 跟随移动端地址栏收放（与项目其它地方一致）。
                maxHeight: "calc(100dvh - 32px)",
                overflowY: "auto",
                fontFamily: themes[currentTheme][1].fontFamily,
              }}
            >
              <Typography.Title heading={6}>
                {t("editor.title")}
              </Typography.Title>
              {(() => {
                // 从主题组件注册表中获取组件
                const ComponentClass = themes[currentTheme][1].components.find(
                  item => item.displayName === editingItem.item.type
                )?.component;
                if (!(ComponentClass as any).getEditorConfig) return null;

                // 每次渲染时重新生成配置，以确保使用最新的props值
                const config = (ComponentClass as any).getEditorConfig(t);

                return (
                  // 把当前组件的 props 下发给表单，供预览类元素跟随实时配色
                  <EditingPropsContext.Provider
                    value={editingItem.item.props || {}}
                  >
                    {config.forms.map((form: PropForm, index: number) => (
                      <div key={index} className="flex flex-col gap-1">
                        <Typography.Text
                          type="tertiary"
                          size="small"
                          className="mt-1.25"
                        >
                          {t(form.label)}
                        </Typography.Text>
                        {React.cloneElement(form.element as any, {
                          checked: editingItem.item.props[form.key],
                          value: (() => {
                            const v = editingItem.item.props[form.key];
                            if (v != null) return v;
                            // 配色属性留空 = 跟随主题默认：
                            // 传 null 让取色器显示「留空」占位而不是误显示白色，
                            // 色块由 fallbackColor 显示实际生效的主题默认色
                            if (
                              form.key === "foreground" ||
                              form.key === "background"
                            ) {
                              return null;
                            }
                            return v;
                          })(),
                          ...(form.element.type === CustomColorPicker
                            ? {
                                // 背景色不列「xx前景色」常量，前景色不列「xx背景色」
                                excludeKeys: excludeColorKeysFor(
                                  themes[currentTheme][1].colors.colors,
                                  form.key
                                ),
                                fallbackColor:
                                  form.key === "foreground"
                                    ? themes[currentTheme][1].colors
                                        .defaultForeground
                                    : themes[currentTheme][1].colors
                                        .defaultBackground,
                                placeholder: t("editor.followTheme"),
                              }
                            : {}),
                          onChange: (value: any) => {
                            setEditingItem({
                              ...editingItem,
                              item: {
                                ...editingItem.item,
                                props: {
                                  ...editingItem.item.props,
                                  [form.key]: value,
                                },
                              },
                            });
                            setRows(prev =>
                              mapChildrenDeep(
                                prev,
                                editingItem.item.id,
                                it =>
                                  rebuildItemElement({
                                    ...it,
                                    props: {
                                      ...it.props,
                                      [form.key]: value,
                                    },
                                  })
                              )
                            );
                            // 触发配置变化通知（包含撤销历史保存）
                            if (onConfigChange && !isRestoring) {
                              setTimeout(() => onConfigChange(), 50);
                            }
                          },
                        })}
                      </div>
                    ))}
                    {/* 添加删除按钮 */}
                    <div className="mt-4 pt-4 border-t border-solid border-gray-200 dark:border-[#2e2e35]">
                      <Button
                        type="danger"
                        theme="outline"
                        onClick={() => {
                          setRows(prev =>
                            removeItemDeep(prev, editingItem.item.id)
                          );
                          // 关闭编辑框
                          setEditingItem(null);
                          // 触发配置变化通知（包含撤销历史保存）
                          if (onConfigChange && !isRestoring) {
                            // 删除操作立即保存状态，避免被后续操作覆盖
                            onConfigChange(true);
                          }
                        }}
                        block
                      >
                        {t("editor.delete")}
                      </Button>
                    </div>
                  </EditingPropsContext.Provider>
                );
              })()}
            </div>,
            document.body
          )}
      </div>
    );
  }
));

export default GuideBoardCols;
