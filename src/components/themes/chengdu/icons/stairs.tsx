import type { IconProps } from "../Icon";

const Stairs = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <g id="b">
        <rect width="256" height="256" rx="40" ry="40" fill={foreground} />
        <polyline
          points="20 220 52 220 52 204 92 204 92 188 132 188 132 172 172 172 172 156 212 156 212 140 236 140"
          fill="none" stroke={background} stroke-miterlimit="10" stroke-width="16" />
        <line x1="75" y1="142" x2="85" y2="129" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="11" />
        <line x1="97" y1="170" x2="76" y2="153" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="11" />
        <line x1="74" y1="187.5" x2="74" y2="112.5" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="11" />
        <line x1="53" y1="128" x2="77" y2="97" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="10" />
        <line x1="80" y1="125.5" x2="80" y2="94.5" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="23" />
        <circle cx="80" cy="69" r="10.5" fill={background} />
        <polyline points="155 100 180 120 180 139" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="12" />
        <line x1="154" y1="154.5" x2="154" y2="99.5" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="12" />
        <line x1="181" y1="89" x2="156" y2="70" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="10" />
        <line x1="154" y1="97" x2="154" y2="63" fill="none" stroke={background} stroke-linecap="round"
          stroke-linejoin="round" stroke-width="23" />
        <circle cx="154" cy="38" r="10.5" fill={background} />
      </g>
    </svg>
  );
};

export default Stairs;
