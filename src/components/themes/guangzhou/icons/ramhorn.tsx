/**
 * 广州地铁标志（羊角）。
 *
 * 取自 Wikimedia Commons 的官方标志矢量
 * （docs/guangzhou/raw/gzmetro-logo.svg，PD-PRC-exempt）。
 * 原文件是「标志 + 中英文标准字」的整条锁定版式，这里只取标志本身的
 * 两条红色路径（文档里 fill:#c51935），文字部分由组件用 DOM 排，
 * 这样 stacked / inline 两种排布和 i18n 都好办。
 *
 * 坐标：原文档用 translate(-55.303433,-561.85155) 把标志挪到原点，
 * 实测墨迹范围 x 0.05..30.55、y 0..36.30（宽高比 0.84）。
 */
export default function RamHorn() {
  return (
    <svg
      viewBox="0 0 30.6 36.3"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
      aria-hidden
    >
      <g transform="translate(-55.303433,-561.85155)" fill="currentColor">
        <path d="m 63.906948,580.5186 c -0.0049,-7.46582 -3.339844,-14.15528 -8.603515,-18.65235 l 6.71875,-0.0147 c 4.414063,4.4043 7.167969,10.50293 7.226563,17.22168 l 0,19.11621 -5.341798,0 z m 0,0" />
        <path d="m 77.334683,580.5186 c 0.0049,-7.46582 3.349609,-14.15528 8.608399,-18.65235 l -6.713868,-0.0147 c -4.428711,4.4043 -7.172851,10.50293 -7.231445,17.22168 l 0,19.11621 5.336914,0 z m 0,0" />
      </g>
    </svg>
  );
}
