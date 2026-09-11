import colors from "./colors";

/**
 * 北京轨道交通线路元数据。
 * color 键对应 define/colors.ts 中的线路色键；textColor 依据标准 §1.1.3.4 的蓝字/白字规则推导。
 */
export interface LineDef {
  /** 线路 id（同时作为 colors 中的键名） */
  id: string;
  nameZh: string;
  nameEn: string;
  /** 线路标志色键（colors 的键） */
  colorKey: string;
  color: string;
  /** 叠在线路色上的文字颜色 */
  textColor: string;
  /** 与其它线路同色时，说明其合并关系 */
  mergedWith?: string;
}

const def = (
  id: string,
  nameZh: string,
  nameEn: string,
  colorKey: string,
  mergedWith?: string
): LineDef => ({
  id,
  nameZh,
  nameEn,
  colorKey,
  color: (colors as Record<string, string>)[colorKey],
  textColor: "white",
  mergedWith,
});

export const lines: LineDef[] = [
  def("line1", "1号线", "Line 1", "line1", "八通线"),
  def("line2", "2号线", "Line 2", "line2"),
  def("line3", "3号线", "Line 3", "line3"),
  def("line4", "4号线", "Line 4", "line4", "大兴线"),
  def("line5", "5号线", "Line 5", "line5"),
  def("line6", "6号线", "Line 6", "line6"),
  def("line7", "7号线", "Line 7", "line7"),
  def("line8", "8号线", "Line 8", "line8"),
  def("line9", "9号线", "Line 9", "line9"),
  def("line10", "10号线", "Line 10", "line10"),
  def("line11", "11号线", "Line 11", "line11"),
  def("line12", "12号线", "Line 12", "line12"),
  def("line13", "13号线", "Line 13", "line13"),
  def("line14", "14号线", "Line 14", "line14"),
  def("line15", "15号线", "Line 15", "line15"),
  def("line16", "16号线", "Line 16", "line16"),
  def("line17", "17号线", "Line 17", "line17"),
  def("line18", "18号线", "Line 18", "line18"),
  def("line19", "19号线", "Line 19", "line19"),
  def("line22", "22号线", "Line 22", "line22"),
  def("linebatong", "八通线", "Batong Line", "line1", "1号线"),
  def("linedaxing", "大兴线", "Daxing Line", "line4", "4号线"),
  def("lineyizhuang", "亦庄线", "Yizhuang Line", "lineyizhuang"),
  def("linefangshan", "房山线", "Fangshan Line", "linefangshan", "燕房线"),
  def("lineyanfang", "燕房线", "Yanfang Line", "linefangshan", "房山线"),
  def("lines1", "S1线", "S1 Line", "lines1"),
  def("linechangping", "昌平线", "Changping Line", "linechangping"),
  def("line28", "28号线", "Line 28", "line28"),
  def("linexijiao", "西郊线", "Xijiao Line", "linexijiao", "亦庄T1线"),
  def("lineyizhuangt1", "亦庄T1线", "Yizhuang T1 Line", "linexijiao", "西郊线"),
  def(
    "linecapitalairport",
    "首都机场线",
    "Capital Airport Express",
    "linecapitalairport"
  ),
  def(
    "linedaxingairport",
    "大兴机场线",
    "Daxing Airport Express",
    "linedaxingairport"
  ),
];

export const findLine = (id: string): LineDef | undefined =>
  lines.find(l => l.id === id);

export default lines;
