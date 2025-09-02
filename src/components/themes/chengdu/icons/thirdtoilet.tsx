import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const ThirdToilet = ({
  foreground = colors.foreground,
  background = colors.background,
}: IconProps) => {
  return (
    <svg
      id="a"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 256 256"
    >
      <defs>
        <filter
          id="d"
          x="166"
          y="118"
          width="66"
          height="71"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feColorMatrix
            result="cm"
            values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"
          />
          <feFlood floodColor="#fff" result="bg" />
          <feBlend in="cm" in2="bg" />
        </filter>
        <mask
          id="c"
          x="166"
          y="118"
          width="66"
          height="71"
          maskUnits="userSpaceOnUse"
        >
          <g filter="url(#d)">
            <rect fill="#fff" x="182" y="118" width="50" height="50" />
          </g>
        </mask>
      </defs>
      <g id="b">
        <rect
          fill={foreground}
          width="256"
          height="256"
          rx="40"
          ry="40"
        />
        <path
          fill={background}
          d="M59.52,88H26.48c-4.21,0-7.62,3.41-7.62,7.62v42.57s0,4.45,3.81,4.45,3.81-4.45,3.81-4.45v-33.04s0-1.91,1.59-1.91,1.59,1.91,1.59,1.91v84.51s0,5.08,5.72,5.08,5.72-5.08,5.72-5.08v-48.29s0-1.91,1.91-1.91,1.91,1.91,1.91,1.91v48.29s0,5.08,5.72,5.08,5.72-5.08,5.72-5.08v-84.51s0-1.91,1.59-1.91,1.59,1.91,1.59,1.91v33.04s0,4.45,3.81,4.45,3.81-4.45,3.81-4.45v-42.57c0-4.21-3.41-7.62-7.62-7.62Z"
        />
        <circle fill={background} cx="43" cy="73" r="11.12" />
        <path
          fill={background}
          d="M154.86,134.38l-12.07-39.39s-1.91-6.99-8.26-6.99h-19.06c-6.35,0-8.26,6.99-8.26,6.99l-12.07,39.39s-1.27,3.81,2.54,5.08,5.08-3.18,5.08-3.18l9.53-33.04s.64-1.91,1.91-1.27.64,2.54.64,2.54l-13.12,46.85c-.11.41.19.81.61.81h9.96v38.12s0,4.45,5.72,4.45,5.72-4.45,5.72-4.45v-38.12h2.54v38.12s0,4.45,5.72,4.45,5.72-4.45,5.72-4.45v-38.12h9.96c.42,0,.73-.4.61-.81l-13.12-46.85s-.64-1.91.64-2.54,1.91,1.27,1.91,1.27l9.53,33.04s1.27,4.45,5.08,3.18,2.54-5.08,2.54-5.08Z"
        />
        <circle fill={background} cx="125" cy="73" r="11.12" />
        <path
          fill={background}
          d="M96,146c-2-1-3,1-3,1l-6.7,9.57c-.19.27-.49.43-.82.43h-6.96c-.33,0-.63-.16-.82-.43l-6.7-9.57s-1-2-3-1-1,3-1,3l7.66,11.5c.22.33.34.71.34,1.11v28.39s0,3,3,3,3-3,3-3v-14s0-1,1-1,1,1,1,1v14s0,3,3,3,3-3,3-3v-28.39c0-.39.12-.78.34-1.11l7.66-11.5s1-2-1-3Z"
        />
        <circle fill={background} cx="82" cy="146" r="6" />
        <g mask="url(#c)">
          <circle
            fill="none"
            stroke={background}
            strokeMiterlimit={10}
            strokeWidth="6px"
            cx="197"
            cy="158"
            r="28"
          />
        </g>
        <line
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="10px"
          x1="237"
          y1="171"
          x2="222"
          y2="146"
        />
        <line
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7px"
          x1="193"
          y1="129"
          x2="219"
          y2="129"
        />
        <polyline
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="14px"
          points="192 118.78 193 146.78 220 146.78"
        />
        <circle fill={background} cx="192" cy="101" r="8.5" />
      </g>
    </svg>
  );
};

export default ThirdToilet;
