import {
  fontEn,
  fontZh,
  measureText,
  useFontsReady,
} from "./define/text";
import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
  textFormItem,
} from "./Background";

/**
 * 环线方向文本（M3）：
 *   「下一站」与「Next Station」**分两行**（小一号），下面再跟中英站名。
 * 标准 §1.3.3：环线的乘车导向站名取「下一站」（非环线取终点站）。
 * 对齐可选，**默认靠左**。
 */
export interface LoopNextStationProps {
  nextZh?: string;
  nextEn?: string;
  stationZh?: string;
  stationEn?: string;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
  background2?: string;
}

export const loopNextStationDefaultProps: LoopNextStationProps = {
  nextZh: "下一站",
  nextEn: "Next Station",
  stationZh: "江浦路",
  stationEn: "Lijia",
  align: "left",
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

export const loopNextStationEditorConfig = (
  t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijing.components.LoopNextStation.props";
  return {
    forms: [
      textFormItem(scope, "nextZh"),
      textFormItem(scope, "nextEn"),
      textFormItem(scope, "stationZh"),
      textFormItem(scope, "stationEn"),
      {
        key: "align",
        label: `${scope}.align.displayName`,
        element: (
          <Select>
            <Select.Option value="left">
              {t("themes.beijing.common.align.left")}
            </Select.Option>
            <Select.Option value="center">
              {t("themes.beijing.common.align.center")}
            </Select.Option>
            <Select.Option value="right">
              {t("themes.beijing.common.align.right")}
            </Select.Option>
          </Select>
        ),
      },
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
/** 第一行小一号 */
/**
 * 版式按标准图实测（牌面 122×107 → 64px 行高）：
 *   下一站 ink 0.093H–0.252H（字号 12.2）／Next Station ink 0.318H–0.393H（cap → 字号 7.5）
 *   站名   ink 0.477H–0.710H（字号 17.7）／英文站名 ink 0.776H–0.925H（含下伸 → 字号 10.5）
 * 上下两块字重统一为标准字重（normal）。
 */
const NEXT_ZH_SIZE = 12.2;
const NEXT_EN_SIZE = 7.5;
const STATION_ZH_SIZE = 17.7;
const STATION_EN_SIZE = 10.5;
const NEXT_WEIGHT = 500;
/** 组件左右固定内边距 */
const PAD_X = 5;
/** 「下一站」英文的横向压缩比例 */
const NEXT_EN_SCALE_X = 0.9;
const STATION_WEIGHT = 500;

function LoopNextStation({
  nextZh = loopNextStationDefaultProps.nextZh,
  nextEn = loopNextStationDefaultProps.nextEn,
  stationZh = loopNextStationDefaultProps.stationZh,
  stationEn = loopNextStationDefaultProps.stationEn,
  align = loopNextStationDefaultProps.align,
  foreground = loopNextStationDefaultProps.foreground,
  background = loopNextStationDefaultProps.background,
  background2 = loopNextStationDefaultProps.background2,
}: LoopNextStationProps) {
  const fontsReady = useFontsReady();
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.background;

  const nZh = (nextZh ?? "").trim();
  const nEn = (nextEn ?? "").trim();
  const sZh = (stationZh ?? "").trim();
  const sEn = (stationEn ?? "").trim();

  const nextZhFont = fontZh(NEXT_WEIGHT, NEXT_ZH_SIZE);
  const nextEnFont = fontEn(NEXT_WEIGHT, NEXT_EN_SIZE);
  const stationZhFont = fontZh(STATION_WEIGHT, STATION_ZH_SIZE);
  const stationEnFont = fontEn(STATION_WEIGHT, STATION_EN_SIZE);

  const nextZhW = measureText(nZh, nextZhFont);
  const nextEnW = measureText(nEn, nextEnFont);
  const stationZhW = measureText(sZh, stationZhFont);
  const stationEnW = measureText(sEn, stationEnFont);

  // 左右各留固定 5px 内边距；宽度按实际渲染宽度取（小英文有 scaleX 压缩）
  const width =
    Math.ceil(
      Math.max(nextZhW, nextEnW * NEXT_EN_SCALE_X, stationZhW, stationEnW)
    ) +
    PAD_X * 2;
  const anchor =
    align === "center" ? "middle" : align === "right" ? "end" : "start";
  const lineX =
    align === "center" ? width / 2 : align === "right" ? width - PAD_X : PAD_X;

  // 小一号的第一行留出中英并排的空间，站名两行居中排布
  // 基线按标准图比例 × 64px 行高。
  // 标准图里「中文 ↔ 其英文」的墨迹间隙上下两块是一致的（0.066H ≈ 4.2px），
  // 所以英文基线 = 中文基线 + 间隙 + 英文 cap 高，而不是照抄 ink 区间端点
  // （照抄会得到上小下大的不等间隙）。
  const nextBaseline = 16.1; // 下一站 ink 底 0.252H
  const nextEnBaseline = nextBaseline + 4.2 + NEXT_EN_SIZE * 0.716; // ≈25.7
  const stationZhBaseline = 46.1; // 站名 ink 顶 0.477H + 0.88em
  const stationEnBaseline = stationZhBaseline + 4.2 + STATION_EN_SIZE * 0.716; // ≈57.8

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      style={{ height: ROW_H, width }}
    >
      <svg width={width} height={ROW_H} data-fonts-ready={fontsReady}>
        <text
          x={lineX}
          y={nextBaseline}
          fontSize={NEXT_ZH_SIZE}
          fontWeight={NEXT_WEIGHT}
          fill={fg}
          textAnchor={anchor}
        >
          {nZh}
        </text>
        {/* 小英文横向压缩 0.9：以当前对齐的基准边为原点缩放，
            左对齐不动左缘、右对齐不动右缘、居中不动中线，避免压缩后整体偏移 */}
        <g
          transform={`translate(${lineX} 0) scale(${NEXT_EN_SCALE_X} 1) translate(${-lineX} 0)`}
        >
          <text
            x={lineX}
            y={nextEnBaseline}
            fontSize={NEXT_EN_SIZE}
            fontWeight={NEXT_WEIGHT}
            fill={fg}
            textAnchor={anchor}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {nEn}
          </text>
        </g>
        <text
          x={lineX}
          y={stationZhBaseline}
          fontSize={STATION_ZH_SIZE}
          fontWeight={STATION_WEIGHT}
          fill={fg}
          textAnchor={anchor}
        >
          {sZh}
        </text>
        <text
          x={lineX}
          y={stationEnBaseline}
          fontSize={STATION_EN_SIZE}
          fontWeight={STATION_WEIGHT}
          fill={fg}
          textAnchor={anchor}
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {sEn}
        </text>
      </svg>
    </MultiRowBackground>
  );
}

LoopNextStation.getEditorConfig = (t: (key: string) => string) =>
  loopNextStationEditorConfig(t);

export default LoopNextStation;
