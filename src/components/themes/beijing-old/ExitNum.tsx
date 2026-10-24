import { Button, Input, Select, Typography } from "@douyinfe/semi-ui";
import {
  fontEn,
  fontZh,
  measureText,
  useFontsReady,
  WEIGHT_VALUE,
} from "./define/text";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import {
  MultiRowBackground,
  backgroundFormItems,
  foregroundFormItem,
} from "./Background";

/**
 * 出入口编号（经典样式）。
 *
 * 编号区为白底圆角方块 + 深蓝字母/数字（形态参考 visys.pdf 第 7 页
 * 示例 C 的 A/B 字母块：0.5a 方块、圆角 0.085、白底深蓝字；
 * 完整版式待用户参考图校准）。数据模型与新版一致：卡片式编辑器，
 * 一个出口 = 字母 + 可留空的附加数字，多出口横向排列，右侧中英文名称。
 */
export type ExitDirection = "east" | "west" | "south" | "north";

/** 一个出口编号：字母 + 可留空的附加数字（A1 / B / C2 …），字母与数字一一对应 */
export interface ExitCode {
  letter: string;
  number: string;
}

export interface ExitNumProps {
  exits?: ExitCode[];
  directions?: ExitDirection[];
  textZh?: string;
  textEn?: string;
  /** 编号块底色 */
  foreground?: string;
  background?: string;
  background2?: string;
}

export const exitNumDefaultProps: ExitNumProps = {
  exits: [{ letter: "A", number: "" }],
  directions: [],
  textZh: "",
  textEn: "",
  foreground: colors.white,
  background: colors.background,
  background2: colors.background,
};

const MAX_EXITS = 10;

/**
 * 出口编号编辑器（与新版同一种做法）：一个出口一张卡片，
 * 卡片里「字母」「附加数字」两个输入框一一对应，底部用 +/− 增删。
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

  const update = (index: number, field: keyof ExitCode, next: string) => {
    onChange?.(
      exits.map((exit, i) => (i === index ? { ...exit, [field]: next } : exit))
    );
  };

  const addExit = () => {
    if (exits.length >= MAX_EXITS) return;
    onChange?.([...exits, { letter: "", number: "" }]);
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
          <div className="flex items-center mb-2">
            <Typography.Text size="small" className="w-16 mr-2">
              {t(`${scope}.exitLetter`)}
            </Typography.Text>
            <Input
              size="small"
              value={exit.letter}
              onChange={val => update(index, "letter", val)}
              placeholder="A"
            />
          </div>
          <div className="flex items-center">
            <Typography.Text size="small" className="w-16 mr-2">
              {t(`${scope}.exitNumber`)}
            </Typography.Text>
            <Input
              size="small"
              value={exit.number}
              onChange={val => update(index, "number", val)}
              placeholder="1"
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

const DIRECTION_ZH: Record<ExitDirection, string> = {
  east: "东",
  west: "西",
  south: "南",
  north: "北",
};

const DIRECTION_EN: Record<ExitDirection, string> = {
  east: "East",
  west: "West",
  south: "South",
  north: "North",
};

/** 中文习惯先东西后南北（东北/西南），英文习惯先南北后东西（North-East）。 */
const ZH_ORDER: ExitDirection[] = ["east", "west", "south", "north"];
const EN_ORDER: ExitDirection[] = ["north", "south", "east", "west"];

const sortDirections = (
  dirs: ExitDirection[],
  order: ExitDirection[]
): ExitDirection[] =>
  Array.from(new Set(dirs))
    .filter(d => order.includes(d))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));

