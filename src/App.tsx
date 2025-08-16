import "./utils/i18n";
import { useTranslation } from "react-i18next";
import Editor from "./components/Editor";
import { useEffect, useState } from "react";
import { Toast } from "@douyinfe/semi-ui";

function App() {
  const { t } = useTranslation();
  const [guideHeight, setGuideHeight] = useState(0);

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
      <Editor guideHeight={guideHeight} />
      <Toast />
    </div>
  );
}

export default App;
