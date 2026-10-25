/**
 * 把 Semi 挂在 body 上的浮层（下拉选择器 / 取色板 / 气泡 / tooltip）
 * 限制在视口内 —— 全主题、全浮层通用。
 *
 * 背景：Semi 浮层的定位容器是 body，autoAdjustOverflow 也按 body 的尺寸判断；
 * 一旦有浮层把 document 撑高（或 body 比视口高），它就永远认为「放得下」，
 * 不会向上翻转。表现为：编辑弹窗里的选择器 / 取色板超出屏幕下沿，
 * 且整页出现竖向滚动条（配合 global.css 里 html/body 的 overflow:hidden，
 * 滚动条已消灭，这里负责把浮层本身拉回视口）。
 *
 * 做法：MutationObserver 盯浮层的出现与 style/class 变化（Semi 重定位会改
 * .semi-portal-inner 的内联 top/left），直接在回调里把越界浮层用独立的
 * translate 属性推回视口。注意两点：
 * - 不用 requestAnimationFrame：页面不可见 / 被遮挡时 rAF 会被跳过，
 *   MutationObserver 的微任务回调不受影响；
 * - 不用 transform：Semi 的入场动画在 transform 上，fill-mode: forwards
 *   会盖掉内联值；translate 是独立属性，互不干扰；
 * - 量几何前不清空 translate，而是把它的当前值从 rect 里减掉还原原始位置，
 *   且只在目标值变化时才写 —— 否则「清空→写回」自身就是突变，观察器会
 *   无限自触发。
 */
const MARGIN = 8;

function parseTranslate(style: string): { x: number; y: number } {
  if (!style || style === "none") return { x: 0, y: 0 };
  const parts = style
    .split(/\s+/)
    .map(Number)
    .filter(n => Number.isFinite(n));
  if (!parts.length) return { x: 0, y: 0 };
  return { x: parts[0] || 0, y: parts[1] ?? (parts[0] || 0) };
}

export function installPortalClamp(): () => void {
  if (typeof window === "undefined" || typeof MutationObserver === "undefined") {
    return () => {};
  }

  const clampAll = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    document
      .querySelectorAll<HTMLElement>(".semi-portal-inner")
      .forEach(el => {
        if (el.getBoundingClientRect().width === 0) return;
        // 当前 translate 从 rect 里减掉，还原 Semi 定位的原始位置
        const cur = parseTranslate(getComputedStyle(el).translate);
        const rect = el.getBoundingClientRect();
        const rawLeft = rect.left - cur.x;
        const rawRight = rect.right - cur.x;
        const rawTop = rect.top - cur.y;
        const rawBottom = rect.bottom - cur.y;
        let dx = 0;
        let dy = 0;
        if (rawBottom > vh - MARGIN) dy = vh - MARGIN - rawBottom;
        if (rawTop + dy < MARGIN) dy = MARGIN - rawTop;
        if (rawRight > vw - MARGIN) dx = vw - MARGIN - rawRight;
        if (rawLeft + dx < MARGIN) dx = MARGIN - rawLeft;
        // dx/dy 是相对「Semi 原始定位」的完整偏移（raw 已把当前 translate 减掉），
        // 直接作为目标值写入；稳定后 want 与现值相同，不再产生突变
        const want = dx || dy ? `${dx}px ${dy}px` : "";
        if (el.style.translate !== want) el.style.translate = want;
      });
  };

  const observer = new MutationObserver(records => {
    for (const r of records) {
      if (r.type === "childList" || r.attributeName) {
        clampAll();
        return;
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });
  window.addEventListener("resize", clampAll);
  // 捕获阶段：弹窗内部滚动改变浮层相对位置时也要重新钳制
  window.addEventListener("scroll", clampAll, true);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", clampAll);
    window.removeEventListener("scroll", clampAll, true);
  };
}
