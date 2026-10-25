# AGENTS.md — 交接文档（北京导视主题）

> 最后更新：2026-10-24。交接自上一任 agent（实现了北京**新版**主题 + 编辑器交互修复）。
> 下一阶段目标：**M8 北京旧版（2015 / 经典样式）导视组件库**。
> 提交现状：HEAD = `a1ab3b2`，工作区干净。

---

## 1. 项目与命令

轨道交通导视牌 Web 编辑器（React 18 + TS + Vite 7 + Tailwind v4 + Semi UI + @dnd-kit + modern-screenshot + i18next，pnpm）。

```bash
pnpm exec tsc -b                          # 类型检查（每步必跑）
pnpm exec biome check <files>             # lint（项目没有 eslint，pnpm lint 不可用）
pnpm build                                # 产物构建（每步必跑）
pnpm dev                                  # 开发服务器（5173 端口，常有常驻实例，改完刷新即可看）
```

- 背景色等视觉验收依赖 5173 的热更新，改完组件让用户刷新查看即可。
- 每完成一个改动都要 `tsc -b` + `biome check` + `build` 三绿。

## 2. 当前进度

- ✅ 北京**新版**主题（`src/components/themes/beijing/`，`THEME_INDEX = 3`）全部完成：
  LineNum / Text / DualText / LoopNextStation / Arrow / TrainDirection / ExitNum /
  ExitIcon / Icon / SpecLine / Spacing / Blank，`tsc -b`、biome、build 全绿，已提交。
- ✅ **M8 北京旧版（2015 / 经典样式）主题已完成**（2026-10-24）：
  `src/components/themes/beijing-old/`，THEME_INDEX 4，key `themes.beijingOld`，
  tsc / biome / build 三绿已提交。要点见 §4 末尾「旧版主题」，遗留项见 §9。
- ✅ 编辑器交互（PC + 移动端）：拖拽/点按判定、触屏长按、小元件热区、删除区可见矩形、
  编辑菜单稳定性、整页缩放禁用等，全部修复并提交（见 §7/§8）。
- ✅ **全应用深色/浅色模式**（2026-10-25）：初始跟随浏览器 `prefers-color-scheme`，
  手动切换后写 `localStorage['guide-theme-mode']` 覆盖。实现要点见 §7 末尾「深色模式」。

## 3. 主题架构契约（新主题必须遵守）

1. `src/components/themes/themereg.ts` 的数组**顺序即 THEME_INDEX**：
   `["themes.chongqing", chongqing] 0 / chengdu 1 / hongkong 2 / beijing 3`。
   旧版注册为第 5 项（建议 key `themes.beijingOld` 或 `themes.beijing-old`，5 个语言都要加 displayName）。
2. 每个组件文件导出形状：`XxxProps`、`xxxDefaultProps`、`xxxEditorConfig(t): EditorConfig`、
   组件上挂静态 `Xxx.getEditorConfig = t => xxxEditorConfig(t)`。
3. **`Spacing` 和 `SpecLine` 必须在 `src/components/DraggableItem.tsx` 里注册**
   （每个主题各 import 一次，用于 `isSpacing`/`isSpecLine` 判定：flex:1 拉伸、z-index 10、
   透明热区）。新主题不加这两行，间距组件和分隔线就会交互异常。
4. 背景统一用 `Background.tsx`（beijing 目录）导出的 `MultiRowBackground`（background /
   background2 用 hard-stop 线性渐变上下分色，避免 1–2px 接缝），以及
   `backgroundFormItems / foregroundFormItem / numberFormItem / textFormItem / weightFormItem /
   digitFormItem` 表单项工厂。
5. 文字工具在 `beijing/define/text.ts`：`weightCss(TextWeight|number)`（`fontZh(500,…)` 传
   数字也行）、`fontZh/fontEn(weight,size)`、`measureText`（canvas 量宽，无 DOM 时按字号估算）、
   `normalizeSvgLine`（SVG 空白预处理，见 §7）、`useFontsReady`（云端字体就绪后再量宽）。
6. 图标字形统一走 `beijing/icons/glyph-types.ts` 的 `GlyphProps { color, secondary?, ground? }`
   + `GlyphBox`；所有 `*-real.tsx` 是脚本生成的**真实 PDF 矢量**，不要手改坐标。
