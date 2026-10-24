import { Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import { ExitClassicGlyph } from "./icons/exit-real";
import type { EditorConfig } from "../../../interfaces/editor";
import { MultiRowBackground, backgroundFormItems } from "./Background";

/**
 * 出口图标（经典样式）：方形出口牌。
 *
 * 图形取自 visys.pdf 第 7 页「Classic Style」行 9 的矢量图层：
 * 直角方形绿底（1.4a × 1.4a，占满行）+ 白色「出」字 + 「EXIT」。
 * 图形自带底板与内容色（素材原色，固定）；background / background2 只作为
 * 「组件自身的两行背景」（有边距时才会露出来）。
 */
export interface ExitIconProps {
  /** none = 图形贴满 64px 行；inset = 四周留 6px */
  padding?: "none" | "inset";
  /** 底板色 */
  background?: string;
  background2?: string;
}

export const exitIconDefaultProps: ExitIconProps = {
  padding: "none",
  background: colors.background,
  background2: colors.background,
};

export const exitIconEditorConfig = (
  t: (key: string) => string
): EditorConfig => {
  const scope = "themes.beijingOld.components.ExitIcon.props";
  return {
    forms: [
      {
        key: "padding",
        label: `${scope}.padding.displayName`,
        element: (
          <Select>
            <Select.Option value="none">
              {t("themes.beijingOld.common.padding.none")}
            </Select.Option>
            <Select.Option value="inset">
              {t("themes.beijingOld.common.padding.inset")}
            </Select.Option>
          </Select>
        ),
      },
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
/** 有边距时四周留白：上下 6px，左右 5px（与新版口径一致） */
const INSET = 6;
const INSET_X = 5;
/** 方形出口牌宽高比 1:1 */
const ASPECT = 1;

function ExitIcon({
  padding = exitIconDefaultProps.padding,
  background = exitIconDefaultProps.background,
  background2 = exitIconDefaultProps.background2,
}: ExitIconProps) {
  const isInset = padding === "inset";
  // 组件盒固定 64 高、背景两行始终铺满整盒；
  // 图形按 padding 决定大小：none = 铺满整盒；inset = 四周留白。
  const boxH = ROW_H;
  const iconH = ROW_H - (isInset ? INSET * 2 : 0);
  const iconW = Math.round(iconH * ASPECT);
  const boxW = iconW + (isInset ? INSET_X * 2 : 0);

  return (
    <MultiRowBackground
      background={background}
      background2={background2}
      style={{ height: boxH, width: boxW }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div style={{ width: iconW, height: iconH }}>
          {/* 图形用素材原色（固定），背景色只作用于组件自身的两行背景 */}
          <ExitClassicGlyph color={colors.white} ground={colors.exit} />
        </div>
      </div>
    </MultiRowBackground>
  );
}

ExitIcon.getEditorConfig = (t: (key: string) => string) =>
  exitIconEditorConfig(t);

export default ExitIcon;
