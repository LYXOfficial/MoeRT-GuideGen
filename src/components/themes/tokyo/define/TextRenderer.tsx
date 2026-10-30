import type { CSSProperties } from "react";
import { fontFamilyEn, fontFamilyFutura, fontFamilyZh } from "./colors";
import themeColors from "./colors";

/** 一个「语言块」：一种语言的一串文字 + 它自己的排版参数 */
export interface TextBlockSpec {
  /** 文字内容（空 = 整块塌陷，不留空隙） */
  text: string;
  /** 字号（px） */
  size: number;
  /** 字重（400 / 500 / 700 …） */
  weight: number;
  /** 字距（px） */
  spacing: number;
  /** 行距（px）：行与行之间的额外间隙 */
  lineGap: number;
  /** 字体族：中文/日文 / 拉丁 / Futura（站号字母） */
  family?: "zh" | "en" | "futura";
  color?: string;
  /** 是否参与折行（默认 true） */
  wrap?: boolean;
}

export interface TextRendererProps {
  blocks: TextBlockSpec[];
  align?: "left" | "center" | "right";
  /** 块与块之间的额外间隙（px） */
  blockGap?: number;
  background?: string;
  /** 左右内边距（px） */
  paddingX?: number;
}

const FAMILY: Record<NonNullable<TextBlockSpec["family"]>, string> = {
  zh: fontFamilyZh,
  en: fontFamilyEn,
  futura: fontFamilyFutura,
};

/**
 * 多语言竖排文字块渲染器。
 *
 * 每个语言块独立控制 字号 / 字重 / 字距 / 行距；缺语种（空串）整块塌陷，
 * 不会留下空隙。**折行宽度已整体砍掉**：要换行就在多行输入框里回车。
 */
export default function TextRenderer({
  blocks,
  align = "left",
  blockGap = 2,
  background,
  paddingX = 2,
}: TextRendererProps) {
  const visible = blocks.filter(b => (b.text ?? "").trim().length > 0);

  return (
    <div
      className="flex h-16 flex-col justify-center"
      style={{
        backgroundColor: background ?? themeColors.transparent,
        alignItems:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        paddingLeft: paddingX,
        paddingRight: paddingX,
        gap: blockGap,
      }}
    >
      {visible.map((block, bi) => {
        const family = FAMILY[block.family ?? "zh"];
        const lines = (block.text ?? "").toString().split("\n");
        const lineHeight = block.size + (block.lineGap ?? 0);
        const style: CSSProperties = {
          fontFamily: family,
          fontWeight: block.weight,
          fontSize: block.size,
          lineHeight: `${lineHeight}px`,
          letterSpacing: block.spacing,
          color: block.color,
          whiteSpace: "nowrap",
          textAlign: align,
        };
        return (
          <div key={bi} style={{ display: "flex", flexDirection: "column" }}>
            {lines.map((line, li) => (
              <div key={li} style={style}>
                {line}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
