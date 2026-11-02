import * as G from "./gb-pictograms";

/** 图标注册表：id → 字形 + 中英文名。数据来源 docs/guangzhou/raw/gbicons/index.json。 */
export interface PictogramEntry {
  id: string;
  nameZh: string;
  nameEn: string;
  category: string;
  glyph: (props: { color?: string }) => JSX.Element;
}

const RAW = [
  { id: "002", nameZh: "入口", nameEn: "Entrance", category: "arrow" },
  { id: "003", nameZh: "出口", nameEn: "Exit", category: "arrow" },
  { id: "004", nameZh: "出入口", nameEn: "Entrance / Exit", category: "arrow" },
  { id: "005", nameZh: "楼梯（上行）", nameEn: "Stairs, going up", category: "vertical" },
  { id: "010", nameZh: "自动扶梯（上行）", nameEn: "Escalator, up", category: "vertical" },
  { id: "011", nameZh: "自动扶梯（下行）", nameEn: "Escalator, down", category: "vertical" },
  { id: "013", nameZh: "电梯（客用）", nameEn: "Passenger lift", category: "vertical" },
  { id: "015", nameZh: "男卫生间", nameEn: "Men's restroom", category: "service" },
  { id: "016", nameZh: "女卫生间", nameEn: "Women's restroom", category: "service" },
  { id: "017", nameZh: "卫生间", nameEn: "Restroom", category: "service" },
  { id: "029", nameZh: "公园", nameEn: "Park", category: "surrounding" },
  { id: "032", nameZh: "购物", nameEn: "Shopping", category: "surrounding" },
  { id: "033", nameZh: "超市", nameEn: "Supermarket", category: "surrounding" },
  { id: "034", nameZh: "宾馆", nameEn: "Hotel", category: "surrounding" },
  { id: "035", nameZh: "医院", nameEn: "Hospital", category: "surrounding" },
  { id: "043", nameZh: "邮局", nameEn: "Post office", category: "service" },
  { id: "046", nameZh: "自动取款机", nameEn: "ATM", category: "service" },
  { id: "047", nameZh: "银行", nameEn: "Bank", category: "service" },
  { id: "051", nameZh: "行李寄存", nameEn: "Left luggage", category: "service" },
  { id: "055", nameZh: "婴儿护理台", nameEn: "Baby care table", category: "service" },
  { id: "057", nameZh: "候车室", nameEn: "Waiting room", category: "service" },
  { id: "058", nameZh: "会合点", nameEn: "Meeting point", category: "service" },
  { id: "059", nameZh: "警务", nameEn: "Police", category: "service" },
  { id: "060", nameZh: "售票处", nameEn: "Ticket office", category: "service" },
  { id: "062", nameZh: "问询处", nameEn: "Information desk", category: "service" },
  { id: "064", nameZh: "中餐", nameEn: "Chinese restaurant", category: "surrounding" },
  { id: "065", nameZh: "快餐", nameEn: "Fast food", category: "surrounding" },
  { id: "067", nameZh: "咖啡厅", nameEn: "Cafe", category: "surrounding" },
  { id: "074", nameZh: "信息", nameEn: "Information", category: "service" },
  { id: "076", nameZh: "失物招领", nameEn: "Lost and found", category: "service" },
  { id: "078", nameZh: "停车场", nameEn: "Parking", category: "transport" },
  { id: "079", nameZh: "室内停车场", nameEn: "Indoor parking", category: "transport" },
  { id: "080", nameZh: "自行车停放", nameEn: "Bicycle parking", category: "transport" },
  { id: "082", nameZh: "电话", nameEn: "Telephone", category: "facility" },
  { id: "094", nameZh: "座椅", nameEn: "Seating", category: "facility" },
  { id: "100", nameZh: "紧急呼救", nameEn: "Emergency call", category: "other" },
  { id: "101", nameZh: "禁止通行", nameEn: "No entry", category: "other" },
  { id: "111", nameZh: "禁止吸烟", nameEn: "No smoking", category: "other" },
  { id: "115", nameZh: "禁止进入", nameEn: "No entry for persons", category: "other" },
];

export const PICTOGRAMS: PictogramEntry[] = RAW.map(item => ({
  ...item,
  glyph: (G as unknown as Record<string, (props: { color?: string }) => JSX.Element>)[
    `Pictogram${item.id}`
  ],
})).filter(item => typeof item.glyph === "function");

export const pictogramById = (id: string): PictogramEntry | undefined =>
  PICTOGRAMS.find(item => item.id === id);