7. i18n：`public/locales/{zh-CN,zh-TW,en-US,ja-JP,ko-KR}/translation.json` 五语言必须同步，
   键布局 `themes.beijing.components.<Comp>.props.*` 与 `themes.beijing.common.*`。
   写入方式：Python `json.load(object_pairs_hook=OrderedDict)` 改完 `indent=2 + 末尾换行`（保持既有格式）。
8. **组件背景要铺满整行 64px**（高刚好 64，与相邻组件对齐），内容才能按比例缩放居中 ——
   ExitNum 曾因背景盒跟着缩到 57.6px，与出口图标相邻时上下露出 3.2px 台阶（§8-15）。

## 4. 北京新版文件与关键常量

> ⚠️ 下面带 🖐 的常量是**用户亲手调过的**，只能用 `edit` 做最小 diff 修改，禁止整文件重写。

| 文件 | 要点 |
|---|---|
| `define/colors.ts` | 新版底色 `background:#142134`；`exit:#25aa41`、`prohibit:#db1c30`、`facility:#00adef`、`facilityfemale:#ed127c`、`aedsubstrate:#eb851d`；32 条线路色（vitool 实测）。**旧版经典深蓝是 `#092f52`**（已注释在文件里） |
| `define/text.ts` | `TextWeight = normal/medium/bold`，`WEIGHT_VALUE = {400,600,800}`，`weightCss` 接受数字；`normalizeSvgLine` |
| `fonts/` | `arial.css`（`/fonts/Arial.ttf`，已提交）+ `sourcehansans.css`（fonts.loli.net 的 Noto Sans SC 400/500/600/700/800） |
| `LineNum.tsx` 🖐 | `SIZE_SPEC.blockH:65 / numInk:0.55 / padTop:0.104 / bandRatio:0.26 / padX:0 / outerMargin:5`；固定字号 42/18/10；`numScale 0.85`、`NUM_SLOT_SCALE`、`numSpacing -5/-3`；`zhBaseline = contentTop + 20`；`numLeftNudge 2 / textLeftNudge 5`；英文右对齐（`textAnchor="end"`，`-1` 微调）；**中文也右对齐到 `textRight = textX + max(zh,en)`**（英文更长时中文跟着走，无数字时两行居中不受影响）；`<text xmlSpace="preserve">`（多空格可见，见 §7）；`SMALL_SCALE 0.62` 整体缩放（注意：该模式背景盒也缩，与满高组件相邻可能露台阶，用户尚未要求改） |
| `Text.tsx` 🖐 | TextArea 多行输入、不设换行宽度；`fontSizeZh 25 / fontSizeEn 15` 钳制 8–48；`lineGap 4 (0–40)`；ink 高度定位（`zhInk 0.88em / enCap 0.716em / enDesc 0.25em`），zh 行距 1.05em、en 1.2em |
| `DualText.tsx` 🖐 | 195×107 参考图 ×0.598：`ZH 11 / EN 6.7`，基线 20.4/28.7/46.1/53.8，`TEXT_WEIGHT = 500`（数字！同时喂给 fontZh/fontEn 和 fontWeight），无 maxWidth、无换行 |
| `LoopNextStation.tsx` 🖐 | `NEXT 12.2/7.5`、`STATION 17.7/10.5`，权重 500（数字），ink 间距 4.2；`PAD_X 5`；`NEXT_EN_SCALE_X 0.9`（绕对齐边缩放）；align 默认 left |
| `Arrow.tsx` | 比例：`.121/.402/.103/.14/.056/.075`，`ARROW_ASPECT 1.163`；`showText` 默认 **false**；align 移动整体；`MODULE_PADDING = 64/6`；文本权重 normal |
| `TrainDirection.tsx` | 英文全 bold；`PAD_X 5` 常驻两侧；`EN_INWARD 1`；zh 25 / en 15，基线 32.5/49.3；textAnchor tspans 对齐 |
| `ExitNum.tsx` 🖐 | 见 §8-12/15：`SCALE 0.9`，`ROW_H 64`（背景铺满整行），`PLATE_H 57.6`，`MODULE = PLATE_H/1.5`（≈38.4，a ≈ 38.4px）；字号 `59.6/44.7/20/13 × SCALE`（字母/数字/中文/英文）；`BASE_Y 1.25a`、`DIGIT_TOP`、`ZH_BASE_Y = DIGIT_TOP + 20×0.72×SCALE`；`NUM_GAP 1`、`NAME_GAP 0.1a`、`PAD_X 4.5`；`exits: {letter, number}[]` 一一对应（卡片式编辑器，同成都 StationNumber 的做法，最多 10 个，空项过滤，多出口用「·」分隔）；方向英文合成一个词 `Southwest/Northeast`（只首字母大写） |
| `ExitIcon.tsx` | 形态 `exitA/exitB/exitC/exitLongA/exitLongB/emergency`，aspect `0.734/0.867/2.0/3.0/3.0/1.833`；内容色与底板固定（不下沉到前景色选项）；**exitLongB = exitLongA 换色**（白底绿字，复用 `ExitLongAGlyph`，不用素材里大 4/3 倍的那版大字）；盒恒 64 高，inset 时 icon 52 居中（INSET 6 / INSET_X 5） |
| `Icon.tsx` | 37 项：`COLORED 15`（fixed 配色）+ `MONO 17`（跟随前景色）+ `OTHER 5`；`BOX 64 / GLYPH_SIZE 44`；`fullBleed` 仅 no_entry_light（scale 1.0345）；MONO 预览黑底白字；aed 用 prohibit 色；无 terminal/city-terminal |
| `SpecLine.tsx` | 宽 `width:3` 默认，黄 `specline`，高 64，`z-10` |
| `Spacing/Blank` | displayName 与其它主题对齐：**间距 / 空格**（用户特意改名，勿改回「填充/空白」） |

