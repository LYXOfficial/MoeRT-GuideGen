import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const Women = ({
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
          d="M175,139l-19-62s-3-11-13-11h-30c-10,0-13,11-13,11l-19,62s-2,6,4,8,8-5,8-5l15-52s1-3,3-2,1,4,1,4l-20.64,73.73c-.18.64.3,1.27.96,1.27h15.68v60s0,7,9,7,9-7,9-7v-60h4v60s0,7,9,7,9-7,9-7v-60h15.68c.66,0,1.14-.63.96-1.27l-20.64-73.73s-1-3,1-4,3,2,3,2l15,52s2,7,8,5,4-8,4-8Z"
        />
        <circle fill={background} cx="128" cy="43.5" r="17.5" />
      </g>
    </svg>
  );
};

export default Women;
