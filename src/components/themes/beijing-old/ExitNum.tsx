import { Input, Typography } from "@douyinfe/semi-ui";
import { useContext } from "react";
import { fontEn, fontZh, measureText, useFontsReady } from "./define/text";
import colors from "./define/colors";
import { EditingPropsContext } from "../../EditingPropsContext";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  commonSelectFormItem,
  foregroundFormItem,
} from "./Background";

/**
 * 出入口编号（经典样式，官方 DB11/T 657.2—2024 图 5 / 图 6）。
 *
 * 字母块 = **描边圆角方块**（非实心）：透明底 + 前景色描边 + 前景色字母。
 * 两个形态（出口最多 1 / 2 个，无需增删按钮）：
 *  - single：一块 1a 方块（行 = 1.5a）
 *  - double：两块 0.5a 方块上下叠、间隔 0.1a（visys p7 示例 C 的 A/B 叠块）；
 *    第二行字母留空时该行整块（含边框）不渲染
 * 字母每格只收一个字母（官方出入口编号规则：字母不含 I/O）。
 */
export type ExitVariant = "single" | "double";

export const EXIT_VARIANTS: ExitVariant[] = ["single", "double"];

/** 一个出口编号：一个字母 */
export interface ExitCode {
  letter: string;
}

export interface ExitNumProps {
  exits?: ExitCode[];
  variant?: ExitVariant;
  textZh?: string;
  textEn?: string;
  /** 描边 / 字母 / 名称颜色 */
  foreground?: string;
  background?: string;
  background2?: string;
}

