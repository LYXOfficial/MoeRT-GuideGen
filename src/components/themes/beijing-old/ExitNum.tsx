import { Button, Input, Typography } from "@douyinfe/semi-ui";
import { fontEn, fontZh, measureText, useFontsReady } from "./define/text";
import colors from "./define/colors";
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
 * 字母块 = **描边圆角方块**（非实心）：透明底 + 前景色描边 + 前景色字母，
 * 官方示例里描边与字母同色（深蓝底上白色）。两个形态：
 *  - single：一块 1a 方块（行 = 1.5a）
 *  - double：两块 0.5a 方块上下叠、间隔 0.1a（visys p7 示例 C 的 A/B 叠块），
 *    供旁边的双行文字逐行对齐
 * 多个出口横向堆叠（图 5 的 A B 并排 = single 堆两个），暂不支持附加数字。
 */
export type ExitVariant = "single" | "double";

export const EXIT_VARIANTS: ExitVariant[] = ["single", "double"];

/** 一个出口编号：一个字母（多出口横向堆叠） */
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

const MAX_EXITS = 10;

/**
 * 出口编号编辑器：一个出口一张卡片（一个字母输入），+/− 增删。
 */
function ExitArrayEditor({
  value = exitNumDefaultProps.exits,
  onChange,
  t,
}: {
  value?: ExitCode[];
  onChange?: (value: ExitCode[]) => void;
  t: (key: string) => string;
}) {
  const scope = "themes.beijingOld.components.ExitNum.props";
  const exits = Array.isArray(value) ? value : [];

  const update = (index: number, next: string) => {
    onChange?.(
      exits.map((exit, i) => (i === index ? { ...exit, letter: next } : exit))
    );
  };

  const addExit = () => {
    if (exits.length >= MAX_EXITS) return;
    onChange?.([...exits, { letter: "" }]);
  };

  const removeExit = () => {
    if (exits.length === 0) return;
    onChange?.(exits.slice(0, -1));
  };

  return (
    <div className="space-y-3">
      {exits.map((exit, index) => (
        <div
          key={index}
          className="border border-solid border-gray-300 p-3 rounded-sm"
        >
          <div className="flex items-center">
            <Typography.Text size="small" className="w-16 mr-2">
              {t(`${scope}.exitLetter`)}
            </Typography.Text>
            <Input
              size="small"
              value={exit.letter}
              onChange={val => update(index, val)}
              placeholder="A"
              maxLength={2}
            />
          </div>
        </div>
      ))}

      <div className="flex gap-2 align-center justify-center">
        <Button
          type="primary"
          size="small"
          onClick={addExit}
          disabled={exits.length >= MAX_EXITS}
        >
          +
        </Button>
        {exits.length > 0 && (
          <Button type="danger" size="small" onClick={removeExit}>
            −
          </Button>
        )}
      </div>
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
        element: <ExitArrayEditor t={t} />,
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
/** a：行 = 1.5a（方形模块 = 1a ≈ 42.7px，官方门匾/出口标志口径） */
const A = ROW_H / 1.5;
/** 描边圆角方块：single 1a 见方；double 每块 0.5a 见方、间隔 0.1a（示例 C 实测） */
const STROKE_W = A * 0.04;
/** 块内字母 ink ≈ 0.45 块高（官方图 36 实测），Arial cap = 0.716em */
const LETTER_RATIO = 0.45;
/** 块圆角 ≈ 0.1 块高（图 5 描边方块实测） */
const BLOCK_RADIUS = 0.1;
/** 块与块（组与组）横向间距 */
const STACK_GAP = A * 0.12;
/** 编号区与名称列之间 */
const NAME_GAP = A * 0.25;
/** 名称列中英文字号（对齐官方导向标志：中文 ink ≈ 0.3H、英文 cap ≈ 0.13H） */
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

  const safeExits = (Array.isArray(exits) ? exits : [])
    .map(exit => ({ letter: String(exit?.letter ?? "").trim() }))
    .filter(exit => exit.letter.length > 0);
  const isDouble = variant === "double";

  // 块几何：single 块 = 1a；double 每块 = 0.5a（上下两块 + 0.1a 间隔）
  const blockSize = isDouble ? A / 2 : A;
  const blockRadius = blockSize * BLOCK_RADIUS;
  const letterSize = (blockSize * LETTER_RATIO) / 0.716;
  const doubleGap = isDouble ? A * 0.1 : 0;
  // double 组总高 = 2 块 + 间隔；single 组 = 1 块；整组垂直居中
  const groupH = isDouble ? blockSize * 2 + doubleGap : blockSize;
  const groupTop = (ROW_H - groupH) / 2;

  // 分组：single 每出口一块横向排；double 两出口一组上下叠、组再横向排
  // （官方示例 C 的 A / B 叠块 = 一组两块）
  const groups: Array<Array<string>> = [];
  if (isDouble) {
    for (let i = 0; i < safeExits.length; i += 2) {
      groups.push([
        safeExits[i].letter,
        safeExits[i + 1]?.letter ?? "",
      ]);
    }
  } else {
    safeExits.forEach(exit => groups.push([exit.letter]));
  }
  const blocks: Array<{ x: number; letters: string[] }> = [];
  let cursor = 0;
  groups.forEach(letters => {
    blocks.push({ x: cursor, letters });
    cursor += blockSize + STACK_GAP;
  });
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

  // 名称列：两行互相居中、整体垂直居中（同官方导向标志的对齐）
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
        {blocks.map((block, index) => (
          <g key={`block-${index}`}>
            {block.letters.map((ch, row) => (
              <g key={row}>
                <rect
                  x={block.x + STROKE_W / 2}
                  y={groupTop + row * (blockSize + doubleGap) + STROKE_W / 2}
                  width={blockSize - STROKE_W}
                  height={blockSize - STROKE_W}
                  rx={blockRadius}
                  fill="none"
                  stroke={fg}
                  strokeWidth={STROKE_W}
                />
                {ch ? (
                  <text
                    x={block.x + blockSize / 2}
                    y={
                      groupTop +
                      row * (blockSize + doubleGap) +
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
                ) : null}
              </g>
            ))}
          </g>
        ))}
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
