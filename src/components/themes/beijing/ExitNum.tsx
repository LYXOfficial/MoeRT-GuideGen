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
 * 出入口编号（M4）：「出口字母 + 附加数字 + 名称」。
 *   左边是大的出口字母（可多字母 A·B·C，每个字母后面可跟编号数字），右边一行中文、一行英文。
 *
 * 版式按官方「出口编号」图纸实测（牌高 1.5a，与号线牌同一模数），整块再 ×0.9 缩放：
 *   纵向自上而下 0.25a（上留白）/ 0.25a（数字区上沿）/ 0.75a（主内容）/ 0.25a（下留白）；
 *   字母 ink 高 1.0a 且上下各留 0.25a，数字 ink 高 0.75a，两者底线齐平（距牌顶 1.25a）；
 *   中文 ink 顶部与数字顶部齐平、在名称列里相对英文居中，字号比图纸的 0.34a 再大一号；
 *   英文比图纸的 0.245a 再小一号，底线仍与字母底线齐平（=牌顶下 1.25a）；
 *   横向：字母与数字之间留 0.05a 再稍放宽，编号列与名称列之间 0.25a，左右再各留 5px。
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
  foreground?: string;
  background?: string;
  background2?: string;
}

export const exitNumDefaultProps: ExitNumProps = {
  exits: [{ letter: "A", number: "" }],
  directions: [],
  textZh: "",
  textEn: "",
  foreground: colors.foreground,
  background: colors.background,
  background2: colors.background,
};

const MAX_EXITS = 10;

/**
 * 出口编号编辑器（与成都「站点编号」同一种做法）：一个出口一张卡片，
 * 卡片里「字母」「附加数字」两个输入框一一对应，底部用 +/− 增删，不需要回车确认。
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
  const scope = "themes.beijing.components.ExitNum.props";
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
  const scope = "themes.beijing.components.ExitNum.props";
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
                {t(`themes.beijing.common.direction4.${d}`)}
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

/**
 * 整体缩放：整块（牌面高 / 字号 / 间距 / 留白）统一 ×0.9。
 * 系数直接乘进每一个尺寸，而不是给盒子挂 CSS transform ——
 * transform 不改变布局盒大小，缩完左右会留下空隙（宽度还是原来的）。
 * 注意：背景要铺满整行 64px（只把内容缩到 0.9 居中），
 * 否则和相邻组件叠在一起时，只有中间 57.6px 盖住邻居，上下各露出 3.2px 的台阶。
 */
const SCALE = 0.9;
/** 行高：背景盒高度，与相邻组件对齐 */
const ROW_H = 64;
/** 牌面（内容）高度 = 1.5a（官方图纸里「出口编号」牌就是 1.5a 高，与号线牌同模数） */
const PLATE_H = ROW_H * SCALE;
/** a（已按 SCALE 缩放） */
const MODULE = PLATE_H / 1.5;
/** 左右各留 5px（与其它组件一致） */
const PAD_X = 5 * SCALE;
/**
 * 字号由图纸 ink 尺寸反推：拉丁 cap = 0.716em（见 define/text.ts），
 * 再按用户微调值放大中文、缩小英文，最后整体 ×SCALE。
 *  字母 ink 1.0a ；数字 ink 0.75a ；中文比图纸大一号、英文小一号、中文顶对齐数字顶
 */