export const exitNumEditorConfig = (t: (key: string) => string): EditorConfig => {
  const scope = "themes.beijingOld.components.ExitNum.props";
  return {
    forms: [
      {
        key: "exits",
        label: `${scope}.exits`,
        element: <ExitArrayEditor t={t} />,
      },
      {
        key: "directions",
        label: `${scope}.directions.displayName`,
        element: (
          <Select multiple>
            {(["east", "west", "south", "north"] as ExitDirection[]).map(d => (
              <Select.Option key={d} value={d}>
                {t(`themes.beijingOld.common.direction4.${d}`)}
              </Select.Option>
            ))}
          </Select>
        ),
      },
      { key: "textZh", label: `${scope}.textZh`, element: <Input /> },
      { key: "textEn", label: `${scope}.textEn`, element: <Input /> },
      foregroundFormItem(scope),
      ...backgroundFormItems(scope),
    ],
  };
};

const ROW_H = 64;
/** 编号块：白底圆角方块，高 1a（官方图 36：A/B 牌 ≈ 0.65H 方块，行 = 1.5a） */
const BLOCK_H = ROW_H / 1.5;
/** 圆角 0.085 × 块宽（示例 C 白块实测 rx 2.4 / 28.3） */
const BLOCK_R = BLOCK_H * 0.085;
/** 块内左右留白 */
const BLOCK_PAD_X = BLOCK_H * 0.22;
/** 字母 ink 0.45H、数字 ink 0.34H（官方图 36 实测：字母 ink 31px / 69px 行高） */
const LETTER_SIZE = (ROW_H * 0.45) / 0.716;
const NUMBER_SIZE = (ROW_H * 0.34) / 0.716;
/** 字母与数字间隙 */
const NUM_GAP = 1.5;
/** 块与块之间 */
const BLOCK_GAP = 4;
/** 编号区与名称列之间 */
const NAME_GAP = 10;
const EN_CAP = 0.716;
/** 汉字视觉 ink 高（em） */
const ZH_INK = 0.88;
/** 名称列中英文字号（对齐新版口径） */
const ZH_SIZE = 20;
const EN_SIZE = 13;
/** 编号块文字色固定用文字蓝（白底上的经典配色） */
const BLOCK_TEXT = colors.textblue;

