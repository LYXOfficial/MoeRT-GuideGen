import colors from "../define/colors";

interface IconProps {
  foreground?: string;
  background?: string;
}

const Elevator = ({
  foreground = colors.foreground,
  background = colors.background,
}: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 256">
        <defs>
            <filter id="d" x="84" y="102" width="66" height="71" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                <feColorMatrix result="cm" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"/>
                <feFlood floodColor={background} result="bg"/>
                <feBlend in="cm" in2="bg"/>
            </filter>
            <mask id="c" x="84" y="102" width="66" height="71" maskUnits="userSpaceOnUse">
                <g style={{ filter: 'url(#d)' }}>
                    <rect fill={background} x="100" y="102" width="50" height="50"/>
                </g>
            </mask>
        </defs>
        <g id="b">
            <rect fill={foreground} width="256" height="256" rx="40" ry="40"/>
            <line stroke={background} strokeWidth="28px" strokeMiterlimit={10} x1="36" y1="240" x2="36" y2="16" fill="none"/>
            <line stroke={background} strokeWidth="28px" strokeMiterlimit={10} x1="220" y1="240" x2="220" y2="16" fill="none"/>
            <rect fill="none" stroke={background} strokeLinejoin="round" strokeWidth="10px" x="67" y="63" width="122" height="128"/>
            <polygon fill={background} points="132.33 222 132.33 205 128 205 123.67 205 123.67 222 113 213.33 113 225.67 128 238 143 225.67 143 213.33 132.33 222"/>
            <g style={{ mask: 'url(#c)' }}>
                <circle fill="none" stroke={background} strokeWidth="6px" strokeMiterlimit={10} cx="115" cy="142" r="28"/>
            </g>
            <line fill="none" stroke={background} strokeLinejoin="round" strokeLinecap="round" strokeWidth="10px" x1="155" y1="155" x2="140" y2="130"/>
            <line fill="none" stroke={background} strokeLinejoin="round" strokeWidth="7px" x1="111" y1="113" x2="137" y2="113"/>
            <polyline fill="none" stroke={background} strokeLinejoin="round" strokeLinecap="round" strokeWidth="14px" points="110 102.78 111 130.78 138 130.78"/>
            <circle fill={background} cx="110" cy="85" r="8.5"/>
            <line fill="none" stroke={background} strokeLinecap="round" strokeMiterlimit={10} strokeWidth="11px" x1="164" y1="116" x2="164" y2="116"/>
            <line fill="none" stroke={background} strokeDasharray="0 16" strokeMiterlimit={10} strokeWidth="11px" x1="164" y1="100" x2="164" y2="92"/>
            <line fill="none" stroke={background} strokeLinecap="round" strokeMiterlimit={10} strokeWidth="11px" x1="164" y1="84" x2="164" y2="84"/>
        </g>
    </svg>
  );
};

export default Elevator;
