import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend) // 加载翻译资源文件
  .use(LanguageDetector) // 检测浏览器语言
  .use(initReactI18next) // 绑定 React
  .init({
    fallbackLng: "zh-CN", // 默认语言
    supportedLngs: ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR"],
    lowerCaseLng: false,
    debug: false,
    interpolation: {
      escapeValue: false, // React 已经自动转义
    },
    detection: {
      order: ["localStorage", "querystring", "navigator"],
      caches: ["localStorage"],
    },
  });
export default i18n;
