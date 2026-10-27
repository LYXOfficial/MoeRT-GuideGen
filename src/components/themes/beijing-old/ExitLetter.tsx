import { Input, Typography } from "@douyinfe/semi-ui";
import { useContext } from "react";
import { useFontsReady } from "./define/text";
import colors from "./define/colors";
import { EditingPropsContext } from "../../EditingPropsContext";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  Background,
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

export interface ExitLetterProps {
  exits?: ExitCode[];
  variant?: ExitVariant;
  /** 描边 / 字母颜色 */
  foreground?: string;
  background?: string;
}

export const exitLetterDefaultProps: ExitLetterProps = {
  exits: [{ letter: "A" }],
  variant: "single",
  foreground: colors.foreground,
  background: colors.background,
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
  const scope = "themes.beijingOld.components.ExitLetter.props";
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
            onChange={val =>
              update(
                index,
                val.replace(/[^A-Za-z0-9]/g, "").slice(-1).toUpperCase()
              )
            }
            placeholder={index === 0 ? "A" : "B"}
            maxLength={1}
          />
        </div>
      ))}
    </div>
  );
}

export const exitLetterEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijingOld.components.ExitLetter.props";
  return {
    forms: [
      {
        key: "exits",
        label: `${scope}.exits`,
        element: <ExitSlots t={t} />,
      },
      commonSelectFormItem(t, scope, "variant", "exitVariant", EXIT_VARIANTS),
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
const BLOCK_RADIUS = 0.14;
/** 组与组横向间距 */
const STACK_GAP = A * 0.12;
/** double 两块间隔 0.1a（示例 C 实测） */
const DOUBLE_GAP = A * 0.1;

function ExitLetter({
  exits = exitLetterDefaultProps.exits,
  variant = exitLetterDefaultProps.variant,
  foreground = exitLetterDefaultProps.foreground,
  background = exitLetterDefaultProps.background,
}: ExitLetterProps) {
  const fontsReady = useFontsReady();
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
  const bg =
    background && background.length > 0 ? background : colors.background;

  const isDouble = variant === "double";
  // 槽位固定：single 1 个、double 2 个 —— 空槽照样占位（不画边框），
  // 这样「只有第一行 / 只有第二行」时另一行的位置仍然保留
  const slots = Array.from({ length: isDouble ? 2 : 1 }, (_, i) =>
    String((Array.isArray(exits) ? exits[i] : undefined)?.letter ?? "").trim()
  );

  // 块几何：single 块 = 1a；double 每块 = 0.5a
  const blockSize = isDouble ? A / 2 : A;
  const blockRadius = blockSize * BLOCK_RADIUS;
  const letterSize = (blockSize * LETTER_RATIO) / 0.716;
  // 组总高按槽位数（不是实际字母数），整组垂直居中
  const groupH = blockSize * slots.length + DOUBLE_GAP * (slots.length - 1);
  const groupTop = (ROW_H - groupH) / 2;

  // single 每槽一块横向排；double 一组（每行一块，空行只占位）
  const PAD_SIDE = 2; // 组件左右各留 2px，避免块贴住相邻组件
  const blocks: Array<{ x: number; letters: string[] }> = [];
  let cursor = PAD_SIDE;
  if (isDouble) {
    blocks.push({ x: cursor, letters: slots });
    cursor += blockSize + STACK_GAP;
  } else {
    slots.forEach(letter => {
      blocks.push({ x: cursor, letters: [letter] });
      cursor += blockSize + STACK_GAP;
    });
  }
  const codeWidth = Math.max(0, cursor - STACK_GAP);


  const width = Math.ceil(Math.max(A / 2 + PAD_SIDE * 2, codeWidth + PAD_SIDE));


  return (
    <Background
      background={bg}
      style={{ height: ROW_H, width }}
    >
      <svg width={width} height={ROW_H} data-fonts-ready={fontsReady}>
        {blocks.map((block, index) =>
          block.letters.map((ch, row) =>
            // 空槽只占位：不画边框也不画字母
            ch ? (
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
                  xmlSpace="preserve">
                  {ch}
                </text>
              </g>
            ) : null
          )
        )}
      </svg>
    </Background>
  );
}

ExitLetter.getEditorConfig = (t: (key: string) => string) =>
  exitLetterEditorConfig(t);

export default ExitLetter;
