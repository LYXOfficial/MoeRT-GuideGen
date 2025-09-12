import type { IconProps } from "../Icon";

const Tickets = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <defs>
        <clipPath id="c">
          <rect x="195.41" y="121.28" width="22" height="10"
            transform="translate(212.57 -115.62) rotate(60)" fill="none" />
        </clipPath>
      </defs>
      <g id="b">
        <rect x="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
        <path
          d="M135,126c-1-3-57-38-58-38S14,125,14,125v62s13,1,22-1,21-4,28-15,6-25,6-25c0,0,0-11,8-14s23.99,8.17,25.5,9.08,7.5,12.92,7.5,14.92-12,23-12,23c0,0-3,7,3,10s11-2,11-2c0,0-2,7,4,10s10-2,10-2c0,0,15-26,16-29s-7-37-8-40Z"
          fill={background} />
        <rect x="146.5" y="78.5" width="56" height="107" transform="translate(201.57 -85.12) rotate(60)"
          fill={foreground} stroke={background} stroke-miterlimit="10" stroke-width="7" />
        <g clip-path="url(#c)">
          <line x1="192.66" y1="102.46" x2="192.66" y2="102.46" fill="none" stroke={background}
            stroke-linecap="round" stroke-linejoin="round" stroke-width="7" />
          <line x1="198.16" y1="111.99" x2="206.41" y2="126.28" fill="none" stroke={background}
            stroke-dasharray="0 11" stroke-linecap="round" stroke-linejoin="round" stroke-width="7" />
          <line x1="209.16" y1="131.04" x2="209.16" y2="131.04" fill="none" stroke={background}
            stroke-linecap="round" stroke-linejoin="round" stroke-width="7" />
        </g>
        <rect x="122.5" y="78.5" width="56" height="107" transform="translate(86.16 -57.57) rotate(30)"
          fill={foreground} stroke={background} stroke-miterlimit="10" stroke-width="7" />
        <line x1="151.46" y1="97.34" x2="151.46" y2="97.34" fill="none" stroke={background}
          stroke-linecap="round" stroke-linejoin="round" stroke-width="7" />
        <line x1="160.99" y1="102.84" x2="175.28" y2="111.09" fill="none" stroke={background}
          stroke-dasharray="0 11" stroke-linecap="round" stroke-linejoin="round" stroke-width="7" />
        <line x1="180.04" y1="113.84" x2="180.04" y2="113.84" fill="none" stroke={background}
          stroke-linecap="round" stroke-linejoin="round" stroke-width="7" />
        <line x1="52.96" y1="159.87" x2="127.04" y2="148.13" fill="none" stroke={background}
          stroke-linecap="round" stroke-linejoin="round" stroke-width="25" />
      </g>
    </svg>
  );
};

export default Tickets;
