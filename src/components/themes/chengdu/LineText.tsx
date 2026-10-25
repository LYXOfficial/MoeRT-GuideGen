import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import { Input, Select } from "@douyinfe/semi-ui";
import type { EditorConfig } from "../../../interfaces/editor";
import CustomColorPicker from "../../CustomColorPicker";

export interface LineTextProps {
  lineColor: string;
  chinese?: string;
  english?: string;
  align?: string;
  foreground?: string;
  background?: string;
}

export const lineTextDefaultProps: LineTextProps = {
  lineColor: colors.lines11,
  chinese: "德阳线",
  english: "Deyang Line",
  align: "left",
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

function LineText({
  lineColor = lineTextDefaultProps.lineColor,
  chinese = lineTextDefaultProps.chinese,
  english = lineTextDefaultProps.english,
  align = lineTextDefaultProps.align,
  foreground = lineTextDefaultProps.foreground ?? colors.foreground,
  background = lineTextDefaultProps.background ?? colors.background,
}: LineTextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const rectWidth = 15;
  const margin = 5; // 矩形和文字的间距
  // 中英文都为空 → 只保留色块，去掉色块与文字之间本应存在的间距
  const textEmpty = !(chinese ?? "").trim() && !(english ?? "").trim();

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        const totalWidth =
          rectWidth + (textEmpty ? 0 : margin) + bbox.width;
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
  const textTranslateX =
    align === "left" ? rectWidth + margin : svgWidth - rectWidth - margin; // 让文字紧挨矩形左边

  return (
    <div style={{ backgroundColor: background }}>
      <div className="h-16 ml-1.25 mr-1.25" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          {/* 矩形 */}
          <rect
            width={rectWidth}
            height={52}
            x={rectX}
            y={12}
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