## 5. 矢量提取管线（`docs/beijing/raw/`，整个 docs/ 已 gitignore）

**原则：禁止凭空造型。所有图形必须从原始 PDF 矢量提取。**

原始文件（本地在、不入库）：`visys.pdf`（北轨视觉系统 2025，19 页）、`stdrd.pdf`（DB11/T 657.2—2024 改编版，38 页）、`extra.ai`（补充图形）。

工具链：
```bash
pdftocairo -svg -f N -l N visys.pdf pageN.svg          # 矢量页 → SVG
pdftotext -bbox -f N -l N visys.pdf pageN.txt.html     # 词坐标 → 名称映射
python3 extract.py pageN.svg pageN.txt.html out.json   # 单元格网格 + 名称 → JSON
python3 extract_windows.py spec.json out.json          # 按窗口名抽（配合 spec-*.json）
python3 gen_batch.py jobs.json                          # JSON → icons/*-real.tsx
python3 text_probe.py                                   # 解析 <use> 得到真实字型度量
```

- `gen_batch.py` preset：`white`（全白）/ `exit`（绿→ground、白→color）/ `exit2`（深绿+亮绿+白）/
  `city` / `noentry`（红→color、白→secondary、底色→ground）；支持 `tight_viewbox`、
  `only_fill`，以及**按单元格覆盖**的 `cellPresets` / `cellOnlyFill`（同页 A/B 配色角色不同时用）。
- `jobs.json` 记录了全部生成任务（源页 → 目标文件 → 单元格名）。
- visys.pdf 页码 → 内容：p1 城市特殊图形 / p2 线路标志 / p3 箭头暗底+出口AB+禁止通行 /
  p4 箭头亮底+出口特殊样式ABC+紧急出口 / p5–6 设施（暗/亮底） / **p7 经典样式（旧版素材！）** /
  p8 其他图标 / p9–10 站台站名标志牌 / p11–18 各尺寸横向标志牌（含全部 a 模数标注）/ p19 版权。
- 比例换算：图标网格里**底板方格 = 1a，PDF 内 ≈ 84.8pt；本项目 1a ↔ 64px**，即 24 个
  viewBox 单位 ↔ 64px。注意 ExitNum 是另一套语境：**牌面 1.5a = 64px 行**（×0.9 后 57.6px），
  那里的 a ≈ 38.4px —— 两个 a 不要混用。
