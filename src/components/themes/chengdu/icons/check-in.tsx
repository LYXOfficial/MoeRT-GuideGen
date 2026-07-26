import type { IconProps } from "../Icon";

const CheckIn = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <defs>
        <filter id="d" x="171" y="34" width="65" height="185" color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse">
          <feColorMatrix result="cm" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0" />
          <feFlood flood-color="#fff" result="bg" />
          <feBlend in="cm" in2="bg" />
        </filter>
        <mask id="c" x="171" y="34" width="65" height="185" maskUnits="userSpaceOnUse">
          <g filter="url(#d)">
            <path d="M220,132h-49v-11h49c3,.14,5.36,2.67,5.3,5.61-.06,2.86-2.38,5.25-5.3,5.39Z"
              fill="#fff" />
          </g>
        </mask>
      </defs>
      <g id="b">
        <rect y="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
        <g mask="url(#c)">
          <path d="M197,34h39v185h-39c-11.05,0-20-8.95-20-20V54c0-11.05,8.95-20,20-20Z" fill={background} />
        </g>
        <polygon points="195 137 118 137 145 105 222 105 195 137" fill={foreground} />
        <polygon points="195 137 118 137 145 105 222 105 195 137" fill="none" stroke={foreground}
          stroke-miterlimit="10" stroke-width="12" />
        <polygon points="195 137 118 137 145 105 222 105 195 137" fill="none" stroke={background}
          stroke-miterlimit="10" stroke-width="6" />
        <rect x="177" y="96" width="59" height="25" fill={background} />
        <path
          d="M106.07,123.74c7.48-.43,16.74-.14,25.44,2,13.93,3.43,27.32.93,28.04-5.96.71-6.89-7.96-8.81-12.78-9.81-4.82-1-28.74-5.78-38.15-9.7-9.41-3.93-19.63-12.59-30.59-18.81s-19.81-4.89-31.81-12c-12-7.11-17.67-15.85-17.67-15.85v63.96s31,25.44,42.11,37.44c11.11,12,24.11,18.69,47.33,18.69,11.67-.52,14.9-2.41,20-6.08,5.11-3.67,19.86-20.61,20-24.94.13-4.33-1.22-8-12.33-8.33-7.98-.24-13.78,11.33-17.67,13s-5.22,1.78-10,2.39-11.11-1.61-15.67-6.33c-4.56-4.72-6.26-8.59-5.04-12.87,1.22-4.28,4.29-6.52,8.78-6.78Z"
          fill={background} />
        <line x1="160" y1="137" x2="131" y2="137" fill="none" stroke={foreground} stroke-miterlimit="10"
          stroke-width="12" />
        <line x1="160" y1="137" x2="131" y2="137" fill="none" stroke={background} stroke-miterlimit="10"
          stroke-width="6" />
        <line x1="162" y1="137" x2="129" y2="137" fill="none" stroke={background} stroke-miterlimit="10"
          stroke-width="6" />
      </g>
    </svg>
  );
};

export default CheckIn;
