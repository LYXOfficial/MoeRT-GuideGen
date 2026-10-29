# AGENTS.md — 交接文档（北京导视主题）

> 最后更新：2026-10-28。导出图片保真度修复（见 §7「导出图片」/§8-36，tsc / biome / build 三绿）。
> 下一阶段目标：**M8 北京旧版（2015 / 经典样式）导视组件库**。（已实现）

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
- 除非用户在这一轮明确要求，否则不要擅自 `push`，依情况可以 `commit`。

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
- ✅ **多存档管理**（2026-10-25）：`src/utils/archiveStore.ts` + `src/components/ArchiveDialog.tsx`。
  顶栏文件夹入口 + 当前存档名；新建 / 切换 / 重命名 / 创建副本 / 下载 / 删除 / 导入（单个存档 JSON）/
  清除全部；自动保存只写活动存档；旧单存档自动迁移。要点见 §7 末尾「多存档」。

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
7. i18n：`public/locales/{zh-CN,zh-HK,yue-HK,en-US,ja-JP,ko-KR,ru-RU,de-DE,fr-FR,es-ES,pt-PT}/
   translation.json` **11 语言必须同步**（新增键 11 份都要加），
   键布局 `themes.beijing.components.<Comp>.props.*` 与 `themes.beijing.common.*`。
   写入方式：Python `json.load(object_pairs_hook=OrderedDict)` 改完 `indent=2 + 末尾换行`（保持既有格式）。
   校验脚本思路：比对键集合（复数后缀 `_one/_few/_many/_other` 视为同一族）+ `{{占位符}}` 一致性。
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
- SVG `<text>` 默认 `xml:space="default"` 会**折叠连续空格、丢掉首尾空格**，而 measureText /
  `getBBox` 按原字符串计宽 → 「打多个空格只显示一个、盒子却按多个空格算宽」或「空格完全不算」。
  **全主题所有文字组件**已统一修复（2026-10-28）：`src/utils/svgText.ts` 的
  `normalizeSvgLine`（只把制表/换行换成空格，**首尾空格保留、不 trim**）+ 渲染侧
  `xmlSpace="preserve"`，量宽与渲染用同一个串。新增文字组件照此办理。
  注意：判断「字段是否为空」仍用 `.trim()`（只有空格的字段按空处理），但渲染时那串空格照旧保留。
- 中文 ink ≈ 0.88em、拉丁 cap ≈ 0.716em，所有基线都用 ink 推导，别用 fontSize 居中。

**图标 / 视图箱**
- 宽扁图形放进方形 viewBox 会被 letterbox 缩小 → 生成脚本要带 `tight_viewbox`。
- PDF 里的白色版面底盘（格子的背景方块）必须从字形路径里剔除，否则整块白底。
- `ROLE_OVERRIDE` 可按图标覆盖角色槽（如 AED 的闪电 = secondary）。

**布局 / CSS**
- 组件盒高必须 64px 铺满整行（ExitNum 台阶教训，§4）。
- **画板左右不能留 1px 内边距**（`pl-px pr-px` 已删）：组件设了跟底板不同的背景色时，
  那 1px 会在最左/最右各露一条底板色，导出图里也是。行首/行尾的组件同时要
  `flushLeft/flushRight`（不给 -1px 负边距），否则它会被行容器的 `overflow:hidden` 裁掉 1px，
  同样露底板色。
- 行容器 `overflow` 必须两轴都 `hidden`（`overflow-x-hidden` 会把另一轴变 auto 冒出滚动条）；
  溢出内容直接裁掉是用户要求。
- 行与行背景接缝：MultiRowBackground 用 hard-stop 渐变，别用两个 div。
- **组件虚线框（DraggableItem 的 outline）必须 `outlineOffset: -2px` 画在盒内**（2026-10-29）：
  outline 默认画在盒子外侧，上下相邻两行之间，上一行组件的 2px 虚线框下缘正好横在行边界上
  （outline 在堆叠绘制最后一步，盖住下一行顶部），看起来就是「关了分隔线行间还有白缝/虚线缝」，
  且与分隔线开关无关。收到盒内后虚线框贴着组件自身边缘画。
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

