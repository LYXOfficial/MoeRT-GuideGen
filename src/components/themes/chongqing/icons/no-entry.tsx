import type { IconProps } from "../Icon";

const NoEntry = ({ foreground, rotation }: IconProps) => {
  return (
    <svg id="b" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <g id="c">
        <path
          d="M128,25c56.79,0,103,46.21,103,103s-46.21,103-103,103S25,184.79,25,128,71.21,25,128,25M128,0C57.31,0,0,57.31,0,128s57.31,128,128,128,128-57.31,128-128S198.69,0,128,0h0Z"
          fill={foreground} />
        <line x1="48" y1="208" x2="208" y2="48" fill="none" stroke={foreground} stroke-miterlimit="10"
          stroke-width="25" />
      </g>
    </svg>
  );
};

export default NoEntry;
