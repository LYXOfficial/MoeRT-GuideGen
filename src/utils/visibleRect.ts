/**
 * 元素在屏幕上真正「露出来」的矩形：与视口、以及最近的裁剪祖先（滚动容器 / overflow:hidden）
 * 分别取交，坐标相对视口。
 *
 * 用途：组件栏（删除区）本身是可滚动的、移动端还藏在底部抽屉里，
 * 直接用 DOM 矩形当拖放区域会比用户看到的大很多——拖到画布外、并没有落在列表上，
 * 也会被判成「拖回组件栏删除」。遮罩同理，只能盖住屏幕上露出来的那块。
 */
export function getVisibleClientRect(el: HTMLElement): {
  top: number;
  left: number;
  width: number;
  height: number;
} {
  const rect = el.getBoundingClientRect();
  let top = Math.max(rect.top, 0);
  let left = Math.max(rect.left, 0);
  let right = Math.min(rect.right, window.innerWidth);
  let bottom = Math.min(rect.bottom, window.innerHeight);

  let parent = el.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll|hidden|clip)/.test(`${style.overflowX}${style.overflowY}`)) {
      const parentRect = parent.getBoundingClientRect();
      top = Math.max(top, parentRect.top);
      left = Math.max(left, parentRect.left);
      right = Math.min(right, parentRect.right);
      bottom = Math.min(bottom, parentRect.bottom);
      break;
    }
    parent = parent.parentElement;
  }

  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}
