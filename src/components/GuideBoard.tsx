import { useDroppable } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { InputNumber, Button, Typography, Switch } from "@douyinfe/semi-ui";
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
      className="min-h-16 overflow-x-hidden h-16 w-full flex align-center relative transition-colors duration-200 ease-in-out"
      style={{
        transition: "all 200ms ease",
        background: isOver ? "#e6f7ff88" : undefined, // 拖拽时高亮
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
}

const GuideBoardCols = forwardRef<GuideBoardRef, GuideBoardProps>(
  ({ currentTheme, zoom = 1, onConfigChange }, ref) => {
    const { t } = useTranslation();
    // 动态行数组，每行是 DraggableItem[]
    const [rows, setRows] = useState<GuideItem[][]>([[]]);
    const [boardWidth, setBoardWidth] = useState(DEFAULT_WIDTH);
    const [showDividers, setShowDividers] = useState(true);
    const [isRestoring, setIsRestoring] = useState(false);
    const [editingItem, setEditingItem] = useState<{
      item: GuideItem;
      position: { x: number; y: number };
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
    }, [rows, boardWidth, showDividers, onConfigChange, isRestoring]);

    // ...existing code...
    const boardContentRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    // 处理点击外部关闭编辑框
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // 判断点击是否在编辑弹窗或 ColorPicker 的弹窗内
        if (
          editingItem &&
          !(event.target as Element).closest(".editing-popup") &&
          !(event.target as Element).closest(".semi-colorPicker-popover")
        ) {
          setEditingItem(null);
        }
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

        // 检查右边界
        if (newX + width > viewportWidth - margin) {
          newX = viewportWidth - width - margin;
        }
        // 检查下边界
        if (newY + height > viewportHeight - margin) {
          newY = viewportHeight - height - margin;
        }
        // 检查左边界
        if (newX < margin) {
          newX = margin;
        }
        // 检查上边界
        if (newY < margin) {
          newY = margin;
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
          },
        }),
        restoreState: state => {
          
          // 设置恢复状态标志，暂停配置变化通知
          setIsRestoring(true);

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
          setBoardWidth(state.config.width);
          setShowDividers(state.config.showSpecLine);

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
      [rows, boardWidth, showDividers, currentTheme]
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
      setRows(prev =>
        prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
      );
      // 触发配置变化通知（包含撤销历史保存）
      if (onConfigChange && !isRestoring) {
        // 添加/删除行操作立即保存状态
        onConfigChange(true);
      }
    };

    return (
      <div className="flex flex-col items-center">
        {/* GuideBoard 区域 */}
        <div
          className="border-2 pl-px pr-px border-solid flex flex-col guide-board select-none"
          ref={boardContentRef}
          style={{
            width: boardWidth,
            borderColor: themes[currentTheme][1].colors.defaultBorder,
            backgroundColor: themes[currentTheme][1].colors.defaultBackground,
            color: themes[currentTheme][1].colors.defaultForeground,
            fontFamily: themes[currentTheme][1].fontFamily,
            transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {rows.map((row, idx) => (
            <React.Fragment key={`row-wrap-${idx}`}>
              <div className="flex items-center">
                <div className="w-full overflow-x-hidden">
                  <SortableContext
                    id={`row${idx + 1}`}
                    items={row.map(i => i.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <GuideBoard id={`row${idx + 1}`}>
                      {row.length > 0 ? (
                        row.map(item => (
                          <DraggableItem
                            key={item.id}
                            id={item.id}
                            zoom={zoom}
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
                              });
                            }}
                          >
                            {React.isValidElement(item.element)
                              ? React.cloneElement(item.element, {
                                  ...item.props,
                                  // 双行容器内部条目被选中时，让它给对应子条目盖遮罩
                                  ...(item.type?.includes("TwoRowContainer")
                                    ? { selectedId: editingItem?.item.id }
                                    : {}),
                                })
                              : item.element}
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
                              themes[currentTheme][1].colors.defaultForeground,
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
                  {idx > 0 && (
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
              className="editing-popup"
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
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                borderRadius: "16px",
                width: 200,
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
                          value: editingItem.item.props[form.key],
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
                    <div className="mt-4 pt-4 border-t border-solid border-gray-200">
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
);

export default GuideBoardCols;
