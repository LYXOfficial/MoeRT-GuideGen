export type ArrowDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right"
  | "ahead-left"
  | "ahead-right"
  | "back-left"
  | "back-right";

// 基础箭头按角度旋转即可得到 8 个方向
const BASE_ROTATION: Partial<Record<ArrowDirection, number>> = {
  up: 0,
  down: 180,
  left: 270,
  right: 90,
  "up-left": 315,
  "up-right": 45,
  "down-left": 225,
  "down-right": 135,
};

// 前方向左/右、左/右行向后：JR 风格独立图形（数据参照
// JR-Guidance-Sign-Web-Editor 的 arrows 图标，viewBox 0 0 56 56）
const JR_PATHS: Partial<Record<ArrowDirection, string>> = {
  "ahead-left":
    "M15.1895 23.8184H40.002C48.8383 23.8186 56.0019 30.9819 56.002 39.8184V51.8047H47.6367V39.8213C47.6366 35.6019 44.2165 32.1816 39.9971 32.1816H15.1895L39.1934 55.7559H27.8418L0 28L27.8418 0.244141H39.1934L15.1895 23.8184Z",
  "ahead-right":
    "M40.8125 23.8184H16C7.16362 23.8186 2.78491e-05 30.9819 0 39.8184V51.8047H8.36523V39.8213C8.36533 35.6019 11.7855 32.1816 16.0049 32.1816H40.8125L16.8086 55.7559H28.1602L56.002 28L28.1602 0.244141H16.8086L40.8125 23.8184Z",
  "back-left":
    "M39.8164 0C30.9799 1.13483e-06 23.8164 7.16345 23.8164 16V20.002H23.8184V40.8105L0.244141 16.8066V28.1582L28 56L55.7559 28.1582V16.8066L32.1816 40.8105V19H32.1797V16.0039C32.1799 11.7847 35.6001 8.36428 39.8193 8.36426H51.8027V0H39.8164Z",
  "back-right":
    "M16.1836 0C25.0201 1.13483e-06 32.1836 7.16345 32.1836 16V20.002H32.1816V40.8105L55.7559 16.8066V28.1582L28 56L0.244141 28.1582V16.8066L23.8184 40.8105V19H23.8203V16.0039C23.8201 11.7847 20.3999 8.36428 16.1807 8.36426H4.19727V0H16.1836Z",
};

export default function ArrowIcon({ type }: { type: ArrowDirection }) {
  const jrPath = JR_PATHS[type];
  // JR 风格独立图形
  if (jrPath) {
    return (
      <svg
        viewBox="0 0 56 56"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ fill: "currentColor", display: "block" }}
        aria-hidden
      >
        <path d={jrPath} />
      </svg>
    );
  }

  // 基础箭头旋转到对应方向
  const rotation = BASE_ROTATION[type] ?? 0;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 141 139"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>
        <clipPath id="a1">
          <path clipRule="evenodd" d="M0 0L848 0L848 831.9999L0 831.9999z" />
        </clipPath>
      </defs>

      <g transform="matrix(1.3333334 0 0 1.3333334 0 0)">
        <g transform="matrix(0.125 0 0 0.125 0 0)">
          <g>
            <g>
              <g>
                <g></g>
                <g clipPath="url(#a1)">
                  <path
                    transform="matrix(6.0141845 0 0 5.9856114 -3139.4043 -1807.6547)"
                    d="M522 397L592 326L592 303L522 373z"
                    stroke="currentColor"
                    strokeWidth="0"
                    strokeLinecap="round"
                    fill="currentColor"
                    fillRule="evenodd"
                    strokeOpacity="0"
                  />
                </g>
                <path
                  transform="matrix(6.0141845 0 0 5.9856114 -3139.4043 -1807.6547)"
                  d="M583 325L583 440L601 440L601 325L583 325z"
                  stroke="currentColor"
                  strokeWidth="0"
                  strokeLinecap="round"
                  fill="currentColor"
                  fillRule="evenodd"
                  strokeOpacity="0"
                />
                <path
                  transform="matrix(6.0141845 0 0 5.9856114 -3139.4043 -1807.6547)"
                  d="M662 397L592 326L592 303L662 373z"
                  stroke="currentColor"
                  strokeWidth="0"
                  strokeLinecap="round"
                  fill="currentColor"
                  fillRule="evenodd"
                  strokeOpacity="0"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