**双行容器（2026-10-25 重做，成都主题 `chengdu/TwoRowContainer.tsx`）**
- 布局模型：容器宽度 `W = max(30, minWidth, 最宽行内容跨度 × 0.5 + 1)`；两行等宽，
  行外层 `width:100%`、内层 `.two-row-inner`（未缩放布局）宽度写死 `W / SCALE`。
  **间距能撑开的前提就是内层有个确定宽度**，`fit-content` 时间距只会收成 0。
- 量宽度要用**子元素实际占据的区间**（`max(offsetLeft+offsetWidth) - min(offsetLeft)`），
  不能累加各自 `offsetWidth`：组件之间靠 `margin: 0 -1px` 压接缝，累加会把每条缝隙都算成宽度，
  条目越多右边剩的空越大（实测 2 条 4px、7 条 9px，就是用户看到的「右边空一块没贴紧」）。
- 文本类组件（出口名称/站点名称/文字/线路标/方向）宽度来自 `getBBox()`。**只 `await` 一次
  `document.fonts.ready` 会留下残影**：中文字体是 fonts.loli.net 的远程字体，若它在这之后才加载完，
  量到的一直是回退字体的宽度 → 盒子比文字宽一截（同样表现为「空一块」）。
  现在统一改成：先量一次 + `fonts.ready` + `fonts` 的 `loadingdone` + 60/240/800ms 重试。
- 间距（`flex:1`）不算进自然宽度：它撑开的是剩余空间，算进去会让容器越量越宽（死循环）。
  `DraggableItem` 给间距挂了 `data-guide-spacing="true"`，测量时跳过它。
  **只跳过元素不够**（2026-10-26 恶性 bug）：间距后面的组件 `offsetLeft` 包含间距已撑开的
  宽度，位置跨度仍会被污染 → 容器每测量周期涨 1px 永续变宽（实测 137px/s，只在间距
  后面还有组件/间距在行首时触发）。必须把该行所有间距的 `offsetWidth` 累加后从跨度里
  扣掉——Spacing 是 `flex:1 1 0%` 固有宽度 0，扣除后正好还原自然跨度。
- `.two-row-inner` **必须 `alignItems: stretch`**：间距/空格是 `height:100%`，
  父级一旦是 `center` 它们就没有高度可撑，盒子塌成 0（容器里的间距/空格点不着就是这个）。
- `minWidth` 是用户可调参数（编辑器里的「最小宽度」，下限 **30**）；内容更宽时以内容为准。
- 拖入落点：**行尾一律算「追加到这一行」**。以前左右各留 1/6 宽边带都判成「插到容器前/后」，
  容器窄（98px）时行尾那 1/6 正好被甩到右边的主行里（用户实测）。现在只有左端一条
  `min(20px, 宽度×0.15)` 的窄边带判「插到容器前」，且边带必须跟宽度成比例，
  否则 30px 宽的容器有一大半区域拖不进去。行级命中（带 `containerId`/`rowIndex`）
  要排在裸容器前面，`over` 落在容器本身时落点处理认不出目标行、会静默退回主行。

**浮层贴边（2026-10-25）**
- 编辑弹窗（`.editing-popup`）定位带 `anchor`（触发组件的矩形）：**右侧放不下就翻到左侧**
  （以前只是把弹窗夹回视口，组件靠右时正好盖住组件）；垂直和组件顶对齐，下方溢出就上移贴边。
- 颜色面板（296×344）除了自己算 `topLeft/bottomLeft`，还在打开后连跟 ~90 帧做**视口纠偏**：
  用 CSS 独立属性 `translate` 写内联（不能用 `transform` —— Semi 入场动画在 transform 上，
  `fill-mode: forwards` 会盖住内联值）。**每帧要先把自己的 translate 清掉再量**，
  否则量到的是纠偏后的位置、下一帧算出 0 又推回去，来回振荡（实测就卡在这个坑里）。
  纠偏要连跟而不是量一次：Semi 会在入场动画结束后再定位一次。
