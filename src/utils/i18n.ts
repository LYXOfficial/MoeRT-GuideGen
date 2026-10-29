import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import zhCNRaw from "../../public/locales/zh-CN/translation.json?raw";

// zh-CN 打包进产物做兜底资源：locales 请求 404 / 断网时简中界面照常可用，
// 其它语言加载失败时缺键也回落到中文而不是裸 key
const bundledZhCN = JSON.parse(zhCNRaw);

i18n
  .use(Backend) // 加载翻译资源文件
  .use(LanguageDetector) // 检测浏览器语言
  .use(initReactI18next) // 绑定 React
  .init({
    fallbackLng: "zh-CN", // 默认语言
    supportedLngs: ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR"],
    lowerCaseLng: false,
    debug: false,
    // 内联 zh-CN 资源：init 时就存在于 store，zh 用户不再发起 locale 请求
    resources: {
      "zh-CN": { translation: bundledZhCN },
    },
    interpolation: {
      escapeValue: false, // React 已经自动转义
    },
    detection: {
      order: ["localStorage", "querystring", "navigator"],
      caches: ["localStorage"],
    },
    backend: {
      // 相对路径：根域部署行为不变，将来部署到子路径（GitHub Pages 类）也不会 404
      loadPath: "locales/{{lng}}/{{ns}}.json",
    },
    // 注意：这里刻意保持 useSuspense 默认开启（true）。
    // 首帧渲染必须等语言包就绪——Semi Select 会缓存选项标签，若首帧发生在
    // 资源加载前，主题名会永久停留在裸 key（ComponentsList 的 key={i18n.language}
    // 只防语言切换，防不了首帧；此坑实测复现过）。慢网络的等待体验由
    // main.tsx 的 Suspense 边界兜底（spinner 而非白屏）。
  });
export default i18n;
