import { useEffect, useState } from "react";

/**
 * 订阅一条 CSS media query，返回当前是否命中。
 * 用 matchMedia 而非 resize 事件，性能更好、且跨 iframe/同源一致。
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * 是否处于「紧凑 / 触屏」布局：手机竖屏与平板窄屏统一走移动端交互。
 * 超过此宽度则维持原有的桌面三段式布局。
 */
export function useIsCompact(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}
