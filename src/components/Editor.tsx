import { useRef, useState, useEffect, useCallback } from "react";
import ComponentsList from "./ComponentsList";
import GuideBoardCols, { type GuideBoardRef } from "./GuideBoard";
import type { GuideItem } from "../interfaces/guide";
import type { SaveData } from "../interfaces/editor";
import { Toast } from "@douyinfe/semi-ui";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import themes from "./themes/themereg";
import Header from "./Header";
import { useTranslation } from "react-i18next";
import { useUndoRedo } from "../hooks/useUndoRedo";

interface EditorProps {
  guideHeight?: number;
  onArchiveLoaded?: () => void;
}

// 撤销/重做状态类型
interface EditorState {
  rows: GuideItem[][];
  config: {
    width: number;
    showSpecLine: boolean;
  };
  currentTheme: number;
}

export default function Editor({
  guideHeight = 0,
  onArchiveLoaded,
}: EditorProps) {
  const { t } = useTranslation();
  const guideBoardRef = useRef<GuideBoardRef>(null);
  const [activeItem, setActiveItem] = useState<GuideItem | null>(null);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [isImporting, setIsImporting] = useState(false); // 添加导入状态标志
  const [isUndoRedoing, setIsUndoRedoing] = useState(false); // 添加撤销/重做状态标志
  const lastChangeRef = useRef(Date.now());
  const autoSaveIntervalMs = 2000; // 自动保存间隔

  // 撤销/重做状态管理
  const initialState: EditorState = {
    rows: [[]],
    config: { width: 512, showSpecLine: true },
    currentTheme: 0,
  };
  const {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear: clearHistory,
  } = useUndoRedo(initialState);

  // 记录状态到历史记录（防抖处理）
  const saveCurrentState = useCallback(() => {
    if (guideBoardRef.current && !isImporting && !isUndoRedoing) {
      const { rows, config } = guideBoardRef.current.getState();
      const state: EditorState = {
        rows,
        config,
        currentTheme,
      };
      console.log("💾 保存状态到历史记录:", {
        rowsCount: rows.length,
        config,
        currentTheme,
      });
      saveState(state);
    }
  }, [saveState, currentTheme, isImporting, isUndoRedoing]);

  // 撤销操作
  const handleUndo = useCallback(() => {
    console.log("🔙 执行撤销操作, canUndo:", canUndo);
    const previousState = undo();
    if (previousState && guideBoardRef.current) {
      console.log("🔙 撤销到状态:", {
        rowsCount: previousState.rows.length,
        theme: previousState.currentTheme,
      });
      // 设置撤销/重做状态，防止触发自动保存
      setIsUndoRedoing(true);

      // 设置主题
      if (previousState.currentTheme !== currentTheme) {
        setCurrentTheme(previousState.currentTheme);
      }

      // 恢复状态（转换数据格式）
      const restoreData = {
        rows: previousState.rows.map(row =>
          row.map(item => ({
            id: item.id,
            type: item.type,
            props: item.props,
          }))
        ),
        config: previousState.config,
      };

      guideBoardRef.current.restoreState(restoreData);

      // 延迟清除撤销/重做状态
      setTimeout(() => setIsUndoRedoing(false), 200);
    } else {
      console.log("🔙 撤销失败: 没有可撤销的状态");
    }
  }, [undo, currentTheme, canUndo]);

  // 重做操作
  const handleRedo = useCallback(() => {
    console.log("🔜 执行重做操作, canRedo:", canRedo);
    const nextState = redo();
    if (nextState && guideBoardRef.current) {
      console.log("🔜 重做到状态:", {
        rowsCount: nextState.rows.length,
        theme: nextState.currentTheme,
      });
      // 设置撤销/重做状态，防止触发自动保存
      setIsUndoRedoing(true);

      // 设置主题
      if (nextState.currentTheme !== currentTheme) {
        setCurrentTheme(nextState.currentTheme);
      }

      // 恢复状态（转换数据格式）
      const restoreData = {
        rows: nextState.rows.map(row =>
          row.map(item => ({
            id: item.id,
            type: item.type,
            props: item.props,
          }))
        ),
        config: nextState.config,
      };

      guideBoardRef.current.restoreState(restoreData);

      // 延迟清除撤销/重做状态
      setTimeout(() => setIsUndoRedoing(false), 200);
    } else {
      console.log("🔜 重做失败: 没有可重做的状态");
    }
  }, [redo, currentTheme, canRedo]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const [isEditingOpen, setIsEditingOpen] = useState(false);

  // 添加全局鼠标位置跟踪
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // 将屏幕坐标转换为内容坐标系统
  const transformMouseCoords = (screenX: number, screenY: number) => {
    if (!editorAreaRef.current) return { x: screenX, y: screenY };

    const editorRect = editorAreaRef.current.getBoundingClientRect();

    // 1. 将屏幕坐标转换为相对于 editorArea 的坐标
    const x = screenX - editorRect.left;
    const y = screenY - editorRect.top;

    // 2. 应用逆变换
    // 变换公式: new_coord = (coord - pan) / zoom
    // 我们需要的是相对于 editorArea 中心的变换
    const centerX = editorRect.width / 2;
    const centerY = editorRect.height / 2;

    // 现在使用 transform: scale(zoom) translate(pan)（先缩放再位移，位移不受缩放影响）
    // 前向：view = center + zoom * (content - center) + pan
    // 逆向：content = center + (view - center - pan) / zoom
    const contentX = centerX + (x - centerX - pan.x) / zoom;
    const contentY = centerY + (y - centerY - pan.y) / zoom;

    return { x: contentX, y: contentY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    // 键盘快捷键监听
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否在输入框中
      const target = e.target as HTMLElement;
      const isInInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      if (isInInput) return;

      // Ctrl+Z 撤销
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y 或 Ctrl+Shift+Z 重做
      else if (
        (e.ctrlKey && e.key === "y") ||
        (e.ctrlKey && e.shiftKey && e.key === "Z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);

    // 监听来自 GuideBoard 的编辑态变化
    const onEditingChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isEditing: boolean };
      setIsEditingOpen(!!detail?.isEditing);
    };
    window.addEventListener(
      "guide-editing-change",
      onEditingChange as EventListener
    );

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(
        "guide-editing-change",
        onEditingChange as EventListener
      );
    };
  }, [handleUndo, handleRedo]);

  // 处理编辑区的鼠标事件（拖拽和缩放）
  const handleEditorMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 编辑器打开时禁用背景拖拽
      if (isEditingOpen) return;

      // 只要点击位置不在 .guide-board 内部，就认为是空白区域，可用于拖拽视图
      const targetEl = e.target as HTMLElement;
      const inGuideBoard = !!targetEl.closest(".guide-board");
      if (!inGuideBoard) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX,
          y: e.clientY,
          panX: pan.x,
          panY: pan.y,
        });
        e.preventDefault();
      }
    },
    [pan, isEditingOpen]
  );

  const handleEditorMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setPan({
          x: dragStart.panX + deltaX,
          y: dragStart.panY + deltaY,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleEditorMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleEditorWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (isEditingOpen) return; // 编辑弹窗打开时禁用滚轮缩放
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.5, Math.min(4, zoom + delta));
      setZoom(newZoom);
    },
    [zoom, isEditingOpen]
  );

  // 全局鼠标事件处理
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setPan({
          x: dragStart.panX + deltaX,
          y: dragStart.panY + deltaY,
        });
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, dragStart]);

  // 拖拽指示器状态
  const [dropIndicator, setDropIndicator] = useState<{
    show: boolean;
    x: number;
    y: number;
    height: number;
  }>({ show: false, x: 0, y: 0, height: 0 });

  // 导出存档
  const stripGuideItem = (
    item: GuideItem
  ): { id: string; type: string; props: Record<string, any> } => {
    const props: any = { ...(item.props || {}) };
    // element 不保存
    delete props.element;
    // children 若存在，为数组则递归剥离元素
    if (Array.isArray(props.children)) {
      props.children = props.children.map((row: any[]) =>
        (row || []).map((child: any) =>
          stripGuideItem({
            id: child.id,
            type: child.type,
            props: child.props,
            element: child.element,
          } as GuideItem)
        )
      );
    }
    return { id: item.id, type: item.type, props };
  };

  const exportSaveData = () => {
    if (!guideBoardRef.current) return;
    const { rows, config } = guideBoardRef.current.getState();
    const saveData: SaveData = {
      version: 1,
      config: {
        ...config,
        theme: themes[currentTheme][0],
      },
      rows: rows.map(row => row.map(stripGuideItem)),
    };

    // 下载文件
    const blob = new Blob([JSON.stringify(saveData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MoeRT_GuideGen_Save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.success(t("saves.export.success"));
  };

  // 导入存档
  const importSaveData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const saveData = JSON.parse(text) as SaveData;

        if (saveData.version !== 1) {
          throw new Error(t("saves.import.unsupportedVersion"));
        }

        // 设置导入状态，防止主题变化触发保存
        setIsImporting(true);

        // 设置主题并等待状态更新
        await new Promise<void>(resolve => {
          const themeIndex = themes.findIndex(
            ([name]) => name === saveData.config.theme
          );
          if (themeIndex !== -1) {
            // 先设置主题
            setCurrentTheme(themeIndex);
            // 等待主题更新完成
            setTimeout(() => {
              if (guideBoardRef.current) {
                // 恢复状态
                guideBoardRef.current.restoreState(saveData);
                // 更新上一次主题引用，防止自动保存触发主题重置
                prevThemeRef.current = themeIndex;
                // 清除导入状态
                setIsImporting(false);
                Toast.success(t("saves.import.success"));
                // 清空撤销历史并保存当前状态
                clearHistory();
                setTimeout(() => saveCurrentState(), 100);
              }
              resolve();
            }, 100);
          } else {
            // 如果主题没有改变，直接恢复状态
            if (guideBoardRef.current) {
              guideBoardRef.current.restoreState(saveData);
              Toast.success(t("saves.import.success"));
              // 清空撤销历史并保存当前状态
              clearHistory();
              setTimeout(() => saveCurrentState(), 100);
            }
            setIsImporting(false);
            resolve();
          }
        });
      } catch (err) {
        setIsImporting(false);
        Toast.error(`${t("saves.import.error")}: ${(err as Error).message}`);
      }
    };
    input.click();
  };

  // 自动保存 - 使用 useCallback 避免闭包问题
  const saveToLocalStorage = useCallback(() => {
    if (!guideBoardRef.current) return;
    const { rows, config } = guideBoardRef.current.getState();
    const saveData: SaveData = {
      version: 1,
      config: {
        ...config,
        theme: themes[currentTheme][0],
      },
      rows: rows.map(row => row.map(stripGuideItem)),
    };
    localStorage.setItem("guide-autosave", JSON.stringify(saveData));
    lastChangeRef.current = Date.now();
  }, []); // 移除 currentTheme 依赖，使用当前值

  // 从 LocalStorage 加载
  const loadFromLocalStorage = async () => {
    try {
      // 若用户刚清理本地存档，跳过加载
      if (localStorage.getItem("guide-clearing") === "1") {
        localStorage.removeItem("guide-clearing");
        return;
      }
      const saved = localStorage.getItem("guide-autosave");
      if (!saved) return;

      const saveData = JSON.parse(saved) as SaveData;
      if (saveData.version !== 1) return;

      return new Promise<void>(resolve => {
        const themeIndex = themes.findIndex(
          ([name, _]) => name === saveData.config.theme
        );

        if (themeIndex !== -1 && themeIndex !== currentTheme) {
          // 先设置主题
          setCurrentTheme(themeIndex);
          // 更新上一次主题引用，防止自动保存触发主题重置
          prevThemeRef.current = themeIndex;
          // 等待主题更新
          setTimeout(() => {
            if (guideBoardRef.current) {
              guideBoardRef.current.restoreState(saveData);
              resolve();
            }
          }, 100);
        } else {
          // 如果主题没变，直接恢复状态
          if (guideBoardRef.current) {
            guideBoardRef.current.restoreState(saveData);
            resolve();
          }
        }
      });
    } catch {
      // 加载自动存档失败
    }
  };

  // 记录上一次的主题，用于检测变化
  const [isInitialized, setIsInitialized] = useState(false);
  const prevThemeRef = useRef(currentTheme);
  const configChangeTimeoutRef = useRef<number>(500);

  // 监听配置变化并触发保存
  const handleConfigChange = () => {
    // 未初始化时不保存，避免循环
    if (!isInitialized || isUndoRedoing) return;

    if (configChangeTimeoutRef.current) {
      window.clearTimeout(configChangeTimeoutRef.current);
    }
    configChangeTimeoutRef.current = window.setTimeout(() => {
      lastChangeRef.current = Date.now();
      saveToLocalStorage();
      // 保存到撤销/重做历史
      saveCurrentState();
    }, 500);
  };

  // 监听主题变化
  useEffect(() => {
    if (isInitialized) {
      // 只有当主题真的改变时才触发保存
      if (prevThemeRef.current !== currentTheme) {
        prevThemeRef.current = currentTheme;
        handleConfigChange();
      }
    }
  }, [currentTheme, isInitialized]);

  // 初始化和自动保存
  useEffect(() => {
    const saveInterval: number | null = null;

    const init = async () => {
      try {
        // 1. 确保完全加载
        await loadFromLocalStorage();
        // 等待一下，确保 DOM 更新完成
        await new Promise(resolve => setTimeout(resolve, 100));
        prevThemeRef.current = currentTheme;
        setIsInitialized(true);
        // 通知App组件档案加载完成
        onArchiveLoaded?.();
        // 延迟保存初始状态到撤销历史，确保所有状态都已初始化
        setTimeout(() => {
          if (guideBoardRef.current) {
            saveCurrentState();
          }
        }, 200);
      } catch {
        setIsInitialized(true);
        // 即使失败也要通知加载完成
        onArchiveLoaded?.();
      }
    };

    init();

    return () => {
      if (saveInterval) clearInterval(saveInterval);
      if (configChangeTimeoutRef.current) {
        clearTimeout(configChangeTimeoutRef.current);
      }
    };
  }, []); // 移除 onArchiveLoaded 依赖，防止重复初始化

  // 设置自动保存定时器 - 恢复正常的2秒定时保存
  useEffect(() => {
    if (!isInitialized) return;

    const saveInterval = window.setInterval(() => {
      // 检查是否需要保存：距离上次变化超过1秒
      if (Date.now() - lastChangeRef.current > 1000) {
        if (!guideBoardRef.current) return;
        const { rows, config } = guideBoardRef.current.getState();
        const saveData: SaveData = {
          version: 1,
          config: {
            ...config,
            theme: themes[currentTheme][0],
          },
          rows: rows.map(row => row.map(stripGuideItem)),
        };
        localStorage.setItem("guide-autosave", JSON.stringify(saveData));
      }
    }, autoSaveIntervalMs); // 2秒间隔

    return () => {
      clearInterval(saveInterval);
    };
  }, [isInitialized, currentTheme]); // 重新添加必要的依赖

  const handleDragStart = (event: DragStartEvent) => {
    const draggedItem = event.active.data.current?.item as GuideItem;
    if (draggedItem) {
      setActiveItem(draggedItem);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setDropIndicator({ show: false, x: 0, y: 0, height: 0 }); // 隐藏指示器

    if (!over) return;

    const draggedItem = active.data.current?.item;
    const sourceRowId = active.data.current?.rowId;

    // 获取准确的 overRowId
    let overRowId = over.data.current?.rowId;
    if (!overRowId && over.id.toString().startsWith("row")) {
      overRowId = over.id.toString();
    }

    // 移除 TwoRowContainer 内部行的特殊处理

    if (!overRowId) return;

    // 从组件列表拖入
    if (draggedItem && !sourceRowId && overRowId) {
      const newId = `${draggedItem.type || "item"}-${Math.random().toString(36).substring(2)}`;
      const rowNumber = overRowId.match(/^row(\d+)/);
      if (!rowNumber) return;

      const targetRowId = `row${rowNumber[1]}`;

      // 计算插入位置
      const rowContainer = document.querySelector(
        `[data-row="${targetRowId}"]`
      );
      let insertIndex: number | undefined;

      if (rowContainer) {
        // 使用视口坐标进行比较（与 getBoundingClientRect() 一致的坐标系）
        const pointerX = mousePositionRef.current.x;

        const children = Array.from(rowContainer.children).filter(child => {
          const element = child as HTMLElement;
          // 过滤掉空占位符、拖拽相关元素和隐藏元素
          const id = element.getAttribute("id") || "";
          const isDragRelated =
            element.classList.contains("sortable-ghost") ||
            element.classList.contains("sortable-chosen") ||
            element.classList.contains("sortable-placeholder") ||
            element.style.display === "none";
          const isEmptyPlaceholder = id.startsWith("empty-");
          const isScriptOrStyle =
            element.tagName === "SCRIPT" || element.tagName === "STYLE";
          // 注意：在组件列表拖入时不需要过滤正在拖拽的元素（因为它还不在目标行中）

          return !isDragRelated && !isEmptyPlaceholder && !isScriptOrStyle;
        }) as HTMLElement[];

        if (children.length > 0 && pointerX > 0) {
          // 找到合适的插入位置
          insertIndex = children.length; // 默认插入到最后
          for (let i = 0; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect();
            if (pointerX < rect.left + rect.width / 2) {
              insertIndex = i;
              break;
            }
          }
        } else if (children.length === 0) {
          // 空行，插入到第一个位置
          insertIndex = 0;
        }
      }

      const newItem: GuideItem = {
        ...draggedItem,
        id: newId,
      };

      // 无 TwoRowContainer 特殊处理

      guideBoardRef.current?.addItemToRow(targetRowId, newItem, insertIndex);
      lastChangeRef.current = Date.now();
      // 保存状态到撤销历史
      setTimeout(() => saveCurrentState(), 50);
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
            lastChangeRef.current = Date.now();
            // 保存状态到撤销历史
            setTimeout(() => saveCurrentState(), 50);
          }
        }
      } else {
        // 跨行移动
        const rowNumber = overRowId.match(/^row(\d+)/);
        if (!rowNumber) return;

        const targetRowId = `row${rowNumber[1]}`;

        // 计算插入位置 - 注意这里需要在移除源元素之前计算位置
        const rowContainer = document.querySelector(
          `[data-row="${targetRowId}"]`
        );
        let insertIndex: number | undefined;

        if (rowContainer) {
          // 使用视口坐标进行比较
          const pointerX = mousePositionRef.current.x;

          const children = Array.from(rowContainer.children).filter(child => {
            const element = child as HTMLElement;
            // 过滤掉空占位符、拖拽相关元素和隐藏元素
            const id = element.getAttribute("id") || "";
            const isDragRelated =
              element.classList.contains("sortable-ghost") ||
              element.classList.contains("sortable-chosen") ||
              element.classList.contains("sortable-placeholder") ||
              element.style.display === "none";
            const isEmptyPlaceholder = id.startsWith("empty-");
            const isScriptOrStyle =
              element.tagName === "SCRIPT" || element.tagName === "STYLE";
            // 跨行移动时，排除正在被拖拽的元素本身（它已经在源行中被移除）
            const isDraggedElement = active.id.toString() === id;

            return (
              !isDragRelated &&
              !isEmptyPlaceholder &&
              !isScriptOrStyle &&
              !isDraggedElement
            );
          }) as HTMLElement[];

          if (children.length > 0 && pointerX > 0) {
            // 找到合适的插入位置
            insertIndex = children.length; // 默认插入到最后
            for (let i = 0; i < children.length; i++) {
              const rect = children[i].getBoundingClientRect();
              if (pointerX < rect.left + rect.width / 2) {
                insertIndex = i;
                break;
              }
            }
          } else if (children.length === 0) {
            // 空行，插入到第一个位置
            insertIndex = 0;
          }
        }

        // 先移除源元素，再插入到目标位置
        const item = guideBoardRef.current?.removeItemFromRow(
          sourceRowId,
          active.id.toString()
        );
        if (item) {
          guideBoardRef.current?.addItemToRow(targetRowId, item, insertIndex);
          lastChangeRef.current = Date.now();
          // 保存状态到撤销历史
          setTimeout(() => saveCurrentState(), 50);
        }
      }
    }
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
      return;
    }

    const draggedItem = active.data.current?.item;
    const sourceRowId = active.data.current?.rowId;

    // 获取准确的 overRowId
    let overRowId = over.data.current?.rowId;
    if (!overRowId && over.id.toString().startsWith("row")) {
      overRowId = over.id.toString();
    }

    // 检查是否是 TwoRowContainer 内部行
    const isTwoRowContainerTarget =
      over.data.current?.type === "two-row-container-row";
    const twoRowTargetId = over.data.current?.rowId;

    // 处理拖拽到 TwoRowContainer 内部行的情况
    if (
      !sourceRowId &&
      draggedItem &&
      isTwoRowContainerTarget &&
      twoRowTargetId
    ) {
      // 阻止拖拽 TwoRowContainer 到自身内部
      if (draggedItem.type?.indexOf("TwoRowContainer") !== -1) {
        setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
        return;
      }

      // 找到 TwoRowContainer 内部行的位置并显示指示器
      const targetElement = document.querySelector(`[id="${twoRowTargetId}"]`);
      if (targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        const guideBoardRect = document
          .querySelector(".guide-board")
          ?.getBoundingClientRect();

        if (guideBoardRect) {
          // 将视口坐标转换为内容坐标（与指示器所在容器一致）
          const gbContent = transformMouseCoords(
            guideBoardRect.left,
            guideBoardRect.top
          );
          const tgtTopLeftContent = transformMouseCoords(
            targetRect.left,
            targetRect.top
          );
          const tgtBottomLeftContent = transformMouseCoords(
            targetRect.left,
            targetRect.bottom
          );

          setDropIndicator({
            show: true,
            x: tgtTopLeftContent.x - gbContent.x + 10 / zoom,
            y: tgtTopLeftContent.y - gbContent.y,
            height: tgtBottomLeftContent.y - tgtTopLeftContent.y,
          });
        }
      }
      return;
    }

    // 如果不是在有效的行上，隐藏指示器
    if (!overRowId) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
      return;
    }

    // 如果是从组件列表拖入，显示指示器
    if (!sourceRowId && draggedItem) {
      // 如果拖拽的是 TwoRowContainer，不显示指示器（因为它是容器组件，直接添加到行中）
      if (draggedItem.type?.indexOf("TwoRowContainer") !== -1) {
        setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
        return;
      }

      const rowNumber = overRowId.match(/^row(\d+)/);
      if (!rowNumber) {
        setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
        return;
      }

      const targetRowId = `row${rowNumber[1]}`;
      const rowContainer = document.querySelector(
        `[data-row="${targetRowId}"]`
      );

      if (rowContainer) {
        const rowRect = rowContainer.getBoundingClientRect();
        const guideBoardRect = document
          .querySelector(".guide-board")
          ?.getBoundingClientRect();

        if (guideBoardRect) {
          // 使用视口坐标进行比较
          const pointerX = mousePositionRef.current.x;

          // 计算插入位置
          const children = Array.from(rowContainer.children).filter(child => {
            const element = child as HTMLElement;
            // 过滤掉空占位符、拖拽相关元素和隐藏元素
            const id = element.getAttribute("id") || "";
            const isDragRelated =
              element.classList.contains("sortable-ghost") ||
              element.classList.contains("sortable-chosen") ||
              element.classList.contains("sortable-placeholder") ||
              element.style.display === "none";
            const isEmptyPlaceholder = id.startsWith("empty-");
            const isScriptOrStyle =
              element.tagName === "SCRIPT" || element.tagName === "STYLE";
            const isDraggedElement = active.id.toString() === id;

            return (
              !isDragRelated &&
              !isEmptyPlaceholder &&
              !isScriptOrStyle &&
              !isDraggedElement
            );
          }) as HTMLElement[];

          let insertX = rowRect.left + 10; // 默认在行首，留一点边距

          if (children.length > 0) {
            // 找到合适的插入位置
            let foundPosition = false;
            for (let i = 0; i < children.length; i++) {
              const rect = children[i].getBoundingClientRect();
              if (pointerX < rect.left + rect.width / 2) {
                insertX = rect.left;
                foundPosition = true;
                break;
              }
            }
            // 如果没有找到位置，插入到最后一个元素的右边
            if (!foundPosition) {
              const lastChild = children[children.length - 1];
              const lastRect = lastChild.getBoundingClientRect();
              insertX = lastRect.right;
            }
          } else {
            // 空行的情况，显示在行的中间
            insertX = rowRect.left + rowRect.width / 2;
          }

          // 视口 -> 内容坐标
          const gbContent = transformMouseCoords(
            guideBoardRect.left,
            guideBoardRect.top
          );
          const insContentX = transformMouseCoords(insertX, rowRect.top).x;
          const rowTopContent = transformMouseCoords(rowRect.left, rowRect.top);
          const rowBottomContent = transformMouseCoords(
            rowRect.left,
            rowRect.bottom
          );

          setDropIndicator({
            show: true,
            x: insContentX - gbContent.x,
            y: rowTopContent.y - gbContent.y,
            height: rowBottomContent.y - rowTopContent.y,
          });
        }
      }
      return;
    }

    // 如果没有源行ID或拖拽项，隐藏指示器
    if (!sourceRowId || !draggedItem) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
      return;
    }

    // 确保 overRowId 是正确的格式
    const rowNumber = overRowId.match(/^row(\d+)/);
    if (!rowNumber) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
      return;
    }

    const targetRowId = `row${rowNumber[1]}`;

    // 使用变换后的鼠标位置
    const pointerX = mousePositionRef.current.x;

    // 获取拖拽元素在源行中的索引
    const oldIndex = guideBoardRef.current?.getItemIndex(
      sourceRowId,
      active.id.toString()
    );

    if (typeof oldIndex !== "number" || oldIndex === -1) {
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
      return;
    }

    // 跨行拖拽，显示指示器
    if (sourceRowId !== targetRowId) {
      const rowContainer = document.querySelector(
        `[data-row="${targetRowId}"]`
      );
      if (rowContainer) {
        const rowRect = rowContainer.getBoundingClientRect();
        const guideBoardRect = document
          .querySelector(".guide-board")
          ?.getBoundingClientRect();

        if (guideBoardRect) {
          // 使用视口坐标进行比较
          const pointerX = mousePositionRef.current.x;

          // 计算插入位置
          const children = Array.from(rowContainer.children).filter(child => {
            const element = child as HTMLElement;
            // 过滤掉空占位符、拖拽相关元素和隐藏元素
            const id = element.getAttribute("id") || "";
            const isDragRelated =
              element.classList.contains("sortable-ghost") ||
              element.classList.contains("sortable-chosen") ||
              element.classList.contains("sortable-placeholder") ||
              element.style.display === "none";
            const isEmptyPlaceholder = id.startsWith("empty-");
            const isScriptOrStyle =
              element.tagName === "SCRIPT" || element.tagName === "STYLE";
            const isDraggedElement = active.id.toString() === id;

            return (
              !isDragRelated &&
              !isEmptyPlaceholder &&
              !isScriptOrStyle &&
              !isDraggedElement
            );
          }) as HTMLElement[];

          let insertX = rowRect.left + 10; // 默认在行首，留一点边距

          if (children.length > 0) {
            // 找到合适的插入位置
            let foundPosition = false;
            for (let i = 0; i < children.length; i++) {
              const rect = children[i].getBoundingClientRect();
              // 检查鼠标是否在当前元素的左半部分
              if (pointerX < rect.left + rect.width / 2) {
                insertX = rect.left;
                foundPosition = true;
                break;
              }
            }
            // 如果没有找到位置，插入到最后一个元素的右边
            if (!foundPosition) {
              const lastChild = children[children.length - 1];
              const lastRect = lastChild.getBoundingClientRect();
              insertX = lastRect.right;
            }
          } else {
            // 空行的情况，显示在行的中间
            insertX = rowRect.left + rowRect.width / 2;
          }

          // 视口 -> 内容坐标
          const gbContent = transformMouseCoords(
            guideBoardRect.left,
            guideBoardRect.top
          );
          const insContentX = transformMouseCoords(insertX, rowRect.top).x;
          const rowTopContent = transformMouseCoords(rowRect.left, rowRect.top);
          const rowBottomContent = transformMouseCoords(
            rowRect.left,
            rowRect.bottom
          );

          setDropIndicator({
            show: true,
            x: insContentX - gbContent.x,
            y: rowTopContent.y - gbContent.y,
            height: rowBottomContent.y - rowTopContent.y,
          });
        }
      }
    } else {
      // 同行内拖拽，隐藏指示器，继续预览重排序
      setDropIndicator({ show: false, x: 0, y: 0, height: 0 });

      const rowContainer = document.querySelector(
        `[data-row="${targetRowId}"]`
      );
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
      sensors={useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
      )}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      collisionDetection={closestCenter}
    >
      <div className="flex flex-col h-screen">
        <Header
          onExport={exportSaveData}
          onImport={importSaveData}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          guideHeight={guideHeight}
          zoom={zoom}
          onZoomChange={setZoom}
          disableZoom={isEditingOpen}
          onClearHistory={clearHistory}
        />
        <div className="flex h-0 flex-1">
          <ComponentsList
            currentTheme={currentTheme}
            onThemeChange={theme => {
              // 在导入过程中忽略主题变化
              if (isImporting) {
                return;
              }
              setCurrentTheme(theme);
              guideBoardRef.current?.clearBoard();
              // 在切换主题后保存状态，而不是清空历史
              setTimeout(() => saveCurrentState(), 100);
            }}
          />
          <div
            ref={editorAreaRef}
            className="flex-1 relative overflow-hidden bg-gray-50"
            style={{ cursor: isDragging ? "grabbing" : "default" }}
            onMouseDown={handleEditorMouseDown}
            onMouseMove={handleEditorMouseMove}
            onMouseUp={handleEditorMouseUp}
            onWheel={handleEditorWheel}
          >
            <div
              className="absolute inset-0 flex items-center justify-center z-1"
              style={{
                // 先缩放，再位移；位移不受缩放影响
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: "center",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                cursor: isDragging ? "grabbing" : "default",
              }}
            >
              <div style={{ position: "relative" }}>
                <GuideBoardCols
                  ref={guideBoardRef}
                  currentTheme={currentTheme}
                  zoom={zoom}
                  onConfigChange={handleConfigChange}
                />
                {/* 拖拽指示器 - 现在直接在GuideBoard的相对定位容器中 */}
                {dropIndicator.show && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: dropIndicator.x,
                      top: dropIndicator.y,
                      width: 2,
                      height: dropIndicator.height,
                      backgroundColor: "#66ccff",
                      borderRadius: 1,
                      zIndex: 50,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <img
          className="love-salt-kawaii-qwq fixed opacity-30 cursor-none -right-50px bottom-0 w-600px select-none"
          src="/imgs/salt.png"
        />
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
              transform: `scale(${zoom})`,
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
