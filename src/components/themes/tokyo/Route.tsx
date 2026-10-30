import { Input, InputNumber, Switch } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import { Background, backgroundFormItems } from "./Background";
import BadgeGlyph from "./define/BadgeGlyph";

/**
 * Route —— 上下叠放的两枚「自家带数字线路标」+ 中间小箭头，
 * 装在一块白色圆角小板上（例：東葉高速線牌上的 T03 ↓ T23）。
 *
 * 只支持本家（東京メトロ）带数字的站号徽章，别家线路标不做。
 */
export interface RouteProps {
  topLetter: string;
  topNumber: string;
  topColor?: string;
  bottomLetter: string;
  bottomNumber: string;
  bottomColor?: string;
  /** 中间小箭头，关掉就只剩两枚徽章 */
  showArrow?: boolean;
  /** 徽章直径（px） */
  badgeSize?: number;
  /** 箭头高（px） */
  arrowSize?: number;
  /** 板子底色 */
  plateColor?: string;
  radius?: number;
  paddingX?: number;
  paddingY?: number;
  foreground?: string;
  background?: string;
}

export const routeDefaultProps: RouteProps = {
  topLetter: "T",
  topNumber: "03",
  topColor: colors.lineT,
  bottomLetter: "T",
  bottomNumber: "23",
  bottomColor: colors.lineT,
  showArrow: true,
  badgeSize: 20,
  arrowSize: 7,
  plateColor: "#ffffff",
  radius: 4,
  paddingX: 4,
  paddingY: 3,
  foreground: "#1a1a1a",
  background: colors.background,
};

export const routeEditorConfig = (_t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "topLetter",
      label: "themes.tokyo-metro.components.Route.props.topLetter",
      element: <Input maxLength={3} />,
    },
    {
      key: "topNumber",
      label: "themes.tokyo-metro.components.Route.props.topNumber",
      element: <Input maxLength={2} />,
    },
    {
      key: "topColor",
      label: "themes.tokyo-metro.components.Route.props.topColor",
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "bottomLetter",
      label: "themes.tokyo-metro.components.Route.props.bottomLetter",
      element: <Input maxLength={3} />,
    },
    {
      key: "bottomNumber",
      label: "themes.tokyo-metro.components.Route.props.bottomNumber",
      element: <Input maxLength={2} />,
    },
    {
      key: "bottomColor",
      label: "themes.tokyo-metro.components.Route.props.bottomColor",
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "showArrow",
      label: "themes.tokyo-metro.components.Route.props.showArrow",
      element: <Switch size="small" />,
    },
    {
      key: "badgeSize",
      label: "themes.tokyo-metro.components.Route.props.badgeSize",
      element: <InputNumber min={10} max={40} />,
    },
    {
      key: "arrowSize",
      label: "themes.tokyo-metro.components.Route.props.arrowSize",
      element: <InputNumber min={0} max={20} />,
    },
    {
      key: "plateColor",
      label: "themes.tokyo-metro.components.Route.props.plateColor",
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "radius",
      label: "themes.tokyo-metro.components.Route.props.radius",
      element: <InputNumber min={0} max={24} />,
    },
    {
      key: "paddingX",
      label: "themes.tokyo-metro.components.Route.props.paddingX",
      element: <InputNumber min={0} max={24} />,
    },
    {
      key: "paddingY",
      label: "themes.tokyo-metro.components.Route.props.paddingY",
      element: <InputNumber min={0} max={24} />,
    },
    ...backgroundFormItems("themes.tokyo-metro.components.Route.props"),
  ],
});

/**
 * 两枚徽章之间的小箭头（朝下）。
 * 形状 = **三角头 + 矩形杆**拼成（现场就是这种实心箭头），
 * 不是「斜 45° 的方块 + 杆」那种折线箭头。
 */
function StackArrow({ size, color }: { size: number; color: string }) {
  const w = size;
  // 比宽度更矮：箭头太方会顶到上下两个徽章
  const h = size * 0.78;
  const headH = h * 0.6;
  const shaftW = w * 0.36;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      style={{ display: "block", margin: "1px 0" }}
    >
      <rect
        x={(w - shaftW) / 2}
        y={0}
        width={shaftW}
        height={h - headH + 0.5}
        fill={color}
      />
      <path
        d={`M ${w / 2} ${h} L 0 ${h - headH} L ${w} ${h - headH} Z`}
        fill={color}
      />
    </svg>
  );
}

function Route({
  topLetter = routeDefaultProps.topLetter,
  topNumber = routeDefaultProps.topNumber,
  topColor = routeDefaultProps.topColor,
  bottomLetter = routeDefaultProps.bottomLetter,
  bottomNumber = routeDefaultProps.bottomNumber,
  bottomColor = routeDefaultProps.bottomColor,
  showArrow = routeDefaultProps.showArrow,
  badgeSize = routeDefaultProps.badgeSize,
  arrowSize = routeDefaultProps.arrowSize,
  plateColor = routeDefaultProps.plateColor,
  radius = routeDefaultProps.radius,
  paddingX = routeDefaultProps.paddingX,
  paddingY = routeDefaultProps.paddingY,
  foreground = routeDefaultProps.foreground,
  background = routeDefaultProps.background,
}: RouteProps) {
  const badge = badgeSize ?? 20;
  const arrow = showArrow ? (arrowSize ?? 7) : 0;
  return (
    <Background
      background={background}
      className="flex h-16 items-center justify-center px-1"
    >
      <div
        style={{
          backgroundColor: plateColor,
          borderRadius: radius,
          padding: `${paddingY}px ${paddingX}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <BadgeGlyph
          size={badge}
          letter={topLetter}
          number={topNumber}
          color={topColor ?? colors.lineT}
          foreground={foreground}
        />
        {showArrow && arrow > 0 && (
          <StackArrow size={arrow} color={foreground ?? "#1a1a1a"} />
        )}
        <BadgeGlyph
          size={badge}
          letter={bottomLetter}
          number={bottomNumber}
          color={bottomColor ?? colors.lineT}
          foreground={foreground}
        />
      </div>
    </Background>
  );
}

Route.getEditorConfig = (t: (key: string) => string) => routeEditorConfig(t);

export default Route;