function ExitNum({
  exits = exitNumDefaultProps.exits,
  directions = exitNumDefaultProps.directions,
  textZh = exitNumDefaultProps.textZh,
  textEn = exitNumDefaultProps.textEn,
  foreground = exitNumDefaultProps.foreground,
  background = exitNumDefaultProps.background,
  background2 = exitNumDefaultProps.background2,
}: ExitNumProps) {
  const fontsReady = useFontsReady();
  const plateColor =
    foreground && foreground.length > 0 ? foreground : colors.white;
  const bg =
    background && background.length > 0 ? background : colors.background;

  // 每个出口 = 字母 + 可留空的数字（一一对应），空项丢掉
  const safeExits = (Array.isArray(exits) ? exits : [])
    .map(exit => ({
      letter: String(exit?.letter ?? "").trim(),
      number: String(exit?.number ?? "").trim(),
    }))
    .filter(exit => exit.letter.length > 0 || exit.number.length > 0);
  const safeDirections = sortDirections(
    (directions ?? []).filter(Boolean) as ExitDirection[],
    ZH_ORDER
  );

  const letterFont = fontEn("bold", LETTER_SIZE);
  const numberFont = fontEn("bold", NUMBER_SIZE);

  // 编号块：每出口一块白底圆角方块，字母 + 同基线的小号数字
  const blocks: Array<{
    x: number;
    w: number;
    letter: string;
    number: string;
    letterW: number;
  }> = [];
  let cursor = 0;
  const blockTop = (ROW_H - BLOCK_H) / 2;
  safeExits.forEach(exit => {
    const letterW = exit.letter ? measureText(exit.letter, letterFont) : 0;
    const numberW = exit.number ? measureText(exit.number, numberFont) : 0;
    const inner =
      letterW + (exit.letter && exit.number ? NUM_GAP : 0) + numberW;
    const w = inner + BLOCK_PAD_X * 2;
    blocks.push({ x: cursor, w, letter: exit.letter, number: exit.number, letterW });
    cursor += w + BLOCK_GAP;
  });
  const codeWidth = Math.max(0, cursor - BLOCK_GAP);

  const dirZh = safeDirections.map(d => DIRECTION_ZH[d]).join("");
  const dirWords = sortDirections(
    (directions ?? []).filter(Boolean) as ExitDirection[],
    EN_ORDER
  ).map(d => DIRECTION_EN[d]);
  const dirEn =
    dirWords.length > 0
      ? dirWords[0] + dirWords.slice(1).map(w => w.toLowerCase()).join("")
      : "";

  const zhText = [(textZh ?? "").trim(), dirZh].filter(Boolean).join("");
  const enText = [(textEn ?? "").trim(), dirEn].filter(Boolean).join(" ");
  const zhFont = fontZh("medium", ZH_SIZE);
  const enFont = fontEn("medium", EN_SIZE);
  const zhWidth = zhText ? measureText(zhText, zhFont) : 0;
  const enWidth = enText ? measureText(enText, enFont) : 0;

  const nameWidth = Math.max(zhWidth, enWidth);
  const hasName = nameWidth > 0;
  const width = Math.ceil(
    Math.max(BLOCK_H, codeWidth + (hasName ? NAME_GAP + nameWidth : 0))
  );

  // 名称列：中英两行整体垂直居中、两行互相居中
  const nameX = codeWidth + NAME_GAP;
  const zhX = nameX + (nameWidth - zhWidth) / 2;
  const enX = nameX + (nameWidth - enWidth) / 2;
  const nameColH = zhText
    ? ZH_SIZE * ZH_INK + 4 + EN_SIZE * EN_CAP
    : EN_SIZE * EN_CAP;
  const nameTop = (ROW_H - nameColH) / 2;
  const zhBaseline = nameTop + ZH_SIZE * ZH_INK;
  const enBaseline = nameTop + nameColH;

  // 块内基线：字母/数字各自 ink 垂直居中于块
  const letterBaseline = blockTop + (BLOCK_H + LETTER_SIZE * EN_CAP) / 2;
  const numberBaseline = blockTop + (BLOCK_H + NUMBER_SIZE * EN_CAP) / 2;

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      style={{ height: ROW_H, width }}
    >
      <svg width={width} height={ROW_H} data-fonts-ready={fontsReady}>
        {blocks.map((block, index) => (
          <g key={`block-${index}`}>
            <rect
              x={block.x}
              y={blockTop}
              width={block.w}
              height={BLOCK_H}
              rx={BLOCK_R}
              fill={plateColor}
            />
            {block.letter ? (
              <text
                x={block.x + BLOCK_PAD_X}
                y={letterBaseline}
                fontSize={LETTER_SIZE}
                fontWeight={WEIGHT_VALUE.bold}
                fill={BLOCK_TEXT}
                fontFamily="Arial, Helvetica, sans-serif"
              >
                {block.letter}
              </text>
            ) : null}
            {block.number ? (
              <text
                x={block.x + BLOCK_PAD_X + (block.letter ? block.letterW + NUM_GAP : 0)}
                y={numberBaseline}
                fontSize={NUMBER_SIZE}
                fontWeight={WEIGHT_VALUE.bold}
                fill={BLOCK_TEXT}
                fontFamily="Arial, Helvetica, sans-serif"
              >
                {block.number}
              </text>
            ) : null}
          </g>
        ))}
        {zhText ? (
          <text
            x={zhX}
            y={zhBaseline}
            fontSize={ZH_SIZE}
            fontWeight={WEIGHT_VALUE.medium}
            fill={colors.foreground}
          >
            {zhText}
          </text>
        ) : null}
        {enText ? (
          <text
            x={enX}
            y={enBaseline}
            fontSize={EN_SIZE}
            fontWeight={WEIGHT_VALUE.medium}
            fill={colors.foreground}
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