- 用户给的参考截图都存在 `docs/beijing/raw/ref/`（exitnum-ref.webp 及 5x 放大图、
  exitnum-now2.webp、exitnum-exiticon-overlap.webp、exitlongb-user.webp 等），量像素用 PIL。

## 6. 北京地铁参考资料（链接全录）

来源均为 **NaL – Central Go** 制作的“非官方”北京轨道交通视觉系统（CC BY-NC-SA 4.0，
署名-非商业-相同方式共享；README 已附出处链接，保持即可）：

| 资料 | 链接 | 说明 |
|---|---|---|
| 下载中心（**主入口**，本会话全部 PDF/AI/字体都来自这里） | https://centralgo.site/download/ | visys.pdf、stdrd.pdf、extra.ai、字体 |
| 官网首页（PDF 封面印刷的地址） | https://centralgo.site （亦作 http://centralgo.site） | |
| VI 系统介绍页 | https://centralgo.site/vi/ | vitool 帮助弹窗「更多信息」指向此处 |
| Arial Medium 字体直链 | http://centralgo.site/files/fonts/arialmedium.otf | extra.ai 首页标注的官方字体下载 |
| 导向标志设计器（vitool，在线工具） | 从 https://centralgo.site/download/ 或仪表盘 https://centralgo.site/tool.html 进入 | 可交互查看图标素材库，含「新版/经典」筛选 —— **旧版素材也从这里拿**；本地只抓了 `docs/beijing/raw/vitool.html + vitool.js` 两个文件（它引用的 `./assets/` 没抓下来；vitool.js 里有 `window.colorPalette` / `COLOR_MODE_RULES`，新版配色即取自它） |
| 标准依据 | DB11/T 657.2—2024《公共交通客运标志 第 2 部分：城市轨道交通》（改编版即本地 stdrd.pdf；原版标准可按编号在北京市地方标准库检索） | stdrd.pdf 38 页含：版面设计要素、颜色（CMYK）、各标志尺寸标注、附录 A 线路色 CMYK 表、附录 B 站位置标志示例 |

字体方案（新版）：中文思源黑体（Normal/Medium/Bold，经 fonts.loli.net 引 Noto Sans SC），
西文与数字 Arial / Arial Medium（标准 §1.1.4.3）。

## 7. 踩过的坑（前车之鉴）

**测量与渲染**
- SVG `letterSpacing` 无单位 = px，不是 em；宽度公式 `rendered = measureText + spacing × (字符数-1)`。
- `fontZh(500, …)` 曾因 `WEIGHT_VALUE[500]` 为 undefined 得到 `"undefined 11px…"` → canvas 回退字体
  → 量宽偏小、文字被裁。`weightCss` 现在接受数字；`TEXT_WEIGHT = 500` 必须同时喂测量和 fontWeight。
- SVG `<text>` 默认 `xml:space="default"` 会**折叠连续空格**，而 measureText 按原字符串计宽 →
  「英文多空格只显示一个、色块却变长」。已用 `normalizeSvgLine` + `xmlSpace="preserve"` 修复
  （仅 LineNum；Text/DualText/LoopNextStation/TrainDirection/ExitNum 还没加，用户未要求）。
- 中文 ink ≈ 0.88em、拉丁 cap ≈ 0.716em，所有基线都用 ink 推导，别用 fontSize 居中。

**图标 / 视图箱**
- 宽扁图形放进方形 viewBox 会被 letterbox 缩小 → 生成脚本要带 `tight_viewbox`。
- PDF 里的白色版面底盘（格子的背景方块）必须从字形路径里剔除，否则整块白底。
- `ROLE_OVERRIDE` 可按图标覆盖角色槽（如 AED 的闪电 = secondary）。

**布局 / CSS**
- 组件盒高必须 64px 铺满整行（ExitNum 台阶教训，§4）。
- 行容器 `overflow` 必须两轴都 `hidden`（`overflow-x-hidden` 会把另一轴变 auto 冒出滚动条）；
  溢出内容直接裁掉是用户要求。
- 行与行背景接缝：MultiRowBackground 用 hard-stop 渐变，别用两个 div。
- `body`/外壳高度用 `100dvh`（`global.css` 已覆盖 `.h-screen`），否则移动端地址栏收放整页跳动。

