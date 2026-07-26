import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const Men = ({
  foreground = colors.foreground,
  background = colors.background,
}: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
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
          d="M154,66h-52c-6.63,0-12,5.37-12,12v67s0,7,6,7,6-7,6-7v-52s0-3,2.5-3,2.5,3,2.5,3v133s0,8,9,8,9-8,9-8v-76s0-3,3-3,3,3,3,3v76s0,8,9,8,9-8,9-8V93s0-3,2.5-3,2.5,3,2.5,3v52s0,7,6,7,6-7,6-7v-67c0-6.63-5.37-12-12-12Z"
        />
        <circle fill={background} cx="128" cy="43.5" r="17.5" />
      </g>
    </svg>
  );
};

export default Men;