- 全站浮层钳制 `utils/portalClamp.ts` 有两道必踩的坑：
  ① 它监听全站 `style`/`class` 又自己写 `translate`，写读序列化不一致就 **写→触发→再写死循环**
  （线上点主题下拉整页卡死）→ 用 `running` 重入锁 + 写完 `takeRecords()` + 数值比较（差 <0.5px 不写）；
  ② Semi 把**还没显示 / 已隐藏**的浮层停在 `(-9999, -9999)`，那不是「跑到屏幕外」，
  去钳制它会把浮层拽到画布外几千 px 并留下 translate，表现是「不卡了但弹不出来」→
  见到哨兵坐标（< -5000）只清掉自己写的 translate 再跳过，别的什么都不做。
- 间距/空格的命中热区改成按**屏幕宽度**判断（`offsetWidth × zoom < 14`）：
  原来直接拿布局 px 比，双行容器（×0.5）里明明只有 4~9px 宽的间距被当成「够宽」而不补热区。
- 窄屏（390px）实测：编辑弹窗、颜色面板、Select 下拉都能完整落在视口内。

**导出图片（2026-10-28）**
- **宽高都可改、互相等比联动**（2026-10-29）：`ExportDialog` 里两个 `Input` 都能编辑，
  改任一边另一边按「画板原始宽高比」自动跟随（`setWidthKeepingRatio` /
  `setHeightKeepingRatio`，比例 = `baseHeight / baseWidth`）。打开对话框时**宽高都从 DOM 现量**
  （`guide.offsetWidth / offsetHeight`），不再用 `guideHeight` 这个 prop —— 它是 App 里
  `ResizeObserver` 上报的，而那个 observer 只在挂载时认一次画板节点，换主题/重挂后会失联，
  高度会停在旧值（出现过「三行 64 应该是 192/196，对话框却给 263」这种怪数）。
- **导出默认 2×、不乘 devicePixelRatio**（2026-10-29 用户拍板）：打开对话框时 `width = 画板宽 × 2`、
  `height = 行数×64 × 2`（`EXPORT_DEFAULT_SCALE = 2`），不再乘 DPR —— 以前 512 宽的板在 135% 屏上
  默认给 691，现在一律 1024×128。倍率滑条 `0.5 … 16`、**step 0.5**，刻度只标 `0.5×/2×/4×/8×/16×`
  （按真实倍率线性定位，1× 只有 3% 宽，标了会重叠）。输入框上限同步到 16×。
- **导出尺寸按内容盒算**（2026-10-29 用户拍板）：高度基准取 `guide.clientHeight`（行数×64），
  不是 `offsetHeight`（+4px 边框）；克隆时把画板边框整个去掉（`style.borderWidth: "0px"`）——
  边框只是编辑辅助线，去掉后内容正好铺满画布（512 宽画板 → 克隆实测 512×64，行高 64 不多不少）。
  以前保留边框盒会把内容整体压低/右移 2px，并且让「三行 64」变成 196 而不是 192。
- **不能改真实节点的 `transform` 再导出**：modern-screenshot 克隆节点时**不会带上
  `transform-origin`**（克隆根的 `transform` 在、origin 丢，回退成 `50% 50%`）。于是只要
  导出宽度 ≠ 画板宽度，内容就会绕克隆根中心缩放并整体平移 —— 实测 1.5× 只剩左上角一小块
  字、2× 整张全空（只剩背景色）。正确做法：不改真实节点，把
  `transform: scale(width/画板宽)` + `transformOrigin: "top left"` 放进 `domToPng` 的
  `style` 选项（只作用于克隆根，且后于 computed style 写入）。
