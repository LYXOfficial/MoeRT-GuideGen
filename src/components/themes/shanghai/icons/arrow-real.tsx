import type { FC } from "react";
import type { GlyphBox, GlyphProps } from "./glyph-types";

/**
 * 上海 DB31/T 1104（2025-11 征求意见稿）导向箭头 —— 两个母版。
 *
 * 图形来源与量取方法（**没有手绘近似**）：
 *  - 标准正文与附录里的箭头全部是 150 ppi 位图（`pdfimages -list` 确认），没有矢量图层，
 *    所以按「600 dpi 整页渲染 → 50% 墨量阈值 → 逐行亚像素交点」量取轮廓，
 *    再用最小二乘拟合下面的参数模型（10 个实例交叉验证：图 B.1 上/下/左/右、
 *    图 26 左向、图 27 上向、图 29 左右、图 53 两个下向、图 54 右向）。
 *  - 模型：矩形杆 + 45° 级「人字」头，头的两条臂在外缘处被竖直平切，切高 = 臂厚。
 *
 * 量取结果（以包围盒宽 W 为 1，`UpArrowGlyph` 即按此生成）：
 *  - 头宽 W  : 1.000
 *  - 总高 H  : 1.345        （W:H = 1:1.345 ≈ 3:4.03）
 *  - 头高（尖到臂端平切上沿）: 0.520 = 0.386 H
 *  - 杆宽 2s : 0.251
 *  - 臂厚 T（平切高度）: 0.333
 *  - 缺口顶 = 杆顶 = s/m + T = 0.464（比臂端平切上沿高 0.056）
 *  - 人字臂斜率 dx/dy = 0.9617（即与竖直方向 46.2°，比正 45° 略陡 —— 原图如此）
 *
 * 自检（生成的 path 光栅化后与源图按同一包围盒缩放求 IoU）：
 *  - 图 26 左向 0.993 / 图 27 上向 0.990 / 图 54 右向 0.989（大的干净实例）
 *  - 图 B.1 小图 0.94（源图仅 151×200 px、150 ppi JPEG，边缘本身就有 ±0.5 px 抖动）
 *
 * ⚠️ 关于弯折箭头：**标准里没有 90° 弯折箭头**。附录 B.1 只有 上/下/左/右/四个斜向/
 * 两个 180° 调头/禁止通行；图 53 是四个斜向箭头；图 54 老沪闵路旁那条是「直行右箭头」
 * （282×209，比例与直行母版完全一致，只是转了 90°）。正文检索也没有「拐」字。
 * 因此 `TurnRightGlyph` 是**按同一套比例构造**的：杆宽、人字头（头宽/臂厚/斜率）与
 * `UpArrowGlyph` 逐项相同，只把杆折 90°；折角半径取标准自己的 180° 调头箭头实测值
 * （图 B.1 往左/右调头：中心线半径 = 1.33 × 杆宽，外半径 = 1.83 × 杆宽，
 *  内半径 = 0.83 × 杆宽）。弯折母版包围盒为 1.50 W × 1.40 W（腿长按视觉平衡选定）。
 */

/** 原始名称：直行向上箭头（DB31/T 1104 图 B.1「往前（上）」） */
export const UpArrowGlyph: FC<GlyphProps & GlyphBox> = ({
  color,
  width = "100%",
  height = "100%",
  x,
  y,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path
      d="M12 0L3.078 9.277L3.078 15.226L9.762 8.276L9.762 24L14.238 24L14.238 8.276L20.922 15.226L20.922 9.277Z"
      fill={color}
    />
  </svg>
);

/**
 * 原始名称：右拐（先向上再 90° 右转）弯折箭头。
 * 标准中无此形态（见图 54 说明），杆宽 / 人字头 / 折角半径均取自直行母版的实测值。
 */
export const TurnRightGlyph: FC<GlyphProps & GlyphBox> = ({
  color,
  width = "100%",
  height = "100%",
  x,
  y,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path
      d="M24 8.8L15.681 0.8L10.347 0.8L16.579 6.794L7.343 6.794A7.343 7.343 0 0 0 0 14.137L0 23.2L4.013 23.2L4.013 14.137A3.331 3.331 0 0 1 7.343 10.806L16.579 10.806L10.347 16.8L15.681 16.8Z"
      fill={color}
    />
  </svg>
);

/** 推荐方向右拐（= 直行母版顺时针 90°），供「只需直行右箭头」的牌面使用 */
export const RightArrowGlyph: FC<GlyphProps & GlyphBox> = ({
  color,
  width = "100%",
  height = "100%",
  x,
  y,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    x={x}
    y={y}
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <path
      d="M24 12L14.723 3.078L8.774 3.078L15.724 9.762L0 9.762L0 14.238L15.724 14.238L8.774 20.922L14.723 20.922Z"
      fill={color}
    />
  </svg>
);

/** 别名，保持命名一致 */
export const TurnRightArrowGlyph = TurnRightGlyph;