**dnd-kit / 编辑器交互（都是血泪，改前先读懂）**
- `{...listeners}` 之后再写同名 `onPointerDown` 会**覆盖** dnd-kit 的激活监听 → 彻底拖不动；
  要叠加自己的逻辑只能用 **capture 变体**（`onPointerDownCapture` 等）。
- 但 `onPointerUpCapture` 里**绝不能 stopPropagation**：PointerSensor 在 document 上等
  pointerup 结束「按下待命」，掐断它 PC 上会「点一下就开始拖」。
- 触屏拖完后浏览器补发的**兼容性鼠标事件**（mousedown+mouseup 几乎同时）会误触「点按」判定、
  误关编辑菜单；点按判定用 pointer 事件 + `hasMovedRef(>10px)` + `transform` 位移判断，
  菜单外部关闭用 mousedown + **400ms 宽限期** + Semi 浮层白名单（`.semi-portal` 等）。
- **不能用 pointerdown 做外部关闭判定**：会绕过 Semi 浮层只拦 mousedown 的内部保护，
  选个下拉选项整个菜单就没了；也不能在弹窗根节点掐断 pointerdown/mousedown（同理，且
  Semi 自己的「点外部收起下拉」会失效）。
- TouchSensor（长按激活）**只该给组件列表卡片用**（列表 `touch-action: pan-y` 可滚动）；
  画板组件曾因全局长按导致「点一下就进拖拽」。已通过在 `DraggableItem` 里对 `boardItem`
  摘掉 `onTouchStart` 解决。sensors：`PointerSensor distance:8` + `TouchSensor delay:250 tolerance:8`。
- 组件 `margin: 0 -1px` 压接缝 + hover/选中置顶 z-40 会盖住 1–3px 的分割线；已用透明热区
  （`hitPad`，ResizeObserver 实测宽度补到 14px/zoom）+ `.guide-item-hit-expand z-50` 解决。
- 删除区（组件栏）droppable 用**可见矩形**（`src/utils/visibleRect.ts` + `data-trash-root` +
  Editor 自定义 measure）：列表可滚动、移动端在抽屉里，整块矩形会把「拖出画布」误判成删除；
  完全不可见时矩形挪到视口外。
- **拖拽到双行容器最左/最右 1/6** 时 collision 过滤可能把 `pool` 清空 → `pool[0].id` 白屏
  （用户实测炸过）。现在空则回退 `base`，且 `pool` 为空有兜底 return。改 collision 前先读 §8-20。
- DragOverlay 的位移要除以真实屏幕缩放；`DraggableItem` 用 `useLayoutEffect`+ResizeObserver
  实时量（绘制前），否则跨行重挂首帧比例失真（手拖很远元素只挪一点/抖动）。
- 拖拽期间：`activeDrag` 时画布手势（单指平移/双指缩放）一律忽略；document 上非被动
  `touchmove` preventDefault + `body touch-action:none`；viewport 已加
  `maximum-scale=1.0, user-scalable=no`。

**工程**
- `pnpm lint` 不可用（无 eslint 配置），用 `pnpm exec biome check`。
- `src/components/themes/chongqing/NumAlphabet.tsx` 是用户手改的（fontFamily Frutiger）——**不许 revert**。
- 5173 上常年挂着 dev server；`docs/` 整体 gitignore，原始素材不会入库。
- locales 手改时保持既有 JSON 风格（2 空格缩进 + 末尾换行），别整文件重排。

**深色模式（2026-10-25，全应用）**
- 双通道切换：`html.dark`（Tailwind v4 `@custom-variant dark`，global.css）+ `body[theme-mode=dark]`
  （Semi 自带深色主题，semi.css 已含两套 token，无需额外引 CSS）。状态在
  `src/hooks/useDarkMode.ts`，`index.html` body 开头有一段内联脚本首帧前套用（防闪白）。
- 深色表面色对齐 Semi token：bg-0 `#16161a` / bg-1 `#232429` / 边框 `#2e2e35`～`#3a3b42`。
- 覆盖元素级内联颜色时**不能上 `!important`**：导出流程靠内联 `border:none` 去掉画板外框，
  `!important` 会盖过它把边框漏进导出图 —— 画板边框改用 `var(--guide-board-border-override, 主题色)`
  方案（global.css 里 `html.dark` 定义 override）。