- 导出宽度 ≠ 画板宽度时**必须**靠上面的 transform：`width` 选项只改克隆根盒子尺寸，
  子元素宽度是原 DOM 的 computed px，不会跟着重排。`scale` 选项别再叠加（会得到 2× 目标尺寸）。
- 画板外框只是编辑辅助线，但**不能 `border: none`**：2px 边框盒一删，导出内容相对预览
  整体偏移 (−2,−2)px（对比时像「字体错位」/右边被裁 2px）。改成 `borderColor: transparent`
  保留占位，画布底色由 `backgroundColor` 填满边框区。
- 默认导出宽度按 `画板 CSS 宽 × min(devicePixelRatio, 2)`：预览是浏览器按设备像素比栅格化的，
  1:1 导出在高分屏上再按原尺寸显示会被放大一档，字看起来比预览细/软。
- 实测（1×，北京新版 Text 25px/500 + Arial 15px/500）：导出图与画板上对应区域**逐像素一致**，
  差异只在预览里的虚线框/选中框（导出时按设计去掉）——即字体本身没有再替换。
  注意浏览器对 `foreignObject` 里的文字用灰度抗锯齿；画板预览因为在 `transform` 容器里
  也是灰度，两边才能对上。拿画布外的普通 DOM 去和导出图对比会出现 LCD 子像素彩边，
  那是测量方式的问题，不是导出 bug。
- modern-screenshot 会把文档里**所有 @font-face 子集**都内嵌（Noto Sans SC 5 个字重 ×202 个子集
  ≈ 1010 条、SVG 约 69MB、首次导出 10s+），慢但字形正确；如果以后导出超时，优先从这里下手。

**工程**
- `pnpm lint` 不可用（无 eslint 配置），用 `pnpm exec biome check`。
- `src/components/themes/chongqing/NumAlphabet.tsx` 是用户手改的（fontFamily Frutiger）——**不许 revert**。
- 5173 上常年挂着 dev server；`docs/` 整体 gitignore，原始素材不会入库。
- locales 手改时保持既有 JSON 风格（2 空格缩进 + 末尾换行），别整文件重排。
- **App.tsx 的 ResizeObserver 只在挂载时认一次节点**（2026-10-29 留意项）：它盯着
  `.guide-board` 上报画板高度（顶栏 fit / 导出高度基准都用它）。当前画板节点从不销毁重建，
  所以永远有效；**将来若给画板加 `key`（比如按主题强制重挂）**，旧节点销毁后监听就失联了，
  高度会冻结在旧值——到时必须把 observer 改成能在节点重建后重新 attach 的形式
  （ref callback / key 变化时重新 observe）。
- **繁体语言是 zh-HK 不是 zh-TW**（2026-10-29 用户拍板，语言菜单旗标 🇭🇰）：目录
  `public/locales/zh-HK/`，i18n.ts 启动时会把旧 localStorage 的 `zh-TW` 迁移成 `zh-HK`。
  **港式用词决策，别「纠正」回去**：MTR 线路名用「綫」（港鐵官方写法，如 觀塘綫/荃灣綫）；
  標籤頁写「分頁」、「裡」写「裏」；「預設/儲存/應用程式/資料/畫布」港台通用，保持原样。
  **2026-10-29 用户再次拍板：zh-HK 全文件「線」→「綫」**（分隔綫/虛綫框/綫路編號一律「綫」），
  yue-HK 同步照此。
  **zh-TW 自动路由到 zh-HK**（2026-10-29）：`src/utils/i18n.ts` 的 `routeLanguage()` 是唯一入口——
  项目只有一套繁体资源，所以 zh-TW / zh-Hant / zh-MO 一律路由到 zh-HK（`zh-Hans/zh-CN/zh-SG` 给 zh-CN，
  `yue/zh-yue` 给 yue-HK）。别名码登记在 `supportedLngs` 里（否则 i18next 会在过滤阶段就把
  navigator 的 zh-TW 回落成 zh-CN），`backend.loadPath` 是函数、按路由结果取文件（免得先 404 一次闪语言），
  再用 `languageChanged` 微任务兜住运行时传进来的别名码。**加语言包时不要去建 zh-TW 目录。**
