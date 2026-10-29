import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import { useEffect, useState } from "react";
import { normalizeSvgLine } from "../../../utils/svgText";
export interface ExitProps {
  letter: string;
  background?: string;
}
export const exitDefaultProps: ExitProps = {
  letter: "A",
  background: colors.transparent,
};
export const exitEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "letter",
      label: "themes.hongkong.components.Exit.props.letter",
      element: <Input maxLength={1} />,
    },
    {
      key: "background",
      label: "themes.hongkong.components.Exit.props.background",
      element: <CustomColorPicker currentTheme={2} />,
    },
  ],
});

// 字母墨迹的垂直居中基线要用渲染时的真实字体量出来（MTR 字体远程加载，
// 未就绪时会先按回退字体给一个基线，字体到了再量一次纠正）
const FONT_STACK = "'MTR Sung', 'Noto Serif TC', 'Noto Serif SC', serif, sans-serif";
const FONT_SIZE = 42;
// 蓝色方块：42×42，位于 (5, 11)，中心 (26, 32)
const LETTER_BOX = { cx: 26, cy: 32 };

function Exit({
  letter = exitDefaultProps.letter,
  background = exitDefaultProps.background,
}: ExitProps) {
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const letterText = normalizeSvgLine(letter);
  const [baseline, setBaseline] = useState(LETTER_BOX.cy + FONT_SIZE * 0.36);

  useEffect(() => {
    let mounted = true;
    const measure = () => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `${FONT_SIZE}px ${FONT_STACK}`;
      const m = ctx.measureText(letterText);
      const ascent = m.actualBoundingBoxAscent;
      const descent = m.actualBoundingBoxDescent;
      if (!Number.isFinite(ascent) || (!ascent && !descent)) return;
      // 墨迹区间 [baseline-ascent, baseline+descent]，中点对齐方块中心：
      // baseline = cy + (ascent - descent) / 2
      setBaseline(LETTER_BOX.cy + (ascent - descent) / 2);
    };
    measure();
    document.fonts?.ready?.then(() => {
      if (mounted) measure();
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [letterText]);

  return (
    <div style={{ background: background }}>
      <div className="h-16 w-13">
        <svg width={52} height={64}>
          <rect width={42} height={42} x={5} y={11} fill={colors.exitletter} />
          {/* textAnchor=middle 按字面宽度水平居中（任何字母都成立）；
             不要加 letterSpacing：单字符时它会被算进锚点长度，把字形推离中心 */}
          <text
            x={LETTER_BOX.cx}
            y={baseline}
            fontSize={FONT_SIZE}
            textAnchor="middle"
            fill={colors.foreground}
            xmlSpace="preserve">
            {letterText}
          </text>
        </svg>
      </div>
    </div>
  );
}

Exit.getEditorConfig = (t: (key: string) => string) => exitEditorConfig(t);

export default Exit;