- Semi Slider 把手写死 `--semi-color-white`，深色下要在 global.css 单独压成暗色。
- 深色 hover 覆盖写在 `@media (hover: hover)` 里，天然避开触屏粘滞高亮（别挪回全局）。
- 切换按钮位置（用户拍板）：桌面在右上按钮组**最右**（GitHub 之后）；移动端在「更多」
  **左边（倒数第二）**。浅色显示月亮、深色显示太阳（IconMoon/IconSun）。

## 8. 用户反馈记录（每条都已修复，按时间序）

1. 「你的样式完全不一样，抄 svg 重新读 pdf」→ 全面改为 PDF 矢量提取（§5）。
2. line 样式不对 → LineNum 按 PDF 重做（底板=背景色、色带、内容居中）。
3. 箭头与文字间距不对 → 按标准图比例重排 Arrow。
4. 禁止通行的预览不是实际图标 → Icon 预览用真实字形 + 固定配色。
5. 彩色图标定色、非彩色跟随前景色、砍重复色、白色图标候选框里换黑色预览。
6. text 组件：不设换行宽度、多行 TextArea、字号可调（钳 8–48）。
7. 溢出行部分直接隐藏（overflow 两轴 hidden）。
8. 改背景色后面的背景没用 → ExitIcon 背景与图形配色解耦、盒恒 64 高。
9. 出口长A/长B（= 出口特殊样式 A/B）→ 提取 visys p4（A 绿底白字 3.0；B **= A 换色**：
   白底绿字、同字形同尺寸——素材里那版大 4/3 的绿字是用户明确不要的）。
10. 出口长B 又被当「只有图形」做错过一轮 → 最终定案如上。
11. 出入口编号：图二官方布局（牌高 1.5a、字母 ink 1.0a、数字 0.75a、中文 0.34a、英文 0.245a、
    间隙 0.05a/0.25a）+ 左右 5px。
12. 数字和字母间距拉远（NUM_GAP → 1）、中文相对英文居中 + 顶对齐数字顶 + 大一号
    （ZH 20）、英文小一号（EN 13）。
13. 整体 ×0.9 但**不能用 scale**（会留边距）→ 系数乘进所有尺寸。
14. 不要 `South-West`，要 `Southwest`。
15. ExitNum 与出口图标挤一块：字母缩了、背景没缩 → 背景铺满整行 64px、内容 0.9 居中（§3-8）。
16. 字母编号/附加数字括号说明删掉；字母数字一对一 → 卡片式编辑器（同成都站点编号）。
17. 删除非空行弹确认「真的要删除此行吗，行内的组件将被清空」（空行直接删）。
18. 总行数 >1 时第一行也要有减号、可删。
19. LineNum 英文多空格：显示折叠但色块变长 → normalizeSvgLine + xmlSpace=preserve。
20. 拖到双行容器边缘白屏（`pool[0].id` crash，成都主题复现）→ §7 兜底修复。
21. 移动端：必须先横拖再上拖 / 拖拽时整页被缩放位移 → TouchSensor 长按 + 拖拽期手势屏蔽。
22. PC 点一下就进拖拽（我引入的 stopPropagation bug）→ 移除。
23. 菜单点一下就消失 / 拖一半蹦菜单 / 菜单编辑不了 / 点别处应关掉二级下拉 →
    pointer 判定 + 宽限期 + Semi 白名单，**别再动这套**（§7）。
24. 拖出画布没进组件列表也删除 + 遮罩铺满整块 → 可见矩形。
25. 「填充→间距」「空白→空格」改名（5 语言）。
26. 彻底禁止整页缩放 → viewport user-scalable=no。
27. LineNum 英文比中文长时中文对齐英文（不影响无数字居中）→ 右对齐锚点。

## 9. 北京旧版（2015 / 经典样式）主题 —— 已完成，遗留项如下

**已完成**（2026-10-24）：`src/components/themes/beijing-old/`，THEME_INDEX 4，key `themes.beijingOld`。
- 底色 `#092f52`（vitool 经典模式 --mode-bg）；线路色沿用 vitool 官方 32 色板 hex；
  「出口绿」#25aa41 与新版一致（visys p7 实测）。
