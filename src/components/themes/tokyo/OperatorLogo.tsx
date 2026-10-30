import { InputNumber, Select, Switch } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Background, backgroundFormItems } from "./Background";
import MetroMark from "./icons/metro-mark";
import ToeiMark from "./icons/toei-mark";

/**
 * OperatorLogo —— 运营者标（出入口牌上的那两枚「小徽章」）。
 *
 * 两种：
 *  - `metro` 東京メトロ（蓝底 Heart M + 深蓝底「東京メトロ」一行，无英文）
 *  - `toei`  東京都交通局（绿底叶形符号 + 東京都交通局）
 * 高度可调（`height`），文字两行的字号也跟着高度走，避免出现「logo 很大字很小」。
 */
export type Operator = "metro" | "toei";

export interface OperatorLogoProps {
  operator?: Operator;
  /** 色块高度（px） */
  height?: number;
  /** 是否显示右侧文字两行 */
  showText?: boolean;
  /** 文字颜色（默认白色） */
  foreground?: string;
  background?: string;
}

export const operatorLogoDefaultProps: OperatorLogoProps = {
  operator: "metro",
  height: 40,
  showText: true,
  // 文案由 operator 决定：メトロ =「東京メトロ」一行，都営 =「都営地下鉄 / TOEI SUBWAY」两行。
  // 切换 operator 时组件内部会回退到对应官方写法（props 里显式给了就用 props）。
  foreground: "#ffffff",
  background: colors.background,
};

const SCOPE = "themes.tokyo-metro.components.OperatorLogo.props";

export const operatorLogoEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "operator",
      label: `${SCOPE}.operator.displayName`,
      element: (
        <Select>
          <Select.Option value="metro">
            {t(`${SCOPE}.operator.metro`)}
          </Select.Option>
          <Select.Option value="toei">
            {t(`${SCOPE}.operator.toei`)}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "height",
      label: `${SCOPE}.height`,
      element: <InputNumber min={16} max={64} />,
    },
    {
      key: "showText",
      label: `${SCOPE}.showText`,
      element: <Switch size="small" />,
    },
    ...backgroundFormItems(SCOPE),
  ],
});

function OperatorLogo({
  operator = "metro",
  height = 40,
  showText = true,
  background = operatorLogoDefaultProps.background,
}: OperatorLogoProps) {
  const isMetro = operator === "metro";
  const box = height;
  // 官方是两个小圆角方块：四角统一 2px，白描边 2px，各自四边都有
  const radius = 2;

  // 官方锁定组合：两个**等大**圆角方首尾相贴（无间隙），外面一圈 1px 白描边。
  // 左：亮蓝底 + 白色 Heart M（符号占 86%，不再留大边距）
  // 右：深蓝底 + 白色「東京メトロ」，**右块颜色永远是 #0b1f33，不跟随主题/前景色**
  if (isMetro) {
    // 「谁家就是什么字」：文案由 operator 决定；メトロ 的锁定组合只有「東京メトロ」一行（没有英文行）
    const text = "東京メトロ";
    // 两块都是 height×height 的正方形；五个字要塞进一个方格里，字号压到 0.17H
    const font = 7;
    return (
      <Background
        background={background}
        className="flex h-16 items-center justify-center px-1"
      >
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div
            style={{
              width: box,
              minWidth: box,
              height: box,
              borderRadius: radius,
              backgroundColor: "#00a3d9",
              border: "2px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <MetroMark size={Math.round(box * 0.94)} />
          </div>
          {showText && (
            <div
              style={{
                width: box,
                minWidth: box,
                height: box,
                padding: 0,
                borderRadius: radius,
                backgroundColor: "#0b1f33",
                border: "2px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  lineHeight: 1,
                  color: "#ffffff",
                }}
              >
                <span
                  style={{
                    fontFamily: fontFamilyZh,
                    fontWeight: 700,
                    fontSize: font,
                    whiteSpace: "nowrap",
                  }}
                >
                  {text}
                </span>
              </span>
            </div>
          )}
        </div>
      </Background>
    );
  }

  // 都営（照 浅草橋駅 门匾实拍）：一整块绿色牌，里面
  // [白色 T 符号] + 右侧两行白字「都営地下鉄 / TOEI SUBWAY」
  const inner = Math.round(box * 0.62);
  const ja = "都営地下鉄";
  const en = "TOEI SUBWAY";
  return (
    <Background
      background={background}
      className="flex h-16 items-center justify-center px-1"
    >
      <div
        style={{
          height: box,
          width: "auto",
          paddingLeft: Math.round(box * 0.08),
          paddingRight: Math.round(box * 0.1),
          backgroundColor: "#00a041",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: Math.round(box * 0.12),
          boxSizing: "border-box",
        }}
      >
        <ToeiMark size={inner} />
        {showText && (
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              style={{
                fontFamily: fontFamilyZh,
                fontWeight: 700,
                fontSize: Math.max(6, Math.round(box * 0.28)),
                whiteSpace: "nowrap",
              }}
            >
              {ja}
            </span>
            <span
              style={{
                fontFamily: fontFamilyEn,
                fontWeight: 700,
                fontSize: Math.max(5, Math.round(box * 0.16)),
                letterSpacing: "0.06em",
                marginTop: Math.round(box * 0.06),
                whiteSpace: "nowrap",
              }}
            >
              {en}
            </span>
          </div>
        )}
      </div>
    </Background>
  );
}

OperatorLogo.getEditorConfig = (t: (key: string) => string) =>
  operatorLogoEditorConfig(t);

export default OperatorLogo;
