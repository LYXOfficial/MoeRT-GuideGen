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
  chinese: "换乘",
  english: "Transfer",
  fontSizeZh: 22,
  fontSizeEn: 14,
  lineGap: 16,
  offsetY: 0,
  foreground: colors.foreground,
  background: colors.transparent,
};

export const textEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.chengdu.components.Text.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chengdu.components.Text.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chengdu.components.Text.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chengdu.components.Text.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.chengdu.components.Text.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chengdu.components.Text.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "alignV",
      label: "themes.chengdu.components.Text.props.alignV.displayName",
      element: (
        <Select>
          <Select.Option value="top">
            {t("themes.chengdu.components.Text.props.alignV.top")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.chengdu.components.Text.props.alignV.center")}
          </Select.Option>
          <Select.Option value="bottom">
            {t("themes.chengdu.components.Text.props.alignV.bottom")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "fontSizeZh",
      label: "themes.chengdu.components.Text.props.fontSizeZh",
      element: <InputNumber step={1} min={8} max={64} />,
    },
    {
      key: "fontSizeEn",
      label: "themes.chengdu.components.Text.props.fontSizeEn",
      element: <InputNumber step={1} min={6} max={48} />,
    },
    {
      key: "lineGap",
      label: "themes.chengdu.components.Text.props.lineGap",
      element: <InputNumber step={1} min={0} max={48} />,
    },
    {
      key: "offsetY",
      label: "themes.chengdu.components.Text.props.offsetY",
      element: <InputNumber step={1} min={-32} max={32} />,
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.Text.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.Text.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  alignV = textDefaultProps.alignV,
  fontSizeZh = textDefaultProps.fontSizeZh,
  fontSizeEn = textDefaultProps.fontSizeEn,
  lineGap = textDefaultProps.lineGap,
  offsetY = textDefaultProps.offsetY,
  foreground = textDefaultProps.foreground,
  background = textDefaultProps.background,
}: TextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const zhText = normalizeSvgLine(chinese);
  const enText = normalizeSvgLine(english);
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

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        setSvgWidth(bbox.width);
      }
    };

    // 先量一次（可能是回退字体），字体就绪后再量、之后每次字体加载完再量。
    // 中文字体是 fonts.loli.net 的远程字体：只 await 一次 fonts.ready 的话，
    // 字体若在这之后才加载完，宽度就一直是回退字体的值 —— 盒子比文字宽一截，
    // 放进双行容器就是「右边空一块、没贴紧」（用户反馈过）。
    measure();
    const fonts = document.fonts;
    const onFontsLoadingDone = () => {
      if (mounted) measure();
    };
    fonts?.addEventListener?.("loadingdone", onFontsLoadingDone);
    fonts?.ready.then(() => {
      if (mounted) measure();
    }).catch(() => {});
    const fontRetryTimers = [60, 240, 800].map(ms =>
      window.setTimeout(() => {
        if (mounted) measure();
      }, ms)
    );

    return () => {
      mounted = false;
      fonts?.removeEventListener?.("loadingdone", onFontsLoadingDone);
      fontRetryTimers.forEach(t => {
        window.clearTimeout(t);
      });
    };
  }, [zhText, enText, zhSize, enSize, gap, dy]);

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
              {zhText}
            </text>
            <text x={0} y={enY} fontSize={enSize} fill={foreground} xmlSpace="preserve">
              {enText}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
