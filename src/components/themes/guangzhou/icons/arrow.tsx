/**
 * 箭头几何：**造型语言照抄重庆**（人字臂 + 矩形杆，臂端竖直平切），
 * 但按广州实拍比例重排（`docs/guangzhou/raw/ref/user-hanging-11-4x.png` 左箭头实测，
 * 4× 位图 165×147px → 归一化到横向 141）：
 *
 * | 项目 | 重庆（旧） | 广州（新，实测） |
 * |---|---|---|
 * | 总长 : 总宽 | 139 : 141 ≈ 0.99 | 158 : 141 ≈ 1.12 |
 * | 臂端竖直切长（臂粗） | 24 | 34 |
 * | 杆宽 | 18 | 27 |
 * | 头部占长 | 68% | 62%（杆更长） |
 *
 * 因此 `viewBox` 换成 141×158（非正方形），默认 `preserveAspectRatio` 按高度贴合，
 * 图形在 36px 方框里画成 36 长 / 32 宽 —— **组件外框、底板、间距一律不动**。
 */
export type ArrowDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right";

// 基础箭头（朝上）按角度旋转即可得到 8 个方向
const BASE_ROTATION: Partial<Record<ArrowDirection, number>> = {
  up: 0,
  down: 180,
  left: 270,
  right: 90,
  "up-left": 315,
  "up-right": 45,
  "down-left": 225,
  "down-right": 135,
};

// 141 = 横向总宽（左右各 70.5）；158 = 纵向总长
const HEAD_CUT = 33.6; // 臂端竖直切长（决定臂的粗细）
const HEAD_DEEP = 97.8; // 头部沿轴向的深度（刀尖到臂端外角）
const STEM_W = 27; // 杆宽
const STEM_TOP = 32; // 杆起点（略高于头部内凹顶点 33.6）
const TOTAL_LEN = 158;

const HALF_W = 141 / 2; // 70.5
const STEM_L = HALF_W - STEM_W / 2; // 57
const STEM_R = HALF_W + STEM_W / 2; // 84
const APEX_Y = 0;
// 臂外侧斜边在 x=0 / x=141 处到达的 y
const SIDE_Y = HEAD_DEEP - HEAD_CUT; // 64.2
const NOTCH_Y = HEAD_DEEP - SIDE_Y; // 33.6

export default function ArrowIcon({ type }: { type: ArrowDirection }) {
  const rotation = BASE_ROTATION[type] ?? 0;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 141 ${TOTAL_LEN}`}
      // 尺寸走内联样式（Tailwind preflight 的 `height:auto` 会盖掉 height 属性，
      // 非正方形 viewBox 会按宽度撑高、溢出 36px 方框）
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* 左臂（人字）：臂端竖直平切，内侧沿 45° 收回中点 */}
      <path
        d={`M0 ${HEAD_DEEP}L${HALF_W} ${NOTCH_Y}L${HALF_W} ${APEX_Y}L0 ${SIDE_Y}z`}
        fill="currentColor"
        fillRule="evenodd"
      />
      {/* 右臂（人字）：镜像 */}
      <path
        d={`M141 ${HEAD_DEEP}L${HALF_W} ${NOTCH_Y}L${HALF_W} ${APEX_Y}L141 ${SIDE_Y}z`}
        fill="currentColor"
        fillRule="evenodd"
      />
      {/* 杆 */}
      <path
        d={`M${STEM_L} ${STEM_TOP}L${STEM_L} ${TOTAL_LEN}L${STEM_R} ${TOTAL_LEN}L${STEM_R} ${STEM_TOP}z`}
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
