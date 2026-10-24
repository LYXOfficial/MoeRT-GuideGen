import colors from "./define/colors";
import {
  TrainSolidGlyph,
  TrainOutlineGlyph,
  TrainFrameGlyph,
} from "./icons/train-real";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  commonSelectFormItem,
  foregroundFormItem,
  nullableColorFormItem,
} from "./Background";

/**
 * 乘车图标（经典样式车头标，visys.pdf 第 7 页「Classic Style」行 1–3）。
 *
 *  - solid：实心列车剪影（线路色方块 + 白色实心车的经典形态，cls@11–38）
 *  - outline：线稿列车（透明底变体，cls@10 车头-原色）
 *  - 方块为 1a 圆角方形（rx = 0.075a），坐在 1.4a 行里上下各留 0.2a
 *    （与经典线路牌同一模数，见 LineNum）
 *  - 图案颜色 = 前景色（列车剪影 / 线稿线条）；
 *    方块颜色、描边颜色为独立变量，均可留空（空 = 不画）：
 *    描边即 p7 第 1 格那种外框环（vitool --mode-cls 衬底描边）。
 */
export type ToTrainVariant = "solid" | "outline";

export const TO_TRAIN_VARIANTS: ToTrainVariant[] = ["solid", "outline"];

export interface ToTrainProps {
  variant?: ToTrainVariant;
  /** 图案颜色（列车剪影 / 线稿线条） */
  foreground?: string;
  /** 方块颜色；留空 = 无方块（透明） */
  plateColor?: string;
  /** 描边颜色（外框环）；留空 = 无描边 */
  strokeColor?: string;
  background?: string;
  background2?: string;
}

export const toTrainDefaultProps: ToTrainProps = {
  variant: "solid",
  foreground: colors.foreground,
  plateColor: colors.line1,
  strokeColor: "",
  background: colors.background,
  background2: colors.background,
};

export const toTrainEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijingOld.components.ToTrain.props";
  return {
    forms: [
      commonSelectFormItem(t, scope, "variant", "toTrainVariant", TO_TRAIN_VARIANTS),
      foregroundFormItem(scope),
      nullableColorFormItem(t, scope, "plateColor"),
      nullableColorFormItem(t, scope, "strokeColor"),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
/** 方牌 1a（官方示例图：行 = 1.5a，方形模块 = 1a，与经典线路牌同模数） */
const PLATE = ROW_H / 1.5;
/** 圆角半径 0.075a（p7 底板实测 rx 4.25 / 56.6） */
const RADIUS = PLATE * (4.25 / 56.6);
/** 列车 ink 占方牌比例（p7 实测：宽 40.8 / 56.6、高 46.7 / 56.6，水平垂直均居中） */
const TRAIN_W = PLATE * (40.8 / 56.6);
const TRAIN_H = PLATE * (46.7 / 56.6);

function ToTrain({
  variant = toTrainDefaultProps.variant,
  foreground = toTrainDefaultProps.foreground,
  plateColor = toTrainDefaultProps.plateColor,
  strokeColor = toTrainDefaultProps.strokeColor,
  background = toTrainDefaultProps.background,
  background2 = toTrainDefaultProps.background2,
}: ToTrainProps) {
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.background;
  const hasPlate = Boolean(plateColor && plateColor.length > 0);

  const x = (ROW_H - PLATE) / 2;
  const trainX = (ROW_H - TRAIN_W) / 2;
  const trainY = (ROW_H - TRAIN_H) / 2;
  const Train =
    variant === "outline" ? TrainOutlineGlyph : TrainSolidGlyph;

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      style={{ height: ROW_H, width: ROW_H }}
    >
      <svg width={ROW_H} height={ROW_H}>
        {hasPlate ? (
          <rect
            x={x}
            y={x}
            width={PLATE}
            height={PLATE}
            rx={RADIUS}
            fill={plateColor}
          />
        ) : null}
        <Train color={fg} width={TRAIN_W} height={TRAIN_H} x={trainX} y={trainY} />
        {strokeColor ? (
          <TrainFrameGlyph color={strokeColor} width={PLATE} height={PLATE} x={x} y={x} />
        ) : null}
      </svg>
    </MultiRowBackground>
  );
}

ToTrain.getEditorConfig = (t: (key: string) => string) =>
  toTrainEditorConfig(t);

export default ToTrain;
