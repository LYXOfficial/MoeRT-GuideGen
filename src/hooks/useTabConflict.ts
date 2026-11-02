import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 多标签页互斥：同一时间只允许一个标签页进入编辑器。
 *
 * 原理：Web Locks API（navigator.locks）。先到的标签页持锁直到关闭/刷新；
 * 后到的标签页拿不到锁 → conflict=true，由调用方弹全屏层并冻结一切写路径
 * （suspendSaveRef/skipAutoSaveRef），防止两个标签页的自动保存互相覆盖存档。
 * 持有方崩溃/关闭后锁由浏览器自动释放；被封锁的标签页由用户点「刷新本页」
 * 重新走完整初始化。
 *
 * 被封锁时还可以「强制接管」：Web Locks 不允许抢锁，所以接管靠 BroadcastChannel
 * 协作完成 —— 接管方广播，对方收到广播后让出锁（清空锁）并转入被封锁
 * 状态（立刻停止保存），接管方随即重新申请，通常 1.5s 内真正拿到锁。
 * 这样「强抢」不会变成两个标签页同时写同一个存档。
 *
 * 写冻结看的是 locked（本页是否持有锁），而不是 conflict（冲突层是否 showing）：
 * 挂载后等锁的 2.5s 宽限期 / 强制接管等锁期 / HMR 重挂间隙里，冲突层都还没弹，
 * 但这几段时间照样不许写 —— 否则第二个标签页在宽限期内随手一拖，
 * 自动保存就把第一个标签页的存档覆盖掉了（锁形同虚设）。
 *
 * 没有 Web Locks 的环境（旧浏览器 / 非安全上下文的局域网访问，
 * 这时 navigator.locks 根本不存在）走 localStorage 心跳选主兜底，
 * 同样的 conflict/locked/force 语义，保证新标签页照样弹窗。
 */
const LOCK_NAME = "moert-guidegen-editor";
const CHANNEL_NAME = "moert-guidegen-editor-takeover";
// 强制接管后等锁的最长容忍：超过还没拿到，说明对方没让锁（极端情况），
// 把冲突层弹回来让用户重试，别让编辑器静默地不保存
const FORCE_TIMEOUT_MS = 6000;
// ---- localStorage 心跳锁（无 Web Locks 时的兜底） ----
const FALLBACK_LOCK_KEY = "moert-guidegen-editor-lock";
const FALLBACK_HEARTBEAT_MS = 1000;
const FALLBACK_STALE_MS = 2500;
const FALLBACK_POLL_MS = 500;
// 抢锁先写上、隔一小会再读回来验证：防两个标签页同一时刻都看到「无锁」同时写上
const FALLBACK_VERIFY_MS = 120;

type TakeoverMessage = { type: "takeover"; epoch: number; from: string };

export type TabConflictHandle = {
  /** 另一个标签页持锁中：本页应弹全屏提醒并冻结一切写路径 */
  conflict: boolean;
  /** 本页当前是否持有编辑锁：没拿到就不许写（等锁期也算在内） */
  locked: boolean;
  /** 强制接管编辑：清空对方的锁，对方转为被封锁 */
  force: () => void;
};

/**
 * 模块级闩锁：StrictMode / 热更新「挂载→立刻卸载→重挂载」会重置 effect 局部量
 * 和 useState，但模块状态保留 —— 之前已封锁的话，重挂后不给 2.5s 宽限、
 * 不给裸奔窗口，冲突层和写冻结原样回来。完整刷新会清掉它，
 * 「关掉旧页后刷新恢复」的流程不受影响。
 */
let lastBlocked = false;

const locksImpl =
  typeof navigator !== "undefined"
    ? (navigator as Navigator & { locks?: LockManager }).locks
    : undefined;
// 必须连 request 一起验：测试/套壳环境可能只剩个空壳，没有它就走心跳兜底
const locksSupported = typeof locksImpl?.request === "function";

