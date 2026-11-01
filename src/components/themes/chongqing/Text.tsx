import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, InputNumber, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import { normalizeSvgLine } from "../../../utils/svgText";

export interface TextProps {
  chinese: string;
  english: string;
  /** 横向对齐 */
  align?: "left" | "center" | "right";
  /** 纵向对齐：贴顶 / 居中 / 贴底（相对 64px 行） */
  alignV?: "top" | "center" | "bottom";
  /** 数字行为：prominent = 数字放大用 Frutiger；flat = 数字与文字同大，用 Helvetica */
  digitMode?: "prominent" | "flat";
  /** 中文字号（px） */
  fontSizeZh?: number;
  /** 英文字号（px） */
  fontSizeEn?: number;
  /** 中英行距：中英两行基线之间的距离（px） */
  lineGap?: number;
  /** 整体上下偏移（px，正数向上） */
  offsetY?: number;
  foreground?: string;
  background?: string;
}
export const textDefaultProps: TextProps = {
  align: "left",
  alignV: "center",
  chinese: "乘车",
  english: "Train",
  digitMode: "flat",
  fontSizeZh: 22,
  fontSizeEn: 14,
  lineGap: 16,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.background,
};

export const textEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.chongqing.components.Text.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chongqing.components.Text.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chongqing.components.Text.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chongqing.components.Text.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.chongqing.components.Text.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chongqing.components.Text.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "alignV",
      label: "themes.chongqing.components.Text.props.alignV.displayName",
      element: (
        <Select>
          <Select.Option value="top">
            {t("themes.chongqing.components.Text.props.alignV.top")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.chongqing.components.Text.props.alignV.center")}
          </Select.Option>
          <Select.Option value="bottom">
            {t("themes.chongqing.components.Text.props.alignV.bottom")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "digitMode",
      label: "themes.chongqing.components.Text.props.digitMode.displayName",
      element: (
        <Select>
          <Select.Option value="prominent">
            {t("themes.chongqing.components.Text.props.digitMode.prominent")}
          </Select.Option>
          <Select.Option value="flat">
            {t("themes.chongqing.components.Text.props.digitMode.flat")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "fontSizeZh",
      label: "themes.chongqing.components.Text.props.fontSizeZh",
      element: <InputNumber step={1} min={8} max={64} />,
    },
    {
      key: "fontSizeEn",
      label: "themes.chongqing.components.Text.props.fontSizeEn",
      element: <InputNumber step={1} min={6} max={48} />,
    },
    {
      key: "lineGap",
      label: "themes.chongqing.components.Text.props.lineGap",
      element: <InputNumber step={1} min={0} max={48} />,
    },
    {
      key: "offsetY",
      label: "themes.chongqing.components.Text.props.offsetY",
      element: <InputNumber step={1} min={-32} max={32} />,
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.Text.props.foreground",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.Text.props.background",
      element: <CustomColorPicker currentTheme={0} />,
    },
  ],
});

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  alignV = textDefaultProps.alignV,
  digitMode = "flat",
  fontSizeZh = textDefaultProps.fontSizeZh,
  fontSizeEn = textDefaultProps.fontSizeEn,
  lineGap = textDefaultProps.lineGap,
  offsetY = textDefaultProps.offsetY,
  foreground = textDefaultProps.foreground ?? colors.foreground,
  background = textDefaultProps.background ?? colors.background,
}: TextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  // 供 JSX 内嵌闭包安全使用
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const chineseText = normalizeSvgLine(chinese ?? textDefaultProps.chinese);
  const englishText = normalizeSvgLine(english);
  // 字号/行距/偏移：非法值兜底到默认（字号钳在合理区间，避免 0 号或离谱大号把行撑坏）
  /** 贴顶 / 贴底时与行上下边留的余量（跟左右 ml-1.25 的 5px 对齐） */
const V_PAD = 5;

