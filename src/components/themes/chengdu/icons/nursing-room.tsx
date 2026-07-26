import type { IconProps } from "../Icon";

const NursingRoom = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <g id="b">
        <rect width="256" height="256" rx="40" ry="40" fill={foreground} />
        <rect x="43" y="73" width="38" height="74" rx="3" ry="3" fill={background} />
        <path
          d="M78,66c-.5-3-3-4-3-4v-2c0-3,0-7-2-11s-6.5-7-6.5-7v-3c0-2-1.5-5-4.5-5s-4.5,3-4.5,5v3s-4.5,3-6.5,7-2,8-2,11v2s-2.5,1-3,4,.5,4,.5,4h31s1-1,.5-4Z"
          fill={background} />
        <line x1="42" y1="124" x2="51" y2="124" fill="none" stroke={foreground} stroke-miterlimit="10"
          stroke-width="2" />
        <line x1="42" y1="110" x2="52" y2="110" fill="none" stroke={foreground} stroke-miterlimit="10"
          stroke-width="2" />
        <line x1="42" y1="96" x2="51" y2="96" fill="none" stroke={foreground} stroke-miterlimit="10"
          stroke-width="2" />
        <path
          d="M200.41,153.79c.88.67,2.23.57,3.01-.2l6.17-6.17c.78-.78.79-2.07.04-2.87l-34.25-36.1c-.76-.8-2.28-1.45-3.38-1.45h-38c-1.1,0-2.62.65-3.38,1.45l-34.25,36.1c-.76.8-.74,2.09.04,2.87l6.17,6.17c.78.78,2.13.87,3.01.2l21.82-16.58c.88-.67,1.59-.31,1.59.79v20c0,1.1-.64,2.64-1.41,3.41l-21.17,21.17c-.78.78-.8,2.07-.04,2.87l33.25,35.1c.76.8,2.05.85,2.87.12l6.01-5.34c.82-.73,1.09-2.13.6-3.12l-11.21-22.42c-.49-.98-.3-2.46.43-3.28l13.34-15.01c.73-.82,1.93-.82,2.66,0l13.34,15.01c.73.82.93,2.3.43,3.28l-11.21,22.42c-.49.98-.22,2.39.6,3.12l6.01,5.34c.82.73,2.11.68,2.87-.12l33.25-35.1c.76-.8.74-2.09-.04-2.87l-21.17-21.17c-.78-.78-1.41-2.31-1.41-3.41v-20c0-1.1.72-1.46,1.59-.79l21.82,16.58Z"
          fill={background} />
        <circle cx="153" cy="81" r="23" fill={background} />
        <path
          d="M154,151h-25c-.55,0-1,.45-1,1v6c0,.55.33,1.31.72,1.69l18.55,17.62c.4.38,1.04.37,1.43-.02l3.59-3.59c.39-.39,1.03-.39,1.41,0l3.59,3.59c.39.39,1.03.4,1.43.02l18.55-17.62c.4-.38.72-1.14.72-1.69v-6c0-.55-.45-1-1-1h-23Z"
          fill={foreground} />
      </g>
    </svg>
  );
};

export default NursingRoom;
