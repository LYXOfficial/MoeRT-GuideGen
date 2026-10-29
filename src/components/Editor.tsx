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
import ArchiveDialog from "./ArchiveDialog";
import { Modal, Toast, Button } from "@douyinfe/semi-ui";
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
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useMediaQuery, useIsCompact } from "../hooks/useMediaQuery";
import { useTabConflict } from "../hooks/useTabConflict";
import { getVisibleClientRect } from "../utils/visibleRect";
import * as archiveStore from "../utils/archiveStore";
import type { ArchiveMeta } from "../utils/archiveStore";

interface EditorProps {
  guideHeight?: number;
  onArchiveLoaded?: () => void;
}

/** 撤销历史里的一条组件（纯数据，不含 React 元素） */
interface HistoryItem {
  id: string;
  type: string;
  props: Record<string, any>;
}

// 撤销/重做状态类型
interface EditorState {
  rows: HistoryItem[][];
  config: {
    width: number;
    showSpecLine: boolean;
    boardBackground?: string;
  };
  currentTheme: number;
}

const delay = (ms: number) =>
  new Promise<void>(resolve => window.setTimeout(resolve, ms));

/** 存档用：剥掉 element（React 节点）和容器上的回调，只留可序列化的数据 */
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

/**
 * 撤销历史里存的形态：只留 {id,type,props} 纯数据 + 配置 + 主题。
 *
 * 必须剥掉 element。撤销/重做还原（GuideBoard.restoreState）会用
 * `{ key, ...props, id, currentTheme }` 重建 React 元素，而组件刚从列表拖进来时
 * 走的是 `{ ...props, id, currentTheme }`（没有 key）——两者序列化结果不一样。
 * 以前历史直接存 getState() 快照、再用 JSON.stringify 比"内容是否相同"，
 * 于是撤销之后紧接着的一次自动保存（内容其实没变）会被当成新操作 push 进去，
 * 顺手把 redo 分支截掉：**撤销完重做只能走一步，之后 redo 永远是灰的**。
 */
const normalizeHistoryState = (state: EditorState): EditorState => ({
  rows: (state.rows || []).map(row =>
    (row || []).map(item => stripGuideItem(item as unknown as GuideItem))
  ),
  config: {
    width: state.config.width,
    showSpecLine: state.config.showSpecLine,
    boardBackground: state.config.boardBackground,
  },
  currentTheme: state.currentTheme,
});

/** 存档里有多少个顶层组件（用于判断“有内容却还原成空画板”） */
const countSavedItems = (saveData: SaveData) =>
  (saveData.rows || []).reduce((sum, row) => sum + (row?.length || 0), 0);

/**
 * 反推存档真正的主题：
 * 组件名自带主题前缀（themes.<主题>.components.<组件>）。
 * 旧版本曾把 config.theme 写错，只信 config 会让组件全部匹配不到。
 */
const resolveThemeIndex = (saveData: SaveData) => {
  const firstType =
    (saveData.rows || []).flat().find(item => item?.type)?.type ?? "";
  const matched = /^(themes\.[^.]+)\./.exec(firstType);
  const themeFromItems =
    matched && themes.some(([name]) => name === matched[1]) ? matched[1] : null;
  const themeName = themeFromItems ?? saveData.config?.theme;
  return themes.findIndex(([name]) => name === themeName);
};

