/**
 * 東京都交通局（都営地下鉄）シンボルマーク。
 * 矢量取自 Wikimedia Commons `File:Tokyo Metropolitan Bureau of Transportation logo.svg`
 * 里的绿色符号（原始路径与变换矩阵原样保留，只把 viewBox 收窄到符号本身）。
 *
 * 包围盒：符号本身约占 x 0–7.1 / y 0–7.07（原文件单位），四周再留 0.2 余量。
 */
export default function ToeiMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-0.2 -0.2 7.5 7.5"
      aria-hidden
      style={{ display: "block", flex: "none" }}
    >
      <g transform="translate(-108.48 -81.887)">
        <g transform="matrix(.35278 0 0 -.35278 115.55 85.423)">
          <path
            d="m0 0v7e-3c0 5.532-4.484 10.016-10.017 10.016-5.532 0-10.017-4.484-10.017-10.016 0-1e-3 1e-3 -3e-3 1e-3 -5e-3 5.432-0.112 9.804-4.547 9.806-10.007 0.071-1e-3 0.14-5e-3 0.21-5e-3 0.082 0 0.163 4e-3 0.244 6e-3 2e-3 5.447 4.356 9.875 9.773 10.004"
            fill="currentColor"
          />
        </g>
      </g>
    </svg>
  );
}
