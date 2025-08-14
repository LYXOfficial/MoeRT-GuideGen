export default function Arrow({ rotation }: { rotation: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 141 139"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>
        <clipPath id="a1">
          <path clip-rule="evenodd" d="M0 0L848 0L848 831.9999L0 831.9999z" />
        </clipPath>
      </defs>

      <g transform="matrix(1.3333334 0 0 1.3333334 0 0)">
        <path
          d="M0 0L105.75 0L105.75 104.25L0 104.25z"
          stroke="none"
          fill="#FFFFFF"
          fill-rule="evenodd"
        />
        <g transform="matrix(0.125 0 0 0.125 0 0)">
          <g>
            <g>
              <g>
                <g></g>
                <g clip-path="url(#1)">
                  <path
                    transform="matrix(6.0141845 0 0 5.9856114 -3139.4043 -1807.6547)"
                    d="M522 397L592 326L592 303L522 373z"
                    stroke="currentColor"
                    stroke-width="0"
                    stroke-linecap="round"
                    fill="currentColor"
                    fill-rule="evenodd"
                    stroke-opacity="0"
                  />
                </g>
                <path
                  transform="matrix(6.0141845 0 0 5.9856114 -3139.4043 -1807.6547)"
                  d="M583 325L583 440L601 440L601 325L583 325z"
                  stroke="currentColor"
                  stroke-width="0"
                  stroke-linecap="round"
                  fill="currentColor"
                  fill-rule="evenodd"
                  stroke-opacity="0"
                />
                <path
                  transform="matrix(6.0141845 0 0 5.9856114 -3139.4043 -1807.6547)"
                  d="M662 397L592 326L592 303L662 373z"
                  stroke="currentColor"
                  stroke-width="0"
                  stroke-linecap="round"
                  fill="currentColor"
                  fill-rule="evenodd"
                  stroke-opacity="0"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
