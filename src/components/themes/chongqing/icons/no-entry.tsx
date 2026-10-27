import type { IconProps } from "../Icon";

const NoEntry = ({ foreground, rotation }: IconProps) => {
  return (
    <svg id="b" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <g id="c">
        <path
          d="M128,25c56.79,0,103,46.21,103,103s-46.21,103-103,103S25,184.79,25,128,71.21,25,128,25M128,0C57.31,0,0,57.31,0,128s57.31,128,128,128,128-57.31,128-128S198.69,0,128,0h0Z"
          fill={foreground} />
        {/* 横杠（原来是对角线）：两端各伸进圆环内侧 10，和圆环融成一体，不留缝 */}
        <line x1="15" y1="128" x2="241" y2="128" fill="none" stroke={foreground} stroke-miterlimit="10"
          stroke-width="25" />
      </g>
    </svg>
  );
};

export default NoEntry;
