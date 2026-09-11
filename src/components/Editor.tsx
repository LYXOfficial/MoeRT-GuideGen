import {
  useRef,
  useState,
  useEffect,
  useCallback,
  cloneElement,
  isValidElement,
  type ReactElement,
} from "react";
import ComponentsList from "./ComponentsList";
import GuideBoardCols, { type GuideBoardRef } from "./GuideBoard";
import type { GuideItem } from "../interfaces/guide";
import type { SaveData } from "../interfaces/editor";
import Salt from "./Salt";
import { Toast, Button } from "@douyinfe/semi-ui";
import { IconClose } from "@douyinfe/semi-icons";
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
  TouchSensor,
} from "@dnd-kit/core";
import themes from "./themes/themereg";
import Header from "./Header";
import { useTranslation } from "react-i18next";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useMediaQuery, useIsCompact } from "../hooks/useMediaQuery";
import { getVisibleClientRect } from "../utils/visibleRect";

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
  // 供空依赖的回调读取最新主题
  const currentThemeRef = useRef(0);
  currentThemeRef.current = currentTheme;
  const [isImporting, setIsImporting] = useState(false); // 添加导入状态标志
  const [isUndoRedoing, setIsUndoRedoing] = useState(false); // 添加撤销/重做状态标志
  const lastChangeRef = useRef(Date.now());
  const autoSaveIntervalMs = 2000; // 自动保存间隔
  // 存档保护：还原失败（比如主题对不上、组件找不到）时置位，
  // 之后一律不再自动保存，避免用空白画板把用户的存档覆盖掉
  const skipAutoSaveRef = useRef(false);
  const archivedItemCountRef = useRef(0);

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
  // 组件灰框：只是编辑时的辅助线，用 CSS 变量下发，导出前会被临时关掉
  const [showItemFrame, setShowItemFrame] = useState(() => {
    try {
      return localStorage.getItem("guide-show-item-frame") !== "0";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("guide-show-item-frame", showItemFrame ? "1" : "0");
    } catch {}
  }, [showItemFrame]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const [isEditingOpen, setIsEditingOpen] = useState(false);

  // 触屏 / 紧凑布局判定
  const isCompact = useIsCompact();
  // 带触摸能力的设备（手机 / 平板 / 触屏笔记本）：这些设备需要手势支持
  const isCoarsePointer = useMediaQuery("(any-pointer: coarse)");
  // 移动端底部「组件抽屉」开关
  const [paletteOpen, setPaletteOpen] = useState(false);

  // 添加全局指针位置跟踪（mouse + touch + pen 都用 pointermove，
  // 这样触屏拖拽时 drop 指示线的插入点也能用真实坐标计算）
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
    const handlePointerMove = (e: PointerEvent) => {
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

    document.addEventListener("pointermove", handlePointerMove);
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
      document.removeEventListener("pointermove", handlePointerMove);
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

        // 用户主动导入了新存档，解除保护
        skipAutoSaveRef.current = false;
        archivedItemCountRef.current = 0;
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
    if (!guideBoardRef.current || skipAutoSaveRef.current) return;
    const { rows, config } = guideBoardRef.current.getState();
    const saveData: SaveData = {
      version: 1,
      config: {
        ...config,
        // 必须用 ref 取当前主题：这个回调的依赖是空数组，
        // 直接读 currentTheme 会永远是首次渲染的 0，
        // 存档会被打上错误的主题名，重载时组件全部匹配不到 → 画板变空 → 存档被清空
        theme: themes[currentThemeRef.current][0],
      },
      rows: rows.map(row => row.map(stripGuideItem)),
    };
    try {
      localStorage.setItem("guide-autosave", JSON.stringify(saveData));
    } catch {
      // 写入失败（配额/隐私模式）时静默跳过，不影响编辑
    }
    lastChangeRef.current = Date.now();
  }, []); // 依赖为空，主题通过 currentThemeRef 读取

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

      // 记下存档里有多少个组件，初始化完成后用来校验是否真的还原成功
      archivedItemCountRef.current = (saveData.rows || []).reduce(
        (sum, row) => sum + (row?.length || 0),
        0
      );

      return new Promise<void>(resolve => {
        // 组件名自带主题前缀（themes.<主题>.components.<组件>），
        // 用它反推真实主题，修掉旧版本写错 config.theme 的存档，
        // 否则组件一个都匹配不上，画板会变成空的
        const firstType =
          (saveData.rows || []).flat().find(item => item?.type)?.type ?? "";
        const matched = /^(themes\.[^.]+)\./.exec(firstType);
        const themeFromItems =
          matched && themes.some(([name]) => name === matched[1])
            ? matched[1]
            : null;
        const themeName = themeFromItems ?? saveData.config.theme;
        const themeIndex = themes.findIndex(([name, _]) => name === themeName);

        // 存档里的主题在当前版本里不存在：还原只会把组件全部丢掉，
        // 干脆不还原，并锁住自动保存，至少把存档原样留着
        if (themeIndex === -1 && archivedItemCountRef.current > 0) {
          skipAutoSaveRef.current = true;
          resolve();
          return;
        }

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

        // 存档里有内容、还原后却是空画板 → 说明组件没匹配上（多半是主题对不上）。
        // 这时候必须锁住自动保存，否则 2 秒后就会用空白画板覆盖掉存档。
        const restoredCount =
          guideBoardRef.current
            ?.getState()
            .rows.reduce((sum, row) => sum + row.length, 0) ?? 0;
        if (archivedItemCountRef.current > 0 && restoredCount === 0) {
          skipAutoSaveRef.current = true;
        }
        if (skipAutoSaveRef.current) {
          Toast.error({
            content: t("saves.restore_failed"),
            duration: 10,
          });
        }

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
        if (!guideBoardRef.current || skipAutoSaveRef.current) return;
        const { rows, config } = guideBoardRef.current.getState();
        const saveData: SaveData = {
          version: 1,
          config: {
            ...config,
            theme: themes[currentThemeRef.current][0],
          },
          rows: rows.map(row => row.map(stripGuideItem)),
        };
        try {
          localStorage.setItem("guide-autosave", JSON.stringify(saveData));
        } catch {
          // 写入失败时静默跳过
        }
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

  // DragOverlay 里的副本：双行容器要切到预览模式，
  // 否则副本内部会用同样的 id 抢注册可拖放区域，导致真身拖过一次后失效
  const renderDragPreview = (item: GuideItem) => {
    if (!isValidElement(item.element)) return item.element;
    if (!item.type?.includes("TwoRowContainer")) return item.element;
    return cloneElement(item.element as ReactElement<any>, { preview: true });
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
      // 双行容器不能嵌套双行容器
      const draggedType = String(
        (activeData.boardItem ?? activeData.item)?.type ?? ""
      );
      if (draggedType.includes("TwoRowContainer")) return;

      // 处理双行容器内部拖拽（行内排序或跨行移动）
      if (isTwoRowInternalDrag) {
        const sourceContainerId = sourceTwoRowData.containerId;
        const sourceRowIndex = sourceTwoRowData.rowIndex;
        const draggedItemId = active.id.toString();

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

    // 双行容器里的条目拖到顶层普通行：先从容器移除，再加到目标行
    // （source 的 rowId 是 tworow-xxx-row-N，走顶部行逻辑会匹配不到，必须走容器移除）
    if (
      activeData.context === "two-row" &&
      activeData.containerId &&
      /^row\d+$/.test(overRowId)
    ) {
      const removed = guideBoardRef.current?.removeItemFromTwoRowContainer(
        activeData.containerId,
        activeData.rowIndex,
        active.id.toString()
      );
      if (removed) {
        guideBoardRef.current?.addItemToRow(
          overRowId,
          removed,
          insertIndexForOver(overRowId, over)
        );
        lastChangeRef.current = Date.now();
        setTimeout(() => saveCurrentState(), 50);
      }
      return;
    }

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

  // 拖拽传感器：PointerSensor（移动激活）+ TouchSensor（触屏长按激活）。
  // ① 监听挂在 document 上，跨行移动时节点被实时搬运/重挂载也不会断拖；
  // ② 鼠标/板内组件仍是「按下去移动 8px 即拖起」，轻点不动则不会误触发，点击编辑照常；
  // ③ 触屏多一条长按通道：组件列表/抽屉是可滚动的（touch-action: pan-y），
  //    竖着拖会被浏览器判成滚动并丢掉 pointer/touch 事件，表现为「必须先横着拖一下、
  //    再往上拖」才能拖出来。按住一小会儿激活后，TouchSensor 会 preventDefault 掉滚动，
  //    所以竖着直接往上拖也进得去（长按之前列表仍可正常滚动）。
  //    延时/容差取 250ms / 8px（dnd-kit 官方推荐值）：短按仍然是点按（正常弹编辑菜单），
  //    按住不动 250ms 才转成拖拽，免得手快时列表先滚起来、看起来像整列被拖走。
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    })
  );

  // ===== 移动端画布「适配 + 手势」 =====

  // 计算把画板放进「当前可见区域」所需的缩放与纵向位移。
  // 若底部组件抽屉打开，可见区域只剩抽屉上方那一截，画板需要上移进这段区域。
  const computeFit = useCallback(() => {
    const area = editorAreaRef.current;
    const board = document.querySelector(".guide-board") as HTMLElement | null;
    const drawer = document.querySelector(
      ".mobile-palette-sheet"
    ) as HTMLElement | null;
    if (!area || !board) return null;
    const aRect = area.getBoundingClientRect();
    const bw = board.offsetWidth;
    const bh = board.offsetHeight;
    const availW = aRect.width;
    if (!availW || !bw || !bh) return null;
    let availH = aRect.height;
    if (drawer) {
      const dTop = drawer.getBoundingClientRect().top;
      availH = Math.min(availH, Math.max(0, dTop - aRect.top - 8));
    }
    const scale = Math.min(
      2,
      Math.max(0.2, Math.min((availW - 24) / bw, (availH - 24) / bh))
    );
    // 内容绕编辑区中心缩放；当抽屉占掉下方后，把画板上移进可见带（translate 在 scale 之前生效，
    // 视觉位移 = scale × 平移量，因此要除以 scale 换算回布局位移）
    const panY = drawer
      ? -Math.max(0, (aRect.height - availH) / 2) / scale
      : 0;
    return { scale, panX: 0, panY };
  }, []);

  // 「适配画板」按钮
  const fitToView = useCallback(() => {
    const fit = computeFit();
    if (!fit) return;
    setZoom(fit.scale);
    setPan({ x: fit.panX, y: fit.panY });
  }, [computeFit]);

  // 适配只在进入移动端布局、或打开组件抽屉（可见区域变小）时执行一次，
  // 之后改宽度/加减行/分割线等都不会重置用户当前的缩放与位置。
  // 初次进入时额外延后一次，等存档/字体恢复完成再按最终尺寸适配。
  useEffect(() => {
    if (!isCompact) return;
    let cancelled = false;
    const run = () => {
      if (!cancelled) fitToView();
    };
    const rafId = requestAnimationFrame(run);
    const timerId = window.setTimeout(run, 800);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
    };
  }, [isCompact, fitToView]);

  // 打开组件抽屉：等滑出动画结束后，把画板对进抽屉上方的可见区域
  useEffect(() => {
    if (!isCompact || !paletteOpen) return;
    const id = window.setTimeout(() => fitToView(), 320);
    return () => window.clearTimeout(id);
  }, [isCompact, paletteOpen, fitToView]);

  // 触屏手势状态机：单指在空白处平移画布，双指缩放（以画布中心为基准）。
  // 任意带触摸的屏幕（含桌面布局的触屏平板）都启用
  const touchStateRef = useRef<{
    mode: "none" | "pan" | "pinch";
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    pinchStartDist: number;
    pinchStartZoom: number;
  }>({
    mode: "none",
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    pinchStartDist: 0,
    pinchStartZoom: 1,
  });
  const touchDistance = (
    a: { clientX: number; clientY: number },
    b: { clientX: number; clientY: number }
  ) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isCoarsePointer || isEditingOpen) return;
      // 正在拖组件（含从组件列表拖入）时，落在画布上的手指一律不算画布手势：
      // 否则拖拽过程中另一根手指（或手掌）贴上来就会触发画布平移/双指缩放，
      // 表现为「拖组件时整个网页/组件列表跟着缩放或位移」。
      if (activeDrag) return;
      const t = e.touches;
      if (t.length === 1) {
        // 落在画板/组件上时交给 dnd-kit，只在空白处做画布平移
        const target = e.target as HTMLElement;
        if (target.closest(".guide-board")) return;
        touchStateRef.current = {
          mode: "pan",
          startX: t[0].clientX,
          startY: t[0].clientY,
          startPanX: pan.x,
          startPanY: pan.y,
          pinchStartDist: 0,
          pinchStartZoom: zoom,
        };
      } else if (t.length === 2) {
        touchStateRef.current = {
          mode: "pinch",
          startX: 0,
          startY: 0,
          startPanX: pan.x,
          startPanY: pan.y,
          pinchStartDist: touchDistance(t[0], t[1]),
          pinchStartZoom: zoom,
        };
      }
    },
    [isCoarsePointer, isEditingOpen, pan, zoom, activeDrag]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isCoarsePointer || isEditingOpen) return;
      // 拖拽中不做画布手势（见 handleTouchStart）
      if (activeDrag) return;
      const s = touchStateRef.current;
      const t = e.touches;
      if (s.mode === "pan" && t.length === 1) {
        const dx = t[0].clientX - s.startX;
        const dy = t[0].clientY - s.startY;
        setPan({ x: s.startPanX + dx, y: s.startPanY + dy });
      } else if (s.mode === "pinch" && t.length >= 2) {
        const d = touchDistance(t[0], t[1]);
        if (s.pinchStartDist > 0) {
          const ratio = d / s.pinchStartDist;
          const next = Math.max(0.2, Math.min(4, s.pinchStartZoom * ratio));
          setZoom(next);
        }
      }
    },
    [isCoarsePointer, isEditingOpen, activeDrag]
  );

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current.mode = "none";
  }, []);

  // 一开始拖组件，就掐断可能正在进行中的画布手势，并把整页的原生手势
  // （滚动 / 双指缩放）关掉，免得拖拽过程中页面和组件列表跟着动
  useEffect(() => {
    if (!activeDrag) return;
    touchStateRef.current.mode = "none";
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.touchAction = "none";
    // 兜底：拖拽期间直接吃掉所有 touchmove 的默认行为（滚动 / 双指缩放），
    // 底层可滚动区域（组件抽屉、组件列表）就不会跟着位移；
    // 只 preventDefault，不影响 dnd-kit 读取坐标。
    const blockTouchMove = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
    };
    document.addEventListener("touchmove", blockTouchMove, {
      passive: false,
    });
    return () => {
      document.body.style.touchAction = previousTouchAction;
      document.removeEventListener("touchmove", blockTouchMove);
    };
  }, [activeDrag]);

  // 组件抽屉显隐（带滑出动画：关→延迟卸载）
  const [paletteRendered, setPaletteRendered] = useState(false);
  const paletteCloseTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (paletteOpen) {
      if (paletteCloseTimerRef.current) {
        window.clearTimeout(paletteCloseTimerRef.current);
        paletteCloseTimerRef.current = null;
      }
      setPaletteRendered(true);
    } else if (paletteRendered) {
      paletteCloseTimerRef.current = window.setTimeout(() => {
        paletteCloseTimerRef.current = null;
        setPaletteRendered(false);
        // 抽屉已从 DOM 移除，把画板按整区重新适配
        requestAnimationFrame(() => fitToView());
      }, 240);
    }
    return () => {
      if (paletteCloseTimerRef.current) {
        window.clearTimeout(paletteCloseTimerRef.current);
      }
    };
  }, [paletteOpen, paletteRendered, fitToView]);

  // 切换主题（桌面侧栏与移动端组件抽屉共用；换主题即清空画板）
  const handleThemeRequest = (theme: number) => {
    if (isImporting) return;
    // 换主题是用户主动清空画板，解除存档保护
    skipAutoSaveRef.current = false;
    archivedItemCountRef.current = 0;
    setCurrentTheme(theme);
    guideBoardRef.current?.clearBoard();
    setTimeout(() => saveCurrentState(), 100);
  };

  return (
    <DndContext
      sensors={sensors}
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
          measure: node => {
            // 组件栏（删除区）只认屏幕上露出来的那块：
            // 列表本身可滚动、移动端还藏在抽屉里，整块矩形会比看到的大很多，
            // 拖到画布外、并没真的落到列表上也会被判成删除。
            if (
              node instanceof HTMLElement &&
              node.dataset.trashRoot === "true"
            ) {
              const visible = getVisibleClientRect(node);
              if (visible.width > 0 && visible.height > 0) {
                return {
                  top: visible.top,
                  left: visible.left,
                  width: visible.width,
                  height: visible.height,
                  right: visible.left + visible.width,
                  bottom: visible.top + visible.height,
                };
              }
              // 完全不在屏幕上（抽屉关着/滚出视口）：挪到视口外，等于不可命中
              return {
                top: -9999,
                left: -9999,
                width: 0,
                height: 0,
                right: -9999,
                bottom: -9999,
              };
            }
            return getClientRect(node, { ignoreTransform: true });
          },
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
        const activeId = String(args.active?.id ?? "");
        const draggedType = String(
          (activeData.boardItem ?? activeData.item)?.type ?? ""
        );
        const isTwoRowArea = (data: Record<string, any>) =>
          data.type === "two-row-container-row" ||
          data.type === "two-row-container" ||
          data.context === "two-row";

        // 排除拖拽元素“内部”的可放置区域：拖动双行容器时，指针一直压在
        // 它自己的内部行上，不排掉就永远命中不到别人（自身作为排序项要保留，
        // 指针在原位时 over 就该是它自己，这样才不会平白无故换位）
        let pool = base.filter(
          collision => dataOf(collision).containerId !== activeId
        );
        // 双行容器不能拖进双行容器，直接忽略所有容器区域，按普通行处理
        if (draggedType.includes("TwoRowContainer")) {
          pool = pool.filter(collision => !isTwoRowArea(dataOf(collision)));
        }
        if (pool.length === 0) pool = base;

        // 双行容器内部的拖动：优先命中同一容器内的元素，才能有排序预览动画
        if (activeData.context === "two-row") {
          const sameContainer = pool.filter(collision => {
            const data = dataOf(collision);
            return (
              data.context === "two-row" &&
              data.containerId === activeData.containerId
            );
          });
          if (sameContainer.length > 0) return sameContainer;
        }

        // 双行容器区域优先（拖进容器时按容器行处理）。
        // 但「普通单行组件」拖到双行容器整块的左/右端时，应视为在容器前/后插入到该行，
        // 否则容器在最左/最右时，压根没法把组件插到它旁边。
        const twoRowHits = pool.filter(collision =>
          isTwoRowArea(dataOf(collision))
        );
        const isTwoRowActive =
          activeData.context === "two-row" ||
          draggedType.includes("TwoRowContainer");
        if (twoRowHits.length > 0 && !isTwoRowActive) {
          // 拿「整个双行容器」的外包盒判断落点（而不是容器内某个窄条目），
          // 左右各留 1/3，避免只能钻小缝隙
          const dc = (twoRowHits[0]?.data?.droppableContainer ?? {}) as any;
          const node = (dc.node?.current ?? dc.node) as HTMLElement | null;
          const el = node?.closest?.(".two-row-container") as HTMLElement | null;
          const rect =
            el?.getBoundingClientRect?.() ?? dc.rect?.current ?? dc.rect ?? null;
          const px = mousePositionRef.current.x;
          const frac = rect?.width ? (px - rect.left) / rect.width : 0.5;
          if (frac < 1 / 6 || frac > 5 / 6) {
            // 左/右端：去掉容器「内部」区域（内部行 + 内部条目），让落点回到
            // 容器这个行级排序项，从而在容器前/后插入到该行。
            // 注意：过滤后可能一个都不剩（指针下只有容器内部区域），这时必须退回 base，
            // 否则下面的 pool[0].id 会读到 undefined，整个画布直接白屏。
            const innerArea = (data: Record<string, any>) =>
              data.type === "two-row-container-row" || data.context === "two-row";
            const withoutInnerAreas = pool.filter(
              c => !innerArea(dataOf(c))
            );
            pool = withoutInnerAreas.length > 0 ? withoutInnerAreas : base;
          } else {
            return twoRowHits;
          }
        } else if (twoRowHits.length > 0) {
          return twoRowHits;
        }

        // 命中了具体元素就用它：dnd-kit 只有在 over 是排序项时才会计算让位动画
        const itemHits = pool.filter(collision => dataOf(collision).sortable);
        if (itemHits.length > 0) return itemHits;

        // 只命中行容器（行首/行尾的空白处）时，退回到该行内距离最近的元素，
        // 否则 overIndex 为 -1，整行都不会有动画
        if (pool.length === 0) return base;
        const rowId = String(pool[0].id);
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
        return pool;
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
          showItemFrame={showItemFrame}
          onShowItemFrameChange={setShowItemFrame}
          onFitToView={fitToView}
          paletteOpen={paletteOpen}
          onTogglePalette={() => setPaletteOpen(open => !open)}
        />
        <div className="flex h-0 flex-1">
          {!isCompact && (
            <ComponentsList
              currentTheme={currentTheme}
              onThemeChange={handleThemeRequest}
            />
          )}
          <div
            ref={editorAreaRef}
            className="flex-1 relative overflow-hidden bg-gray-50"
            style={{
              cursor: isDragging ? "grabbing" : "default",
              // 触屏画布手势由 JS 处理（单指平移/双指缩放），禁用原生手势
              touchAction: isCoarsePointer ? "none" : undefined,
            }}
            onMouseDown={handleEditorMouseDown}
            onMouseMove={handleEditorMouseMove}
            onMouseUp={handleEditorMouseUp}
            onWheel={handleEditorWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              className="absolute inset-0 flex items-center justify-center z-1"
              style={
                {
                  // 先缩放，再位移；位移不受缩放影响
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: "center",
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                  cursor: isDragging ? "grabbing" : "default",
                  // 组件框的颜色，取当前主题的边框色，
                  // DraggableItem 的 outline 和间距箭头都继承这个变量
                  "--guide-item-outline": showItemFrame
                    ? themes[currentTheme][1].colors.defaultBorder
                    : "transparent",
                } as React.CSSProperties
              }
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
        <Salt />
        {isCompact && paletteRendered && (
          <div
            className={`mobile-palette-sheet fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl border-t border-gray-200 overflow-hidden ${
              paletteOpen ? "" : "moert-sheet-closing"
            }`}
            style={{ maxHeight: "50vh", paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="shrink-0 flex items-center justify-between gap-3 pl-4 pr-2 pt-2 pb-1">
              <span className="font-sans font-bold text-sm text-gray-700">
                {t("componentsList.title")}
              </span>
              <Button
                theme="borderless"
                icon={<IconClose />}
                onClick={() => setPaletteOpen(false)}
                style={{ color: "#111827" }}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <ComponentsList
                fullWidth
                currentTheme={currentTheme}
                onThemeChange={handleThemeRequest}
              />
            </div>
          </div>
        )}
      </div>
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeDrag ? (
          // 从组件列表拖出时，覆盖层的尺寸是整张卡片，
          // 把预览居中放进去，避免看起来像在拖侧栏的卡片
          <div
            className={
              activeDrag.fromBoard
                ? undefined
                : "w-full h-full flex items-center justify-center"
            }
          >
            <div
              style={{
                // 面板上的元素本身已经被缩放过，覆盖层按同样比例还原尺寸，
                // 并以左上角为基准，正好盖住原来的位置
                transform: `scale(${activeDrag.scale})`,
                transformOrigin: activeDrag.fromBoard ? "top left" : "center",
                boxShadow: "0 0 8px rgba(0,0,0,0.12)",
                background: themes[currentTheme][1].colors.defaultBackground,
                color: themes[currentTheme][1].colors.defaultForeground,
                display: "inline-flex",
                alignItems: "center",
                cursor: "grabbing",
                opacity: 0.9,
                fontFamily: themes[currentTheme][1].fontFamily,
              }}
            >
              {renderDragPreview(activeDrag.item)}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
