/**
 * 北京旧版主题的文字/度量工具。
 *
 * 汉字用中易黑体（SimHei，fonts/simhei.css 从 CDN 引入），
 * 西文与数字用 Arial —— 与官方样例的度量一致。
 * 量宽/字重/空白预处理等工具与新版共用同一套实现。
 */
import { fontFamilyEn, fontFamilyZh } from "./colors";
import { weightCss, type TextWeight } from "../../beijing/define/text";

export {
  measureText,
  normalizeSvgLine,
  weightCss,
  WEIGHT_VALUE,
  type TextWeight,
} from "../../beijing/define/text";

import { useEffect, useState } from "react";

/**
 * 字体就绪钩子（旧版专用）：新版通用的 useFontsReady 只等 document.fonts.ready，
 * 而中易黑体是组件渲染时才触发请求的 —— ready 可能在 SimHei 发起加载前就 resolve，
 * 导致 canvas 量宽/量 ink 时用的是回退字体的度量（基线/字宽全错）。
 * 这里显式 load SimHei 与 Arial 后再置 ready。
 */
export const useFontsReady = (): boolean => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    Promise.all([
      document.fonts?.load('700 16px "SimHei"').catch(() => []),
      document.fonts?.load('400 16px "SimHei"').catch(() => []),
      document.fonts?.load('400 16px Arial').catch(() => []),
      document.fonts?.load('700 16px Arial').catch(() => []),
      document.fonts?.ready ?? Promise.resolve(),
    ])
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  return ready;
};

/** 中文字体串（用于 canvas measureText 与 SVG font-family） */
export const fontZh = (weight: TextWeight | number, size: number): string =>
  `${weightCss(weight)} ${size}px ${fontFamilyZh}`;

/** 拉丁/数字字体串（旧版与中文同为中易黑体） */
export const fontEn = (weight: TextWeight | number, size: number): string =>
  `${weightCss(weight)} ${size}px ${fontFamilyEn}`;
