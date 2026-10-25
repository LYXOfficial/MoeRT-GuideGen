import { useCallback, useRef, useState } from "react";

interface UndoRedoActions<T> {
  /** 记录一份新状态（默认防抖 100ms，immediate=true 立即落账） */
  saveState: (state: T, immediate?: boolean) => void;
  /** 立刻把还在防抖里的状态落账（撤销前调用，保证"最后一次修改"也被记下） */
  flush: () => void;
  undo: () => T | undefined;
  redo: () => T | undefined;
  canUndo: boolean;
  canRedo: boolean;
  /** 暂停记录：还原历史期间画板上的中间态不写进历史 */
  pause: () => void;
  /** 恢复记录 */
  resume: () => void;
  clear: () => void;
  /** 把历史重置成以 state 为唯一起点（切换存档/导入后使用，避免撤销跨存档） */
  reset: (state: T) => void;
}

interface HistoryEntry<T> {
  state: T;
  /** 稳定序列化结果，用于判断"内容没变" */
  key: string;
}

/**
 * 稳定序列化：对象键排序后再序列化，函数 / symbol / undefined 依照 JSON 规则丢弃。
 *
 * 历史去重必须用它而不是 JSON.stringify：同一份内容如果只是键的插入顺序不同，
 * 直接 stringify 会得到两个不同的串，于是撤销后紧接着的一次自动保存会被当成"新操作"，
 * 把 redo 分支截掉（表现为：撤销之后重做只能走一步，之后 redo 按钮永远是灰的）。
 * 这里还顺手挡住了循环引用，避免极端数据把历史链路抛崩。
 */
export function stableSerialize(value: unknown): string {
  const seen = new WeakSet<object>();
  const walk = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input.map(item => {
        const next = walk(item);
        return next === undefined ? null : next;
      });
    }
    if (input && typeof input === "object") {
      const object = input as Record<string, unknown>;
      if (seen.has(object)) return "[circular]";
      seen.add(object);
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(object).sort()) {
        const next = walk(object[key]);
        if (next === undefined) continue;
        out[key] = next;
      }
      seen.delete(object);
      return out;
    }
    if (typeof input === "function" || typeof input === "symbol") {
      return undefined;
    }
    return input;
  };
  const serialized = JSON.stringify(walk(value));
  return typeof serialized === "string" ? serialized : "";
}

/** 深拷贝快照：历史项必须和画板里的对象脱钩，后续任何原地修改都不能污染它 */
function cloneSnapshot<T>(value: T): T {
  try {
    const text = JSON.stringify(value);
    if (typeof text !== "string") return value;
    return JSON.parse(text) as T;
  } catch {
    return value;
  }
}

/**
 * 撤销/重做功能 Hook
 *
 * 设计要点（都是踩过的坑）：
 * 1. 历史存在 ref 里、同步读写：`undo()` / `redo()` 连按（键盘长按、连续点按钮）
 *    不会像 useState 版本那样读到上一帧的旧 index 而少走一步。
 * 2. 落账前和 `history[currentIndex]` 做内容比较：内容没变就不新增条目。
 *    撤销后的自动保存（画板内容 == 历史当前项）因此不会把 redo 分支截掉。
 * 3. `undo` / `redo` 会先把防抖里的状态 flush 掉，撤销点永远对齐"最后一次真实修改"。
 * 4. 还原历史期间用 `pause()` 挡住中间态；`resume()` 之后的重叠保存由第 2 条兜底。
 *
 * @param initialState 初始状态
 * @param maxHistorySize 最大历史记录数量，默认 50
 * @param normalize 可选的规整函数：把状态压成只含语义字段的纯数据（去掉 element 等运行时内容）。
 *                  历史比较必须在规整后的形态上做，否则 React element 之类的东西会让
 *                  "内容相同"被误判成"内容不同"。
 */
