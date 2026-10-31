import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  BackgroundBox,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import { ROW_H } from "./define/layout";
import { UpArrowGlyph, TurnRightGlyph } from "./icons/arrow-real";

/**
 * 箭头（标准图 B.1 方向标识 / 图 54 出入口信息组合）。
 *
 * 只保留两个母版：
 *  - 直行箭头（B.1「往前（上）」）—— 8 个方向靠旋转
 *  - 右拐箭头（图 54 那条 90° 弯折箭头，母版是「上→右」）—— 8 种组合：
 *    四个拐角 × 箭头在两头（例如「左-上」= 尾巴朝左、头朝上；「上-左」= 尾巴朝上、头朝左）。
 *    后四种由母版镜像 + 旋转得到，不需要另画。
 */
export type ArrowShape = "straight" | "turn";
export type ArrowDirection =
  | "up"
  | "up-right"
  | "right"
  | "down-right"
  | "down"
  | "down-left"
  | "left"
  | "up-left";

/** 拐弯方向：先写尾巴朝向，再写箭头朝向 */
export type TurnPair =
  | "up-right"
  | "right-down"
  | "down-left"
  | "left-up"
  | "up-left"
  | "right-up"
  | "down-right"
  | "left-down";

export interface ArrowProps {
  shape?: ArrowShape;
  /** 直行箭头的方向（8 个） */
  direction?: ArrowDirection;
  /** 拐弯箭头（8 种组合） */
  turnDirection?: TurnPair;
  foreground?: string;
  background?: string;
}

export const arrowDefaultProps: ArrowProps = {
  shape: "straight",
  direction: "up",
  turnDirection: "up-right",
  foreground: colors.foreground,
  background: colors.background,
};

const STRAIGHT_ANGLE: Record<ArrowDirection, number> = {
  up: 0,
  "up-right": 45,
  right: 90,
  "down-right": 135,
  down: 180,
  "down-left": 225,
  left: 270,
  "up-left": 315,
};

/** 母版是「上→右」：rot 为顺时针角度，mirror 先左右镜像再旋转 */
const TURN_VARIANT: Record<
  TurnPair,
  { rot: number; mirror: boolean; tail: ArrowDirection; head: ArrowDirection }
> = {
  "up-right": { rot: 0, mirror: false, tail: "up", head: "right" },
  "right-down": { rot: 90, mirror: false, tail: "right", head: "down" },
  "down-left": { rot: 180, mirror: false, tail: "down", head: "left" },
  "left-up": { rot: 270, mirror: false, tail: "left", head: "up" },
  "up-left": { rot: 0, mirror: true, tail: "up", head: "left" },
  "right-up": { rot: 90, mirror: true, tail: "right", head: "up" },
  "down-right": { rot: 180, mirror: true, tail: "down", head: "right" },
  "left-down": { rot: 270, mirror: true, tail: "left", head: "down" },
};

const TURN_ORDER: TurnPair[] = [
  "up-right",
  "right-down",
  "down-left",
  "left-up",
  "up-left",
  "right-up",
  "down-right",
  "left-down",
];

const SCOPE = "themes.shanghai.components.Arrow.props";

/** 箭头方块边长锁死（用户要求：没必要开放调整） */
const ARROW_SIZE = 44;

export const arrowEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "shape",
      label: `${SCOPE}.shape.displayName`,
      element: (
        <Select>
          <Select.Option value="straight">
            {t("themes.shanghai.common.shape.straight")}
          </Select.Option>
          <Select.Option value="turn">
            {t("themes.shanghai.common.shape.turn")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "direction",
      label: `${SCOPE}.direction.displayName`,
      visible: props => props.shape !== "turn",
      element: (
        <Select>
          {(
            [
              "up",
              "up-right",
              "right",
              "down-right",
              "down",
              "down-left",
              "left",
              "up-left",
            ] as ArrowDirection[]
          ).map(value => (
            <Select.Option key={value} value={value}>
              {t(`themes.shanghai.common.direction.${value}`)}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "turnDirection",
      label: `${SCOPE}.turnDirection.displayName`,
      visible: props => props.shape === "turn",
      element: (
        <Select>
          {TURN_ORDER.map(value => {
            const v = TURN_VARIANT[value];
            return (
              <Select.Option key={value} value={value}>
                {`${t(`themes.shanghai.common.direction.${v.tail}`)}-${t(
                  `themes.shanghai.common.direction.${v.head}`
                )}`}
              </Select.Option>
            );
          })}
        </Select>
      ),
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
  ],
});

export default function Arrow({
  shape = arrowDefaultProps.shape,
  direction = arrowDefaultProps.direction,
  turnDirection = arrowDefaultProps.turnDirection,
  foreground = arrowDefaultProps.foreground,
  background = arrowDefaultProps.background,
}: ArrowProps) {
  const side = ARROW_SIZE;
  const dir = (direction ?? "up") as ArrowDirection;
  const isTurn = shape === "turn";
  const Glyph = isTurn ? TurnRightGlyph : UpArrowGlyph;
  const variant =
    TURN_VARIANT[(turnDirection ?? "up-right") as TurnPair] ??
    TURN_VARIANT["up-right"];
  const angle = isTurn
    ? variant.rot
    : (STRAIGHT_ANGLE[dir] ?? 0);
  // 先镜像再旋转：CSS 函数从右往左生效，所以 rotate 写在前面
  const parts: string[] = [];
  if (angle) parts.push(`rotate(${angle}deg)`);
  if (isTurn && variant.mirror) parts.push("scaleX(-1)");
  const transform = parts.length > 0 ? parts.join(" ") : undefined;

  return (
    <BackgroundBox
      background={background}
      style={{ height: ROW_H, width: side }}
    >
      <div
        style={{
          height: ROW_H,
          width: side,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: side, height: side, transform }}>
          <Glyph color={foreground ?? colors.foreground} />
        </div>
      </div>
    </BackgroundBox>
  );
}

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);
