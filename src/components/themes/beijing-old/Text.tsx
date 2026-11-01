import { useEffect, useMemo, useState } from "react";
import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  Background,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";
import { normalizeSvgLines } from "../../../utils/svgText";

export type TextWeight = "normal" | "medium" | "bold";

const WEIGHT_VALUE: Record<TextWeight, number> = {
  normal: 400,
  medium: 500,
  bold: 700,
};

export interface TextProps {
  chinese: string;
  english: string;
  /**
   * 对齐：左 / 中 / 右 / 边缘。
   * 边缘（同 Word 的「分散对齐」）：较短的一行摊到块宽，首字贴左缘、尾字贴右缘 ——
   * 英文比中文长时，中文首字与英文左缘对齐、尾字与英文右缘对齐。
   */
  align?: "left" | "center" | "right" | "justify";
  weight?: TextWeight;
  /** 中文字距，单位 em */
  letterSpacingZh?: number;
  /** 英文字距，单位 em */
  letterSpacingEn?: number;
  /** 中文字号（px），限制在 8–48 */
  fontSizeZh?: number;
  /** 英文字号（px），限制在 8–48 */
  fontSizeEn?: number;
  /** 中英之间的间距（px，指中文最后一行底部到英文顶部的空隙） */
  lineGap?: number;
  foreground?: string;
  background?: string;
  /** 第二行背景色（上下分色时使用） */
}

export const textDefaultProps: TextProps = {
  chinese: "换乘",
  english: "Transfer",
  align: "left",
  weight: "bold",
  letterSpacingZh: 0.15,
  letterSpacingEn: 0.15,
  fontSizeZh: 23,
  fontSizeEn: 14,
  lineGap: 9,
  foreground: colors.foreground,
  background: colors.transparent,
};

// 默认字号来自 visys.pdf/extra.ai 矢量图层实测（中文 25px、英文 15px = 0.6 倍）；
// 用户可在合理范围内调整中文基准号，英文按同一比例派生。
export const TEXT_FONT_SIZE_MIN = 8;
export const TEXT_FONT_SIZE_MAX = 48;
/** 默认字号（= textDefaultProps.fontSizeZh / fontSizeEn） */
const DEFAULT_FONT_SIZE_ZH = 23;
const DEFAULT_FONT_SIZE_EN = 14;

// 行距：单行 fs×1.3；多行时中文 fs×1.05（汉字 ink 就有 0.88em，
// 之前用 0.65 会直接叠字）、英文 fs×1.2（拉丁 ink ≈0.97em）。
const zhStep = (zhSize: number, lineCount: number) =>
  zhSize * (lineCount > 1 ? 1.05 : 1.3);
const enStep = (enSize: number, lineCount: number) =>
  enSize * (lineCount > 1 ? 1.2 : 1.35);

let measureCtx: CanvasRenderingContext2D | null = null;

const measure = (text: string, font: string): number => {
  if (!measureCtx && typeof document !== "undefined") {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) return text.length * 12;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
};

/** 边缘对齐 / 右对齐时英文的左缩量（px），抵消拉丁末字的墨迹外凸 */
const EN_INSET = 1;

/**
 * 墨迹度量（相对排字原点）：拉丁字形的左右边距和汉字不一样，
 * 边缘对齐要贴着「首字墨迹左缘 / 尾字墨迹右缘」，所以得知道墨迹起止。
 * advance 之外的这两个值来自 canvas 的 actualBoundingBox（拿不到时退化成 0 / advance）。
 */
const measureInk = (
  text: string,
  font: string
): { advance: number; inkLeft: number; inkRight: number } => {
  if (!measureCtx && typeof document !== "undefined") {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) {
    const width = text.length * 12;
    return { advance: width, inkLeft: 0, inkRight: width };
  }
  measureCtx.font = font;
  const metrics = measureCtx.measureText(text);
  const safe = (value: number, fallback: number) =>
    Number.isFinite(value) ? value : fallback;
  return {
    advance: metrics.width,
    inkLeft: safe(-metrics.actualBoundingBoxLeft, 0),
    inkRight: safe(metrics.actualBoundingBoxRight, metrics.width),
  };
};

/** 中文按字切分、拉丁按词切分，便于贪心换行 */
const tokenize = (text: string): string[] => {
  const tokens: string[] = [];
  let buffer = "";
  for (const ch of Array.from(text)) {
    if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch)) {
      if (buffer) {
        tokens.push(buffer);
        buffer = "";
      }
      tokens.push(ch);
    } else if (ch === " ") {
      tokens.push(`${buffer} `);
      buffer = "";
    } else {
      buffer += ch;
    }
  }
  if (buffer) tokens.push(buffer);
  return tokens;
};

