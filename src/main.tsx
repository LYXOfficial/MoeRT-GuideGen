import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import "./utils/errorLog"; // 初始化日志收集
import ErrorBoundary from "./components/ErrorBoundary";
import { Spin } from "@douyinfe/semi-ui";

// Suspense 边界：i18n 语言包（http-backend 异步 fetch）就绪前整树挂起。
// 没有这个边界时挂起 = 纯白屏；有边界则显示 spinner。
// 不能用 useSuspense:false 绕过：Semi Select 会缓存选项标签，
// 首帧若发生在语言包就绪前，主题名会永久停留在裸 key（实测复现过）。
const SuspenseFallback = (
  <div
    style={{
      width: "100vw",
      height: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f2f3f5",
    }}
  >
    <Spin size="large" />
  </div>
);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={SuspenseFallback}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
