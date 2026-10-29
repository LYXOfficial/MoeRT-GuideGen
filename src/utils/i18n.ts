import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import zhCNRaw from "../../public/locales/zh-CN/translation.json?raw";

// zh-CN 打包进产物做兜底资源：locales 请求 404 / 断网时简中界面照常可用，
// 其它语言加载失败时缺键也回落到中文而不是裸 key
const bundledZhCN = JSON.parse(zhCNRaw);

const SUPPORTED_LNGS = [
  "zh-CN",
  "zh-HK",
  "yue-HK",
  "en-US",
  "ja-JP",
  "ko-KR",
  "ru-RU",
  "de-DE",
  "fr-FR",
  "es-ES",
  "pt-PT",
];

// 只认「有用的码」：解析出来的这批码本身没有语言包，全部在 routeLanguage 里归一
const ALIAS_LNGS = ["zh-TW", "zh-Hant", "zh-MO", "zh-Hans", "yue"];

// 简体：zh / zh-CN / zh-Hans / zh-SG / zh-MY …；其余中文变体视为繁体
const HANS = /-(hans|cn|sg|my)$/;

/**
 * 语言码归一（路由）。
 *
 * 项目只有**一套**繁体资源 zh-HK，所以 zh-TW / zh-Hant / zh-MO 这类码一律路由到
 * zh-HK，而不是让 i18next 自己按 zh-TW → zh → fallback(zh-CN) 的层级回落成简中
 * （那正是之前湾湾 / 香港用户的浏览器语言被当成简中的原因）。
 *
 * 返回 null = 不用改，交给 i18next 自己做 best-match（en、ja、de-AT 之类）。
 */
export function routeLanguage(lng?: string | null): string | null {
  if (!lng) return null;
  if (SUPPORTED_LNGS.includes(lng)) return lng;
  const low = lng.toLowerCase();
  if (low === "yue" || low.startsWith("yue-")) return "yue-HK";
  // 粤语繁体（zh-yue）也归到粤语资源
  if (low.startsWith("zh-yue")) return "yue-HK";
  if (low === "zh" || low.startsWith("zh-")) {
    return HANS.test(low) ? "zh-CN" : "zh-HK";
  }
  return null;
}

// 存量数据迁移：老版本存过 zh-TW（旧语言菜单里的台湾繁体）→ 统一改写成路由结果
try {
  const stored = localStorage.getItem("i18nextLng");
  const routed = routeLanguage(stored);
  if (stored && routed && routed !== stored) {
    localStorage.setItem("i18nextLng", routed);
  }
} catch {
  // 隐私模式读写失败就不管了，最多回落一次
}

i18n
  .use(Backend) // 加载翻译资源文件
  .use(LanguageDetector) // 检测浏览器语言
  .use(initReactI18next) // 绑定 React
  .init({
    fallbackLng: "zh-CN", // 默认语言
    // 别名码也登记进来：不登记的话 i18next 会在 supportedLngs 过滤阶段就把
    // navigator 探到的 zh-TW 回落成 zh-CN，下面的路由钩子根本等不到它
    supportedLngs: [...SUPPORTED_LNGS, ...ALIAS_LNGS],
    lowerCaseLng: false,
    debug: false,
    // 内联 zh-CN 资源：init 时就存在于 store，zh 用户不再发起 locale 请求
    resources: {
      "zh-CN": { translation: bundledZhCN },
    },
    // 必须！资源只打包了一部分（zh-CN 兜底）。不声明 partial 的话，
    // i18next 会认为「所有语言都已打包」而跳过后端加载——切换语言后
    // 永远拿不到对应语言包，全部回落中文（实测复现过）
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false, // React 已经自动转义
    },
    detection: {
      order: ["localStorage", "querystring", "navigator"],
      caches: ["localStorage"],
    },
    backend: {
      // 相对路径：根域部署行为不变，将来部署到子路径（GitHub Pages 类）也不会 404。
      // 用函数形式先把别名码换成真实语言码，否则 zh-TW 会去请求一个不存在的目录，
      // 只能先 404 再靠 languageChanged 补救，中间会闪一下别的语言。
      loadPath: (lngs: string[]) => {
        const lng = routeLanguage(lngs[0]) ?? lngs[0];
        return `locales/${lng}/{{ns}}.json`;
      },
    },
    // 注意：这里刻意保持 useSuspense 默认开启（true）。
    // 首帧渲染必须等语言包就绪——Semi Select 会缓存选项标签，若首帧发生在
    // 资源加载前，主题名会永久停留在裸 key（ComponentsList 的 key={i18n.language}
    // 只防语言切换，防不了首帧；此坑实测复现过）。慢网络的等待体验由
    // main.tsx 的 Suspense 边界兜底（spinner 而非白屏）。
  });

// 兜住一切「运行时进来的别名码」：?lng=zh-TW、navigator=zh-TW、手动 changeLanguage、
// 以及老 localStorage。资源已经按 loadPath 拿到了正确语言包，这里只是把 i18n.language
// 本身改写成真实码，菜单高亮 / <html lang> / 存档默认名才会跟着对。
// 放在微任务里执行，避免在 languageChanged 的同步派发里再调 changeLanguage。
i18n.on("languageChanged", lng => {
  const routed = routeLanguage(lng);
  if (!routed || routed === lng) return;
  void Promise.resolve().then(() => i18n.changeLanguage(routed));
});

export default i18n;
