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
  type Over,
  rectIntersection,
  pointerWithin,
  closestCenter,
  getClientRect,
  MeasuringStrategy,
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
  // 正在拖拽的元素（用于 DragOverlay 渲染跟随指针的副本）
  const [activeDrag, setActiveDrag] = useState<{
    item: GuideItem;
    scale: number;
    fromBoard: boolean;
  } | null>(null);
  // 单次拖拽的过程状态：起始行、是否已经实时跨行搬运过
  const dragMetaRef = useRef<{ sourceRowId?: string; movedRows: boolean }>({
    movedRows: false,
  });
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
      saveState(state);
    }
  }, [saveState, currentTheme, isImporting, isUndoRedoing]);

  // 撤销操作
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState && guideBoardRef.current) {
      // 设置撤销/重做状态，防止触发自动保存
      setIsUndoRedoing(true);

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

      // 如果需要切换主题，先切主题再恢复，等待主题生效
      if (previousState.currentTheme !== currentTheme) {
        setCurrentTheme(previousState.currentTheme);
        setTimeout(() => {
          guideBoardRef.current?.restoreState(restoreData);
          // 在恢复完成后再清除撤销/重做标志，避免自动保存提前触发
          setTimeout(() => setIsUndoRedoing(false), 200);
        }, 150);
      } else {
        // 主题未变化，直接恢复
        guideBoardRef.current.restoreState(restoreData);
        // 延迟清除撤销/重做状态
        setTimeout(() => setIsUndoRedoing(false), 200);
      }
    }
  }, [undo, currentTheme, canUndo]);

  // 重做操作
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState && guideBoardRef.current) {
      // 设置撤销/重做状态，防止触发自动保存
      setIsUndoRedoing(true);

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

      // 如果主题不同，切换主题并等待后再恢复
      if (nextState.currentTheme !== currentTheme) {
        setCurrentTheme(nextState.currentTheme);
        setTimeout(() => {
          guideBoardRef.current?.restoreState(restoreData);
          setTimeout(() => setIsUndoRedoing(false), 200);
        }, 150);
      } else {
        guideBoardRef.current.restoreState(restoreData);
        setTimeout(() => setIsUndoRedoing(false), 200);
      }
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

  // 插入位置指示线：只在「从左侧组件列表拖入」时显示
  // （面板内已有的元素在拖动时是实时排布预览，不需要指示线）
  const [dropIndicator, setDropIndicator] = useState<{
    show: boolean;
    x: number;
    y: number;
    height: number;
  }>({ show: false, x: 0, y: 0, height: 0 });

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

  // 隐藏指示线（只有真的在显示时才更新，避免拖拽过程中无谓的重渲染）
  const hideDropIndicator = useCallback(() => {
    setDropIndicator(prev =>
      prev.show ? { show: false, x: 0, y: 0, height: 0 } : prev
    );
  }, []);

  // 从组件列表拖入时，计算并显示插入位置的蓝线
  const updateDropIndicator = (
    activeData: Record<string, any>,
    overData: Record<string, any>,
    over: Over
  ) => {
    // 只有「新组件拖入」才需要指示线；拖到左侧组件栏（删除区）也不显示
    const isNewItemDrag = Boolean(activeData.item) && !activeData.rowId;
    if (!isNewItemDrag || overData.type === "trash") {
      hideDropIndicator();
      return;
    }

    // 目标容器：普通行，或双行容器内部的某一行
    let rowEl: HTMLElement | null = null;
    if (overData.rowId && !/^row\d+$/.test(String(overData.rowId))) {
      rowEl = document.querySelector(
        `[id="${overData.rowId}"] .two-row-inner`
      ) as HTMLElement | null;
    } else {
      const candidate = String(overData.rowId ?? over.id);
      if (/^row\d+$/.test(candidate)) {
        rowEl = document.querySelector(
          `[data-row="${candidate}"]`
        ) as HTMLElement | null;
      }
    }
    const boardEl = document.querySelector(".guide-board") as HTMLElement | null;
    if (!rowEl || !boardEl) {
      hideDropIndicator();
      return;
    }

    const rowRect = rowEl.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();
    const pointerX = mousePositionRef.current.x;

    const children = (Array.from(rowEl.children) as HTMLElement[]).filter(el => {
      const id = el.getAttribute("id") || "";
      return !id.startsWith("empty-") && el.style.display !== "none";
    });

    let insertX = rowRect.left;
    if (children.length > 0) {
      // 落在第一个「指针还没越过中线」的元素前面，否则追加到最后一个元素后面
      const next = children.find(el => {
        const rect = el.getBoundingClientRect();
        return pointerX < rect.left + rect.width / 2;
      });
      insertX = next
        ? next.getBoundingClientRect().left
        : children[children.length - 1].getBoundingClientRect().right;
    }

    // 指示线和画板处于同一个缩放层内，位移要换算回布局像素
    const scale = zoom || 1;
    const next = {
      show: true,
      x: (insertX - boardRect.left) / scale,
      y: (rowRect.top - boardRect.top) / scale,
      height: rowRect.height / scale,
    };
    setDropIndicator(prev =>
      prev.show &&
      Math.abs(prev.x - next.x) < 0.5 &&
      Math.abs(prev.y - next.y) < 0.5 &&
      Math.abs(prev.height - next.height) < 0.5
        ? prev
        : next
    );
  };

  // 依据指针落在目标元素的左半 / 右半，算出插入下标
  const insertIndexForOver = (targetRowId: string, over: Over) => {
    const overIndex =
      guideBoardRef.current?.getItemIndex(targetRowId, over.id.toString()) ?? -1;
    if (overIndex === -1) return undefined; // 落在行的空白处 → 追加到行尾
    const rect = over.rect;
    const pointerX = mousePositionRef.current.x;
    return pointerX > rect.left + rect.width / 2 ? overIndex + 1 : overIndex;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = (event.active.data.current || {}) as Record<string, any>;
    dragMetaRef.current = { sourceRowId: data.rowId, movedRows: false };
    const draggedItem = (data.boardItem ?? data.item) as GuideItem | undefined;
    if (draggedItem) {
      setActiveDrag({
        item: draggedItem,
        // 组件列表里的元素本身没有缩放，按编辑区缩放预览；
        // 面板上的元素还要叠加所在容器的内部缩放（如双行容器的 0.5）
        scale: zoom * (typeof data.scale === "number" ? data.scale : 1),
        fromBoard: Boolean(data.boardItem),
      });
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);
    setDropIndicator({ show: false, x: 0, y: 0, height: 0 });

    // 拖拽过程中已经实时跨行搬运过：即使最后没有落在有效目标上，也要记录这次变更
    const dragMeta = dragMetaRef.current;
    const movedRows = dragMeta.movedRows;
    dragMetaRef.current = { movedRows: false };

    if (!over) {
      if (movedRows) {
        lastChangeRef.current = Date.now();
        setTimeout(() => saveCurrentState(), 50);
      }
      return;
    }

    const draggedItem = active.data.current?.item;
    // 元素可能在拖拽过程中已经被实时搬到别的行，以记录的当前行为准
    const sourceRowId = dragMeta.sourceRowId ?? active.data.current?.rowId;
    const overData = (over.data.current || {}) as Record<string, any>;
    const activeData = (active.data.current || {}) as Record<string, any>;

    // ===== 拖回左侧组件栏 = 删除 =====
    if (overData.type === "trash") {
      if (!activeData.boardItem) return; // 组件列表里拖出来又拖回去，什么都不做
      if (activeData.context === "two-row" && activeData.containerId) {
        guideBoardRef.current?.removeItemFromTwoRowContainer(
          activeData.containerId,
          activeData.rowIndex,
          active.id.toString()
        );
      } else if (sourceRowId) {
        guideBoardRef.current?.removeItemFromRow(
          sourceRowId,
          active.id.toString()
        );
      }
      lastChangeRef.current = Date.now();
      setTimeout(() => saveCurrentState(), 50);
      return;
    }

    // 检查是否是双行容器相关的拖拽
    // （落点既可能是容器的某一行，也可能是这一行里的某个元素）
    const isTwoRowContainerTarget =
      overData.type === "two-row-container-row" ||
      overData.context === "two-row";
    const twoRowContainerId = overData.containerId;
    const twoRowTargetRowIndex = overData.rowIndex;
    const twoRowTargetRowId = overData.rowId;

    // 检查是否是双行容器内部拖拽（同一容器内的行间拖拽或行内排序）
    const sourceTwoRowData = active.data.current;
    const isTwoRowInternalDrag = sourceTwoRowData?.context === 'two-row' && 
                                sourceTwoRowData?.containerId && 
                                isTwoRowContainerTarget &&
                                sourceTwoRowData.containerId === twoRowContainerId;

    // 处理拖拽到双行容器内部的情况
    if (isTwoRowContainerTarget && twoRowContainerId && typeof twoRowTargetRowIndex === 'number') {
      console.log('TwoRowContainer drag detected:', {
        isTwoRowContainerTarget,
        twoRowContainerId,
        twoRowTargetRowIndex,
        draggedItem: draggedItem?.type,
        sourceRowId,
        isTwoRowInternalDrag,
        sourceTwoRowData
      });
      
      // 阻止拖拽 TwoRowContainer 到自身内部
      if (draggedItem?.type?.indexOf('TwoRowContainer') !== -1) {
        console.log('Blocked: Cannot drag TwoRowContainer into itself');
        return;
      }

      // 处理双行容器内部拖拽（行内排序或跨行移动）
      if (isTwoRowInternalDrag) {
        const sourceContainerId = sourceTwoRowData.containerId;
        const sourceRowIndex = sourceTwoRowData.rowIndex;
        const draggedItemId = active.id.toString();
        
        console.log('Internal TwoRow drag:', {
          sourceContainerId,
          sourceRowIndex,
          targetRowIndex: twoRowTargetRowIndex,
          draggedItemId
        });
        
        // 同一行内、且落在具体元素上：直接按 dnd-kit 预览的结果换位，
        // 保证松手后的位置和拖拽时看到的动画一致
        if (
          sourceRowIndex === twoRowTargetRowIndex &&
          overData.context === "two-row" &&
          over.id !== active.id
        ) {
          const oldIndex =
            guideBoardRef.current?.getTwoRowItemIndex(
              sourceContainerId,
              sourceRowIndex,
              draggedItemId
            ) ?? -1;
          const newIndex =
            guideBoardRef.current?.getTwoRowItemIndex(
              sourceContainerId,
              sourceRowIndex,
              over.id.toString()
            ) ?? -1;
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            guideBoardRef.current?.reorderTwoRowContainerRow(
              sourceContainerId,
              sourceRowIndex,
              oldIndex,
              newIndex
            );
            lastChangeRef.current = Date.now();
            setTimeout(() => saveCurrentState(), 50);
          }
          return;
        }

        // 如果是同一行内的排序
        if (sourceRowIndex === twoRowTargetRowIndex) {
          // 使用 GuideBoard 的重排序方法
          const sourceItem = guideBoardRef.current?.removeItemFromTwoRowContainer(
            sourceContainerId, 
            sourceRowIndex, 
            draggedItemId
          );
          
          if (sourceItem) {
            // 计算插入位置
            const targetElement = document.querySelector(`[id="${twoRowTargetRowId}"]`);
            let insertIndex: number | undefined;
            
            if (targetElement) {
              const pointerX = mousePositionRef.current.x;
              const innerRow = targetElement.querySelector('.two-row-inner');
              if (innerRow) {
                const children = Array.from(innerRow.children).filter(child => {
                  const element = child as HTMLElement;
                  const isDragRelated = element.classList.contains('sortable-ghost') || 
                                       element.classList.contains('sortable-chosen') ||
                                       element.style.display === 'none';
                  const isBeingDragged = element.getAttribute('id') === draggedItemId;
                  return !isDragRelated && !isBeingDragged;
                }) as HTMLElement[];
                
                if (children.length > 0 && pointerX > 0) {
                  insertIndex = children.length;
                  for (let i = 0; i < children.length; i++) {
                    const rect = children[i].getBoundingClientRect();
                    if (pointerX < rect.left + rect.width / 2) {
                      insertIndex = i;
                      break;
                    }
                  }
                } else {
                  insertIndex = 0;
                }
              }
            }
            
            guideBoardRef.current?.addItemToTwoRowContainer(
              sourceContainerId, 
              twoRowTargetRowIndex, 
              sourceItem, 
              insertIndex
            );
            
            lastChangeRef.current = Date.now();
            setTimeout(() => saveCurrentState(), 50);
          }
        } else {
          // 跨行移动
          const sourceItem = guideBoardRef.current?.removeItemFromTwoRowContainer(
            sourceContainerId, 
            sourceRowIndex, 
            draggedItemId
          );
          
          if (sourceItem) {
            // 计算插入位置
            const targetElement = document.querySelector(`[id="${twoRowTargetRowId}"]`);
            let insertIndex: number | undefined;
            
            if (targetElement) {
              const pointerX = mousePositionRef.current.x;
              const innerRow = targetElement.querySelector('.two-row-inner');
              if (innerRow) {
                const children = Array.from(innerRow.children).filter(child => {
                  const element = child as HTMLElement;
                  const isDragRelated = element.classList.contains('sortable-ghost') || 
                                       element.classList.contains('sortable-chosen') ||
                                       element.style.display === 'none';
                  return !isDragRelated;
                }) as HTMLElement[];
                
                if (children.length > 0 && pointerX > 0) {
                  insertIndex = children.length;
                  for (let i = 0; i < children.length; i++) {
                    const rect = children[i].getBoundingClientRect();
                    if (pointerX < rect.left + rect.width / 2) {
                      insertIndex = i;
                      break;
                    }
                  }
                } else {
                  insertIndex = 0;
                }
              }
            }
            
            guideBoardRef.current?.addItemToTwoRowContainer(
              sourceContainerId, 
              twoRowTargetRowIndex, 
              sourceItem, 
              insertIndex
            );
            
            lastChangeRef.current = Date.now();
            setTimeout(() => saveCurrentState(), 50);
          }
        }
        return;
      }

      // 从组件列表拖入双行容器
      if (draggedItem && !sourceRowId) {
        const newId = `${draggedItem.type || "item"}-${Math.random().toString(36).substring(2)}`;
        const newItem: GuideItem = { ...draggedItem, id: newId };
        
        // 计算插入位置
        const targetElement = document.querySelector(`[id="${twoRowTargetRowId}"]`);
        let insertIndex: number | undefined;
        
        if (targetElement) {
          const pointerX = mousePositionRef.current.x;
          const innerRow = targetElement.querySelector('.two-row-inner');
          if (innerRow) {
            const children = Array.from(innerRow.children).filter(child => {
              const element = child as HTMLElement;
              const isDragRelated = element.classList.contains('sortable-ghost') || 
                                   element.classList.contains('sortable-chosen') ||
                                   element.style.display === 'none';
              return !isDragRelated;
            }) as HTMLElement[];
            
            if (children.length > 0 && pointerX > 0) {
              insertIndex = children.length;
              for (let i = 0; i < children.length; i++) {
                const rect = children[i].getBoundingClientRect();
                if (pointerX < rect.left + rect.width / 2) {
                  insertIndex = i;
                  break;
                }
              }
            } else {
              insertIndex = 0;
            }
          }
        }
        
        guideBoardRef.current?.addItemToTwoRowContainer(twoRowContainerId, twoRowTargetRowIndex, newItem, insertIndex);
        lastChangeRef.current = Date.now();
        setTimeout(() => saveCurrentState(), 50);
        return;
      }
      
      // 从普通行拖拽到双行容器
      if (sourceRowId && !isTwoRowInternalDrag) {
        const item = guideBoardRef.current?.removeItemFromRow(sourceRowId, active.id.toString());
        if (item) {
          // 计算插入位置（同上）
          const targetElement = document.querySelector(`[id="${twoRowTargetRowId}"]`);
          let insertIndex: number | undefined;
          
          if (targetElement) {
            const pointerX = mousePositionRef.current.x;
            const innerRow = targetElement.querySelector('.two-row-inner');
            if (innerRow) {
              const children = Array.from(innerRow.children).filter(child => {
                const element = child as HTMLElement;
                const isDragRelated = element.classList.contains('sortable-ghost') || 
                                     element.classList.contains('sortable-chosen') ||
                                     element.style.display === 'none';
                const isBeingDragged = element.getAttribute('id') === active.id.toString();
                return !isDragRelated && !isBeingDragged;
              }) as HTMLElement[];
              
              if (children.length > 0 && pointerX > 0) {
                insertIndex = children.length;
                for (let i = 0; i < children.length; i++) {
                  const rect = children[i].getBoundingClientRect();
                  if (pointerX < rect.left + rect.width / 2) {
                    insertIndex = i;
                    break;
                  }
                }
              } else {
                insertIndex = 0;
              }
            }
          }
          
          guideBoardRef.current?.addItemToTwoRowContainer(twoRowContainerId, twoRowTargetRowIndex, item, insertIndex);
          lastChangeRef.current = Date.now();
          setTimeout(() => saveCurrentState(), 50);
        }
        return;
      }
    }

    // 获取准确的 overRowId
    let overRowId = over.data.current?.rowId;
    if (!overRowId && over.id.toString().startsWith("row")) {
      overRowId = over.id.toString();
    }

    if (!overRowId) return;

    // 从组件列表拖入普通行
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

      guideBoardRef.current?.addItemToRow(targetRowId, newItem, insertIndex);
      lastChangeRef.current = Date.now();
      // 保存状态到撤销历史
      setTimeout(() => saveCurrentState(), 50);
      return;
    }

    // 行内和跨行拖拽
    if (sourceRowId && overRowId) {
      if (sourceRowId === overRowId) {
        // 行内排序：按 dnd-kit 预览的落点换位（over 就是预览时让位的那个元素）
        let changed = movedRows;
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
            newIndex !== -1 &&
            oldIndex !== newIndex
          ) {
            guideBoardRef.current?.reorderRow(sourceRowId, oldIndex, newIndex);
            changed = true;
          }
        }
        if (changed) {
          lastChangeRef.current = Date.now();
          // 保存状态到撤销历史
          setTimeout(() => saveCurrentState(), 50);
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
        }
        if (item || movedRows) {
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
      hideDropIndicator();
      return;
    }

    const activeData = (active.data.current || {}) as Record<string, any>;
    const overData = (over.data.current || {}) as Record<string, any>;
    const sourceRowId = activeData.rowId;

    // ===== 面板普通行里的元素被拖动 =====
    // 行内换位交给 dnd-kit 的排序预览（左右方向都有位移动画）；
    // 跨行则当场把元素搬到目标行，让两边的行都用 FLIP 动画重新排布。
    const isTwoRowArea =
      overData.type === "two-row-container-row" ||
      overData.type === "two-row-container" ||
      overData.context === "two-row";
    const isBoardRowDrag =
      Boolean(activeData.boardItem) &&
      activeData.context !== "two-row" &&
      typeof sourceRowId === "string";
    if (!isBoardRowDrag || isTwoRowArea) {
      // 从组件列表拖入：没有实时排布预览，用蓝色指示线提示插入位置
      updateDropIndicator(activeData, overData, over);
      return;
    }
    hideDropIndicator();

    const candidate = String(overData.rowId ?? over.id);
    const targetRowId = /^row\d+$/.test(candidate) ? candidate : null;
    // 元素被搬走后会在新行里重新挂载，active.data 可能还停留在旧行，
    // 因此以自己记录的当前行为准
    const currentRowId = dragMetaRef.current.sourceRowId ?? sourceRowId;
    if (!targetRowId || targetRowId === currentRowId) return;

    const moved = guideBoardRef.current?.moveItemBetweenRows(
      currentRowId,
      targetRowId,
      active.id.toString(),
      insertIndexForOver(targetRowId, over)
    );
    if (moved) {
      dragMetaRef.current.sourceRowId = targetRowId;
      dragMetaRef.current.movedRows = true;
      lastChangeRef.current = Date.now();
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
      // onDragOver 只在落点切换时触发，指示线还需要跟着指针连续移动
      onDragMove={event => {
        const { active, over } = event;
        const activeData = (active.data.current || {}) as Record<string, any>;
        if (activeData.boardItem) return; // 面板内的元素有实时预览，不用指示线
        if (!over) {
          hideDropIndicator();
          return;
        }
        updateDropIndicator(
          activeData,
          (over.data.current || {}) as Record<string, any>,
          over
        );
      }}
      onDragCancel={() => {
        setActiveDrag(null);
        setDropIndicator({ show: false, x: 0, y: 0, height: 0 });
        if (dragMetaRef.current.movedRows) {
          lastChangeRef.current = Date.now();
          setTimeout(() => saveCurrentState(), 50);
        }
        dragMetaRef.current = { movedRows: false };
      }}
      // 拖拽过程中元素会实时换位，必须持续重新测量；
      // 并且测量时忽略元素自身的 transform，否则量到的是动画中间态的位置。
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
          measure: node => getClientRect(node, { ignoreTransform: true }),
        },
      }}
      collisionDetection={args => {
        const dataOf = (collision: { data?: Record<string, any> }) =>
          (collision.data?.droppableContainer?.data?.current ?? {}) as Record<
            string,
            any
          >;
        // 优先使用 pointerWithin，指针不在任何区域内时回退到矩形相交检测
        // （删除区只认指针位置，否则元件靠近组件栏就会被误判成删除）
        const pointer = pointerWithin(args);
        const base =
          pointer.length > 0
            ? pointer
            : rectIntersection(args).filter(
                collision => dataOf(collision).type !== "trash"
              );
        if (base.length === 0) return base;

        const activeData = (args.active?.data?.current ?? {}) as Record<
          string,
          any
        >;

        // 双行容器内部的拖动：优先命中同一容器内的元素，才能有排序预览动画
        if (activeData.context === "two-row") {
          const sameContainer = base.filter(collision => {
            const data = dataOf(collision);
            return (
              data.context === "two-row" &&
              data.containerId === activeData.containerId
            );
          });
          if (sameContainer.length > 0) return sameContainer;
        }

        // 双行容器区域优先（拖进容器时按容器行处理）
        const twoRowHits = base.filter(collision => {
          const data = dataOf(collision);
          return (
            data.type === "two-row-container-row" ||
            data.type === "two-row-container"
          );
        });
        if (twoRowHits.length > 0) return twoRowHits;

        // 命中了具体元素就用它：dnd-kit 只有在 over 是排序项时才会计算让位动画
        const itemHits = base.filter(collision => dataOf(collision).sortable);
        if (itemHits.length > 0) return itemHits;

        // 只命中行容器（行首/行尾的空白处）时，退回到该行内距离最近的元素，
        // 否则 overIndex 为 -1，整行都不会有动画
        const rowId = String(base[0].id);
        if (/^row\d+$/.test(rowId)) {
          const rowItems = args.droppableContainers.filter(
            container =>
              (container.data?.current as any)?.sortable?.containerId === rowId
          );
          if (rowItems.length > 0) {
            const closest = closestCenter({
              ...args,
              droppableContainers: rowItems,
            });
            if (closest.length > 0) return closest;
          }
        }
        return base;
      }}
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
                {/* 从组件列表拖入时的插入位置指示线 */}
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
        {activeDrag ? (
          <div
            style={{
              // 面板上的元素本身已经被缩放过，覆盖层按同样比例还原尺寸，
              // 并以左上角为基准，正好盖住原来的位置
              transform: `scale(${activeDrag.scale})`,
              transformOrigin: activeDrag.fromBoard ? "top left" : "center",
              boxShadow: "0 0 8px rgba(0,0,0,0.12)",
              background: activeDrag.fromBoard
                ? themes[currentTheme][1].colors.defaultBackground
                : "white",
              color: activeDrag.fromBoard
                ? themes[currentTheme][1].colors.defaultForeground
                : undefined,
              display: "inline-flex",
              alignItems: "center",
              cursor: "grabbing",
              opacity: 0.9,
              fontFamily: themes[currentTheme][1].fontFamily,
            }}
          >
            {activeDrag.item.element}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
