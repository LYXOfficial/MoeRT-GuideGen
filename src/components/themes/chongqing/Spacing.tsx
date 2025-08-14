export interface SpacingProps {
  background?: string;
}
export const spacingDefaultProps: SpacingProps = {
  background: "transparent",
};

export default function Spacing({
  background = spacingDefaultProps.background,
}: SpacingProps) {
  return (
    <div className="flex-1" style={{ backgroundColor: background }}></div>
  );
}
