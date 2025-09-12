import type { IconProps } from "../Icon";

const Taxi = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <g id="b">
        <rect y="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
        <rect x="50" y="169" width="28" height="40" rx="5" ry="5" fill={background} />
        <rect x="178" y="169" width="28" height="40" rx="5" ry="5" fill={background} />
        <path d="M108,49h40c3.86,0,7,3.14,7,7v19h-54v-19c0-3.86,3.14-7,7-7Z" fill={background} />
        <polyline points="206 128 190 77 128 77 66 77 50 128" fill="none" stroke={background}
          stroke-linejoin="round" stroke-width="14" />
        <path
          d="M52,116.5h152c12.14,0,22,9.86,22,22v40c0,.55-.45,1-1,1H31c-.55,0-1-.45-1-1v-40c0-12.14,9.86-22,22-22Z"
          fill={background} />
        <circle cx="64" cy="145" r="13.5" fill={foreground} />
        <circle cx="192" cy="145" r="13.5" fill={foreground} />
        <text transform="translate(109.3 66.79)" fill={foreground}
          font-family="MicrosoftYaHei-Bold, &apos;Microsoft YaHei&apos;" font-size="16"
          font-weight="700">
          <tspan x="0" y="0" letter-spacing="-.08em">T</tspan>
          <tspan x="8.8" y="0">AXI</tspan>
        </text>
      </g>
    </svg>
  );
};

export default Taxi;
