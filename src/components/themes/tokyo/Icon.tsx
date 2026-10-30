import { InputNumber, Select } from "@douyinfe/semi-ui";
import colors from "./define/colors";
import type { EditorConfig } from "../../../interfaces/editor";
import { Background, backgroundFormItems, foregroundFormItem } from "./Background";
import PICTOGRAMS from "./icons/pictograms";
import MetroMark from "./icons/metro-mark";
import ToeiMark from "./icons/toei-mark";

/**
 * Icon —— 设施图记。
 *
 * 图形全部来自官方《旅客施設用図記号ガイドライン 2025》的矢量页
 * （p12–p31 逐单元提取，见 `icons/pictograms.ts`，**不要手改坐标**）。
 * 图记本身是单色描形，用 `foreground` 上色；**高度可调**，
 * 宽度按各图记自己的宽高比走（官方图形并非都是正方形）。
 */
export interface IconProps {
  /** 图记 id（见 icons/pictograms.ts） */
  icon: string;
  /** 图形高度（px） */
  height?: number;
  foreground?: string;
  background?: string;
}

export const iconDefaultProps: IconProps = {
  icon: "p14-06",
  height: 40,
  foreground: "#ffffff",
  background: colors.background,
};

const SCOPE = "themes.tokyo-metro.components.Icon.props";

/** 下拉里每一项前面画一个小预览（不然一百多个名字根本不知道长什么样） */
function OptionGlyph({ box, paths, kind }: { box: string; paths: string[]; kind?: string }) {
  if (kind === "operator-metro") return <MetroMark size={18} />;
  if (kind === "operator-toei") {
    return (
      <span
        style={{
          width: 18, height: 18, borderRadius: 3, backgroundColor: "#00a041",
          color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <ToeiMark size={14} />
      </span>
    );
  }
  return (
    <svg width={18} height={18} viewBox={box} aria-hidden style={{ flex: "none" }}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}

export const iconEditorConfig = (
  t: (key: string) => string
): EditorConfig => ({
  forms: [
    {
      key: "icon",
      label: `${SCOPE}.icon`,
      element: (
        <Select style={{ width: "100%" }} dropdownMatchSelectWidth>
          {PICTOGRAMS.map(p => (
            <Select.Option key={p.id} value={p.id}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <OptionGlyph box={p.box} paths={p.paths} kind={p.kind} />
                <span>{t(`themes.tokyo-metro.pictograms.${p.id}`)}</span>
              </span>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      key: "height",
      label: `${SCOPE}.height`,
      element: <InputNumber min={8} max={64} />,
    },
    foregroundFormItem(SCOPE),
    ...backgroundFormItems(SCOPE),
  ],
});

function Icon({
  icon = iconDefaultProps.icon,
  height = iconDefaultProps.height,
  foreground = iconDefaultProps.foreground,
  background = iconDefaultProps.background,
}: IconProps) {
  const picto = PICTOGRAMS.find(p => p.id === icon) ?? PICTOGRAMS[0];
  // 彩色运营者标（東京メトロ / 都営）走专用渲染，不是单色路径
  if (picto.kind === "operator-metro" || picto.kind === "operator-toei") {
    const hh = height ?? 40;
    return (
      <Background
        background={background}
        className="flex h-16 items-center justify-center px-1"
        style={{ color: foreground }}
      >
        {picto.kind === "operator-metro" ? (
          <MetroMark size={hh} />
        ) : (
          <div
            style={{
              width: hh, height: hh, borderRadius: Math.round(hh * 0.14),
              backgroundColor: "#00a041", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ToeiMark size={Math.round(hh * 0.78)} />
          </div>
        )}
      </Background>
    );
  }
  const [, , w, h] = (picto?.box ?? "0 0 1 1").split(" ").map(Number);
  const boxH = h || 1;
  const boxW = w || 1;
  const hh = height ?? 40;
  const ww = Math.round((hh * boxW) / boxH);

  return (
    <Background
      background={background}
      className="flex h-16 items-center justify-center px-1"
      style={{ color: foreground }}
    >
      <svg width={ww} height={hh} viewBox={picto.box} aria-hidden style={{ display: "block" }}>
        {picto.paths.map((d, i) => (
          <path key={i} d={d} fill="currentColor" />
        ))}
      </svg>
    </Background>
  );
}

Icon.getEditorConfig = (t: (key: string) => string) => iconEditorConfig(t);

export default Icon;