export function useUndoRedo<T>(
  initialState: T,
  maxHistorySize: number = 50,
  normalize?: (state: T) => T
): UndoRedoActions<T> {
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;

  const prepare = useCallback((state: T): T => {
    const fn = normalizeRef.current;
    return cloneSnapshot(fn ? fn(state) : state);
  }, []);

  const entriesRef = useRef<HistoryEntry<T>[] | null>(null);
  if (entriesRef.current === null) {
    const prepared = prepare(initialState);
    entriesRef.current = [{ state: prepared, key: stableSerialize(prepared) }];
  }
  const indexRef = useRef(0);

  // 历史本身不放 state（同步读写要靠 ref），用计数器强制重渲染刷新 canUndo / canRedo
  const [, setRevision] = useState(0);
  const bump = useCallback(() => setRevision(v => v + 1), []);

  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef<{ state: T } | null>(null);
  const pausedRef = useRef(false);

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** 把新状态压进历史（内容相同则跳过） */
  const commit = useCallback(
    (state: T) => {
      const entries = entriesRef.current;
      if (!entries) return false;
      const prepared = prepare(state);
      const key = stableSerialize(prepared);
      if (entries[indexRef.current]?.key === key) return false;

      // 在历史中间做了新操作：丢掉后面的 redo 分支
      if (indexRef.current < entries.length - 1) {
        entries.splice(indexRef.current + 1);
      }
      entries.push({ state: prepared, key });

      // 限制历史大小
      if (entries.length > maxHistorySize) {
        entries.splice(0, entries.length - maxHistorySize);
      }
      indexRef.current = entries.length - 1;
      bump();
      return true;
    },
    [bump, maxHistorySize, prepare]
  );

  const flush = useCallback(() => {
    cancelTimer();
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending) return;
    commit(pending.state);
  }, [cancelTimer, commit]);

  const saveState = useCallback(
    (newState: T, immediate: boolean = false) => {
      cancelTimer();
      // 还原历史期间不落账：这时画板上的状态是过渡态（旧 rows + 新主题之类）
      if (pausedRef.current) return;

      if (immediate) {
        pendingRef.current = { state: newState };
        flush();
        return;
      }
      pendingRef.current = { state: newState };
      // 防抖：短时间内的多次调用只保存最后一次
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        flush();
      }, 100);
    },
    [cancelTimer, flush]
  );

  const undo = useCallback((): T | undefined => {
    // 先把还没落账的修改记下来，否则撤销点会比用户预期多退一格
    flush();
    if (indexRef.current <= 0) {
      bump();
      return undefined;
    }
    indexRef.current -= 1;
    bump();
    const entry = entriesRef.current?.[indexRef.current];
    return entry ? cloneSnapshot(entry.state) : undefined;
  }, [bump, flush]);

  const redo = useCallback((): T | undefined => {
    // 有未落账的修改时，flush 会截断 redo 分支 → redo 自然变成空操作（符合直觉）
    flush();
    const entries = entriesRef.current;
    if (!entries || indexRef.current >= entries.length - 1) {
      bump();
      return undefined;
    }
    indexRef.current += 1;
    bump();
    return cloneSnapshot(entries[indexRef.current].state);
  }, [bump, flush]);

  const pause = useCallback(() => {
    cancelTimer();
    pendingRef.current = null;
    pausedRef.current = true;
  }, [cancelTimer]);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const clear = useCallback(() => {
    cancelTimer();
    pendingRef.current = null;
    pausedRef.current = false;
    const entries = entriesRef.current;
    if (entries) {
      const current = entries[indexRef.current];
      if (current) entriesRef.current = [{ ...current }];
      indexRef.current = 0;
    }
    bump();
  }, [bump, cancelTimer]);

  const reset = useCallback(
    (nextState: T) => {
      cancelTimer();
      pendingRef.current = null;
      pausedRef.current = false;
      const prepared = prepare(nextState);
      // baseline 直接就是新状态：紧接着（restore 触发的）自动保存不会再多压一条
      entriesRef.current = [{ state: prepared, key: stableSerialize(prepared) }];
      indexRef.current = 0;
      bump();
    },
    [bump, cancelTimer, prepare]
  );

  const entries = entriesRef.current ?? [];
  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < entries.length - 1;

  return {
    saveState,
    flush,
    undo,
    redo,
    canUndo,
    canRedo,
    pause,
    resume,
    clear,
    reset,
  };
}
