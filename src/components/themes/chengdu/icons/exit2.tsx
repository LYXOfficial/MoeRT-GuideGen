import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const Exit2 = ({
  foreground = colors.exitforeground,
  background = colors.exitbackground,
}: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <g id="b">
            <rect fill={foreground} width="256" height="256" rx="40" ry="40"/>
            <polygon fill={background} points="140 69 140 159 128 159 116 159 116 69 85 102 85 68 128 21 171 68 171 102 140 69"/>
            <polygon fill={background} points="193 99 193 114 202 114 202 204 128 204 54 204 54 114 63 114 63 99 28 99 28 231 128 231 228 231 228 99 193 99"/>
        </g>
    </svg>
  );
};

export default Exit2;
