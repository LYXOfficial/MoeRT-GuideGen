import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const WaitingRoom = ({
  foreground = colors.foreground,
  background = colors.background,
}: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <g id="b">
        <rect fill={foreground} width="256" height="256" rx="40" ry="40" />
        <circle
          stroke={background}
          strokeWidth="6px"
          strokeMiterlimit={10}
          fill={foreground}
          cx="53"
          cy="51"
          r="30"
        />
        <polyline
          fill="none"
          stroke={background}
          strokeWidth="4px"
          strokeLinejoin="round"
          points="53 29 53 51 38 43"
        />
        <polyline
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="12px"
          points="116.96 99 101 138 64 146"
        />
        <line
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="20px"
          x1="70.5"
          y1="165.5"
          x2="27.5"
          y2="204.5"
        />
        <polyline
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="23px"
          points="125 166.33 72 166.33 72 226.33"
        />
        <line
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth="36px"
          x1="125"
          y1="163"
          x2="125"
          y2="101"
        />
        <circle fill={background} cx="125" cy="60" r="17.5" />
        <polyline
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="23px"
          points="174.5 166.33 227.5 166.33 227.5 226.33"
        />
        <line
          fill="none"
          stroke={background}
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth="36px"
          x1="174.5"
          y1="163"
          x2="174.5"
          y2="101"
        />
        <circle fill={background} cx="174.5" cy="60" r="17.5" />
        <rect
          fill={foreground}
          x="80"
          y="177"
          width="141"
          height="61"
          rx="1"
          ry="1"
        />
      </g>
    </svg>
  );
};

export default WaitingRoom;
