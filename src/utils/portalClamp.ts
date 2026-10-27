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
/** Semi 隐藏浮层时停放的哨兵坐标（left/top = -9999） */
const HIDDEN_PARK = -5000;

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

  // 自触发保护：
  // clampAll 自己会写 el.style.translate，而观察器盯的是全站 style/class 变化 ——
  // 若「写进去的值」和「读回来的序列化值」不完全一致（例如 `12px 0px` 读回 `12px`），
  // 就会 写 → 触发回调 → 再写 …… 死循环，表现是整个页面卡死（线上点开主题下拉就中招）。
  // 所以：① 运行期间置 running，回调直接忽略；② 写完 takeRecords() 丢掉自己产生的记录；
  // ③ 比较用数值差值，而不是序列化字符串。
  let observer: MutationObserver | null = null;
  let running = false;
  let pendingAgain = false;

  const clampAll = () => {
    if (running) {
      pendingAgain = true;
      return;
    }
    running = true;
    try {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      document
        .querySelectorAll<HTMLElement>(".semi-portal-inner")
        .forEach(el => {
          const rect0 = el.getBoundingClientRect();
          if (rect0.width === 0) return;
          // Semi 把「还没显示 / 已隐藏」的浮层停在 (-9999, -9999)。
          // 那不是「浮层跑到屏幕外」，而是它根本没出来 —— 这时去钳制它，反而会把它
          // 从哨兵位置拽到画布外几千 px，之后 Semi 再摆到正确位置时我们的 translate
          // 还留着，于是就「不卡了但弹不出来」（线上点主题下拉就是这个）。
          // 看到哨兵就只把自己之前写的偏移清掉，然后跳过。
          if (rect0.left < HIDDEN_PARK || rect0.top < HIDDEN_PARK) {
            if (el.style.translate) el.style.translate = "";
            return;
          }
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none") return;

          // 当前 translate 从 rect 里减掉，还原 Semi 定位的原始位置
          const cur = parseTranslate(cs.translate);
          const rect = rect0;
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
          // 已经在目标位置（误差 < 0.5px）就一个字都别写，否则又会触发观察器
          if (Math.abs(cur.x - dx) < 0.5 && Math.abs(cur.y - dy) < 0.5) return;
          el.style.translate = dx || dy ? `${dx}px ${dy}px` : "";
        });
    } finally {
      running = false;
      // 丢掉本函数自己写入引发的 mutation 记录
      observer?.takeRecords();
      if (pendingAgain) {
        pendingAgain = false;
        queueMicrotask(clampAll);
      }
    }
  };

  observer = new MutationObserver(records => {
    if (running) return;
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
    observer?.disconnect();
    window.removeEventListener("resize", clampAll);
    window.removeEventListener("scroll", clampAll, true);
  };
}
