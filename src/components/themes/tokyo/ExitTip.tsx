import { Input } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import { fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import {
  Background,
  backgroundFormItems,
} from "./Background";

/**
 * ExitTip —— 出入口「门板编号」小牌。
 *
 * 不是出口号（ExitNum）：这是挂在牌面右上角/角落的**小方块**，
 * 深色圆角底 + 白色数字（浅草駅出入口牌右上角的「5」即此物）。
 * 实测（user 40×64 裁切）：小牌高 ≈ 0.22 行高、宽高比 ≈ 1.36:1、
 * 圆角 ≈ 0.18 牌高、数字 ink ≈ 0.78 牌高。
 */
export interface ExitTipProps {
  /** 门板编号（数字或字母数字） */
  text: string;
  /** 数字颜色 */
  textColor?: string;
  /** 小牌底色 */
  plate?: string;
  /** 外层底色（落板会被固化成板色，视觉上不露出） */
  background?: string;
}

export const exitTipDefaultProps: ExitTipProps = {
  text: "5",
  textColor: "#ffffff",
  plate: colors.exitnumbackground,
  background: colors.background,
};

export const exitTipEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "text",
      label: "themes.tokyo-metro.components.ExitTip.props.text",
      element: <Input />,
    },
    {
      key: "textColor",
      label: "themes.tokyo-metro.components.ExitTip.props.textColor",
      element: <CustomColorPicker currentTheme={5} />,
    },
    {
      key: "plate",
      label: "themes.tokyo-metro.components.ExitTip.props.plate",
      element: <CustomColorPicker currentTheme={5} />,
    },
    ...backgroundFormItems("themes.tokyo-metro.components.ExitTip.props"),
  ],
});

function ExitTip({
  text = exitTipDefaultProps.text,
  textColor = exitTipDefaultProps.textColor,
  plate = exitTipDefaultProps.plate,
  background = exitTipDefaultProps.background,
}: ExitTipProps) {
  return (
    <Background
      background={background}
      className="flex h-16 items-start justify-center px-1"
    >
      <div
        style={{
          backgroundColor: plate,
          color: textColor,
          fontFamily: fontFamilyZh,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: 1,
          padding: `2px 7px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 5,
        }}
      >
        {text}
      </div>
    </Background>
  );
}

ExitTip.getEditorConfig = (t: (key: string) => string) => exitTipEditorConfig(t);

export default ExitTip;
