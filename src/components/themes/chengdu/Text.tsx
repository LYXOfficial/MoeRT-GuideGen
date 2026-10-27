import { useRef, useState, useEffect } from "react";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Input, Select } from "@douyinfe/semi-ui";
import CustomColorPicker from "../../CustomColorPicker";
import { normalizeSvgLine } from "../../../utils/svgText";

export interface TextProps {
  chinese: string;
  english: string;
  align?: "left" | "center" | "right";
  foreground?: string;
  background?: string;
}
export const textDefaultProps: TextProps = {
  align: "left",
  chinese: "换乘",
  english: "Transfer",
  foreground: colors.foreground,
  background: colors.background,
};

export const textEditorConfig = (t: (key: string) => string): EditorConfig => ({
  forms: [
    {
      key: "chinese",
      label: "themes.chengdu.components.Text.props.chinese",
      element: <Input />,
    },
    {
      key: "english",
      label: "themes.chengdu.components.Text.props.english",
      element: <Input />,
    },
    {
      key: "align",
      label: "themes.chengdu.components.Text.props.align.displayName",
      element: (
        <Select>
          <Select.Option value="left">
            {t("themes.chengdu.components.Text.props.align.left")}
          </Select.Option>
          <Select.Option value="center">
            {t("themes.chengdu.components.Text.props.align.center")}
          </Select.Option>
          <Select.Option value="right">
            {t("themes.chengdu.components.Text.props.align.right")}
          </Select.Option>
        </Select>
      ),
    },
    {
      key: "foreground",
      label: "themes.chengdu.components.Text.props.foreground",
      element: <CustomColorPicker currentTheme={1} />,
    },
    {
      key: "background",
      label: "themes.chengdu.components.Text.props.background",
      element: <CustomColorPicker currentTheme={1} />,
    },
  ],
});

export default function Text({
  chinese = textDefaultProps.chinese,
  english = textDefaultProps.english,
  align = textDefaultProps.align,
  foreground = textDefaultProps.foreground,
  background = textDefaultProps.background,
}: TextProps) {
  const textGroupRef = useRef<SVGGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  // 只把制表/换行换成空格（首尾、中间的空格全部保留），渲染侧配 xmlSpace="preserve"
  // 量宽和渲染必须用同一个串，否则空格数对不上（多空格被折叠/被丢掉的老毛病）
  const zhText = normalizeSvgLine(chinese);
  const enText = normalizeSvgLine(english);

  useEffect(() => {
    let mounted = true;

    const measure = () => {
      if (textGroupRef.current) {
        const bbox = textGroupRef.current.getBBox();
        setSvgWidth(bbox.width);
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
  }, [zhText, enText]);

  // 对齐时的起始 x 坐标
  let groupX = 0;
  if (align === "center") groupX = svgWidth / 2;
  if (align === "right") groupX = svgWidth;

  return (
    <div style={{ backgroundColor: background }}>
      <div className="ml-1.25 mr-1.25" style={{ width: svgWidth }}>
        <svg className="h-full" width={svgWidth} height={64}>
          <g
            ref={textGroupRef}
            transform={`translate(${groupX}, 0)`}
            textAnchor={
              align === "center"
                ? "middle"
                : align === "right"
                  ? "end"
                  : "start"
            }
          >
            <text x={0} y={32} fontSize={22} fill={foreground} xmlSpace="preserve">
              {zhText}
            </text>
            <text x={0} y={48} fontSize={14} fill={foreground} xmlSpace="preserve">
              {enText}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// 添加静态方法
Text.getEditorConfig = (t: (key: string) => string) => textEditorConfig(t);