const { downloadJson } = archiveStore;

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
  const lastChangeRef = useRef(Date.now());
  const autoSaveIntervalMs = 2000; // 自动保存间隔
  // 存档保护：还原失败（比如主题对不上、组件找不到）时置位，
  // 之后一律不再自动保存，避免用空白画板把用户的存档覆盖掉
  const skipAutoSaveRef = useRef(false);
  const archivedItemCountRef = useRef(0);

  // ===== 多存档 =====
  const [archives, setArchives] = useState<ArchiveMeta[]>([]);
  const [activeArchiveId, setActiveArchiveId] = useState("");
  const activeArchiveIdRef = useRef("");
  // 切换存档 / 恢复期间冻结自动保存：此时画板还是旧数据、活动存档已经/即将换成新的，
  // 任何一次写入都会把旧画板塞进另一个存档
  const suspendSaveRef = useRef(false);
  // 上一次真正写进 localStorage 的内容（内容没变就不写，省配额、也不白刷 updatedAt）
  const lastSavedJsonRef = useRef("");
  const [archiveDialogVisible, setArchiveDialogVisible] = useState(false);
  // 当前存档主题对不上、无法还原时弹出的引导（只能去存档管理处理）
  const [restoreFailedVisible, setRestoreFailedVisible] = useState(false);
  const quotaToastAtRef = useRef(0);

  // 多标签互斥：另一个标签页持有编辑锁时，弹全屏提醒并冻结本页一切写路径
  // （自动保存/撤销/配置落盘都被 suspendSaveRef 拦下），防止互覆存档
  const tabConflict = useTabConflict();
  const tabConflictAppliedRef = useRef(false);
  useEffect(() => {
    if (tabConflict && !tabConflictAppliedRef.current) {
      tabConflictAppliedRef.current = true;
      suspendSaveRef.current = true;
      skipAutoSaveRef.current = true;
    }
    // 刻意不做解除：封锁只随「刷新本页」结束，否则本页内存里的旧画板
    // 会在解锁后把对方标签页刚保存的内容覆盖掉
  }, [tabConflict]);

  // 底板背景色：真实状态在 GuideBoard（随存档/撤销/换主题走），
  // 这里只留一份镜像给侧栏的「底板背景色」控件显示当前值
  const [boardBgMirror, setBoardBgMirror] = useState<string | null>(null);
  const handleBoardBackgroundChange = useCallback((color: string | null) => {
    guideBoardRef.current?.setBoardBackground(color);
    setBoardBgMirror(color);
  }, []);

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
    pause: pauseHistory,
    resume: resumeHistory,
    clear: clearHistory,
    reset: resetHistory,
  } = useUndoRedo(initialState, 50, normalizeHistoryState);

  /** 当前画板的纯数据快照（进撤销历史 / 做内容比较用） */
  const buildHistoryState = useCallback((): EditorState | null => {
    const board = guideBoardRef.current;
    if (!board) return null;
    const { rows, config } = board.getState();
    return normalizeHistoryState({
      rows: rows as unknown as HistoryItem[][],
      config,
      // 主题用 ref：撤销到别的主题时，闭包里的 currentTheme 可能还是旧值
      currentTheme: currentThemeRef.current,
    });
  }, []);

  // 记录状态到历史记录（防抖处理；immediate=true 立即落账）
  const saveCurrentState = useCallback(
    (immediate = false) => {
      if (!guideBoardRef.current || isImporting) return;
      const state = buildHistoryState();
      if (!state) return;
      saveState(state, immediate);
    },
    [buildHistoryState, saveState, isImporting]
  );

  // ===== 撤销/重做的还原链路 =====
  // 还原期间要挡住画板上的过渡态（旧 rows + 新主题、重建过程中的空行），
  // 之前用一个 200ms 的布尔量硬挡，既挡不干净（配置防抖 500ms 后才落账），
  // 又会把用户在这 200ms 里做的真实修改丢掉。
  const restoreTimerRef = useRef<number | null>(null);
  const releaseTimerRef = useRef<number | null>(null);
  // persistCurrentState 在这段代码后面才定义（依赖它会让 useCallback 提前取值），
  // 用 ref 转一道
  const persistRef = useRef<(force?: boolean) => boolean>(() => false);

  const clearRestoreTimers = useCallback(() => {
    if (restoreTimerRef.current !== null) {
      window.clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = null;
    }
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }, []);

  /** 把一份历史快照灌回画板（主题不同时先切主题） */
  const applyHistorySnapshot = useCallback(
    (snapshot: EditorState) => {
      if (!guideBoardRef.current) return;
      clearRestoreTimers();
      pauseHistory();

      const restoreData = {
        rows: snapshot.rows.map(row =>
          row.map(item => ({
            id: item.id,
            type: item.type,
            props: item.props,
          }))
        ),
        config: snapshot.config,
      };

      const apply = () => {
        restoreTimerRef.current = null;
        guideBoardRef.current?.restoreState(restoreData);
        // 撤销/重做也会还原底板背景色：镜像跟着快照走
        setBoardBgMirror(
          typeof restoreData.config.boardBackground === "string" &&
            restoreData.config.boardBackground
            ? restoreData.config.boardBackground
            : null
        );
        // 等 GuideBoard 内部 isRestoring 的收尾 + 配置变更链路走完再放开历史
        releaseTimerRef.current = window.setTimeout(() => {
          releaseTimerRef.current = null;
          resumeHistory();
          // 撤销/重做也是一次真实的状态变更，尽快落盘
          lastChangeRef.current = Date.now();
          persistRef.current();
        }, 120);
      };

      if (snapshot.currentTheme !== currentThemeRef.current) {
        // 先切主题，等组件按新主题重挂完再灌数据。
        // ref 立刻同步：500ms 的配置防抖读的是 ref，否则会把画板存成旧主题
        currentThemeRef.current = snapshot.currentTheme;
        setCurrentTheme(snapshot.currentTheme);
        restoreTimerRef.current = window.setTimeout(apply, 150);
      } else {
        apply();
      }
    },
    [clearRestoreTimers, pauseHistory, resumeHistory]
  );

  // 撤销操作
  const handleUndo = useCallback(() => {
    // 切换/导入存档的还原窗口内禁止撤销：此时画板还是旧存档内容，
    // 撤销链路会把旧快照灌回画板并在收尾时落盘，整份覆盖刚载入的新存档
    if (suspendSaveRef.current) return;
    // 先把还没落账的最近一次修改记进历史：
    // 否则防抖没走完就撤销，撤销点会比用户的预期多退一格，之后的自动保存
    // 还会把"撤销前"的内容当成新操作压进去
    saveCurrentState(true);
    const previousState = undo();
    if (!previousState) return;
    applyHistorySnapshot(previousState);
  }, [applyHistorySnapshot, saveCurrentState, undo]);

  // 重做操作
  const handleRedo = useCallback(() => {
    // 同 handleUndo：还原窗口内禁止重做
    if (suspendSaveRef.current) return;
    saveCurrentState(true);
    const nextState = redo();
    if (!nextState) return;
    applyHistorySnapshot(nextState);
  }, [applyHistorySnapshot, redo, saveCurrentState]);

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

      // 撤销/重做：Windows/Linux 用 Ctrl，macOS 用 Cmd
      const modifier = e.ctrlKey || e.metaKey;
      if (!modifier || e.altKey) return;
      const key = e.key.toLowerCase();

      // Ctrl/Cmd+Z 撤销（Shift 反向 = 重做）
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      // Ctrl+Y 重做
      if (key === "y" && !e.shiftKey) {
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

  // ===== 存档数据 =====
  const buildSaveData = useCallback((): SaveData | null => {
    if (!guideBoardRef.current) return null;
    const { rows, config } = guideBoardRef.current.getState();
    return {
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
  }, []);

  // 把当前画板写进「活动存档」；内容和上次写入完全一致时跳过
  // （既省 localStorage 配额，也避免每 2 秒无意义地刷新 updatedAt）
  const persistCurrentState = useCallback(
    (force = false) => {
      if (
        !guideBoardRef.current ||
        skipAutoSaveRef.current ||
        suspendSaveRef.current
      ) {
        return false;
      }
      const id = activeArchiveIdRef.current;
      if (!id) return false;
      // 多标签页防护：另一个标签页可能刚删掉这个存档。写前查一次索引，
      // 避免把整份内容写进无人引用的孤儿键（用户看来就是「编辑全丢了」）
      if (
        !archiveStore
          .listArchives()
          .archives.some(archive => archive.id === id)
      ) {
        return false;
      }
      const saveData = buildSaveData();
      if (!saveData) return false;

      const serialized = JSON.stringify(saveData);
      if (!force && serialized === lastSavedJsonRef.current) return true;

      const ok = archiveStore.saveArchiveData(id, saveData);
      if (ok) {
        lastSavedJsonRef.current = serialized;
        lastChangeRef.current = Date.now();
      } else {
        const now = Date.now();
        if (now - quotaToastAtRef.current > 5000) {
          quotaToastAtRef.current = now;
          Toast.error(t("saves.archives.saveFailedQuota"));
        }
      }
      return ok;
    },
    [buildSaveData, t]
  );

  // 给撤销/重做的还原链路用（那边定义在它前面，只能走 ref）
  persistRef.current = persistCurrentState;

  const refreshArchiveList = useCallback(() => {
    const state = archiveStore.listArchives();
    setArchives(state.archives);
    return state;
  }, []);

  const makeDefaultArchiveName = useCallback(() => {
    const { archives: list } = archiveStore.listArchives();
    const names = new Set(list.map(archive => archive.name));
    let index = list.length + 1;
    let name = t("saves.archives.defaultName", { index });
    while (names.has(name)) {
      index += 1;
      name = t("saves.archives.defaultName", { index });
    }
    return name;
  }, [t]);

  const uniqueArchiveName = useCallback((base: string) => {
    const { archives: list } = archiveStore.listArchives();
    const names = new Set(list.map(archive => archive.name));
    if (!names.has(base)) return base;
    let index = 2;
    while (names.has(`${base} (${index})`)) index += 1;
    return `${base} (${index})`;
  }, []);

  /**
   * 把一份存档数据应用到底层画板（主题 → 数据 → 重置撤销基线）。
   * 期间冻结自动保存，避免旧画板被写进新存档。
   */
  const applySaveData = useCallback(
    async (saveData: SaveData) => {
      const themeIndex = resolveThemeIndex(saveData);
      const itemCount = countSavedItems(saveData);
      let targetTheme = themeIndex;
      if (themeIndex === -1) {
        // 未知主题 + 有内容：restoreState 会把组件全部丢掉，拒绝还原，
        // 交给调用方锁住自动保存，至少把原始存档留着
        if (itemCount > 0) return false;
        targetTheme = currentThemeRef.current;
      }

      suspendSaveRef.current = true;
      // 撤销/重做里挂着「切主题 150ms 后再灌数据」的定时器：切换存档/导入时
      // 必须先撤掉它，否则它稍后会把旧存档的历史快照灌进刚载入的新存档
      clearRestoreTimers();
      resumeHistory();
      try {
        if (targetTheme !== currentThemeRef.current) {
          setCurrentTheme(targetTheme);
          await delay(120);
        }
        if (!guideBoardRef.current) return false;
        guideBoardRef.current.restoreState(saveData);
        // 底板背景色镜像跟随存档里的配置
        setBoardBgMirror(
          typeof saveData.config.boardBackground === "string" &&
            saveData.config.boardBackground
            ? saveData.config.boardBackground
            : null
        );
        // 更新上一次主题引用，防止自动保存触发主题重置
        prevThemeRef.current = targetTheme;
        // 等 React 提交 restoreState 的 rows，再以它作为撤销基线：
        // 否则 clearHistory 会保留上一个存档的状态，撤销一次就跨存档了
        await delay(120);
        const board = guideBoardRef.current.getState();
        resetHistory(
          normalizeHistoryState({
            rows: board.rows as unknown as HistoryItem[][],
            config: board.config,
            currentTheme: targetTheme,
          })
        );
        return true;
      } finally {
        window.setTimeout(() => {
          suspendSaveRef.current = false;
        }, 80);
      }
    },
    [clearRestoreTimers, resetHistory, resumeHistory]
  );

  /** 切换活动存档：先把当前画板落盘，再恢复目标存档 */
  const switchArchive = useCallback(
    async (id: string, options: { persist?: boolean; silent?: boolean } = {}) => {
      if (!id) return false;
      if (id === activeArchiveIdRef.current) return true;

      if (options.persist !== false) persistCurrentState(true);

      const targetName =
        archiveStore.listArchives().archives.find(archive => archive.id === id)
          ?.name ?? "";
      let saveData = archiveStore.loadArchiveData(id);
      if (!saveData) {
        if (archiveStore.getArchiveRaw(id)) {
          // 原始 JSON 还在、只是校验不过（未来版本升级 / 数据损坏）：
          // 绝不能用空画板覆盖原始数据。锁住自动保存，走「还原失败」引导，
          // 让用户进存档管理自己决定切换 / 删除 / 下载
          skipAutoSaveRef.current = true;
          setRestoreFailedVisible(true);
          if (!options.silent) {
            Toast.error(t("saves.archives.switchFailed"));
          }
          return false;
        }
        // raw 真的不在（写了一半 / 手动清理）：补一份空画板，保证可读
        saveData = archiveStore.createEmptySaveData(
          themes[currentThemeRef.current][0]
        );
        archiveStore.saveArchiveData(id, saveData);
      }

      let ok: boolean;
      try {
        ok = await applySaveData(saveData);
      } catch {
        // 畸形数据把 restoreState 搞抛了：按还原失败处理，别让异常往外冒
        // （调用方拿到 false 后会锁自动保存 / 走失败引导）
        skipAutoSaveRef.current = true;
        setRestoreFailedVisible(true);
        if (!options.silent) {
          Toast.error(t("saves.archives.switchFailed"));
        }
        return false;
      }
      if (!ok) {
        if (!options.silent) {
          Toast.error(t("saves.archives.switchFailed"));
        }
        return false;
      }

      activeArchiveIdRef.current = id;
      setActiveArchiveId(id);
      archiveStore.setActiveArchiveId(id);
      skipAutoSaveRef.current = false;
      archivedItemCountRef.current = 0;
      lastSavedJsonRef.current = JSON.stringify(saveData);
      setRestoreFailedVisible(false);
      refreshArchiveList();
      if (!options.silent) {
        Toast.success(
          t("saves.archives.switchSuccess", { name: targetName })
        );
      }
      return true;
    },
    [applySaveData, persistCurrentState, refreshArchiveList, t]
  );

  // 导入工程 JSON：不覆盖当前画板，而是生成一个新存档并切过去
  const importSaveData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setIsImporting(true);
        const text = await file.text();
        const parsed: unknown = archiveStore.migrateSaveData(JSON.parse(text));

        // 崩溃页导出的整包备份：逐个恢复成新存档（不覆盖现有存档）
        if (archiveStore.isArchiveBundle(parsed)) {
          const created: ArchiveMeta[] = [];
          for (const item of parsed.archives) {
            const baseName =
              item.name.trim().slice(0, 60) ||
              t("saves.archives.untitled");
            const name = uniqueArchiveName(baseName);
            const meta = archiveStore.createArchive(name, item.data);
            if (meta) created.push(meta);
          }
          if (created.length === 0) throw new Error(t("saves.import.error"));

          refreshArchiveList();
          // 优先切到一个能正常还原的存档；整包可能包含修复用的坏存档
          const target = created.find(meta => {
            const data = archiveStore.loadArchiveData(meta.id);
            return (
              !!data &&
              (countSavedItems(data) === 0 || resolveThemeIndex(data) !== -1)
            );
          });
          if (target) {
            await switchArchive(target.id, { persist: true, silent: true });
          }
          Toast.success(
            t("saves.import.bundleCreated", { count: created.length })
          );
          // 导入后保持存档管理弹窗打开，方便继续管理
          return;
        }

        if (!archiveStore.isSaveData(parsed)) {
          throw new Error(t("saves.import.unsupportedVersion"));
        }
        if (
          resolveThemeIndex(parsed) === -1 &&
          countSavedItems(parsed) > 0
        ) {
          throw new Error(t("saves.import.unsupportedTheme"));
        }

        const fileStem = file.name
          .replace(/\.json$/i, "")
          .trim()
          .slice(0, 60);
        const name = uniqueArchiveName(
          fileStem || t("saves.archives.untitled")
        );
        const meta = archiveStore.createArchive(name, parsed);
        if (!meta) throw new Error(t("saves.import.error"));

        const ok = await switchArchive(meta.id, {
          persist: true,
          silent: true,
        });
        if (!ok) {
          archiveStore.deleteArchive(meta.id);
          refreshArchiveList();
          throw new Error(t("saves.import.error"));
        }
        Toast.success(t("saves.import.created", { name }));
        // 导入后保持存档管理弹窗打开，方便继续切换 / 重命名 / 删除
      } catch (err) {
        Toast.error(`${t("saves.import.error")}: ${(err as Error).message}`);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // 启动时载入「活动存档」（旧的单存档会自动迁移成第一个存档）
  const loadActiveArchive = async () => {
    try {
      // 用户刚点了「清除本地存档」：跳过迁移，直接给一张空画板
      if (localStorage.getItem(archiveStore.CLEARING_MARK_KEY) === "1") {
        localStorage.removeItem(archiveStore.CLEARING_MARK_KEY);
        localStorage.removeItem(archiveStore.LEGACY_ARCHIVE_KEY);
      }

      const state = archiveStore.ensureArchives({
        defaultName: t("saves.archives.defaultName", { index: 1 }),
        legacyName: t("saves.archives.legacyName"),
        theme: themes[currentThemeRef.current][0],
      });
      setArchives(state.archives);
      if (!state.activeId) return;

      activeArchiveIdRef.current = state.activeId;
      setActiveArchiveId(state.activeId);

      const saveData = archiveStore.loadArchiveData(state.activeId);
      if (!saveData) return;

      // 记下存档里有多少个组件，初始化完成后用来校验是否真的还原成功
      archivedItemCountRef.current = countSavedItems(saveData);
      lastSavedJsonRef.current = JSON.stringify(saveData);

      const ok = await applySaveData(saveData);
      if (!ok) skipAutoSaveRef.current = true;
    } catch {
      // 启动还原中途抛错（畸形数据等）：保持 fail-closed —— 锁住自动保存，
      // 不然 2 秒后空画板就会覆盖掉这份存档的原始 JSON
      skipAutoSaveRef.current = true;
      setRestoreFailedVisible(true);
    }
  };


  // 记录上一次的主题，用于检测变化
  const [isInitialized, setIsInitialized] = useState(false);
  const prevThemeRef = useRef(currentTheme);
  const configChangeTimeoutRef = useRef<number>(500);

  // 监听配置变化并触发保存
  const handleConfigChange = () => {
    // 未初始化时不保存，避免循环；切换存档/导入期间也一律不落盘
    // （撤销/重做期间的过渡态由 useUndoRedo 的 pause 挡，不再靠时间窗口）
    if (!isInitialized || isImporting) return;

    if (configChangeTimeoutRef.current) {
      window.clearTimeout(configChangeTimeoutRef.current);
    }
    configChangeTimeoutRef.current = window.setTimeout(() => {
      if (suspendSaveRef.current) return;
      lastChangeRef.current = Date.now();
      persistCurrentState();
      // 保存到撤销/重做历史
      saveCurrentState();
    }, 500);
  };

  // ===== 多存档操作 =====
  const openArchiveDialog = useCallback(() => {
    // 打开前先把最新内容落盘，弹窗里的更新时间 / 组件数才是准的
    persistCurrentState();
    refreshArchiveList();
    setArchiveDialogVisible(true);
  }, [persistCurrentState, refreshArchiveList]);

  const getArchiveSummary = useCallback(
    (id: string) => {
      const data = archiveStore.loadArchiveData(id);
      if (!data) return null;
      const themeKey = data.config?.theme ?? "";
      const knownTheme = themes.some(([name]) => name === themeKey);
      const themeName = knownTheme
        ? t(`${themeKey}.displayName`, { defaultValue: themeKey })
        : t("saves.archives.unknownTheme");
      return {
        rows: data.rows?.length ?? 0,
        items: countSavedItems(data),
        themeName,
      };
    },
    [t]
  );

  const handleCreateArchive = useCallback(async () => {
    if (suspendSaveRef.current) return false;
    const name = makeDefaultArchiveName();
    const data = archiveStore.createEmptySaveData(
      themes[currentThemeRef.current][0]
    );
    const meta = archiveStore.createArchive(name, data);
    if (!meta) {
      Toast.error(t("saves.archives.saveFailedQuota"));
      return false;
    }
    refreshArchiveList();
    // 先把当前画板存进旧存档，再切到新存档
    const ok = await switchArchive(meta.id, { persist: true, silent: true });
    if (ok) {
      Toast.success(t("saves.archives.createSuccess", { name }));
    } else {
      Toast.error(t("saves.archives.switchFailed"));
    }
    return ok;
  }, [
    makeDefaultArchiveName,
    refreshArchiveList,
    switchArchive,
    t,
  ]);

  const handleRenameArchive = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim().slice(0, 60);
      if (!trimmed) return;
      archiveStore.renameArchive(id, trimmed);
      refreshArchiveList();
      Toast.success(t("saves.archives.renameSuccess"));
    },
    [refreshArchiveList, t]
  );

  const handleDuplicateArchive = useCallback(
    (id: string) => {
      const source = archiveStore
        .listArchives()
        .archives.find(archive => archive.id === id);
      if (!source) return;
      const name = uniqueArchiveName(
        `${source.name} ${t("saves.archives.copySuffix")}`.slice(0, 60)
      );
      const meta = archiveStore.duplicateArchive(id, name);
      if (!meta) {
        Toast.error(t("saves.archives.saveFailedQuota"));
        return;
      }
      refreshArchiveList();
      Toast.success(t("saves.archives.duplicateSuccess", { name }));
    },
    [refreshArchiveList, t, uniqueArchiveName]
  );

  const handleDeleteArchive = useCallback(
    async (id: string) => {
      const before = archiveStore
        .listArchives()
        .archives.find(archive => archive.id === id);
      const wasActive = id === activeArchiveIdRef.current;

      let state = archiveStore.deleteArchive(id);
      // 最后一个存档被删掉：自动补一个空存档，编辑器永远有「当前存档」
      if (state.archives.length === 0) {
        const meta = archiveStore.createArchive(
          makeDefaultArchiveName(),
          archiveStore.createEmptySaveData(themes[currentThemeRef.current][0])
        );
        if (meta) state = archiveStore.listArchives();
      }
      refreshArchiveList();

      if (wasActive) {
        // 画板还停在被删存档的内容上：不要落盘（persist:false），
        // 否则会把刚删掉的内容写进新活动存档
        const switched =
          !!state.activeId &&
          (await switchArchive(state.activeId, {
            persist: false,
            silent: true,
          }));
        if (!switched) {
          // 补建/切换失败（配额满、目标存档还原不出来等）：
          // activeId 不能悬在已删 id 上干等 —— 锁住自动保存并给「还原失败」
          // 引导，否则用户一编辑，内容就会写进已删除的 id，重载后全部丢失
          skipAutoSaveRef.current = true;
          setRestoreFailedVisible(true);
        }
      }
      if (before) {
        Toast.success(
          t("saves.archives.deleteSuccess", { name: before.name })
        );
      }
    },
    [
      makeDefaultArchiveName,
      refreshArchiveList,
      switchArchive,
      t,
    ]
  );

  const handleDownloadArchive = useCallback(
    (id: string) => {
      const raw = archiveStore.getArchiveRaw(id);
      if (!raw) return;
      downloadJson(raw, archiveStore.savesFileName());
      Toast.success(t("saves.archives.downloadSuccess"));
    },
    [t]
  );

  // 导出全部存档：打包成 zip，包内每个存档一个 json（内容和单独下载完全一致）
  const handleExportAllArchives = useCallback(() => {
    // 先把当前画板落盘，保证导出的就是用户看到的这份
    persistCurrentState();
    const count = archiveStore.exportAllArchivesZip();
    if (count === 0) {
      // 和崩溃页的 window.alert 对齐：空的时候要有反馈，不能静默无反应
      Toast.warning(t("saves.archives.exportAllEmpty"));
      return;
    }
    Toast.success(t("saves.archives.exportAllSuccess", { count }));
  }, [persistCurrentState, t]);

  // 清除全部本地存档（Header 的红色按钮 / 崩溃页共用）
  const handleClearLocal = useCallback(() => {
    suspendSaveRef.current = true;
    try {
      archiveStore.clearAllArchives();
      localStorage.setItem(archiveStore.CLEARING_MARK_KEY, "1");
    } catch {
      // 隐私模式下写标记失败也无所谓，刷新后最多迁移一次旧存档
    }
    clearHistory();
    window.location.reload();
  }, [clearHistory]);

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
        await loadActiveArchive();
        // 等待一下，确保 DOM 更新完成
        await new Promise(resolve => setTimeout(resolve, 100));

        // 存档里有内容、还原后却是空画板 → 说明组件没匹配上（多半是主题对不上）。
        // 这时候必须锁住自动保存，否则 2 秒后就会用空白画板覆盖掉这个存档。
        const restoredCount =
          guideBoardRef.current
            ?.getState()
            .rows.reduce((sum, row) => sum + row.length, 0) ?? 0;
        if (archivedItemCountRef.current > 0 && restoredCount < archivedItemCountRef.current) {
          skipAutoSaveRef.current = true;
        }
        if (skipAutoSaveRef.current) {
          // 不在错误弹窗里直接删/导出：多存档下应该让用户进存档管理，
          // 自己决定切换、删除还是下载（其他存档都在那里）
          setRestoreFailedVisible(true);
        }

        // 用 ref：主题可能在 applySaveData 里切过，闭包里的 currentTheme 还是 0
        prevThemeRef.current = currentThemeRef.current;
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

  // 定时自动保存：只写「活动存档」，内容没变时 persistCurrentState 内部直接跳过
  useEffect(() => {
    if (!isInitialized) return;

    const saveInterval = window.setInterval(() => {
      // 距离上次变化超过 1 秒才尝试保存
      if (Date.now() - lastChangeRef.current > 1000) {
        persistCurrentState();
      }
    }, autoSaveIntervalMs); // 2秒间隔

    return () => {
      clearInterval(saveInterval);
    };
  }, [isInitialized, persistCurrentState]);

  // 关标签页 / 切后台时兜底落盘：定时器 2s + 配置防抖 500ms 的节奏下，
  // 最坏有 ~4s 的编辑只存在于内存里，不兜底的话关页就丢
  useEffect(() => {
    if (!isInitialized) return;
    // pagehide 里同步写 localStorage 仍可靠；suspend/skip 由 persistCurrentState 自查
    const flush = () => persistCurrentState(true);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isInitialized, persistCurrentState]);

  // 隐藏指示线（只有真的在显示时才更新，避免拖拽过程中无谓的重渲染）
  const hideDropIndicator = useCallback(() => {
    setDropIndicator(prev =>
      prev.show ? { show: false, x: 0, y: 0, height: 0 } : prev
    );
  }, []);

  // 兜底：插入指示线（那根 2px 的浅蓝竖线）只能活在「一次拖拽」里。
  // 以前只靠 onDragEnd / onDragCancel 收线 —— 指针如果在窗口外松开、或者 dnd-kit
  // 没收到 pointerup，线就会一直留在画板上（用户反馈「有时候小蓝条会残留」）。
  // 这里再加几道保险：任何一次按下 / 抬起 / 取消 / 失焦 / 切标签页都收线，
  // 拖拽状态清空（activeDrag = null）时也收。
  useEffect(() => {
    if (!dropIndicator.show) return;
    const hide = () => hideDropIndicator();
    window.addEventListener("pointerdown", hide, true);
    window.addEventListener("pointerup", hide, true);
    window.addEventListener("pointercancel", hide, true);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("pointerdown", hide, true);
      window.removeEventListener("pointerup", hide, true);
      window.removeEventListener("pointercancel", hide, true);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [dropIndicator.show, hideDropIndicator]);

  useEffect(() => {
    if (!activeDrag && dropIndicator.show) hideDropIndicator();
  }, [activeDrag, dropIndicator.show, hideDropIndicator]);

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
    // 底板背景色覆盖也随画板一起回到主题默认
    guideBoardRef.current?.setBoardBackground(null);
    setBoardBgMirror(null);
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
        // 但「普通单行组件」拖到双行容器整块的左端时，应视为在容器前插入到该行，
        // 否则容器贴着行首时，压根没法把组件插到它前面。
        const twoRowHits = pool.filter(collision =>
          isTwoRowArea(dataOf(collision))
        );
        const isTwoRowActive =
          activeData.context === "two-row" ||
          draggedType.includes("TwoRowContainer");
        if (twoRowHits.length > 0 && !isTwoRowActive) {
          const dc = (twoRowHits[0]?.data?.droppableContainer ?? {}) as any;
          const node = (dc.node?.current ?? dc.node) as HTMLElement | null;
          const el = node?.closest?.(".two-row-container") as HTMLElement | null;
          const rect =
            el?.getBoundingClientRect?.() ?? dc.rect?.current ?? dc.rect ?? null;
          const px = mousePositionRef.current.x;
          // 以前左右各留 1/6 宽边带都判成「插到容器前/后」，容器一窄（比如 98px）
          // 行尾那 1/6 正好是「往这一行末尾追加」的位置，结果被甩到右边的主行里
          // （用户实测：拖到行尾总是插进更右边的主行）。
          // 现在只保留左端一条窄边带（容器贴着行首时插到它前面用），
          // 右端一律当作「追加到这一行末尾」。
          // 边带必须跟容器宽度成比例：容器被设成 30px 最小宽时，固定 20px 会把大半个
          // 容器都判成「前面插」，压根拖不进容器。
          const edgePx = rect ? Math.min(20, rect.width * 0.15) : 0;
          const nearLeftEdge = !!rect && px < rect.left + edgePx;
          if (nearLeftEdge) {
            // 去掉容器「内部」区域（内部行 + 内部条目），让落点回到
            // 容器这个行级排序项，从而在容器前插入到该行。
            // 注意：过滤后可能一个都不剩（指针下只有容器内部区域），这时必须退回 base，
            // 否则下面的 pool[0].id 会读到 undefined，整个画布直接白屏。
            const innerArea = (data: Record<string, any>) =>
              data.type === "two-row-container-row" || data.context === "two-row";
            const withoutInnerAreas = pool.filter(
              c => !innerArea(dataOf(c))
            );
            pool = withoutInnerAreas.length > 0 ? withoutInnerAreas : base;
          } else {
            // 行级命中要排在裸容器前面：over 落在「容器本身」时落点处理认不出
            // containerId / rowIndex，会静默退回主行。
            const usableOver = (data: Record<string, any>) =>
              !!data.containerId && typeof data.rowIndex === "number";
            return [...twoRowHits].sort(
              (a, b) => Number(usableOver(dataOf(b))) - Number(usableOver(dataOf(a)))
            );
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
      {/* 多标签互斥：另一标签页正在编辑时，全屏提醒并挡住本页一切交互 */}
      {tabConflict &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-6">
            <div className="font-sans w-full max-w-md rounded-lg shadow-xl p-6 bg-white dark:bg-[#232429]">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {t("editor.tabConflict.title")}
              </h3>
              <p className="text-sm leading-relaxed mb-4 text-gray-600 dark:text-gray-300">
                {t("editor.tabConflict.body")}
              </p>
              <button
                type="button"
                className="w-full py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                {t("editor.tabConflict.refresh")}
              </button>
            </div>
          </div>,
          document.body
        )}
      <div className="flex flex-col h-screen">
        <Header
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          guideHeight={guideHeight}
          zoom={zoom}
          onZoomChange={setZoom}
          disableZoom={isEditingOpen}
          showItemFrame={showItemFrame}
          onShowItemFrameChange={setShowItemFrame}
          onFitToView={fitToView}
          paletteOpen={paletteOpen}
          onTogglePalette={() => setPaletteOpen(open => !open)}
          currentArchiveName={
            archives.find(archive => archive.id === activeArchiveId)?.name ?? ""
          }
          onOpenArchives={openArchiveDialog}
        />
        <div className="flex h-0 flex-1">
          {!isCompact && (
            <ComponentsList
              currentTheme={currentTheme}
              onThemeChange={handleThemeRequest}
              boardBackground={boardBgMirror}
              onBoardBackgroundChange={handleBoardBackgroundChange}
            />
          )}
          <div
            ref={editorAreaRef}
            className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-[#101014]"
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
        <ArchiveDialog
          visible={archiveDialogVisible}
          onCancel={() => setArchiveDialogVisible(false)}
          archives={archives}
          activeId={activeArchiveId}
          getSummary={getArchiveSummary}
          onSwitch={async id => {
            const ok = await switchArchive(id);
            if (ok) setArchiveDialogVisible(false);
            return ok;
          }}
          onCreate={async () => {
            // 新建后保持弹窗打开：用户还要在列表里接着管理
            await handleCreateArchive();
          }}
          onImport={importSaveData}
          onClearAll={handleClearLocal}
          onRename={handleRenameArchive}
          onDuplicate={handleDuplicateArchive}
          onDelete={handleDeleteArchive}
          onDownload={handleDownloadArchive}
          onExportAll={handleExportAllArchives}
        />
        {/* 存档还原失败：不再直接给「删除 / 导出」，统一引导进存档管理 */}
        <Modal
          title={t("saves.restore_failed_title")}
          visible={restoreFailedVisible}
          onCancel={() => setRestoreFailedVisible(false)}
          centered
          width={460}
          style={{ maxWidth: "calc(100vw - 24px)" }}
          footer={
            <div className="flex justify-end pt-2">
              <Button
                theme="solid"
                type="primary"
                onClick={() => {
                  setRestoreFailedVisible(false);
                  openArchiveDialog();
                }}
              >
                {t("saves.open_archives")}
              </Button>
            </div>
          }
        >
          <p className="m-0 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {t("saves.restore_failed")}
          </p>
        </Modal>
        {isCompact && paletteRendered && (
          <div
            className={`mobile-palette-sheet fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-white dark:bg-[#16161a] shadow-2xl border-t border-gray-200 dark:border-[#2e2e35] overflow-hidden ${
              paletteOpen ? "" : "moert-sheet-closing"
            }`}
            style={{ maxHeight: "50vh", paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="shrink-0 flex items-center justify-between gap-3 pl-4 pr-2 pt-2 pb-1">
              <span className="font-sans font-bold text-sm text-gray-700 dark:text-gray-200">
                {t("componentsList.title")}
              </span>
              <Button
                theme="borderless"
                icon={<IconClose />}
                onClick={() => setPaletteOpen(false)}
                style={{ color: "var(--semi-color-text-0, #111827)" }}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <ComponentsList
                fullWidth
                currentTheme={currentTheme}
                onThemeChange={handleThemeRequest}
                boardBackground={boardBgMirror}
                onBoardBackgroundChange={handleBoardBackgroundChange}
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
