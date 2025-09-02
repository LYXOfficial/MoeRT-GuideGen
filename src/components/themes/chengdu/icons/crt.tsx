import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const CRT = ({
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
          d="M126,94h-60.36c-2.31,0-4.51,1-6.03,2.74l-46.34,53.17c-4.79,5.5-.89,14.08,6.41,14.08h67.32v-37h-11l7-8h16.48c2.87,0,5.61-1.24,7.51-3.39l19.01-21.61ZM55,135h22v20H22l46-53h38l-7,8h-22l-22,25Z"
        />
        <path
          fill={background}
          d="M177,94h-37l-29,33h-15v37h30v-37h17.48c2.88,0,5.61-1.24,7.51-3.4l26.01-29.6Z"
        />
        <path
          fill={background}
          d="M244,94h-53l-61,70h37l32-37h11.48c2.88,0,5.61-1.24,7.51-3.4l26.01-29.6Z"
        />
      </g>
    </svg>
  );
};

export default CRT;
