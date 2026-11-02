import { Input, Button, Typography } from "@douyinfe/semi-ui";
import colors, { fontFamilyEn } from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { THEME_INDEX } from "./Background";
import CustomColorPicker from "../../CustomColorPicker";

/**
 * 车站编号（白底胶囊 + 线路色描边 + 中竖线）。
 *
 * 版式（用户 2026-11-03 明确）：
 *  - 每枚胶囊**各自**一块贴身的白底（1px 内缩、圆角 = 高一半），**没有**外圈灰线；
 *  - 多枚时：1 枚单行 / 2 枚竖排 / 3 枚品字（上一下二）/ 4 枚 2×2；
 *  - 站序不足两位自动补 0；
 *  - 尺寸写死，不给调，方便连着添加；
 *  - 编辑器照成都：每条一张卡（线路号 + 站点号），底部 +/-。
 */
export interface StationNumItem {
  /** 线路号（纯文本，如 "1"、"GF"、"APM"），决定描边色 */
  line: string;
  /** 站点号 */
  number: string;
  /** 这枚胶囊的描边色（可空；空则跟随 line 的线路色） */
  color?: string;
}

export interface StationNumProps {
  items?: StationNumItem[];
  /** 胶囊内部填充色 */
  fillColor?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 胶囊外面那层白底的颜色 */
  plateColor?: string;
  /** 组件背景色（板底衬，落板时按板色固化） */
  background?: string;
}

/** 胶囊高度（写死） */
const PILL_H = 18;
/** 白底外扩（四向严格等距） */
const PLATE_PAD = 2;
/** 同一行两枚白底之间 */
const COL_GAP = 0;
/** 行与行之间：共用一块底板，不再留缝 */
const ROW_GAP = 0;

export const stationNumDefaultProps: StationNumProps = {
  items: [{ line: "1", number: "14", color: colors.line1 }],
  fillColor: colors.white,
  textColor: colors.black,
  plateColor: colors.white,
  background: colors.transparent,
};

/** 编辑器：成都那套「一条一张卡 + 底部 +/-」 */
function ItemsEditor({
  value,
  onChange,
}: {
  value?: unknown;
  onChange?: (value: StationNumItem[]) => void;
}) {
  const items: StationNumItem[] = Array.isArray(value)
    ? (value as StationNumItem[])
    : (stationNumDefaultProps.items ?? []);

  const patch = (index: number, key: keyof StationNumItem, next: string) => {
    onChange?.(items.map((item, i) => (i === index ? { ...item, [key]: next } : item)));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-solid border-gray-300 p-3 rounded-sm">
          <div className="mb-2">
            <CustomColorPicker
              currentTheme={THEME_INDEX}
              value={item.color && item.color !== "" ? item.color : colors.line1}
              onChange={next => patch(index, "color", String(next ?? ""))}
            />
          </div>
          <div className="flex items-center mb-2">
            <Typography.Text size="small" className="w-16 mr-2">
              线路号
            </Typography.Text>
            <Input
              size="small"
              value={item.line}
              placeholder="如: 1"
              onChange={v => patch(index, "line", String(v))}
            />
          </div>
          <div className="flex items-center">
            <Typography.Text size="small" className="w-16 mr-2">
              站点号
            </Typography.Text>
            <Input
              size="small"
              value={item.number}
              placeholder="如: 01"
              onChange={v => patch(index, "number", String(v))}
            />
          </div>
        </div>
      ))}

      <div className="flex gap-2 items-center justify-center">
        <Button
          type="primary"
          size="small"
          disabled={items.length >= 4}
          onClick={() => {
            if (items.length >= 4) return;
            const next = items.length + 1;
            onChange?.([...items, { line: String(next), number: "01", color: colors.line1 }]);
          }}
        >
          +
        </Button>
        {items.length > 0 && (
          <Button
            type="danger"
            size="small"
            disabled={items.length <= 1}
            onClick={() => onChange?.(items.slice(0, -1))}
          >
            -
          </Button>
        )}
      </div>
    </div>
  );
}

