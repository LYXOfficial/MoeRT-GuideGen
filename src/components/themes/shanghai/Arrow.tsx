import { InputNumber, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import { ROW_H } from "./define/layout";
import { UpArrowGlyph, TurnRightGlyph } from "./icons/arrow-real";

/**
 * 箭头（标准图 B.1 方向标识 / 图 54 出入口信息组合）。
 *
 * 只保留两个母版：
 *  - 直行箭头（标准里的「往前（上）」）—— 8 个方向靠旋转
 *  - 右拐箭头（图 54 里「老沪闵路」那条弯折箭头）—— 4 个方向靠旋转
 * 图形本身由 `icons/arrow-real.tsx` 从原始图形精确提取（见 docs/shanghai/notes/arrow-report.md），
 * 不做手绘近似。
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

export interface ArrowProps {
  shape?: ArrowShape;
  direction?: ArrowDirection;
  /** 箭头独占的方块边长（px） */
  size?: number;
  foreground?: string;
  background?: string;
  background2?: string;
}

export const arrowDefaultProps: ArrowProps = {
  shape: "straight",
  direction: "up",
  size: 44,
  foreground: colors.foreground,
  background: colors.transparent,
  background2: colors.transparent,
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

const TURN_ANGLE: Record<ArrowDirection, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
  "up-right": 0,
  "down-right": 90,
  "down-left": 180,
  "up-left": 270,
};

const SCOPE = "themes.shanghai.components.Arrow.props";
const SIZE_MIN = 16;
const SIZE_MAX = 72;

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
      key: "size",
      label: `${SCOPE}.size`,
      element: <InputNumber step={1} min={SIZE_MIN} max={SIZE_MAX} />,
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
  ],
});

export default function Arrow({
  shape = arrowDefaultProps.shape,
  direction = arrowDefaultProps.direction,
  size = arrowDefaultProps.size,
  foreground = arrowDefaultProps.foreground,
  background = arrowDefaultProps.background,
  background2 = arrowDefaultProps.background2,
}: ArrowProps) {
  const side = Math.min(SIZE_MAX, Math.max(SIZE_MIN, Number(size) || 44));
  const dir = (direction ?? "up") as ArrowDirection;
  const isTurn = shape === "turn";
  const Glyph = isTurn ? TurnRightGlyph : UpArrowGlyph;
  // 直行箭头支持 8 个方向（斜向 = 45°），拐弯箭头只有 4 个（90°）
  const angle = isTurn
    ? (TURN_ANGLE[dir] ?? 0)
    : (STRAIGHT_ANGLE[dir] ?? 0);

  return (
    <MultiRowBackground
      background={background}
      background2={background2}
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
        <div
          style={{
            width: side,
            height: side,
            transform: angle ? `rotate(${angle}deg)` : undefined,
          }}
        >
          <Glyph color={foreground ?? colors.foreground} />
        </div>
      </div>
    </MultiRowBackground>
  );
}

Arrow.getEditorConfig = (t: (key: string) => string) => arrowEditorConfig(t);