- **素材提取**：`docs/beijing/raw/extract_p7.py`（p7 专用提取器）+ `jobs-p7-old.json` /
  `jobs-p5-old.json`（走 gen_batch.py）→ `beijing-old/icons/{arrow,exit,train,facilities}-real.tsx`。
  燕尾箭头 ×8（左右 56.6×35.4pt、斜 43.4×43.5pt）、方形直角出口牌、乘车车头标
  （实心 TrainSolid / 线稿 TrainOutline / 外框环 TrainFrame 三形态，可拆拼）、
  方框设施图标 ×17（p5 第 13–29 格，图形自带圆角方框描边）。
- **布局语境**：官方 DB11/T 657.2—2024 示例图（官方原版 PDF 已下载到 /tmp/bjold/，
  docs/ 不入库）校准：**行高 = 1.5a、方形模块（车头标方块/线路牌/字母牌/设施框）= 1a ≈ 42.7px、
  EXIT 绿块满行、元素间距 ≈ 0.25–0.4a、中文 ink ≈ 0.5a**。visys p7 手册网格是另一个语境
  （行 = 1.4a，a = 56.6pt），两套 a 不要混用。
- 组件差异：LineNum = 线路色圆角矩形（rx 0.075a、1.85a/1.95a 宽、数字 ink 0.742a 居中、
  号线 0.4a + Line 0.188a 互相居中、墨迹间隙 0.303a/0.065a —— 用 canvas
  actualBoundingBox 扣 bearing）；**无色带、无 small 档（有 size=small 缩放）**；
  Arrow 只有 8 方向；**ToTrain 新组件**（图案=前景色、方块/描边颜色独立可空，
  编辑器用 `nullableColorFormItem` + `NullableColorField`）；ExitNum = 白底圆角块
  + 深蓝字母数字（块 1a、字母 ink 0.45H，完整版式待用户参考图校准）；
  SpecLine = 单色白线（经典无黄线）；Icon = 17 个方框图标跟随前景色
  （暗底/亮底复用同一套，靠前景/背景切换，**不做两套图标**）。
- **旧版不做双行背景**：backgroundFormItems 只暴露一项背景色；组件 props 里的
  background2 保留但永不进编辑器。
- i18n：5 语言 `themes.beijingOld.*` 全套（components displayName 复制自新版同名组件，
  ToTrain 自带五语）；colors 按旧版 colors.ts 键集过滤（37 键）。

**遗留 / 待用户输入**：
1. ExitNum 完整版式（块尺寸/字号/间距）等用户发参考图后校准（当前是官方图 36 近似值）。
2. 旧版禁止/警告类图标（visys p7 无此内容）——需要用户指路素材或按官方标准图近似。
3. TrainDirection / LoopNextStation / DualText / Text 沿用新版字号体系，未按旧版标准复核。
4. 旧版数字字体疑似窄体（p7「1」ink 宽高比 0.367 vs Arial 0.49），用户若提出再换 Helvetica/
   其它窄体并调 numSpacing。

**工具备忘**：
- visual-reviewer subagent 识图仅供参考，矢量以 SVG 提取为准；官方 PDF 示例是位图
  （pdfimages 确认），布局用「识图量比例 → a 模数换算」。
- 网页验收：IAB 截图可用 `document.documentElement.style.zoom` 临时放大；
  cua.drag 大概率触发页面刷新（zoom 等内存态会丢）；高清组件截图用页面内
  `import("/node_modules/.vite/deps/modern-screenshot.js").domToPng(el, { scale })`。

## 10. 协作方式（重要）

- **用户会并发手改文件**：改前必读、用 `edit` 最小 diff、绝不整文件重写
  （LineNum / Text / DualText / LoopNextStation / ExitNum 都被他手调过）。
- 用户习惯「发截图 + 一句话」，先用 PIL 量像素再动手，数值要有出处（PDF pt、a 模数、
  截图实测），修完在回复里给出测量表。
- 视觉验收靠 5173 热更新；每次改动结束跑三件套（tsc / biome / build）。
- 图标几何永远走提取管线，别手绘。
