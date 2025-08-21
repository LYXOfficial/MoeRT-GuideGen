const Ticket: React.FC<
  React.SVGProps<SVGSVGElement> & {
    rotation?: number;
    background?: string;
    foreground?: string;
  }
> = ({
  rotation = 0,
  background = "#fff",
  foreground = "currentColor",
  style,
  ...props
}) => {
  const mergedStyle = {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: "center",
    ...(style as any),
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      style={mergedStyle}
      {...props}
    >
      <rect width="256" height="256" rx="40" ry="40" fill={foreground} />
      <path
        d="M35.28,34h185v97c0,8.28-6.72,15-15,15H50.28c-8.28,0-15-6.72-15-15V34h0Z"
        fill={background}
      />
      <rect
        x="43"
        y="69"
        width="170"
        height="66"
        rx="1"
        ry="1"
        fill={foreground}
      />
      <rect x="123" y="89" width="79" height="113" fill={background} />
      <circle cx="66" cy="200" r="34" fill={background} />
      <text
        fontFamily="sans-serif'"
        fontSize={54}
        fontWeight={700}
        transform="translate(39 221.21)"
        fill={foreground}
      >
        ￥
      </text>
    </svg>
  );
};

export default Ticket;