- **11 语言**（2026-10-29）：在 zh-HK 后加 **yue-HK 繁體中文（粵語）**（旗标 🇲🇴 区分），
  再追加 ru-RU / de-DE / fr-FR / es-ES / pt-PT。`Header.tsx` 的 `languages` 数组顺序即菜单顺序，
  `src/utils/i18n.ts` 的 `supportedLngs` 必须同步，否则切过去会被回落成中文。
  非中文语言在 `saves.import.bundleCreated_*` / `saves.archives.exportAllSuccess_*` 上要补
  单复数形式（俄语 `_one/_few/_many/_other`，其余 `_one/_other`，中文只有 `_other`）。
- **Blueaka 是 GBK 字体，有坑**（2026-10-29）：「é/è」和整个西里尔字母在 GBK 里都是**全角**字形，
  俄语界面整片字距被撑开、法语 Thème 变成「Th è me」。`global.css` 里已按 `html[lang]` 给
  ru/de/fr/es/pt 五种语言换系统比例字体（`--font-sans`），中日韩照旧 Blueaka。
  **新增语言如果也是拉丁/西里尔文，必须把 lang 加进那条选择器**，否则又会「全角」。
- **「组件虚线框」开关在侧栏主题下方**（2026-10-29）：曾放顶栏，法/德/俄的标签 ~270px 把顶栏顶爆，
  收到 xl 以下只留勾选框又被用户判「字都没了」。现在在 `ComponentsList` 主题选择下面，
  顶栏不再有这个开关（`Header` props 里已删）。

**深色模式（2026-10-25，全应用）**
- 双通道切换：`html.dark`（Tailwind v4 `@custom-variant dark`，global.css）+ `body[theme-mode=dark]`
  （Semi 自带深色主题，semi.css 已含两套 token，无需额外引 CSS）。状态在
  `src/hooks/useDarkMode.ts`，`index.html` body 开头有一段内联脚本首帧前套用（防闪白）。
- 深色表面色对齐 Semi token：bg-0 `#16161a` / bg-1 `#232429` / 边框 `#2e2e35`～`#3a3b42`。
- 覆盖元素级内联颜色时**不能上 `!important`**：导出流程靠内联 `borderColor: transparent`
  去掉画板外框（边框盒必须留着，见 §7「导出图片」），`!important` 会盖过它把边框漏进导出图 ——
  画板边框改用 `var(--guide-board-border-override, 主题色)` 方案（global.css 里 `html.dark` 定义 override）。
- Semi Slider 把手写死 `--semi-color-white`，深色下要在 global.css 单独压成暗色。
- 深色 hover 覆盖写在 `@media (hover: hover)` 里，天然避开触屏粘滞高亮（别挪回全局）。
- 切换按钮位置（用户拍板）：桌面在右上按钮组**最右**（GitHub 之后）；移动端在「更多」
  **左边（倒数第二）**。浅色显示月亮、深色显示太阳（IconMoon/IconSun）。

**多存档（2026-10-25）**
- 存储布局：`guide-archives`（索引 `{version,activeId,archives:[{id,name,createdAt,updatedAt}]}`）
  + `guide-archive:<id>`（每个存档一份 SaveData）；旧 `guide-autosave` 首次启动自动迁移成
  「我的存档」后删除；清除全部时一并清理。
- 自动保存只写 `activeArchiveIdRef` 指向的存档；`persistCurrentState` 内容没变直接跳过。
  切换/导入期间用 `suspendSaveRef` 冻结写入，避免把旧画板塞进新存档。