export function useTabConflict(): TabConflictHandle {
  const [conflict, setConflict] = useState(lastBlocked);
  // 挂载先当没锁（冻结写路径），拿到锁才解冻；兜底分支拿不到存储时才放行
  const [locked, setLocked] = useState(false);
  const forceRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!locksSupported) return undefined;

    const instanceId = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    let cancelled = false;
    // blocked：本页被封锁（停止写存档，也不再抢锁）
    let blocked = lastBlocked;
    // forced：用户已点「强制接管」，等锁期间保持 conflict=false 但 locked=false（照样冻结）
    let forced = false;
    let timer = 0;
    let watchdog = 0;
    let releaseHold: (() => void) | null = null;
    let epoch = 0;
    let lockedNow = false;
    // StrictMode / 热更新会「挂载→立刻卸载→重挂载」：旧实例的锁释放与新实例
    // 的申请存在竞态，刚启动的一小段时间内拿不到锁是正常现象，
    // 只有持续拿不到锁（真有别的标签页持有着）才判定冲突并封锁。
    // 但之前已经闩住（lastBlocked）的话不再给宽限 —— 第一轮拿不到就地封锁
    const mountedAt = performance.now();
    const graceUntil = lastBlocked ? 0 : mountedAt + 2500;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      channel = null;
    }

    const setLockedState = (value: boolean) => {
      lockedNow = value;
      setLocked(value);
    };
    const setConflictState = (value: boolean) => {
      lastBlocked = value;
      setConflict(value);
    };

    const stopTimer = () => {
      window.clearTimeout(timer);
      timer = 0;
    };
    const stopWatchdog = () => {
      window.clearTimeout(watchdog);
      watchdog = 0;
    };

    const schedule = (delay: number) => {
      if (cancelled || blocked) return;
      stopTimer();
      timer = window.setTimeout(attempt, delay);
    };

    /** 放开本页持有的编辑锁（「清空锁」），把位置让给对方 */
    const yieldLock = () => {
      const release = releaseHold;
      releaseHold = null;
      release?.();
    };

    /** 转入被封锁：停止抢锁（锁让给接管方），由调用方冻结写路径 */
    const block = () => {
      stopTimer();
      if (blocked) return;
      blocked = true;
      setConflictState(true);
    };

    const attempt = () => {
      if (cancelled || blocked) return;
      navigator.locks
        .request(LOCK_NAME, { ifAvailable: true }, async lock => {
          if (!lock) {
            // 别的标签页持有编辑锁：持续拿不到才封锁（闩住，不自动解除）。
            // forced（刚点了强制接管、等对方让锁）不算冲突，只管继续等
            if (!forced && performance.now() > graceUntil) block();
            return; // 回调结束 = 没持有锁，外层稍后重试
          }
          // 本实例已被卸载（StrictMode 第一轮 / HMR）：立刻放锁，
          // 否则僵尸持有会让紧随其后的重挂载误判成「别的标签页在编辑」
          if (cancelled) return;
          // 拿到锁：先亮 locked（写路径随即解冻），一直持有到本页关闭。
          // 只有「刚点了强制接管」才顺手清掉冲突层；之前被封锁过但没点接管
          // （HMR 重挂、持锁方刚好关了）则保持封锁画面，让用户手动刷新
          // 重新初始化，否则本页内存里的旧画板会把对方刚保存的内容覆盖掉
          setLockedState(true);
          stopWatchdog();
          if (forced) {
            forced = false;
            setConflictState(false);
          }
          await new Promise<void>(resolve => {
            releaseHold = resolve;
          });
        })
        .then(
          () => schedule(forced ? 1500 : 250),
          () => schedule(forced ? 1500 : 250)
        );
    };

    /** 强制接管：广播出去（对方让锁并转入封锁），本页重新申请。
     * 注意这里只清冲突层、不解冻 —— 锁真正到手（locked=true）后调用方才解冻，
     * 否则广播在路上、对方还没让锁的 1 秒里两边同时写存档 */
    const takeOver = () => {
      if (cancelled) return;
      forced = true;
      blocked = false;
      epoch = Date.now();
      setConflictState(false);
      setLockedState(false);
      yieldLock();
      channel?.postMessage({
        type: "takeover",
        epoch,
        from: instanceId,
      } satisfies TakeoverMessage);
      // 对方没让锁（极端情况）：别让编辑器静默地不保存，
      // 超时把冲突层弹回来让用户重试 / 刷新
      stopWatchdog();
      watchdog = window.setTimeout(() => {
        watchdog = 0;
        if (cancelled || lockedNow) return;
        setConflictState(true);
      }, FORCE_TIMEOUT_MS);
      schedule(0);
    };
    forceRef.current = takeOver;

    const handleTakeover = (message: TakeoverMessage) => {
      if (cancelled || message.from === instanceId) return;
      if (message.epoch <= epoch) return;
      epoch = message.epoch;
      forced = false;
      yieldLock(); // 让出锁给接管方
      setLockedState(false);
      block(); // 本页转为被封锁：立刻停止保存
    };

    if (channel) {
      channel.onmessage = event => {
        const data = event.data as TakeoverMessage | null;
        if (data?.type !== "takeover") return;
        handleTakeover(data);
      };
    }

    attempt();
    return () => {
      cancelled = true;
      stopTimer();
      stopWatchdog();
      forceRef.current = () => {};
      channel?.close();
      yieldLock();
    };
  }, []);

  // ---- 无 Web Locks 时的兜底：localStorage 心跳选主 ----
  // 语义和主分支一致（conflict/locked/force + 2.5s 宽限 + 闩住 + 接管协作），
  // 同一浏览器里同样走这个分支的标签页之间互斥正常生效。
  useEffect(() => {
    if (locksSupported) return undefined;

    const instanceId = `fb-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    let cancelled = false;
    let blocked = lastBlocked;
    let forced = false;
    let timer = 0;
    let watchdog = 0;
    let heartbeat = 0;
    let verifyTimer = 0;
    let holding = false;
    let epoch = 0;
    let lockedNow = false;
    const mountedAt = performance.now();
    const graceUntil = lastBlocked ? 0 : mountedAt + 2500;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      channel = null;
    }

    const setLockedState = (value: boolean) => {
      lockedNow = value;
      setLocked(value);
    };
    const setConflictState = (value: boolean) => {
      lastBlocked = value;
      setConflict(value);
    };

    const stopTimer = () => {
      window.clearTimeout(timer);
      timer = 0;
    };
    const stopWatchdog = () => {
      window.clearTimeout(watchdog);
      watchdog = 0;
    };
    const stopHeartbeat = () => {
      window.clearInterval(heartbeat);
      heartbeat = 0;
    };

    type StoredLock = { id: string; ts: number };
    const readLock = (): StoredLock | null => {
      try {
        const raw = localStorage.getItem(FALLBACK_LOCK_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<StoredLock>;
        if (typeof parsed.id !== "string" || typeof parsed.ts !== "number") {
          return null;
        }
        return { id: parsed.id, ts: parsed.ts };
      } catch {
        return null;
      }
    };
    const writeLock = (): boolean => {
      try {
        localStorage.setItem(
          FALLBACK_LOCK_KEY,
          JSON.stringify({ id: instanceId, ts: Date.now() } satisfies StoredLock)
        );
        return true;
      } catch {
        return false;
      }
    };
    // 只清自己的锁：别人的心跳（哪怕看着过期了）也别碰，交由过期判定处理
    const clearOwnLock = () => {
      try {
        if (readLock()?.id === instanceId) {
          localStorage.removeItem(FALLBACK_LOCK_KEY);
        }
      } catch {
        // 忽略
      }
    };

    const startHeartbeat = () => {
      stopHeartbeat();
      heartbeat = window.setInterval(() => {
        if (cancelled || !holding) return;
        writeLock();
      }, FALLBACK_HEARTBEAT_MS);
    };

    const schedule = (delay: number) => {
      if (cancelled || blocked) return;
      stopTimer();
      timer = window.setTimeout(attempt, delay);
    };

    /** 放开锁：停心跳 + 只清自己的锁 */
    const yieldLock = () => {
      holding = false;
      stopHeartbeat();
      clearOwnLock();
    };

    const block = () => {
      stopTimer();
      if (blocked) return;
      blocked = true;
      setConflictState(true);
    };

    const attempt = () => {
      if (cancelled || blocked) return;
      const now = Date.now();
      const cur = readLock();
      const stale = !cur || now - cur.ts > FALLBACK_STALE_MS;
      if (cur && !stale && cur.id !== instanceId) {
        // 别的标签页持锁中：持续拿不到才封锁（闩住，不自动解除）
        if (!forced && performance.now() > graceUntil) block();
        else schedule(FALLBACK_POLL_MS);
        return;
      }
      // 无锁 / 已过期 / 就是自己：先写上，隔一会读回来验证是自己才算拿到
      if (!writeLock()) {
        // 存储不可用（隐私模式等）：退化成放行，别把编辑器冻死
        setLockedState(true);
        return;
      }
      window.clearTimeout(verifyTimer);
      verifyTimer = window.setTimeout(() => {
        verifyTimer = 0;
        if (cancelled || blocked) {
          clearOwnLock();
          return;
        }
        if (readLock()?.id === instanceId) {
          holding = true;
          setLockedState(true);
          stopWatchdog();
          if (forced) {
            forced = false;
            setConflictState(false);
          }
          startHeartbeat();
        } else {
          // 验证期被别人盖掉了：当没抢到处理
          if (!forced && performance.now() > graceUntil) block();
          else schedule(FALLBACK_POLL_MS);
        }
      }, FALLBACK_VERIFY_MS);
    };

    const takeOver = () => {
      if (cancelled) return;
      forced = true;
      blocked = false;
      epoch = Date.now();
      setConflictState(false);
      setLockedState(false);
      yieldLock();
      channel?.postMessage({
        type: "takeover",
        epoch,
        from: instanceId,
      } satisfies TakeoverMessage);
      stopWatchdog();
      watchdog = window.setTimeout(() => {
        watchdog = 0;
        if (cancelled || lockedNow) return;
        setConflictState(true);
      }, FORCE_TIMEOUT_MS);
      schedule(0);
    };
    forceRef.current = takeOver;

    const handleTakeover = (message: TakeoverMessage) => {
      if (cancelled || message.from === instanceId) return;
      if (message.epoch <= epoch) return;
      epoch = message.epoch;
      forced = false;
      yieldLock(); // 让出锁给接管方
      setLockedState(false);
      block(); // 本页转为被封锁：立刻停止保存
    };

    if (channel) {
      channel.onmessage = event => {
        const data = event.data as TakeoverMessage | null;
        if (data?.type !== "takeover") return;
        handleTakeover(data);
      };
    }

    // 对方心跳变化（持有/释放/接管）时早点去看一眼；
    // 只有同源其它标签页的写入才会触发，自己写的不触发
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FALLBACK_LOCK_KEY) return;
      if (cancelled || blocked || holding) return;
      schedule(50);
    };
    window.addEventListener("storage", onStorage);
    // 关页前把锁让出来：对方不用等心跳过期（2.5s）就能接上
    const releaseOnHide = () => {
      clearOwnLock();
    };
    window.addEventListener("pagehide", releaseOnHide);

    attempt();
    return () => {
      cancelled = true;
      stopTimer();
      stopWatchdog();
      window.clearTimeout(verifyTimer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", releaseOnHide);
      forceRef.current = () => {};
      channel?.close();
      yieldLock();
    };
  }, []);

  const force = useCallback(() => {
    forceRef.current();
  }, []);

  return { conflict, locked, force };
}
