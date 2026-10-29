import "./utils/i18n";
import { useTranslation } from "react-i18next";
import Editor from "./components/Editor";
import { useEffect, useState } from "react";
import { Toast, Spin } from "@douyinfe/semi-ui";
import { installPortalClamp } from "./utils/portalClamp";

// DEV-only：用于构造真正的 React 全局崩溃页（与存档 / 画板无关）。
// 生产构建里这个分支会被 import.meta.env.DEV 消除。
function DevGlobalCrash(): null {
  throw new Error("GuideGen DEV global crash test");
}

function App() {
  const { t } = useTranslation();
  const [guideHeight, setGuideHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [archiveLoaded, setArchiveLoaded] = useState(false);
  const [devCrash, setDevCrash] = useState(false);

  // Semi 浮层（下拉/取色板等挂在 body 上的弹层）越界时推回视口内，
  // 否则编辑弹窗里的二级浮层会超出屏幕下沿、并把整页撑出滚动条
  useEffect(() => installPortalClamp(), []);

  // ?__crash_test=1：挂载后再触发一次更新，让子组件在 render 期抛错进 ErrorBoundary；
  // 先把 query 去掉，刷新即可恢复。不在首次 render 直接 throw（React 会重试首帧）。
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (new URLSearchParams(window.location.search).get("__crash_test") !== "1") {
      return;
    }
    try {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.hash
      );
    } catch {
      // 去掉 query 失败也不影响本次构造
    }
    setDevCrash(true);
  }, []);

  // 监听字体加载
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  // 监听存档加载完成（通过 Editor 组件传递的回调）
  const handleArchiveLoaded = () => {
    setArchiveLoaded(true);
  };

  // 当字体和存档都加载完成时，隐藏加载动画
  // （i18n 语言包的等待在 main.tsx 的 Suspense 边界，这里不用管）
  useEffect(() => {
    if (fontsLoaded && archiveLoaded) {
      // 延迟一点时间让动画更自然
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [fontsLoaded, archiveLoaded]);

  useEffect(() => {
    const updateHeight = () => {
      const guideRef = document.querySelector<HTMLElement>(".guide-board");
      // 用 offsetHeight（含上下 2px 边框盒）而不是 clientHeight：
      // 导出宽度基准是 offsetWidth（含边框），高度基准必须同口径，
      // 否则导出图按 clientHeight 烘会系统性比画板矮 4px，末行底边被裁
      setGuideHeight(guideRef?.offsetHeight || 0);
    };

    // 初始更新
    updateHeight();

    // 创建 ResizeObserver 来监听高度变化
    const observer = new ResizeObserver(updateHeight);
    const guideRef = document.querySelector(".guide-board");
    if (guideRef) {
      observer.observe(guideRef);
    }

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, []); // 空依赖数组，只在组件挂载时运行

  return (
    <div className="h-full flex flex-col">
      <link rel="icon" href="/favicon.ico" />
      <title>{t("title")}</title>

      {/* 全屏加载动画 */}
      {isLoading && (
        <div className="fixed inset-0 z-1000 bg-white dark:bg-[#16161a] flex flex-col items-center justify-center">
          <Spin size="large" />
          <div className="mt-4 text-lg text-gray-600 dark:text-gray-300 font-sans">
            {t("loading.message", "正在加载...")}
          </div>
          <div className="mt-2 text-sm text-gray-400 dark:text-gray-500 font-sans">
            {!fontsLoaded && t("loading.fonts", "加载字体中...")}
            {fontsLoaded &&
              !archiveLoaded &&
              t("loading.archive", "加载存档中...")}
          </div>
        </div>
      )}

      <Editor guideHeight={guideHeight} onArchiveLoaded={handleArchiveLoaded} />
      {devCrash && <DevGlobalCrash />}
      <Toast />
    </div>
  );
}

export default App;
