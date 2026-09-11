import { useEffect, useMemo, useState } from "react";
import { InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn, fontFamilyZh } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";

export type TextWeight = "normal" | "medium" | "bold";

const WEIGHT_VALUE: Record<TextWeight, number> = {
  normal: 400,
  medium: 500,
  bold: 700,
};

export interface TextProps {
  chinese: string;
  english: string;
  align?: "left" | "center" | "right";
  weight?: TextWeight;
  /** 字距，单位 em */
  letterSpacing?: number;
  /** 中文字号（px），限制在 8–48 */
  fontSizeZh?: number;
  /** 英文字号（px），限制在 8–48 */
  fontSizeEn?: number;
  /** 中英之间的间距（px，指中文最后一行底部到英文顶部的空隙） */
  lineGap?: number;
  foreground?: string;
  background?: string;
  /** 第二行背景色（上下分色时使用） */
  background2?: string;
}

export const textDefaultProps: TextProps = {
  chinese: "乘车",
  english: "Train",
  align: "left",
  weight: "medium",
  letterSpacing: 0,
  fontSizeZh: 25,
  fontSizeEn: 15,
  lineGap: 5,
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

// 默认字号来自 visys.pdf/extra.ai 矢量图层实测（中文 25px、英文 15px = 0.6 倍）；
// 用户可在合理范围内调整中文基准号，英文按同一比例派生。
export const TEXT_FONT_SIZE_MIN = 8;
export const TEXT_FONT_SIZE_MAX = 48;
/** 默认字号（= textDefaultProps.fontSizeZh / fontSizeEn） */
const DEFAULT_FONT_SIZE_ZH = 25;
const DEFAULT_FONT_SIZE_EN = 15;

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
      label: "themes.beijing.components.Text.props.chinese",
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "english",
      label: "themes.beijing.components.Text.props.english",
      element: <TextArea autosize={{ minRows: 1, maxRows: 4 }} />,
    },
    {
      key: "weight",
      label: "themes.beijing.components.Text.props.weight.displayName",
      element: (
        <Select>
          <Select.Option value="normal">
            {t("themes.beijing.components.Text.props.weight.normal")}
          </Select.Option>
          <Select.Option value="medium">
            {t("themes.beijing.components.Text.props.weight.medium")}
          </Select.Option>
          <Select.Option value="bold">
            {t("themes.beijing.components.Text.props.weight.bold")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "letterSpacing",
      label: "themes.beijing.components.Text.props.letterSpacing",
      element: <InputNumber step={0.01} min={0} max={0.5} />,
    },
    {
      key: "align",
      label: "themes.beijing.components.Text.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.beijing.components.Text.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.beijing.components.Text.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.beijing.components.Text.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "fontSizeZh",
      label: "themes.beijing.components.Text.props.fontSizeZh",
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
      label: "themes.beijing.components.Text.props.fontSizeEn",
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
      label: "themes.beijing.components.Text.props.lineGap",
      element: <InputNumber step={1} min={0} max={40} />,
    },
    foregroundFormItem("themes.beijing.components.Text.props"),
    ...backgroundFormItems("themes.beijing.components.Text.props"),
  ],
});

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  weight = textDefaultProps.weight,
  letterSpacing = textDefaultProps.letterSpacing,
  fontSizeZh = textDefaultProps.fontSizeZh,
  fontSizeEn = textDefaultProps.fontSizeEn,
  lineGap = textDefaultProps.lineGap,
  foreground = textDefaultProps.foreground,
  background = textDefaultProps.background,
  background2 = textDefaultProps.background2,
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
  const ls = letterSpacing ?? 0;
  // 不按宽度自动折行：只认用户在输入框里敲的换行
  const limit = 0;

  const layout = useMemo(() => {
    const zhLines = wrapText(chinese, zhFont, limit);
    const enLines = wrapText(english, enFont, limit);
    const widthOf = (lines: string[], font: string, size: number) =>
      Math.max(
        0,
        ...lines.map(
          line =>
            measure(line, font) +
            ls * size * Math.max(0, Array.from(line).length - 1)
        )
      );
    const width = Math.max(
      widthOf(zhLines, zhFont, zhSize),
      widthOf(enLines, enFont, enSize)
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
      width: Math.max(1, Math.ceil(width)),
      height: Math.max(64, Math.ceil(contentHeight) + 6),
      zhInk,
      enCap,
      contentHeight,
      zhStepValue,
      enStepValue,
    };
    // fontsReady 参与依赖：字体就绪后重新量一遍
  }, [chinese, english, zhFont, enFont, zhSize, enSize, gap, ls, limit, fontsReady]);

  const anchor =
    align === "center" ? "middle" : align === "right" ? "end" : "start";
  const groupX =
    align === "center"
      ? layout.width / 2
      : align === "right"
        ? layout.width
        : 0;
  const top = Math.max(0, (layout.height - layout.contentHeight) / 2);
  // 与上面的墨迹模型对齐：中文首行基线 = 墨迹顶 + ink 高；英文首行基线 = 中文末行基线下移 gap + cap
  const zhStart = top + layout.zhInk;
  const enStart =
    zhStart +
    (layout.zhLines.length - 1) * layout.zhStepValue +
    gap +
    layout.enCap;

  return (
    <MultiRowBackground
      background={background}
      background2={background2}
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
              letterSpacing={`${ls}em`}
            >
              {layout.zhLines.map((line, index) => (
                <tspan
                  key={index}
                  x={0}
                  y={zhStart + index * layout.zhStepValue}
                >
                  {line}
                </tspan>
              ))}
            </text>
            <text
              fontSize={enSize}
              fontWeight={weightValue}
              fill={foreground}
              fontFamily={fontFamilyEn}
              letterSpacing={`${ls}em`}
            >
              {layout.enLines.map((line, index) => (
                <tspan
                  key={index}
                  x={0}
                  y={enStart + index * layout.enStepValue}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        </svg>
      </div>
    </MultiRowBackground>
  );
}

Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
