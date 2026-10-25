import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

const STORAGE_KEY = "guide-theme-mode";

/**
 * 深浅色模式：
 * - 初始（未手动选择过）实时跟随浏览器设置 prefers-color-scheme；
 * - 手动切换后写入 localStorage，优先于系统设置。
 * 应用方式：html.dark 供 Tailwind 的 dark: 变体使用，
 * body[theme-mode] 驱动 Semi 组件自带的深色主题，meta theme-color 同步移动端浏览器 chrome。
 */
export function useDarkMode() {
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [stored, setStored] = useState<"dark" | "light" | null>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === "dark" || v === "light" ? v : null;
    } catch {
      return null;
    }
  });

  const isDark = stored ? stored === "dark" : systemDark;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.body.setAttribute("theme-mode", isDark ? "dark" : "light");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? "#16161a" : "#f9fafb");
  }, [isDark]);

  const toggle = useCallback(() => {
    const next: "dark" | "light" = isDark ? "light" : "dark";
    setStored(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 写入失败（隐私模式等）时仅本次会话生效
    }
  }, [isDark]);

  return { isDark, toggle };
}
