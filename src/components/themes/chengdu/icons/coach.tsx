import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const Coach = ({
  foreground = colors.foreground,
  background = colors.background,
}: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <g id="b">
            <rect fill={foreground} width="256" height="256" rx="40" ry="40"/>
            <path fill={background} d="M230,157c0,.55-.45,1-1,1H27c-.55,0-1-.45-1-1v-67c0-6.63,5.37-12,12-12h180c6.63,0,12,5.37,12,12v67Z"/>
            <circle stroke={foreground} strokeMiterlimit={10} strokeWidth="4px" fill={background} cx="70" cy="158" r="21.5"/>
            <circle stroke={foreground} strokeMiterlimit={10} strokeWidth="4px" fill={background} cx="186" cy="158" r="21.5"/>
            <rect fill={foreground} x="36" y="89" width="40" height="28" rx="2" ry="2"/>
            <rect fill={foreground} x="84" y="89" width="40" height="28" rx="2" ry="2"/>
            <rect fill={foreground} x="132" y="89" width="40" height="28" rx="2" ry="2"/>
            <rect fill={foreground} x="180" y="89" width="40" height="28" rx="2" ry="2"/>
            <rect fill={foreground} x="100" y="121" width="56" height="33" rx="1.5" ry="1.5"/>
            <path stroke={background} strokeLinejoin="round" strokeWidth="2px" fill="none" d="M123,130v-6s2-.5,5-.5,5,.5,5,.5v6"/>
            <rect fill={background} x="110" y="127.5" width="36" height="25" rx="4" ry="4"/>
        </g>
    </svg>
  );
};

export default Coach;
