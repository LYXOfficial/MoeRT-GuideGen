import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import { Input, Select } from "@douyinfe/semi-ui";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";
import RectModeSelect from "../../RectModeSelect";

export interface LineTextProps {
  lineColor: string;
  chinese?: string;
  english?: string;
  align?: string;
  /** 色块宽度：default = 19 宽（垂直居中）；narrow = 15 宽（旧版式，贴底） */
  rectMode?: "default" | "narrow";
  foreground?: string;
  background?: string;
}

export const lineTextDefaultProps: LineTextProps = {
  lineColor: colors.lines11,
  chinese: "德阳线",
  english: "Deyang Line",
  align: "left",
  rectMode: "default",
  foreground: colors.foreground,
  background: colors.background,
};

export const lineTextEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "lineColor",
      label: "themes.chengdu.components.LineText.props.lineColor",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "chinese",
      label: "themes.chengdu.components.LineText.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chengdu.components.LineText.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chengdu.components.LineText.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chengdu.components.LineText.props.align.left")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chengdu.components.LineText.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "rectMode",
      label: "themes.chengdu.components.LineText.props.rectMode.displayName",
      element: (
        <RectModeSelect

          labelDefault={t("themes.chengdu.components.LineText.props.rectMode.default")}

          labelNarrow={t("themes.chengdu.components.LineText.props.rectMode.narrow")}

        />
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.LineText.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.LineText.props.background",
      element: <CustomColorPicker currentTheme={1} />,
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
  foreground = lineTextDefaultProps.foreground ?? colors.foreground,
  background = lineTextDefaultProps.background ?? colors.background,
}: LineTextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const RS = RECT_STYLES[rectMode ?? "narrow"];
  const rectWidth = RS.w;
  // 中英文都为空 → 只保留色块，去掉色块与文字之间本应存在的间距
  const textEmpty = !(chinese ?? "").trim() && !(english ?? "").trim();

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

    // 先量一次（可能是回退字体），字体就绪后再量、之后每次字体加载完再量。
    // 中文字体是 fonts.loli.net 的远程字体：只 await 一次 fonts.ready 的话，
    // 字体若在这之后才加载完，宽度就一直是回退字体的值 —— 盒子比文字宽一截，
    // 放进双行容器就是「右边空一块、没贴紧」（用户反馈过）。
    measure();
    const fonts = document.fonts;
    const onFontsLoadingDone = () => {
      if (mounted) measure();
    };
    fonts?.addEventListener?.("loadingdone", onFontsLoadingDone);
    fonts?.ready.then(() => {
      if (mounted) measure();
    }).catch(() => {});
    const fontRetryTimers = [60, 240, 800].map(ms =>
      window.setTimeout(() => {
        if (mounted) measure();
      }, ms)
    );

    return () => {
      mounted = false;
      fonts?.removeEventListener?.("loadingdone", onFontsLoadingDone);
      fontRetryTimers.forEach(t => {
        window.clearTimeout(t);
      });
    };
  }, [chinese, english]);

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
            <text x={0} y={32} fontSize={22} fill={foreground}>
              {chinese}
            </text>
            <text x={0} y={48} fontSize={12} fill={foreground}>
              {english}
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
