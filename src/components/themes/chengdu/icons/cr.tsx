import type { IconProps } from "../Icon";

const CR = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <defs>
        <filter id="d" x="49" y="45" width="158" height="161" color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse">
          <feColorMatrix result="cm" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0" />
          <feFlood flood-color="#fff" result="bg" />
          <feBlend in="cm" in2="bg" />
        </filter>
        <mask id="c" x="49" y="45" width="158" height="161" maskUnits="userSpaceOnUse">
          <g filter="url(#d)">
            <polygon points="128 138 79 206 177 206 128 138" fill="#fff" />
          </g>
        </mask>
      </defs>
      <g id="b">
        <rect x="0" y="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
        <path
          d="M144.26,46.19c.95,4.3-1.86,7.81-6.26,7.81h-20c-4.4,0-7.22-3.51-6.26-7.81l.53-2.38c.95-4.3,5.34-7.81,9.74-7.81h12c4.4,0,8.78,3.51,9.74,7.81l.53,2.38Z"
          fill={background} />
        <g mask="url(#c)">
          <circle cx="128" cy="124" r="70.5" fill="none" stroke={background} stroke-miterlimit="10"
            stroke-width="17" />
        </g>
        <path
          d="M179,213c-.43-1.67-1.68-2.61-3-3-3.59-1.06-30.56-5.56-34-7s-8-6-8-16v-41c0-4.56,4.11-7.48,6-8l15-4v-16s0-4-3-7-8-3-8-3h-32s-5,0-8,3-3,7-3,7v16l15,4c1.89.52,6,3.44,6,8v41c0,10-4.56,14.56-8,16s-30.41,5.94-34,7c-1.32.39-2.57,1.33-3,3-.43,1.67-1,7-1,7h104s-.57-5.33-1-7Z"
          fill={background} />
      </g>
    </svg>
  );
};

export default CR;
