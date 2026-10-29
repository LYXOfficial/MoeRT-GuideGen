import { useEffect, useRef, useState } from "react";

/**
 * 多标签页互斥：同一时间只允许一个标签页进入编辑器。
 *
 * 原理：Web Locks API（navigator.locks）。先到的标签页持锁直到关闭/刷新；
 * 后到的标签页拿不到锁 → 返回 true，由调用方弹窗并冻结一切写路径
 * （suspendSaveRef/skipAutoSaveRef），防止两个标签页的自动保存互相覆盖存档。
 * 持有方崩溃/关闭后锁由浏览器自动释放；被封锁的标签页每 1.5s 重试，
 * 一旦拿到锁就把它攥在手里（防止第三个标签页再进来），但保持封锁状态，
 * 由用户点「刷新本页」重新走完整初始化。
 *
 * 浏览器不支持 Web Locks 时直接放行（保持旧行为，不做封锁）。
 */
const LOCK_NAME = "moert-guidegen-editor";

export function useTabConflict(): boolean {
  const [conflict, setConflict] = useState(false);
  const conflictRef = useRef(false);

  useEffect(() => {
    if (!("locks" in navigator)) return undefined;
    let cancelled = false;
    let timer = 0;
    let releaseHold: (() => void) | null = null;
    // StrictMode / 热更新会「挂载→立刻卸载→重挂载」：旧实例的锁释放与新实例
    // 的申请存在竞态，刚启动的一小段时间内拿不到锁是正常现象，
    // 只有持续拿不到锁（真有别的标签页持有着）才判定冲突并封锁
    const mountedAt = performance.now();

    const attempt = () => {
      if (cancelled) return;
      navigator.locks
        .request(LOCK_NAME, { ifAvailable: true }, async lock => {
          if (!lock) {
            // 别的标签页持有编辑锁：持续拿不到才封锁（闩住，不自动解除）
            if (!conflictRef.current && performance.now() - mountedAt > 2500) {
              conflictRef.current = true;
              setConflict(true);
            }
            return; // 回调结束 = 没持有锁，外层稍后重试
          }
          // 本实例已被卸载（StrictMode 第一轮 / HMR）：立刻放锁，
          // 否则僵尸持有会让紧随其后的重挂载误判成「别的标签页在编辑」
          if (cancelled) return;
          // 拿到锁：一直持有到本页关闭。即使本页曾被封锁过
          // （前一持有者刚关闭）也保持封锁画面，让用户手动刷新重新初始化，
          // 否则本页内存里的旧画板会把对方刚保存的内容覆盖掉
          await new Promise<void>(resolve => {
            releaseHold = resolve;
          });
        })
        .then(
          () => {
            if (!cancelled) {
              timer = window.setTimeout(
                attempt,
                conflictRef.current ? 1500 : 250
              );
            }
          },
          () => {
            if (!cancelled) {
              timer = window.setTimeout(
                attempt,
                conflictRef.current ? 1500 : 250
              );
            }
          }
        );
    };

    attempt();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      releaseHold?.();
    };
  }, []);

  return conflict;
}