const CODE_SIZE = 59.6 * SCALE;
const NUMBER_SIZE = 44.7 * SCALE;
const ZH_SIZE = 20 * SCALE;
const EN_SIZE = 13 * SCALE;
/** 拉丁 cap 高（em），与 define/text.ts 的口径一致 */
const EN_CAP = 0.716;
/** 汉字视觉 ink 高（em，按微调后的观感取值，用于把中文底线摆到正确位置） */
const ZH_INK = 0.72;
/** 字母与数字之间的间隙：图纸标 0.05a，再稍微拉远一点（墨迹间隙约 3px） */
const NUM_GAP = 1;
/** 编号列与名称列之间（图纸 0.25a） */
const NAME_GAP = MODULE * 0.1;
/** 字母 / 数字 / 英文共用底线：牌顶下 1.25a（= 0.25a + 1.0a） */
const BASE_Y = MODULE * 1.25;
/** 数字 ink 顶部（牌顶下 0.5a）——中文 ink 顶部对齐到这里 */
const DIGIT_TOP = BASE_Y - NUMBER_SIZE * EN_CAP;
/** 中文 ink 底线 = 数字顶部 + 中文 ink 高（顶部对齐数字） */
const ZH_BASE_Y = DIGIT_TOP + ZH_SIZE * ZH_INK;

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
  const fg =
    foreground && foreground.length > 0 ? foreground : colors.foreground;
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

  const codeFont = fontEn("medium", CODE_SIZE);
  const numFont = fontEn("medium", NUMBER_SIZE);
  const zhFont = fontZh("medium", ZH_SIZE);
  const enFont = fontEn("medium", EN_SIZE);

  // 编号排版：字母（大）+ 紧跟其后的附加数字（0.75a 高、底线对齐），多个出口用「·」分隔
  const codeParts: Array<{ text: string; size: number; x: number }> = [];
  let cursor = PAD_X;
  safeExits.forEach((exit, index) => {
    if (index > 0) {
      codeParts.push({ text: "·", size: CODE_SIZE, x: cursor });
      cursor += measureText("·", codeFont);
    }
    if (exit.letter) {
      codeParts.push({ text: exit.letter, size: CODE_SIZE, x: cursor });
      cursor += measureText(exit.letter, codeFont);
    }
    if (exit.number) {
      cursor += NUM_GAP;
      codeParts.push({ text: exit.number, size: NUMBER_SIZE, x: cursor });
      cursor += measureText(exit.number, numFont);
    }
  });
  const codeWidth = cursor - PAD_X;

  const dirZh = safeDirections.map(d => DIRECTION_ZH[d]).join("");
  // 英文组合成一个词、只首字母大写：Southwest / Northeast（不加连字符）
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
  const zhWidth = zhText ? measureText(zhText, zhFont) : 0;
  const enWidth = enText ? measureText(enText, enFont) : 0;

  const nameWidth = Math.max(zhWidth, enWidth);
  const hasName = nameWidth > 0;
  const width = Math.ceil(
    PAD_X + codeWidth + (hasName ? NAME_GAP + nameWidth : 0) + PAD_X
  );

  // 基线固定：字母/数字/英文一条底线，中文 ink 顶部与数字 ink 顶部齐平
  const codeBaseline = BASE_Y;
  const zhBaseline = ZH_BASE_Y;
  const enBaseline = BASE_Y;
  const nameX = PAD_X + codeWidth + NAME_GAP;
  // 中英两行在名称列内各自居中 → 中文相对英文居中
  const zhX = nameX + (nameWidth - zhWidth) / 2;
  const enX = nameX + (nameWidth - enWidth) / 2;

  return (
    <MultiRowBackground
      background={bg}
      background2={background2}
      style={{ height: ROW_H, width }}
    >
      {/* 背景铺满整行，牌面内容按 0.9 缩好后垂直居中 */}
      <div
        style={{
          height: ROW_H,
          width,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <svg width={width} height={PLATE_H} data-fonts-ready={fontsReady}>
        {codeParts.map((part, index) => (
          <text
            key={`code-${index}`}
            x={part.x}
            y={codeBaseline}
            fontSize={part.size}
            fontWeight={WEIGHT_VALUE.medium}
            fill={fg}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {part.text}
          </text>
        ))}
        {zhText ? (
          <text
            x={zhX}
            y={zhBaseline}
            fontSize={ZH_SIZE}
            fontWeight={WEIGHT_VALUE.medium}
            fill={fg}
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
            fill={fg}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {enText}
          </text>
        ) : null}
        </svg>
      </div>
    </MultiRowBackground>
  );
}

ExitNum.getEditorConfig = (t: (key: string) => string) => exitNumEditorConfig(t);

export default ExitNum;
