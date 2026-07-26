import type { IconProps } from "../Icon";

const TicketMachine = ({ background, foreground, rotation }: IconProps) => {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" transform={`rotate(${rotation})`}>
      <g id="b">
        <rect width="256" height="256" rx="40" ry="40" fill={foreground} />
        <path d="M35.28,34h185v97c0,8.28-6.72,15-15,15H50.28c-8.28,0-15-6.72-15-15V34h0Z" fill={background} />
        <rect x="43" y="69" width="170" height="66" rx="1" ry="1" fill={foreground} />
        <rect x="123" y="89" width="79" height="113" fill={background} />
        <circle cx="66" cy="200" r="34" fill={background} />
        <text transform="translate(39 221.21)" fill={foreground}
          font-family="MicrosoftYaHei-Bold, &apos;Microsoft YaHei&apos;" font-size="54"
          font-weight="700">
          <tspan x="0" y="0">￥</tspan>
        </text>
      </g>
    </svg>
  );
};

export default TicketMachine;
