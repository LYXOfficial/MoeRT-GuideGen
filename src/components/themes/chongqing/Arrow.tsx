import colors from "./define/colors";
import ArrowIcon from "./icons/arrow";

export interface ArrowProps {
  type:
    | "up"
    | "down"
    | "left"
    | "right"
    | "up-left"
    | "up-right"
    | "down-left"
    | "down-right";
  foreground?: string;
  background?: string;
}
export const arrowDefaultProps: ArrowProps = {
  type: "up",
  foreground: colors["foreground"],
  background: colors["background"],
};

export default function Arrow({
  type = arrowDefaultProps.type,
  foreground = arrowDefaultProps.foreground,
  background = arrowDefaultProps.background,
}: ArrowProps) {
  return (
    <div
      className="h-64px w-64px p-10px"
      style={{ backgroundColor: background, color: foreground }}
    >
      <ArrowIcon
        rotation={
          type === "up"
            ? 0
            : type === "down"
              ? 180
              : type === "left"
                ? 270
                : type === "right"
                  ? 90
                  : type === "up-left"
                    ? 315
                    : type === "up-right"
                      ? 45
                      : type === "down-left"
                        ? 225
                        : 135
        }
      />
    </div>
  );
}
