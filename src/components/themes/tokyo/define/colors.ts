const colors = {
  // 透明：间距/空格/分隔线默认（各主题取值一致）
  transparent: "transparent",

  // 底板三色体系：深蓝（乘车/方向）、黄（出口/下行）、白（改札/出入口牌）
  // 深蓝取自照片取样 #0B1F33~#14243A（docs/tokyo/东京メトロ导视系统-中文解读.md §底板三色）
  background: "#0b1f33",
  background2: "#0b1f33",
  // 第三种地面：白底黑字 → background3 + foreground3
  background3: "#ffffff",
  foreground: "#ffffff",
  foreground3: "#000000",
  border: "#e5e7eb",
  specline: "#ffffff",
  // 出口：**黄底黑字**（重庆同款的出口黄）
  exitbackground: "#ffc72c",
  exitforeground: "#000000",
  // 出口号小牌底色（门板编号那类深灰蓝）
  exitnumbackground: "#3d4757",

  // 九条线路色：CI 指南 P9（DIC / CMYK）→ 社区通行 HEX
  lineG: "#ff9500", // 銀座線 オレンジ  DIC163
  lineM: "#f62e36", // 丸ノ内線 レッド  DIC158
  lineH: "#b5b5ac", // 日比谷線 シルバー DIC548
  lineT: "#009bbf", // 東西線 スカイ    DIC138
  lineC: "#00bb85", // 千代田線 グリーン DIC132
  lineY: "#c1a470", // 有楽町線 ゴールド DIC334
  lineZ: "#8f76d6", // 半蔵門線 パープル DIC105
  lineN: "#00ac9b", // 南北線 エメラルド DIC2575
  lineF: "#9c5e31", // 副都心線 ブラウン DIC321

  // ===== 东京都市圈其它线路（缩写即徽章记号；HEX 见 docs/tokyo/布局规范 …§6.2）=====
  lineJY: "#9ACD32", // JY 山手線
  lineJK: "#00B2E5", // JK 京浜東北・根岸
  lineJC: "#F15A22", // JC 中央快速・青梅・五日市
  lineJB: "#FFD400", // JB 中央総武緩行
  lineJE: "#C9242F", // JE 京葉線
  lineJA: "#00AC9A", // JA 埼京・川越
  lineJS: "#E21F26", // JS 湘南新宿ライン
  lineJO: "#0067C0", // JO 横須賀・総武快速
  lineJJ: "#00B261", // JJ 常磐快速
  lineJL: "#808080", // JL 常磐緩行
  lineJU: "#F68B1E", // JU 宇都宮・高崎
  lineJT: "#F68B1E", // JT 東海道・伊東
  lineJM: "#F15A22", // JM 武蔵野線
  lineJN: "#FFD400", // JN 南武線
  lineJI: "#FFD400", // JI 鶴見線
  lineJH: "#9ACD32", // JH 横浜線
  lineR: "#89C6CD", // R りんかい線
  lineMO: "#003686", // MO 東京モノレール
  lineA: "#E85298", // A 浅草線
  lineI: "#0079C2", // I 三田線
  lineS: "#6CBB5A", // S 新宿線
  lineE: "#B6007A", // E 大江戸線
  lineTY: "#DA0442", // TY 東横線
  lineMG: "#009CD2", // MG 目黒線
  lineDT: "#20A288", // DT 田園都市線
  lineOM: "#F18C43", // OM 大井町線
  lineIK: "#EE86A7", // IK 池上線
  lineTM: "#AE0378", // TM 多摩川線
  lineSG: "#FCC70D", // SG 世田谷線
  lineSH: "#890D84", // SH 新横浜線
  lineMM: "#09357F", // MM みなとみらい線
  lineOH: "#0D82C7", // OH 小田原線
  lineOE: "#0D82C7", // OE 江ノ島線
  lineOT: "#0D82C7", // OT 多摩線
  lineKO: "#D5007F", // KO 京王線
  lineIN: "#103675", // IN 井の頭線
  lineSI: "#FF6600", // SI 西武池袋線
  lineSS: "#0099CC", // SS 西武新宿線
  lineSK: "#33CC66", // SK 西武国分寺・西武園
  lineST: "#FFCC33", // ST 西武多摩湖線
  lineSW: "#FF3333", // SW 西武多摩川線
  lineSY: "#FF6600", // SY 西武山口線
  lineTS: "#0F6CC3", // TS 東武スカイツリーライン
  lineTI: "#FF0000", // TI 東武伊勢崎線
  lineTN: "#FFA500", // TN 東武日光線
  lineTD: "#33CCCC", // TD 東武野田線
  lineTJ: "#000099", // TJ 東武東上線
  lineKS: "#005AAA", // KS 京成線
  lineKK: "#33C2E4", // KK 京急線
  lineSO: "#0071C1", // SO 相鉄線
  lineU: "#1662B8", // U ゆりかもめ
  lineNT: "#B53A77", // NT 日暮里・舎人ライナー
  lineSA: "#B53A77", // SA 都電荒川線
};

export default colors;

/** 和文字体：新ゴ（Noto Sans JP 近似，见 fonts/notosansjp.css；缺字回落到 SC） */
export const fontFamilyZh =
  '"Noto Sans JP", "Noto Sans SC", "Source Han Sans JP", "PingFang JP", "Hiragino Sans", "Microsoft YaHei", sans-serif';

/**
 * 欧文/数字字体：**Frutiger**（现场标牌的欧文，2017 实调结论 = Frutiger Bold）。
 * 仓库只有 `Frutiger-Normal.ttf`（LT 55 Roman），700 由浏览器合成粗体；
 * 站号字母另有 Futura（`fontFamilyFutura`），和文用 Noto Sans JP。
 * 兜底顺序：Frutiger → Helvetica → Arial → 和文字体。
 */
export const fontFamilyEn = `Frutiger, Helvetica, Arial, ${fontFamilyZh}`;

/** 站号字母：Futura Bold（CI 指南调查结论），系统缺字回落 Helvetica Bold */
export const fontFamilyFutura = `"Futura Metro", Futura, "Futura PT", "Century Gothic", Helvetica, Arial, ${fontFamilyZh}`;