- `ArchiveDialog`：新建/导入后**不关弹窗**；切换成功才关；列表固定按 `createdAt` 排序
  （切换不得跳位），活动行会滚进可视区；三颗动作按钮（导入/新建/清除）`height:28 /
  padding:4px 0`。**导入/新建两颗按钮并排一行**（`flex-nowrap` + `whitespace-nowrap`），
  说明文字与按钮同一行、放不下才整组换行；弹窗 `width 600`（560 时正文只剩 282px，
  而一行要 300px，会被挤断行且右边漏一大块空白）。
- **浮层贴边会被裁**：Semi 的 `autoAdjustOverflow` 以 `getPopupContainer()`（默认 body）为容器
  判溢出，body 比视口高 → 它永远觉得"放得下"，所以顶栏/屏幕下沿的 Popover、Tooltip 不会翻转。
  Select 有自己一套定位逻辑，没这问题。已处理：`CustomColorPicker` 按可视空间自己算
  `position: topLeft / bottomLeft`（pointerdown 时量，`rePosKey` 跟着变）；
  顶栏缩放滑块的数值气泡（固定 `position="top"`，必定被窗口上沿裁掉）直接
  `tooltipVisible={false}`，右边那格百分比本来就在实时更新。
- 顶栏：桌面文件夹图标 + 当前存档名（`max-w-32 xl:max-w-48` + truncate，hover 跟随顶栏主题蓝）；
  移动端只在「更多」里；顶栏已移除清除/导入/保存项目图标。
- 还原失败（主题对不上）：不直接删除/导出，弹窗只给「进入存档管理」，由用户自己切换/删除/下载。
- 撤销/重做（2026-10-25 重写，见 §8-35）：切换存档或导入后用 `useUndoRedo.reset(state)` 重建基线。
  历史存在 `useRef` 里同步读写，`canUndo/canRedo` 靠一个 revision 计数器刷新；
  `saveState` / `undo` / `redo` 全部走 `normalizeHistoryState()`（剥 element → 稳定序列化）
  再和 `history[currentIndex]` 比内容，相同就不追加 —— 否则撤销后的自动保存会把 redo 分支截掉。
- 下载名：`moert-guidegen-save-<存档名>_<YYYY-MM-DD_HH-mm-ss>.json`；
  「导出全部存档」现在打 **zip**：`src/utils/zip.ts`（手写 store 模式 ZIP，无第三方依赖，
  崩溃页也能直接用），包内每个存档一个 `moert-guidegen-save-<存档名>_<时间戳>.json`，
  内容和「单独下载某个存档」完全一致（就是 localStorage 里的原始文本）。
  存档管理底部「清除全部存档」左边也有同一个按钮。
  **旧的整包 JSON（`{type:"moert-guidegen-archives", ...}`）导入支持已在 2026-10-29 彻底删除**：
  `ArchiveBundle` 类型、`createArchiveBundle`、`isArchiveBundle` 全部移除，导入只接受单个存档 JSON
  （或直接拖 zip 里的单个文件）。`createArchiveBundle` 从加入起就没有任何调用点（导出走 zip），
  `isArchiveBundle` 也只剩一条导入兼容分支，用户确认「不需要兼容」，一并删掉。
- 崩溃页导出：ErrorBoundary 的「导出存档」打开纯 HTML 弹窗（**不依赖 Semi / React 主题**），
  列出全部存档、每行可单独导出；「导出全部存档」同样打 zip（复用 `exportAllArchivesZip`）。
  深色只写 `@media (prefers-color-scheme: dark)` 的 CSS，不用 JS 判断（崩溃时 JS 状态不可靠）。
- **导入支持多选 + 全页拖放**（2026-10-29）：`importSaveData` 的 file input 带 `multiple`，
  真正干活的 `importFiles(files: File[])` 逐文件解析（`migrateSaveData` → `isSaveData` → 主题校验），
  单个失败不影响其它文件；全部处理完**切到最后一个成功导入的存档**（列表会自动滚到它）。
  提示分三种：只有 1 个文件 → 成功用 `saves.import.created`、失败给具体原因；
  多个全成功 → `saves.import.multiOk`（已导入 {{count}} 个）；有失败 → `saves.import.multiPartial`
  （已导入 {{success}} 个，{{failed}} 个失败）后面接第一条失败原因。
  全页拖放走 window 上的 `dragenter/dragover/dragleave/drop`，只认 `dataTransfer.types` 含 `Files`
  （**不会干扰 dnd-kit**，它走 pointer 事件），`dragover` 必须 preventDefault 否则浏览器会直接打开文件
  把当前画板顶掉；dragenter/dragleave 用 depth 计数防闪烁；遮罩是 `z-[9999] pointer-events-none`。
  非 .json 文件 → `saves.import.onlyJson`。
