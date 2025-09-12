import type { IconProps } from "../Icon";

const Exit1 = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <g id="b">
        <rect x="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
        <polygon
          points="128 226 28 226 28 93 61 93 61 103 51 103 51 202 128 202 205 202 205 103 195 103 195 93 228 93 228 226 128 226"
          fill={background} />
        <polygon
          points="141 106 141 166 128 166 115 166 115 106 83 141 83 104 128 52 173 104 173 141 141 106"
          fill={background} />
        <line x1="72" y1="82" x2="98" y2="34" fill="none" stroke={background} stroke-miterlimit="10"
          stroke-width="10" />
        <line x1="184" y1="82" x2="158" y2="34" fill="none" stroke={background} stroke-miterlimit="10"
          stroke-width="10" />
      </g>
    </svg>
  );
};

export default Exit1;
