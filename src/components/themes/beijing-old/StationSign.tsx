import { Switch } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import { fontEn, fontZh, measureText, useFontsReady } from "./define/text";
import { MetroAGlyph } from "../beijing/icons/city-real";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
  textFormItem,
} from "./Background";

/**
 * 站名（门匾，官方 DB11/T 657.2—2024 图 3 / 图 4）：
 * 北京地铁地徽 + 居中的车站名称（字号比导向标志小一档）+ 名称下方的小字拼音。
 *
 *  - 地徽取 visys.pdf 第 1 页的城市特殊图形矢量（与新版 Icon 的 metro_a 同源），
 *    显示开关可控；地徽高 ≈ 0.6a
 *  - 站名中文 ink ≈ 0.32H、拼音 cap ≈ 0.10H，两行在名称列内居中
 *  - 右侧线路牌用「线路标」组件横向拼接（图 3 / 图 4 的组合用法）
 */
export interface StationSignProps {
  nameZh?: string;
  nameEn?: string;
  /** 是否显示北京地铁地徽 */
  showLogo?: boolean;
  foreground?: string;
  background?: string;
  background2?: string;
}

export const stationSignDefaultProps: StationSignProps = {
  nameZh: "平安里站",
  nameEn: "Ping'anli",
  showLogo: true,
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

export const stationSignEditorConfig = (
  _t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijingOld.components.StationSign.props";
  return {
    forms: [
      textFormItem(scope, "nameZh"),
      textFormItem(scope, "nameEn"),
      { key: "showLogo", label: `${scope}.showLogo`, element: <Switch /> },
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
const A = ROW_H / 1.5;
/** 地徽高 1a（方形模块满高，官方图 3 地徽与线路牌同高） */
const LOGO_SIZE = A;
const LOGO_GAP = A * 0.2;
/** 站名中文 ink 0.32H、拼音 cap 0.12H */
const ZH_SIZE = (ROW_H * 0.32) / 0.88;
const EN_SIZE = (ROW_H * 0.12) / 0.716;
const NAME_GAP_Y = 5;
const PAD_X = 5;

function StationSign({
  nameZh = stationSignDefaultProps.nameZh,
  nameEn = stationSignDefaultProps.nameEn,
  showLogo = stationSignDefaultProps.showLogo,
  foreground = stationSignDefaultProps.foreground,
  background = stationSignDefaultProps.background,
  background2 = stationSignDefaultProps.background2,
}: StationSignProps) {
  const fontsReady = useFontsReady();
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.background;

  const zhText = (nameZh ?? "").trim();
  const enText = (nameEn ?? "").trim();
  const zhFont = fontZh(700, ZH_SIZE);
  const enFont = fontEn(700, EN_SIZE);
  const zhWidth = zhText ? measureText(zhText, zhFont) : 0;
  const enWidth = enText ? measureText(enText, enFont) : 0;

  const nameWidth = Math.max(zhWidth, enWidth, 1);
  const logoW = showLogo ? LOGO_SIZE + LOGO_GAP : 0;
  const width = Math.ceil(PAD_X + logoW + nameWidth + PAD_X);

  // 名称列两行整体垂直居中
  const ZH_INK = ZH_SIZE * 0.88;
  const EN_CAP = EN_SIZE * 0.716;
  const colH = enText ? ZH_INK + NAME_GAP_Y + EN_CAP : ZH_INK;
  const colTop = (ROW_H - colH) / 2;
  const zhX = PAD_X + logoW + (nameWidth - zhWidth) / 2;
  const enX = PAD_X + logoW + (nameWidth - enWidth) / 2;

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      style={{ height: ROW_H, width }}
    >
      <svg width={width} height={ROW_H} data-fonts-ready={fontsReady}>
        {showLogo ? (
          <MetroAGlyph
            color={fg}
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            x={PAD_X}
            y={(ROW_H - LOGO_SIZE) / 2}
          />
        ) : null}
        {zhText ? (
          <text
            x={zhX}
            y={colTop + ZH_INK}
            fontSize={ZH_SIZE}
            fontWeight={700}
            fill={fg}
          >
            {zhText}
          </text>
        ) : null}
        {enText ? (
          <text
            x={enX}
            y={colTop + colH}
            fontSize={EN_SIZE}
            fontWeight={700}
            fill={fg}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {enText}
          </text>
        ) : null}
      </svg>
    </MultiRowBackground>
  );
}

StationSign.getEditorConfig = (t: (key: string) => string) =>
  stationSignEditorConfig(t);

export default StationSign;