const clampNum = (v: unknown, min: number, max: number, fallback: number) => {
    const n = Number(v);
    return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fallback));
  };
  const zhSize = clampNum(fontSizeZh, 8, 64, 22);
  const enSize = clampNum(fontSizeEn, 6, 48, 14);
  const gap = clampNum(lineGap, 0, 48, 16);
  // 纵向对齐（相对 64px 行）：以「居中」为基准（中文基线 32，跟改动前一模一样），
  // 贴顶 = 把整块墨迹推到行顶，贴底 = 推到行底；两头都留 V_PAD 的余量，别真的贴边。
  // 墨迹高：中文 ink ≈ 0.88em（坐在基线上）+ 行距 + 英文下伸部 ≈ 0.25em。
  const zhInkH = zhSize * 0.88;
  const enDescH = enSize * 0.25;
  const vAlignDelta =
    alignV === "top"
      ? V_PAD - (32 - zhInkH)
      : alignV === "bottom"
        ? 64 - V_PAD - (32 + gap + enDescH)
        : 0;
  // 上下偏移：正数向上（和编辑器里的 ↑ 一致），两行一起动；与纵向对齐叠加
  const dy = -(Number(offsetY) || 0) + vAlignDelta;
  // 中文基线：默认 32（居中），英文 = 中文基线 + 行距（默认 16 → 48，与改动前一致）
  const zhY = 32 + dy;
  const enY = zhY + gap;
  // 突出显示的数字跟着中文字号等比放大（默认 22 → 30）
  const prominentSize = Math.round(((zhSize * 30) / 22) * 10) / 10;

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        setSvgWidth(bbox.width);
      }
    };

    (async () => {
      await document.fonts.ready; // 等字体加载完成
      if (mounted) measure();
    })();

    return () => {
      mounted = false;
    };
  }, [chineseText, englishText, zhSize, enSize, gap, dy]);

  // 汉字里的数字分段出来。digitMode = "prominent"（突出）时数字放大
  // （fontSize 30、Frutiger）+ dy 偏移；"flat"（持平）时数字与文字同大同基线，
  // 字体改用 Helvetica 而不是主题的 Frutiger。dy 会累积，因此逐段维护偏移。
  const DIGIT_DY = 1; // 数字基线相对普通文字的偏移（与 LineText 一致）
  const chineseSegs = (() => {
    let offset = 0;
    return chineseText
      .split(/(\d+)/)
      .filter(Boolean)
      .map(seg => {
        const isDigit = /^\d+$/.test(seg);
        const prominent = isDigit && digitMode === "prominent";
        const desired = prominent ? DIGIT_DY : 0;
        const dy = desired - offset;
        offset = desired;
        return { seg, isDigit, prominent, dy };
      });
  })();

  // 对齐时的起始 x 坐标
  let groupX = 0;
  if (align === "center") groupX = svgWidth / 2;
  if (align === "right") groupX = svgWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-1.25 mr-1.25" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g
            ref={textGroupRef}
            transform={`translate(${groupX}, 0)`}
            textAnchor={
              align === "center"
                ? "middle"
                : align === "right"
                  ? "end"
                  : "start"
            }
          >
            <text x={0} y={zhY} fontSize={zhSize} fill={foreground} xmlSpace="preserve">
              {chineseSegs.map((seg, idx) =>
                seg.prominent ? (
                  <tspan
                    key={idx}
                    dy={seg.dy}
                    fontSize={prominentSize}
                    fill={foreground}
                    fontFamily="Frutiger, Helvetica, sans-serif"
                  >
                    {seg.seg}
                  </tspan>
                ) : (
                  <tspan
                    key={idx}
                    dy={seg.dy}
                    fill={foreground}
                    fontFamily={seg.isDigit ? "Helvetica, sans-serif" : undefined}
                  >
                    {seg.seg}
                  </tspan>
                )
              )}
            </text>
            <text x={0} y={enY} fontSize={enSize} fill={foreground} xmlSpace="preserve">
              {englishText}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
