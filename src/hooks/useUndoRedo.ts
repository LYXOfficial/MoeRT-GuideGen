import { useRef, useState, useCallback } from "react";

interface UndoRedoState<T> {
  history: T[];
  currentIndex: number;
}

interface UndoRedoActions<T> {
  saveState: (state: T, immediate?: boolean) => void;
  undo: () => T | undefined;
  redo: () => T | undefined;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

/**
 * 撤销/重做功能 Hook
 * @param initialState 初始状态
 * @param maxHistorySize 最大历史记录数量，默认 50
 */
export function useUndoRedo<T>(
  initialState: T,
  maxHistorySize: number = 50
): UndoRedoActions<T> {
  const [state, setState] = useState<UndoRedoState<T>>({
    history: [initialState],
    currentIndex: 0,
  });

  // 防抖timer ref，避免短时间内多次保存相同状态
  const debounceTimer = useRef<number | null>(null);
  const lastSavedState = useRef<string>("");

  const saveState = useCallback(
    (newState: T, immediate: boolean = false) => {
      // 清除之前的防抖定时器
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }

      const doSave = () => {
        const serializedState = JSON.stringify(newState);

        // 如果新状态与上次保存的状态相同，跳过
        if (serializedState === lastSavedState.current) {
          return;
        }

        lastSavedState.current = serializedState;

        setState(prevState => {
          const { history, currentIndex } = prevState;

          // 移除当前索引之后的所有历史记录（当用户在历史记录中间进行新操作时）
          const newHistory = history.slice(0, currentIndex + 1);

          // 添加新状态
          newHistory.push(newState);

          // 限制历史记录大小
          if (newHistory.length > maxHistorySize) {
            newHistory.shift();
          }

          // 保存到撤回栈（移除调试日志）

          return {
            history: newHistory,
            currentIndex: newHistory.length - 1,
          };
        });
      };

      if (immediate) {
        // 立即保存，用于删除等重要操作
        doSave();
      } else {
        // 防抖：短时间内的多次调用只保存最后一次
        debounceTimer.current = window.setTimeout(doSave, 100);
      }
    },
    [maxHistorySize]
  );

  const undo = useCallback((): T | undefined => {
    // 直接从当前状态中获取数据，避免异步问题
    const currentState = state;
    const { history, currentIndex } = currentState;

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const result = history[newIndex];
      
      // undo 操作（移除调试日志）

      // 更新状态
      setState(prevState => ({
        ...prevState,
        currentIndex: newIndex,
      }));

      // 返回结果（移除调试日志）
      return result;
    } else {
      // 无可撤销（移除调试日志）
      return undefined;
    }
  }, [state]);

  const redo = useCallback((): T | undefined => {
    // 直接从当前状态中获取数据，避免异步问题
    const currentState = state;
    const { history, currentIndex } = currentState;

    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const result = history[newIndex];
      
      // redo 操作（移除调试日志）

      // 更新状态
      setState(prevState => ({
        ...prevState,
        currentIndex: newIndex,
      }));

      // 返回结果（移除调试日志）
      return result;
    } else {
      // 无可重做（移除调试日志）
      return undefined;
    }
  }, [state]);

  const clear = useCallback(() => {
    setState(prevState => ({
      history: [prevState.history[prevState.currentIndex]],
      currentIndex: 0,
    }));
    lastSavedState.current = "";
  }, []);

  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
