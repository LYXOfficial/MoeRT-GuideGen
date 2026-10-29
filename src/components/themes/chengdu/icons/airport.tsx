import colors from "../define/colors";

interface IconProps {
  rotation?: number | string;
  foreground?: string;
  background?: string;
}

const Airport = ({
  foreground = colors.foreground,
  background = colors.background,
  rotation = 0,
}: IconProps) => {
  return (
    <svg
      id="a"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}
    >
      <g id="b">
        <rect fill={foreground} width="256" height="256" rx="40" ry="40" />
        {/* 实拍黑底黄牌剪影脚本提取（阈值分割 + 镜像对称 + potrace 描摹平滑）*/}
        <path d="M128,27 Q142.5,27 142.5,41.5 L142.5,92.5 L233.3,144.7 Q236,146 236,149 L236,163 Q236,166 233.1,165.2 L142.5,141.5 L142.5,196 L170.9,214.9 Q173,217 173,220 L173,224 Q173,227 170,226.6 L140,223 L128,218 L116,223 L86,226.6 Q83,227 83,224 L83,220 Q83,217 85.1,214.9 L113.5,196 L113.5,141.5 L22.9,165.2 Q20,166 20,163 L20,149 Q20,146 22.7,144.7 L113.5,92.5 L113.5,41.5 Q113.5,27 128,27 Z" fill={background} />
      </g>
    </svg>
  );
};

export default Airport;
