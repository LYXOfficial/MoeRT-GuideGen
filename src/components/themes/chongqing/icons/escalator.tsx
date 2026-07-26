import type { IconProps } from "../Icon";

const Escalator = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <g id="b">
        <rect x="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
        <line x1="112" y1="142" x2="112" y2="91" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="27" />
        <circle cx="112" cy="62" r="12" fill={background} />
        <polyline points="50 180 80 180 174 88 206 88" fill="none" stroke={background}
          stroke-linecap="round" stroke-miterlimit="10" stroke-width="50" />
        <polyline points="50 180 80 180 174 88 206 88" fill="none" stroke={foreground}
          stroke-linecap="round" stroke-miterlimit="10" stroke-width="28" />
      </g>
    </svg>
  );
};

export default Escalator;