export const exitNumDefaultProps: ExitNumProps = {
  exits: [{ letter: "A" }],
  variant: "single",
  textZh: "",
  textEn: "",
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

/**
 * 出口编号编辑器：输入框数量随形态固定（single 1 个 / double 2 个），
 * 无增删按钮；GuideBoard 会向表单元素注入 value / onChange。
 */
function ExitSlots({
  value,
  onChange,
  t,
}: {
  value?: ExitCode[];
  onChange?: (value: ExitCode[]) => void;
  t: (key: string) => string;
}) {
  const scope = "themes.beijingOld.components.ExitNum.props";
  const editing = useContext(EditingPropsContext);
  const variant = (editing?.variant as ExitVariant) ?? "single";
  const count = variant === "double" ? 2 : 1;
  const exits = Array.from({ length: count }, (_, i) => ({
    letter: String((Array.isArray(value) ? value[i] : undefined)?.letter ?? ""),
  }));

  const update = (index: number, next: string) => {
    onChange?.(
      exits.map((exit, i) => (i === index ? { ...exit, letter: next } : exit))
    );
  };

  return (
    <div className="space-y-3">
      {exits.map((exit, index) => (
        <div key={index} className="flex items-center">
          <Typography.Text size="small" className="w-16 mr-2">
            {t(`${scope}.exitLetter`)}
            {count > 1 ? ` ${index + 1}` : ""}
          </Typography.Text>
          <Input
            size="small"
            value={exit.letter}
            onChange={val => update(index, val.slice(-1).toUpperCase())}
            placeholder={index === 0 ? "A" : "B"}
            maxLength={1}
          />
        </div>
      ))}
    </div>
  );
}

export const exitNumEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijingOld.components.ExitNum.props";
  return {
    forms: [
      {
        key: "exits",
        label: `${scope}.exits`,
        element: <ExitSlots t={t} />,
      },
      commonSelectFormItem(t, scope, "variant", "exitVariant", EXIT_VARIANTS),
      { key: "textZh", label: `${scope}.textZh`, element: <Input /> },
      { key: "textEn", label: `${scope}.textEn`, element: <Input /> },
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
/** a：行 = 1.5a（方形模块 = 1a ≈ 42.7px） */
const A = ROW_H / 1.5;
/** 描边宽 ≈ 0.04 块高（图 5 描边方块实测） */
const STROKE_W = A * 0.04;
/** 块内字母 ink ≈ 0.67 块高（官方图 36：字母 ink 0.45H、块 ≈ 0.67H），Arial cap = 0.716em */
const LETTER_RATIO = 0.67;
/** 块圆角 ≈ 0.1 块高（图 5 实测） */
const BLOCK_RADIUS = 0.1;
/** 组与组横向间距 */
const STACK_GAP = A * 0.12;
/** double 两块间隔 0.1a（示例 C 实测） */
const DOUBLE_GAP = A * 0.1;
/** 编号区与名称列之间 */
const NAME_GAP = A * 0.25;
/** 名称列中英文字号（官方导向标志：中文 ink ≈ 0.3H、英文 cap ≈ 0.13H） */
const ZH_SIZE = (ROW_H * 0.3) / 0.88;
const EN_SIZE = (ROW_H * 0.13) / 0.716;

function ExitNum({
  exits = exitNumDefaultProps.exits,
  variant = exitNumDefaultProps.variant,
  textZh = exitNumDefaultProps.textZh,
  textEn = exitNumDefaultProps.textEn,
  foreground = exitNumDefaultProps.foreground,
  background = exitNumDefaultProps.background,
  background2 = exitNumDefaultProps.background2,
}: ExitNumProps) {
  const fontsReady = useFontsReady();
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.background;

  const isDouble = variant === "double";
  // 槽位固定：single 1 个、double 2 个
  const slots = Array.from({ length: isDouble ? 2 : 1 }, (_, i) =>
    String((Array.isArray(exits) ? exits[i] : undefined)?.letter ?? "").trim()
  );
  // double 第二行字母为空 → 该行整块（含边框）不渲染
  const rows = slots.filter(letter => letter.length > 0);

  // 块几何：single 块 = 1a；double 每块 = 0.5a
  const blockSize = isDouble ? A / 2 : A;
  const blockRadius = blockSize * BLOCK_RADIUS;
  const letterSize = (blockSize * LETTER_RATIO) / 0.716;
  // 组总高按实际行数，整组垂直居中
  const groupH = rows.length > 0 ? blockSize * rows.length + DOUBLE_GAP * (rows.length - 1) : blockSize;
  const groupTop = (ROW_H - groupH) / 2;

  // single 每字母一块横向排；double 一组（每行一块）
  const blocks: Array<{ x: number; letters: string[] }> = [];
  let cursor = 0;
  if (isDouble) {
    if (rows.length > 0) {
      blocks.push({ x: 0, letters: rows });
      cursor = blockSize + STACK_GAP;
    }
  } else {
    rows.forEach(letter => {
      blocks.push({ x: cursor, letters: [letter] });
      cursor += blockSize + STACK_GAP;
    });
  }
  const codeWidth = Math.max(0, cursor - STACK_GAP);

  const zhText = (textZh ?? "").trim();
  const enText = (textEn ?? "").trim();
  const zhFont = fontZh(700, ZH_SIZE);
  const enFont = fontEn(700, EN_SIZE);
  const zhWidth = zhText ? measureText(zhText, zhFont) : 0;
  const enWidth = enText ? measureText(enText, enFont) : 0;

  const nameWidth = Math.max(zhWidth, enWidth);
  const hasName = nameWidth > 0;
  const width = Math.ceil(
    Math.max(A / 2, codeWidth + (hasName ? NAME_GAP + nameWidth : 0))
  );

  // 名称列：两行互相居中、整体垂直居中
  const nameX = codeWidth + NAME_GAP;
  const zhX = nameX + (nameWidth - zhWidth) / 2;
  const enX = nameX + (nameWidth - enWidth) / 2;
  const ZH_INK = ZH_SIZE * 0.88;
  const EN_CAP = EN_SIZE * 0.716;
  const nameGapY = 4;
  const nameColH = zhText ? ZH_INK + nameGapY + EN_CAP : EN_CAP;
  const nameTop = (ROW_H - nameColH) / 2;

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      style={{ height: ROW_H, width }}
    >
      <svg width={width} height={ROW_H} data-fonts-ready={fontsReady}>
        {blocks.map((block, index) =>
          block.letters.map((ch, row) => (
            <g key={`block-${index}-${row}`}>
              <rect
                x={block.x + STROKE_W / 2}
                y={groupTop + row * (blockSize + DOUBLE_GAP) + STROKE_W / 2}
                width={blockSize - STROKE_W}
                height={blockSize - STROKE_W}
                rx={blockRadius}
                fill="none"
                stroke={fg}
                strokeWidth={STROKE_W}
              />
              <text
                x={block.x + blockSize / 2}
                y={
                  groupTop +
                  row * (blockSize + DOUBLE_GAP) +
                  blockSize / 2 +
                  (letterSize * 0.716) / 2
                }
                fontSize={letterSize}
                fontWeight={700}
                fill={fg}
                textAnchor="middle"
                fontFamily="Arial, Helvetica, sans-serif"
              >
                {ch}
              </text>
            </g>
          ))
        )}
        {zhText ? (
          <text
            x={zhX}
            y={nameTop + ZH_INK}
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
            y={nameTop + nameColH}
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

ExitNum.getEditorConfig = (t: (key: string) => string) =>
  exitNumEditorConfig(t);

export default ExitNum;
