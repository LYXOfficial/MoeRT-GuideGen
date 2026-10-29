import colors from "./define/colors";
import { TrainSolidGlyph, TrainFrameGlyph } from "./icons/train-real";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  Background,
  backgroundFormItems,
  foregroundFormItem,
  nullableColorFormItem,
} from "./Background";

/**
 * 乘车图标（经典样式车头标，visys.pdf 第 7 页「Classic Style」行 1–3）。
 *
 * 实心列车剪影一种形态；方块颜色 / 描边颜色为独立变量，均可留空（空 = 不画），
 * 线稿观感 = 方块留空 + 前景/描边自由搭配，无需单独的形态选项。
 * 方块为 1a 圆角方形（rx = 0.075a），坐在 1.5a 行里（与经典线路牌同一模数）。
 */
export interface ToTrainProps {
  /** 图案颜色（列车剪影） */
  foreground?: string;
  /** 方块颜色；留空 = 无方块（透明） */
  plateColor?: string;
  /** 描边颜色（外框环）；留空 = 无描边 */
  strokeColor?: string;
  background?: string;
}

export const toTrainDefaultProps: ToTrainProps = {
  foreground: colors.foreground,
  plateColor: colors.line1,
  strokeColor: "",
  background: colors.transparent,
};

export const toTrainEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijingOld.components.ToTrain.props";
  return {
    forms: [
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
  foreground = toTrainDefaultProps.foreground,
  plateColor = toTrainDefaultProps.plateColor,
  strokeColor = toTrainDefaultProps.strokeColor,
  background = toTrainDefaultProps.background,
}: ToTrainProps) {
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.transparent;
  const hasPlate = Boolean(plateColor && plateColor.length > 0);

  const x = (ROW_H - PLATE) / 2;
  const trainX = (ROW_H - TRAIN_W) / 2;
  const trainY = (ROW_H - TRAIN_H) / 2;

  return (
    <Background
      background={bg}
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
        <TrainSolidGlyph color={fg} width={TRAIN_W} height={TRAIN_H} x={trainX} y={trainY} />
        {strokeColor ? (
          <TrainFrameGlyph color={strokeColor} width={PLATE} height={PLATE} x={x} y={x} />
        ) : null}
      </svg>
    </Background>
  );
}

ToTrain.getEditorConfig = (t: (key: string) => string) =>
  toTrainEditorConfig(t);

export default ToTrain;
