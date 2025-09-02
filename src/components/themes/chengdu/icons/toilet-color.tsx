import colors from "../define/colors";

const ToiletColor = () => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <g id="b">
        <rect fill={colors.foreground} width="256" height="256" rx="40" ry="40" />
        <line
          fill="none"
          stroke={colors.background}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8px"
          x1="128"
          y1="232.5"
          x2="128"
          y2="45.5"
        />
        <path
          fill="#00ade9"
          d="M92,66h-52c-6.63,0-12,5.37-12,12v67s0,7,6,7,6-7,6-7v-52s0-3,2.5-3,2.5,3,2.5,3v133s0,8,9,8,9-8,9-8v-76s0-3,3-3,3,3,3,3v76s0,8,9,8,9-8,9-8V93s0-3,2.5-3,2.5,3,2.5,3v52s0,7,6,7,6-7,6-7v-67c0-6.63-5.37-12-12-12Z"
        />
        <circle fill="#00ade9" cx="66" cy="43.5" r="17.5" />
        <path
          fill="#D7A3AB"
          d="M237,139l-19-62s-3-11-13-11h-30c-10,0-13,11-13,11l-19,62s-2,6,4,8,8-5,8-5l15-52s1-3,3-2,1,4,1,4l-20.64,73.73c-.18.64.3,1.27.96,1.27h15.68v60s0,7,9,7,9-7,9-7v-60h4v60s0,7,9,7,9-7,9-7v-60h15.68c.66,0,1.14-.63.96-1.27l-20.64-73.73s-1-3,1-4,3,2,3,2l15,52s2,7,8,5,4-8,4-8Z"
        />
        <circle fill="#D7A3AB" cx="190" cy="43.5" r="17.5" />
      </g>
    </svg>
  );
};

export default ToiletColor;
