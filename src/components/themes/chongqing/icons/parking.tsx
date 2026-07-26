import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const Parking = ({
  foreground = colors.foreground,
  background = colors.background,
}: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <g id="b">
        <rect
          fill={foreground}
          y="0"
          width="256"
          height="256"
          rx="40"
          ry="40"
        />
        <text
          fill={background}
          style={{
            fontFamily: "sans-serif",
            fontSize: "165px",
            fontWeight: 700,
          }}
          transform="translate(73.78 221.39)"
        >
          <tspan x="0" y="0">
            P
          </tspan>
        </text>
        <polyline
          fill="none"
          stroke={background}
          strokeLinejoin="round"
          strokeWidth="16px"
          points="27 87 128 49 229 87"
        />
      </g>
    </svg>
  );
};

export default Parking;