/** 自动换行：先按显式换行分段，再按最大宽度贪心折行 */
export const wrapText = (
  text: string,
  font: string,
  maxWidth: number
): string[] => {
  const paragraphs = String(text ?? "").split("\n");
  const out: string[] = [];
  for (const para of paragraphs) {
    if (!para) {
      out.push("");
      continue;
    }
    if (maxWidth <= 0) {
      out.push(para);
      continue;
    }
    let line = "";
    for (const token of tokenize(para)) {
      const candidate = line + token;
      if (line && measure(candidate.trimEnd(), font) > maxWidth) {
        out.push(line.trimEnd());
        line = token.trimStart();
      } else {
        line = candidate;
      }
    }
    out.push(line.trimEnd());
  }
  return out.length > 0 ? out : [""];
};

export const textEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.beijingOld.components.Text.props.chinese",
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "english",
      label: "themes.beijingOld.components.Text.props.english",
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "weight",
      label: "themes.beijingOld.components.Text.props.weight.displayName",
      element: (
        <Select>
          <Select.Option value="normal">
            {t("themes.beijingOld.components.Text.props.weight.normal")}
          </Select.Option>
          <Select.Option value="bold">
            {t("themes.beijingOld.components.Text.props.weight.bold")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "letterSpacingZh",
      label: "themes.beijingOld.components.Text.props.letterSpacingZh",
      element: <InputNumber step={0.01} min={0} max={0.5} />,
    },
    {
      key: "letterSpacingEn",
      label: "themes.beijingOld.components.Text.props.letterSpacingEn",
      element: <InputNumber step={0.01} min={0} max={0.5} />,
    },
    {
      key: "align",
      label: "themes.beijingOld.components.Text.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.beijingOld.components.Text.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.beijingOld.components.Text.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.beijingOld.components.Text.props.align.right")}
          </Select.Option>
          <Select.Option value="justify">
            {t("themes.beijingOld.components.Text.props.align.justify")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "fontSizeZh",
      label: "themes.beijingOld.components.Text.props.fontSizeZh",
      element: (
        <InputNumber
          step={1}
          min={TEXT_FONT_SIZE_MIN}
          max={TEXT_FONT_SIZE_MAX}
        />
      ),
    },
    {
      key: "fontSizeEn",
      label: "themes.beijingOld.components.Text.props.fontSizeEn",
      element: (
        <InputNumber
          step={1}
          min={TEXT_FONT_SIZE_MIN}
          max={TEXT_FONT_SIZE_MAX}
        />
      ),
    },
    {
      key: "lineGap",
      label: "themes.beijingOld.components.Text.props.lineGap",
      element: <InputNumber step={1} min={0} max={40} />,
    },
    foregroundFormItem("themes.beijingOld.components.Text.props"),
    ...backgroundFormItems("themes.beijingOld.components.Text.props"),
  ],
});

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  weight = textDefaultProps.weight,
  letterSpacingZh = textDefaultProps.letterSpacingZh,
  letterSpacingEn = textDefaultProps.letterSpacingEn,
  fontSizeZh = textDefaultProps.fontSizeZh,
  fontSizeEn = textDefaultProps.fontSizeEn,
  lineGap = textDefaultProps.lineGap,
  foreground = textDefaultProps.foreground,
  background = textDefaultProps.background,
}: TextProps) {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    document.fonts?.ready.then(() => {
      if (mounted) setFontsReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const weightValue = WEIGHT_VALUE[weight ?? "medium"];
  // 中英字号分开设置；都限制在合理范围内，非法值兜底
  const clampSize = (value: unknown, fallback: number) => {
    const n = Number(value);
    return Math.min(
      TEXT_FONT_SIZE_MAX,
      Math.max(
        TEXT_FONT_SIZE_MIN,
        Number.isFinite(n) && n > 0 ? n : fallback
      )
    );
  };
  const zhSize = clampSize(fontSizeZh, DEFAULT_FONT_SIZE_ZH);
  const enSize = clampSize(fontSizeEn, DEFAULT_FONT_SIZE_EN);
  const gap = Math.max(0, Number(lineGap) || 0);
  const zhFont = `${weightValue} ${zhSize}px ${fontFamilyZh}`;
  const enFont = `${weightValue} ${enSize}px ${fontFamilyEn}`;
  const lsZh = letterSpacingZh ?? 0;
  const lsEn = letterSpacingEn ?? 0;
  const justify = align === "justify";
  // 不按宽度自动折行：只认用户在输入框里敲的换行
  const limit = 0;

  const layout = useMemo(() => {
    const zhLines = wrapText(normalizeSvgLines(chinese).join("\n"), zhFont, limit);
    const enLines = wrapText(normalizeSvgLines(english).join("\n"), enFont, limit);
    // 行度量：块宽按排字宽度（与左/中/右一致，容器不会被墨迹外凸撑大）；
    // 另外记下墨迹宽和首字墨迹左缘，边缘对齐用它贴边。
    const lineMetrics = (line: string, font: string, size: number, ls: number) => {
      const ink = measureInk(line, font);
      const gaps = Math.max(0, Array.from(line).length - 1);
      const base = ls * size * gaps;
      return {
        advance: ink.advance + base,
        inkLeft: ink.inkLeft,
        inkWidth: ink.inkRight - ink.inkLeft + base,
        gaps,
      };
    };
    const zhMetrics = zhLines.map(line => lineMetrics(line, zhFont, zhSize, lsZh));
    const enMetrics = enLines.map(line => lineMetrics(line, enFont, enSize, lsEn));
    const width = Math.max(
      0,
      ...zhMetrics.map(m => m.advance),
      ...enMetrics.map(m => m.advance)
    );
    // 以「墨迹范围」而不是行距块高来定高度与居中：
    // 行距的留白本来只该体现在行与行之间，按块高算会把留白全堆到下方，视觉上就偏上了。
    const zhStepValue = zhStep(zhSize, zhLines.length);
    const enStepValue = enStep(enSize, enLines.length);
    const zhInk = zhSize * 0.88; // 汉字 ink ≈ 0.88em（坐在基线上）
    const enCap = enSize * 0.716; // 拉丁 cap 高
    const enDesc = enSize * 0.25; // 拉丁下伸部
    const contentHeight =
      (zhLines.length - 1) * zhStepValue +
      zhInk +
      gap +
      (enLines.length - 1) * enStepValue +
      enCap +
      enDesc;
    return {
      zhLines,
      enLines,
      zhMetrics,
      enMetrics,
      width: Math.max(1, Math.ceil(width)),
      height: Math.max(64, Math.ceil(contentHeight) + 2),
      zhInk,
      enCap,
      contentHeight,
      zhStepValue,
      enStepValue,
    };
    // fontsReady 参与依赖：字体就绪后重新量一遍
  }, [
    chinese,
    english,
    zhFont,
    enFont,
    zhSize,
    enSize,
    gap,
    lsZh,
    lsEn,
    limit,
    fontsReady,
  ]);

  // 每行的实际字距（px）与横向偏移：
  //  · 左/中/右 → 基准字距（em × 字号），x = 0（按排字原点对齐，与改动前一致）；
  //  · 边缘对齐 → 基准字距 + 把「块宽 − 该行墨迹宽」均摊到字间空隙，
  //    并把首字挪到墨迹左缘贴 0（汉字/拉丁的左右边距不同，按原点对齐会缩进 1–3px）。
  //    块宽已取整且 ≥ 各行墨迹宽，均摊量恒 ≥ 0；单字行没有字间空隙，保持基准字距。
  const lineLayout = (
    metrics: { inkLeft: number; inkWidth: number; gaps: number },
    size: number,
    ls: number
  ): { x: number; spacing: number } => {
    const base = ls * size;
    const spacing =
      justify && metrics.gaps > 0
        ? base + Math.max(0, (layout.width - metrics.inkWidth) / metrics.gaps)
        : base;
    return { x: justify ? -metrics.inkLeft : 0, spacing };
  };

  const anchor =
    align === "center" ? "middle" : align === "right" ? "end" : "start";
  const groupX =
    align === "center"
      ? layout.width / 2
      : align === "right"
        ? layout.width
        : 0;
  // 垂直居中：行距变化时文字块整体保持在行内居中
  const top = Math.max(0, (layout.height - layout.contentHeight) / 2);
  // 与上面的墨迹模型对齐：中文首行基线 = 墨迹顶 + ink 高；英文首行基线 = 中文末行基线下移 gap + cap
  const zhStart = top + layout.zhInk;
  const enStart =
    zhStart +
    (layout.zhLines.length - 1) * layout.zhStepValue +
    gap +
    layout.enCap;

  return (
    <Background
      background={background}
      style={{ height: layout.height }}
    >
      <div className="ml-1.25 mr-1.25" style={{ width: layout.width }}>
        <svg width={layout.width} height={layout.height}>
          <g transform={`translate(${groupX}, 0)`} textAnchor={anchor}>
            <text
              fontSize={zhSize}
              fontWeight={weightValue}
              fill={foreground}
              fontFamily={fontFamilyZh}
              xmlSpace="preserve">
              {layout.zhLines.map((line, index) => {
                const placed = lineLayout(
                  layout.zhMetrics[index],
                  zhSize,
                  lsZh
                );
                return (
                  <tspan
                    key={index}
                    x={placed.x}
                    y={zhStart + index * layout.zhStepValue}
                    letterSpacing={placed.spacing}
                  >
                    {line}
                  </tspan>
                );
              })}
            </text>
            <text
              fontSize={enSize}
              fontWeight={weightValue}
              fill={foreground}
              fontFamily={fontFamilyEn}
              xmlSpace="preserve">
              {layout.enLines.map((line, index) => {
                const placed = lineLayout(
                  layout.enMetrics[index],
                  enSize,
                  lsEn
                );
                return (
                  <tspan
                    key={index}
                    // 边缘对齐 / 右对齐时英文左移 1px：拉丁末字的墨迹会比排字宽度探出一点点，
                    // 按排字原点贴边会看着「英文比中文多出一点」
                    x={
                      placed.x -
                      (align === "justify" || align === "right" ? EN_INSET : 0)
                    }
                    y={enStart + index * layout.enStepValue}
                    letterSpacing={placed.spacing}
                  >
                    {line}
                  </tspan>
                );
              })}
            </text>
          </g>
        </svg>
      </div>
    </Background>
  );
}

Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
