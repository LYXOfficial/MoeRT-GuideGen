import { InputNumber, Select, Switch } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import {
  Background,
  THEME_INDEX,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import PICTOGRAMS from "./icons/pictograms";
import { frameOf } from "./icons/pictogram-frames";
import MetroMark from "./icons/metro-mark";
import ToeiMark from "./icons/toei-mark";

/**
 * Icon —— 设施图记。
 *
 * 图形全部来自官方《旅客施設用図記号ガイドライン 2025》的矢量页
 * （p12–p31 逐单元提取，见 `icons/pictograms.ts`，**不要手改坐标**）。
 *
 * 官方每个图记都画在一个**方形基准框**里（「ピクト基准框」：视距 40m→480mm 角、
 * 10m→120mm …，全是正方形）。基准框在现场牌面上就是那块**白牌**：白底 + 一圈细边，
 * 图记按官方比例摆在框内（并不都是居中，见 `icons/pictogram-frames.ts`）。
 *
 * 所以这里画的不是一个裸图形，而是「基准框 + 图形」：
 *   · `height` = 框的边长（px），图形按官方比例缩放；
 *   · `plateColor` = 框底色，`borderColor` / `borderWidth` = 框描边；
 *   · `showFrame` 打开才是「白牌 + 边框」；**默认关**（没显式值 = 不画框，老存档不被改版面）。
 * 图形本体用 `foreground` 上色。
 */
export interface IconProps {
  /** 图记 id（见 icons/pictograms.ts） */
  icon: string;
  /** 基准框（正方形白牌）边长 px —— 图形按官方比例落在框内 */
  height?: number;
  /** 图形颜色 */
  foreground?: string;
  /** 组件所在的整行底色（底板色） */
  background?: string;
  /** 基准框底色（默认白） */
  plateColor?: string;
  /** 基准框描边色 */
  borderColor?: string;
  /** 基准框描边宽度（px），0 = 不描边 */
  borderWidth?: number;
  /**
   * 是否画基准框（关掉只剩图形）。
   * **没有显式值 = 不画**：老存档 / 别人调好的版面不会被硬塞一块白牌进来，
   * 要框就在编辑器里打开开关。
   */
  showFrame?: boolean;
}

export const iconDefaultProps: IconProps = {
  icon: "p14-06",
  height: 52,
  foreground: colors.iconblue,
  background: colors.background,
  plateColor: "#ffffff",
  borderColor: colors.iconblue,
  borderWidth: 1.5,
  showFrame: true,
};

/** 官方基准框圆角 6.2pt / 边长 99.09pt = 6.25% */
const FRAME_RADIUS_RATIO = 0.0625;

const SCOPE = "themes.tokyo-metro.components.Icon.props";

/** 下拉里每一项前面画一个小预览（不然一百多个名字根本不知道长什么样） */
function OptionGlyph({ box, paths, kind }: { box: string; paths: string[]; kind?: string }) {
  if (kind === "operator-metro") return <MetroMark size={18} />;
  if (kind === "operator-toei") {
    return (
      <span
        style={{
          width: 18, height: 18, borderRadius: 3, backgroundColor: "#00a041",
          color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <ToeiMark size={14} />
      </span>
    );
  }
  return (
    <svg width={18} height={18} viewBox={box} aria-hidden style={{ flex: "none" }}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}

export const iconEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "icon",
      label: `${SCOPE}.icon`,
      element: (
        <Select style={{ width: "100%" }} dropdownMatchSelectWidth>
          {PICTOGRAMS.map(p => (
            <Select.Option key={p.id} value={p.id}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <OptionGlyph box={p.box} paths={p.paths} kind={p.kind} />
                <span>{t(`themes.tokyo-metro.pictograms.${p.id}`)}</span>
              </span>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "height",
      label: `${SCOPE}.height`,
      element: <InputNumber min={8} max={64} />,
    },
    {
      key: "showFrame",
      label: `${SCOPE}.showFrame`,
      element: <Switch size="small" />,
    },
    {
      key: "plateColor",
      label: `${SCOPE}.plateColor`,
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "borderColor",
      label: `${SCOPE}.borderColor`,
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "borderWidth",
      label: `${SCOPE}.borderWidth`,
      element: <InputNumber min={0} max={8} step={0.5} />,
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
  ],
});

function Icon({
  icon = iconDefaultProps.icon,
  height = iconDefaultProps.height,
  foreground = iconDefaultProps.foreground,
  background = iconDefaultProps.background,
  plateColor = iconDefaultProps.plateColor,
  borderColor = iconDefaultProps.borderColor,
  borderWidth = iconDefaultProps.borderWidth,
  showFrame = iconDefaultProps.showFrame,
}: IconProps) {
  const picto = PICTOGRAMS.find(p => p.id === icon) ?? PICTOGRAMS[0];
  // 彩色运营者标（東京メトロ / 都営）走专用渲染，不是单色路径；它们没有基准框
  if (picto.kind === "operator-metro" || picto.kind === "operator-toei") {
    const hh = height ?? 40;
    return (
      <Background
        background={background}
        className="flex h-16 items-center justify-center px-1"
        style={{ color: foreground }}
      >
        {picto.kind === "operator-metro" ? (
          <MetroMark size={hh} />
        ) : (
          <div
            style={{
              width: hh, height: hh, borderRadius: Math.round(hh * 0.14),
              backgroundColor: "#00a041", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ToeiMark size={Math.round(hh * 0.78)} />
          </div>
        )}
      </Background>
    );
  }

  // 基准框边长 = height；图形按官方「框内占比」摆放（见 pictogram-frames.ts）
  const side = Math.max(8, height ?? 52);
  const frame = frameOf(picto.id);
  const bw = Math.max(0, borderWidth ?? 0);
  const radius =
    frame.shape === "circle" ? side / 2 : frame.shape === "plain" ? 0 : side * FRAME_RADIUS_RATIO;

  return (
    <Background
      background={background}
      className="flex h-16 items-center justify-center px-1"
      style={{ color: foreground }}
    >
      <div
        style={{
          position: "relative",
          flex: "none",
          width: side,
          height: side,
          borderRadius: radius,
          backgroundColor: showFrame ? (plateColor ?? "#ffffff") : colors.transparent,
          // 描边用 inset 阴影画在框内侧：不占布局、跟着圆角裁，框尺寸不受线宽影响
          boxShadow:
            showFrame && bw > 0
              ? `inset 0 0 0 ${bw}px ${borderColor ?? colors.foreground3}`
              : undefined,
          overflow: "hidden",
        }}
      >
        <svg
          width={frame.w * side}
          height={frame.h * side}
          viewBox={picto.box}
          aria-hidden
          style={{
            position: "absolute",
            left: frame.x * side,
            top: frame.y * side,
            display: "block",
          }}
        >
          {picto.paths.map((d, i) => (
            <path key={i} d={d} fill="currentColor" />
          ))}
        </svg>
      </div>
    </Background>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
