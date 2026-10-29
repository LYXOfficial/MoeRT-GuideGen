import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import { Input, Select } from "@douyinfe/semi-ui";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import RectModeSelect from "../../RectModeSelect";
import { normalizeSvgLine } from "../../../utils/svgText";

export interface LineTextProps {
  lineColor: string;
  chinese?: string;
  english?: string;
  align?: string;
  /** 色块宽度：default = 19 宽（垂直居中）；narrow = 15 宽（旧版式，贴底） */
  rectMode?: "default" | "narrow";
  /** 数字行为：prominent = 数字放大用 Frutiger（默认）；flat = 数字与文字同大，用 Helvetica */
  digitMode?: "prominent" | "flat";
  foreground?: string;
  background?: string;
}

export const lineTextDefaultProps: LineTextProps = {
  lineColor: colors.linebitong,
  chinese: "璧铜线",
  english: "Bitong Line",
  align: "left",
  rectMode: "default",
  digitMode: "prominent",
  foreground: colors.foreground,
  background: colors.background,
};

export const lineTextEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "lineColor",
      label: "themes.chongqing.components.LineText.props.lineColor",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "chinese",
      label: "themes.chongqing.components.LineText.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chongqing.components.LineText.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chongqing.components.LineText.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chongqing.components.LineText.props.align.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chongqing.components.LineText.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "rectMode",
      label: "themes.chongqing.components.LineText.props.rectMode.displayName",
      element: (
        <RectModeSelect

          labelDefault={t("themes.chongqing.components.LineText.props.rectMode.default")}

          labelNarrow={t("themes.chongqing.components.LineText.props.rectMode.narrow")}

        />
      ),
    },
    {
      key: "digitMode",
      label: "themes.chongqing.components.LineText.props.digitMode.displayName",
      element: (
        <Select>
          <Select.Option value="prominent">
            {t("themes.chongqing.components.LineText.props.digitMode.prominent")}
          </Select.Option>
          <Select.Option value="flat">
            {t("themes.chongqing.components.LineText.props.digitMode.flat")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chongqing.components.LineText.props.foreground",
      element: <CustomColorPicker currentTheme={0} />,
    },
    {
      key: "background",
      label: "themes.chongqing.components.LineText.props.background",
      element: <CustomColorPicker currentTheme={0} />,
    },
  ],
});

// 色块宽度两档（和「数字线路」保持一致）：
//   default = 19×52，垂直居中（y=6）；narrow = 原来那档 15×52 贴底（y=12）
const RECT_STYLES = {
  default: { w: 19, h: 52, y: 12, pad: 9 },
  narrow: { w: 15, h: 52, y: 12, pad: 5 },
} as const;

