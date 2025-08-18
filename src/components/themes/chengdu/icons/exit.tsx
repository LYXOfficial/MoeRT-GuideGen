const Exit: React.FC<
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
      <rect x="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
      <polygon
        points="128 30 28 30 28 163 61 163 61 153 51 153 51 54 128 54 205 54 205 153 195 153 195 163 228 163 228 30 128 30"
        fill={background}
      />
      <polygon
        points="141 150 141 90 128 90 115 90 115 150 83 115 83 152 128 204 173 152 173 115 141 150"
        fill={background}
      />
      <rect
        x="80"
        y="170.5"
        width="10"
        height="55"
        transform="translate(-83.01 63.08) rotate(-28)"
        fill={background}
      />
      <rect
        x="168"
        y="170.5"
        width="10"
        height="55"
        transform="translate(232.79 454.04) rotate(-152)"
        fill={background}
      />
    </svg>
  );
};

export default Exit;
