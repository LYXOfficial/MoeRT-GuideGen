/**
 * SVG 文字与空白字符。
 *
 * 坑：SVG `<text>` 默认 `xml:space="default"`，连续空格会被折叠成一个、
 * 行首行尾的空格直接丢掉；而量宽度（canvas `measureText` / `getBBox`）是按
 * 用户输入的原始字符串算的 —— 于是「输入多个空格」就变成「显示只留一个、
 * 盒子却按多个空格算宽」或者反过来「文字被算窄、被裁掉」。
 *
 * 统一做法：
 *   1. 内容先过 normalizeSvgLine（只把制表/换行换成空格，**首尾空格也保留**）；
 *   2. 量宽度和渲染都用这个处理过的字符串（两边空格数才对得上）；
 *   3. 渲染的 `<text>` 上加 `xmlSpace="preserve"`（保留连续空格与首尾空格）。
 */

/** 单行字段：制表/换行按 SVG 规则换成空格；首尾与中间的空格全部原样保留 */
export const normalizeSvgLine = (text?: string | null): string =>
  (text ?? "").replace(/[\t\n\r]/g, " ");

/** 多行字段：保留行结构（换行符不动），每行做单行规范化 */
export const normalizeSvgLines = (text?: string | null): string[] =>
  (text ?? "").split(/\r?\n/).map(line => normalizeSvgLine(line));