function LineText({
  lineColor = lineTextDefaultProps.lineColor,
  chinese = lineTextDefaultProps.chinese,
  english = lineTextDefaultProps.english,
  align = lineTextDefaultProps.align,
  // 注意：不给默认值 —— 老存档里没有这个字段，要按「窄」渲染（迁移）；
  // 新拖入的组件带着 defaultProps 里的 "default"（宽），不受影响
  rectMode,
  // 数字行为默认「突出」：老存档里没有这个字段也按突出渲染（和旧版一致）
  digitMode = "prominent",
  foreground = lineTextDefaultProps.foreground ?? colors.foreground,
  background = lineTextDefaultProps.background ?? colors.background,
}: LineTextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const RS = RECT_STYLES[rectMode ?? "narrow"];
  const rectWidth = RS.w;
  // 供 JSX 内嵌闭包安全使用
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const chineseText = normalizeSvgLine(chinese ?? lineTextDefaultProps.chinese);
  const englishText = normalizeSvgLine(english);
  // 中英文都为空 → 只保留色块，去掉色块与文字之间本应存在的间距
  // 只有空白的字段按「空」算（渲染时空格照旧保留）
  const textEmpty = !chineseText.trim() && !englishText.trim();

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        const totalWidth =
          rectWidth + (textEmpty ? 0 : RS.pad) + bbox.width;
        setSvgWidth(totalWidth);
      }
    };

    // 先量一次（多半是回退字体），字体就绪后再量、之后每次字体加载完再量：
    // 中文字体是 fonts.loli.net 的远程字体，只 await 一次 fonts.ready 的话，
    // 字体若在这之后才加载完，盒子就按回退字体的宽度定死了 —— 文字被裁掉（用户实测）。
    measure();
    const fonts = document.fonts;
    const onLoadingDone = () => {
      if (mounted) measure();
    };
    fonts?.addEventListener?.("loadingdone", onLoadingDone);
    fonts?.ready
      .then(() => {
        if (mounted) measure();
      })
      .catch(() => {});
    const fontRetryTimers = [60, 240, 800].map(ms =>
      window.setTimeout(() => {
        if (mounted) measure();
      }, ms)
    );

    return () => {
      mounted = false;
      fonts?.removeEventListener?.("loadingdone", onLoadingDone);
      fontRetryTimers.forEach(t => {
        window.clearTimeout(t);
      });
    };
  }, [chineseText, englishText]);

  // 汉字里的数字分段出来。digitMode = "prominent"（默认）时数字放大
  // （fontSize 30、Frutiger）+ dy 偏移；"flat"（持平）时数字与文字同大同基线，
  // 字体改用 Helvetica 而不是 Frutiger。dy 对后续 tspan 累积，
  // 所以逐段维护偏移、给每段显式 dy，避免「越来越歪」。
  const DIGIT_DY = 1; // 数字基线相对普通文字的偏移
  const chineseSegs = (() => {
    let offset = 0;
    return chineseText
      .split(/(\d+)/)
      .filter(Boolean)
      .map(seg => {
        const isDigit = /^\d+$/.test(seg);
        const prominent = isDigit && digitMode === "prominent";
        const desired = prominent ? DIGIT_DY : 0; // 该段想要落到的基线偏移
        const dy = desired - offset; // 相对当前累积偏移的补偿量
        offset = desired;
        return { seg, isDigit, prominent, dy };
      });
  })();

  // 矩形位置
  const rectX = align === "left" ? 0 : svgWidth - rectWidth;

  // 文字组位置
  // 文字紧挨色块：间距跟色块档位走（宽档 9 / 窄档 5）
  const textTranslateX =
    align === "left" ? rectWidth + RS.pad : svgWidth - rectWidth - RS.pad;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="h-16 ml-1.25 mr-1.25" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          {/* 矩形 */}
          <rect
            width={rectWidth}
            height={RS.h}
            x={rectX}
            y={RS.y}
            fill={lineColor}
          />

          {/* 文字组 */}
          <g
            ref={textGroupRef}
            transform={`translate(${textTranslateX}, 0)`}
            textAnchor={align === "right" ? "end" : "start"}
          >
            <text x={0} y={32} fontSize={22} fill={foreground} xmlSpace="preserve">
              {chineseSegs.map((seg, idx) =>
                seg.prominent ? (
                  <tspan
                    key={idx}
                    dy={seg.dy}
                    fontSize={30}
                    fill={foreground}
                    fontFamily="Frutiger, Helvetica, sans-serif"
                  >
                    {seg.seg}
                  </tspan>
                ) : (
                  <tspan
                    key={idx}
                    dy={seg.dy}
                    fill={foreground}
                    fontFamily={seg.isDigit ? "Helvetica, sans-serif" : undefined}
                  >
                    {seg.seg}
                  </tspan>
                )
              )}
            </text>
            <text x={0} y={48} fontSize={12} fill={foreground} xmlSpace="preserve">
              {englishText}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

LineText.getEditorConfig = (t: (key: string) => string) =>
  lineTextEditorConfig(t);
export default LineText;
