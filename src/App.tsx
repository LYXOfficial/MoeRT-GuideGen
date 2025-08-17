import "./utils/i18n";
import { useTranslation } from "react-i18next";
import Editor from "./components/Editor";
import { useEffect, useState } from "react";
import { Toast, Spin } from "@douyinfe/semi-ui";

function App() {
  const { t } = useTranslation();
  const [guideHeight, setGuideHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [archiveLoaded, setArchiveLoaded] = useState(false);

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
      const guideRef = document.querySelector(".guide-board");
      setGuideHeight(guideRef?.clientHeight || 0);
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
        <div className="fixed inset-0 z-1000 bg-white flex flex-col items-center justify-center">
          <Spin size="large" />
          <div className="mt-4 text-lg text-gray-600 font-sans">
            {t("loading.message", "正在加载...")}
          </div>
          <div className="mt-2 text-sm text-gray-400 font-sans">
            {!fontsLoaded && t("loading.fonts", "加载字体中...")}
            {fontsLoaded &&
              !archiveLoaded &&
              t("loading.archive", "加载存档中...")}
          </div>
        </div>
      )}

      <Editor guideHeight={guideHeight} onArchiveLoaded={handleArchiveLoaded} />
      <Toast />
    </div>
  );
}

export default App;