export const stationNumEditorConfig = (
  _t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "items",
      label: "themes.guangzhou.components.StationNum.props.items",
      element: <ItemsEditor />,
    },
    {
      key: "fillColor",
      label: "themes.guangzhou.components.StationNum.props.fillColor",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "textColor",
      label: "themes.guangzhou.components.StationNum.props.textColor",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "plateColor",
      label: "themes.guangzhou.components.StationNum.props.plateColor",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
    {
      key: "background",
      label: "themes.guangzhou.components.StationNum.props.background",
      element: <CustomColorPicker currentTheme={THEME_INDEX} />,
    },
  ],
});

/** 行切分：1 单行；2 竖排；3 品字；4 两行两列 */
function toRows(list: StationNumItem[]): StationNumItem[][] {
  if (list.length <= 1) return [list];
  if (list.length === 2) return [[list[0]], [list[1]]];
  if (list.length === 3) return [[list[0], list[1]], [list[2]]];
  return [list.slice(0, 2), list.slice(2, 4)];
}

/** 站点号：纯数字且只有一位时补前导 0 */
const pad2 = (value: string) => (/^\d$/.test(value) ? `0${value}` : value);

function StationNum({
  items = stationNumDefaultProps.items,
  fillColor = stationNumDefaultProps.fillColor,
  textColor = stationNumDefaultProps.textColor,
  plateColor = stationNumDefaultProps.plateColor,
  background = stationNumDefaultProps.background,
}: StationNumProps) {
  const list = (Array.isArray(items) ? items : []).filter(
    item => item && (item.line !== undefined || item.number !== undefined)
  );
  const rows = toRows(list);
  const h = PILL_H;
  const border = Math.max(2, Math.round(h * 0.12));
  const fs = Math.round(h * 0.63);
  const padX = Math.round(h * 0.2);

  // 多行时正中间那个点四块外扩都够不到，补一小块白
  const centerPatch = rows.length > 1 ? (PLATE_PAD + border) * 2 + 4 : 0;

  return (
    <div
      className="h-16 flex items-center"
      // 衬底本身向外溢出 PLATE_PAD + 描边，组件两侧还要再留 3px，
      // 否则衬底正好贴着组件边缘（看着像没有左右边距），shadow 也会盖到相邻组件
      style={{
        paddingLeft: PLATE_PAD + border + 3,
        paddingRight: PLATE_PAD + border + 3,
        backgroundColor: background,
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{ rowGap: ROW_GAP, position: "relative", isolation: "isolate" }}
      >
        {centerPatch > 0 && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: centerPatch,
              height: centerPatch,
              marginLeft: -centerPatch / 2,
              marginTop: -centerPatch / 2,
              backgroundColor: plateColor,
              borderRadius: 1,
              zIndex: 0,
            }}
          />
        )}
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-center"
            style={{ columnGap: COL_GAP }}
          >
            {row.map((item, index) => {
              // 颜色完全由用户指定，不根据输入的线路名去猜
              const stroke =
                item.color && item.color !== "" ? item.color : colors.line1;
              return (
                <span
                  key={`${rowIndex}-${index}`}
                  className="inline-flex items-center"
                  style={{
                    position: "relative",
                    height: h,
                    borderRadius: h / 2,
                    border: `${border}px solid ${stroke}`,
                    backgroundColor: fillColor,
                    color: textColor,
                    fontFamily: fontFamilyEn,
                    fontSize: fs,
                    lineHeight: 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {/* 白底走 z-index:-1 的独立层：四向等距外扩，但始终压在胶囊下面，
                      不会像 box-shadow 那样盖住隔壁胶囊 */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      // 绝对定位参照的是「padding box」，所以要把 border 宽度补上，
                      // 否则白底会被边框吃掉一圈（左边距会看起来没有）
                      left: -(PLATE_PAD + border),
                      top: -(PLATE_PAD + border),
                      right: -(PLATE_PAD + border),
                      bottom: -(PLATE_PAD + border),
                      borderRadius: h / 2 + PLATE_PAD + border,
                      backgroundColor: plateColor,
                      zIndex: -1,
                    }}
                  />
                  <span
                    style={{
                      paddingLeft: padX,
                      paddingRight: Math.round(padX * 0.4),
                      borderRight: `${border}px solid ${stroke}`,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.line}
                  </span>
                  <span
                    style={{
                      paddingLeft: Math.round(padX * 0.4),
                      paddingRight: padX,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {pad2(item.number)}
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

StationNum.getEditorConfig = (t: (key: string) => string) =>
  stationNumEditorConfig(t);

export default StationNum;
