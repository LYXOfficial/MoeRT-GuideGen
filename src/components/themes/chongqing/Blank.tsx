export interface BlankProps {
  background?: string;
  width?: number;
}
export const spacingDefaultProps: BlankProps = {
  background: "transparent",
  width: 20,
};

export default function Blank({
  background = spacingDefaultProps.background,
  width = spacingDefaultProps.width,
}: BlankProps) {
  return <div style={{ backgroundColor: background, width: width }}></div>;
}
