export default function Salt() {
  return (
    <img
      // 挂在编辑器画布视口里（absolute，不是全屏 fixed），并给负的 z-index：
      // 负层在「父级背景之上、所有正常内容之下」，所以画板/组件永远压在她上面。
      // （z-0 不够：画布那层是 z-index auto 的合成层，和 z-0 按 DOM 顺序排，容易翻上来）
      // 窄屏（手机）整屏都是画布，再用小一号
      className="love-salt-kawaii-qwq absolute -z-10 opacity-30 cursor-none -right-12.5 bottom-0 w-40 lg:w-70 rotate-y-180 select-none pointer-events-none"
      src="https://img.0v0.my/2026/09/09/4269f4ff25acc.webp"
    />
  );
}
// 夹带私货qwq