- **导入时做组件条目级校验**（2026-10-29）：`findBadSaveItem()` 会逐行逐项检查
  `id`（非空字符串）/ `type`（非空字符串）/ `props`（对象或空，但不能是数字/字符串）/
  `type` 是否在解析出的主题 `components` 里（`displayName` 全等，形如
  `themes.<主题>.components.<组件>`）。任何一条不合格就**整份文件拒收**并给出定位：
  「第 N 行第 M 个组件：缺少有效的 id / 类型在当前主题里不存在（xxx）」。
  以前这些坏条目会被 `createArchive` 原样存进去，载入时 GuideBoard 只 `console.warn`
  然后 `return null` —— 表现就是「导入成功了但少了个元件」，用户完全不知道为什么。
- DEV-only 全局崩溃页验收：打开 `http://127.0.0.1:5173/?__crash_test=1`，App 挂载后 setState
  让 `DevGlobalCrash` 在 render 期 `throw`（与存档 / 画板无关，是真正的 React 全局 ErrorBoundary），
  不改 localStorage；URL 里的 query 会被移除，刷新即恢复。仅用于测崩溃页导出，
  生产构建里这段分支会被 `import.meta.env.DEV` 去掉。

**存档版本号（2026-10-29）**
- **唯一取值点**：`src/utils/saveMigrations.ts` 的 `LATEST_SAVE_VERSION`。`archiveStore.ts` 的
  `SAVE_VERSION` 只是它的转出；`buildSaveData` / `createEmptySaveData` 写入用它，
  `isSaveData` 校验用**区间**（`1 … SAVE_VERSION`，不是 `===`）——所以别再在任何地方写死数字，
  也别把校验改回等于。
- **追加式改动不用改版本号**（用户拍板）：新增可选字段、老字段语义不变、组件 props 加可选属性，
  统统不用动 `version`。`config.boardBackground?` / `boardForeground?` 就是先例——老档缺字段读成
  `undefined`，代码里用默认值兜住即可。**版本号只在破坏性改动时才动**，别为了「表示改过」而升。
- **破坏性改动**（字段改名 / 删字段 / 语义变了 / `rows` 结构变了）：`LATEST_SAVE_VERSION` 加一，
  并在 `MIGRATIONS` 里按「旧版本号 → 迁移函数」补一条（返回带新 version 的完整数据）。
  迁移会自动在 `loadArchiveData`、导入工程文件、旧 `guide-autosave` 迁移三处、`isSaveData` 之前
  逐级执行，且有 16 步防环；但**迁移结果不写回 localStorage**，要等下一次自动保存才落成新版本。
- 索引 `INDEX_VERSION`（`guide-archives`）是另一个格式，各管各的，别跟存档版本号搅在一起。
  （曾经的整包备份 `ArchiveBundle.version` 已随整套 bundle 代码删除，见上「多存档」。）注意 `readIndex()` 版本不匹配时直接 `return null`，
  会走「没有存档 → 新建空存档」分支，旧索引里的存档条目就全部没有入口了（数据其实还在
  `guide-archive:<id>` 里）——真要改索引版本必须自己补迁移。

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
28. 多存档管理：新建 / 切换 / 重命名 / 副本 / 下载 / 删除 / 导入 / 清除全部；自动保存只写活动存档，
    旧单存档自动迁移（见 §7「多存档」）。
