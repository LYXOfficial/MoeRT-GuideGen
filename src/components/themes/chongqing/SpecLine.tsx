import colors from "./define/colors";

export interface SpecLineProps {
  foreground?: string;
  background?: string;
}
export const SpecLineDefaultProps = {
  foreground: colors.specline,
  background: "transparent",
};

export default function SpecLine({
  background = SpecLineDefaultProps.background,
  foreground = SpecLineDefaultProps.foreground,
}: SpecLineProps) {
  return (
    <svg height={64} width={2} style={{ backgroundColor: background }}>
      <path d="M 0 10 L 2 10 L 2 54 L 0 54 Z" fill={foreground} />
    </svg>
  );
}
