const Checkin: React.FC<
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
      id="a"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      style={mergedStyle}
      {...props}
    >
      <defs>
        <style>{`
          .c {
            stroke: ${foreground};
            stroke-width: 12px;
          }

          .c,
          .d {
            fill: none;
            stroke-miterlimit: 10;
          }

          .e {
            fill: ${foreground};
          }

          .d {
            stroke: ${background};
            stroke-width: 6px;
          }

          .f {
            fill: ${background};
          }
        `}</style>
      </defs>
      <g id="b">
        <rect className="e" y="0" width="256" height="256" rx="40" ry="40" />
        <path
          className="f"
          d="M197,34h39v185h-39c-11.05,0-20-8.95-20-20V54c0-11.05,8.95-20,20-20Z"
        />
        <path
          className="e"
          d="M220,132h-49v-11h49c3,.14,5.36,2.67,5.3,5.61-.06,2.86-2.38,5.25-5.3,5.39Z"
        />
        <polygon
          className="e"
          points="195 137 118 137 145 105 222 105 195 137"
        />
        <polygon
          className="c"
          points="195 137 118 137 145 105 222 105 195 137"
        />
        <polygon
          className="d"
          points="195 137 118 137 145 105 222 105 195 137"
        />
        <rect className="f" x="177" y="96" width="59" height="25" />
        <path
          className="f"
          d="M106.07,123.74c7.48-.43,16.74-.14,25.44,2,13.93,3.43,27.32.93,28.04-5.96.71-6.89-7.96-8.81-12.78-9.81-4.82-1-28.74-5.78-38.15-9.7-9.41-3.93-19.63-12.59-30.59-18.81s-19.81-4.89-31.81-12c-12-7.11-17.67-15.85-17.67-15.85v63.96s31,25.44,42.11,37.44c11.11,12,24.11,18.69,47.33,18.69,11.67-.52,14.9-2.41,20-6.08,5.11-3.67,19.86-20.61,20-24.94.13-4.33-1.22-8-12.33-8.33-7.98-.24-13.78,11.33-17.67,13s-5.22,1.78-10,2.39-11.11-1.61-15.67-6.33-6.26-8.59-5.04-12.87c1.22-4.28,4.29-6.52,8.78-6.78Z"
        />
        <line className="c" x1="160" y1="137" x2="131" y2="137" />
        <line className="d" x1="160" y1="137" x2="131" y2="137" />
        <line className="d" x1="162" y1="137" x2="129" y2="137" />
      </g>
    </svg>
  );
};

export default Checkin;