29. 顶栏移除清除 / 导入 / 保存项目图标，入口改文件夹图标 + 当前存档名；长名字截断 + tooltip，
    hover 跟随主题蓝。弹窗内导入 / 新建 / 清除按钮统一 `height:28 / padding:4px 0`。
30. 新建存档、导入存档成功后**不关闭**存档管理弹窗；切换存档成功才关；列表按创建序稳定，
    活动行自动滚进可视区。
31. 存档载入失败不再直接给「删除 / 导出」，统一引导进存档管理；失败 toast 改
    「存档载入失败（原存档未受影响）」。
32. 导出名统一 `moert-guidegen-save-存档名_时间戳.json`；崩溃页增加「导出全部存档」整包备份，
    存档管理支持整包导入。
33. 损坏存档生成器只用于报错 UI 验收，验收完成后已删除（勿再往生产 UI 加测试入口）。
34. 崩溃页导出改为类似存档管理的弹窗：单存档 / 全部存档；深色只做
    `prefers-color-scheme` CSS；初始存档名已确认随浏览器语言（en `Save 1` / ja `保存 1` /
    ko `저장 1`）。
35. 「redo 有严重问题」→ 实测症状：**撤销一次之后 redo 只能走一步，约 0.8 秒后按钮永久变灰**。
    根因链：撤销 → 200ms 后 `isUndoRedoing=false` → 重渲染让 GuideBoard 拿到新的
    `onConfigChange` → 其 10ms 防抖触发 → Editor 的 500ms 配置防抖到点 → `saveCurrentState()`
    → `JSON.stringify(getState())` 和 `history[currentIndex]` 不相等（还原时
    `restoreState` 用 `{key, ...props}` 重建 React 元素，新建时是 `{...props}`、element 的
    `key`/`_owner` 不同）→ 被当成新操作 push，顺手 `splice(index+1)` 把 redo 分支删了。
    重写要点：历史搬到 `useRef` 同步读写（连按不再丢步）、`normalizeHistoryState` 剥掉 element
    再比内容、`stableSerialize` 键名排序后比较、撤销/重做前先 `flush()` 未落账的防抖状态、
    还原期间用 `pause/resume` 挡过渡态（不再用 200ms 时间窗，那会把用户这期间的真实修改丢掉）、
    还原后关掉属性弹窗（旧 props 快照会让撤销掉的内容复活）、Ctrl+Shift+Z / Cmd+Z 支持。
36. 「导出的图片和编辑框里预览的字体有细微差别」→ 实测：1:1 导出与画板**逐像素一致**，
    字体没有被替换；真正的差异来自导出流程本身，已修（详见 §7「导出图片」）：
    ① 导出宽度 ≠ 画板宽度时 `transform-origin` 丢失 → 内容偏移/空白（改在 domToPng 的 style 里给）；
    ② `border:none` 让内容相对预览偏移 (−2,−2)px（改成 `borderColor: transparent` 保留边框盒）；
    ③ 默认导出宽度改为 `画板宽 × min(devicePixelRatio, 2)`，高分屏下不再比预览糊一档。

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
- **小改动不要反复开浏览器验证**（用户明确提过）：改个文案、翻译键、按钮顺序、加一个 key 这类，
  跑完三件套直接回报改了什么就够，验收交给用户刷新看。只有「像素几何 / 布局塌陷 / 拖拽落点」
  这类光看图就能看出问题的改动，才做**一次**针对性实测（量一对数字或截一张图），
  不要为了验证去重建场景、连点几十次、反复 reload —— 有那时间早该去改下一处了。
  另一个 agent 并发改文件时尤其别硬耗：dev server 被它改崩了，验证必然超时，直接收手。
- 图标几何永远走提取管线，别手绘。
- 不要在根目录新建任何测试文件/临时文件/截图文件/占位文件（.playwright-mcp下的文件除外，它们是被gitignore了的），应该放到系统的 temp 目录，如`/tmp/` `C:\Users\xxx\Appdata\Local\temp`