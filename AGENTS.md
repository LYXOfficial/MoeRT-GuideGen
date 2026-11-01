# AGENTS.md — 交接文档

> 最后更新：2026-11-01。上海主题章节（§11）按东京那套结构重写：组件尺寸表 / 颜色 / 字体 /
> 图形符号 / 背景与落板 / i18n / 坑，共 7 小节；四个卫生间图标重描参数也记在 §11.4。
> 下一阶段目标：**深圳 / 广州主题**（未定，等用户拍板）；北京旧版已实现、遗留项见 §9。

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
- ✅ **上海地铁主题**（2026-11-01）：`src/components/themes/shanghai/`，THEME_INDEX 6，
  key `themes.shanghai`（显示名「上海地铁风格」）。依据 DB31/T 1104（2025-11 修订征求意见稿）建成 12 个组件
  （LineNum / TextLineNum / Text / BigZh / BigEn / NumAlphabet / DualText / Arrow / Icon /
  SpecLine / Spacing / Blank），图形符号 28 个 + 申通标志，线路色 24 组全部来自标准 CMYK。
  资料与实测笔记在 `docs/shanghai/`（见 §11），tsc / biome / build 三绿。
- ✅ **东京地铁主题（第二版）**（2026-10-31）：`src/components/themes/tokyo/`，
  **THEME_INDEX 5**，key `themes.tokyo-metro`（显示名「东京地铁风格」）。16 个组件、
  157 项官方图记、73 条线路色、11 语言全量；要点与踩坑见 **§12**。
- ✅ 编辑器交互（PC + 移动端）：拖拽/点按判定、触屏长按、小元件热区、删除区可见矩形、
  编辑菜单稳定性、整页缩放禁用等，全部修复并提交（见 §7/§8）。
- ✅ **全应用深色/浅色模式**（2026-10-25）：初始跟随浏览器 `prefers-color-scheme`，
  手动切换后写 `localStorage['guide-theme-mode']` 覆盖。实现要点见 §7 末尾「深色模式」。
- ✅ **多存档管理**（2026-10-25）：`src/utils/archiveStore.ts` + `src/components/ArchiveDialog.tsx`。
  顶栏文件夹入口 + 当前存档名；新建 / 切换 / 重命名 / 创建副本 / 下载 / 删除 / 导入（单个存档 JSON）/
  清除全部；自动保存只写活动存档；旧单存档自动迁移。要点见 §7 末尾「多存档」。

## 3. 主题架构契约（新主题必须遵守）

1. `src/components/themes/themereg.ts` 的数组**顺序即 THEME_INDEX**（当前 7 项）：
   `chongqing 0 / chengdu 1 / hongkong 2 / beijing 3 / beijingOld 4 / tokyo-metro 5 / shanghai 6`。
   新增主题要同步：`themereg.ts`、`Background.tsx` 里的 `THEME_INDEX` 常量（取色器用它读色板）、
   `GuideBoard.tsx` 的 `bakeDropColors` 分支（哪些主题落板固化板色）、`DraggableItem.tsx`
   的 Spacing/SpecLine 注册、11 个语言包、以及 `src/locales/zh-CN.json` 兜底副本。
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

## 7. 踩过的坑（改前必读）

**测量与渲染**
- SVG `letterSpacing` 无单位 = px；宽度 = `measureText + spacing × (字符数-1)`。
- `fontZh(500,…)` 曾因 `WEIGHT_VALUE[500]` undefined 得到 `"undefined 11px…"` → 回退字体 → 量宽偏小、
  文字被裁。`weightCss` 现已接受数字；**字号数字要同时喂测量和 fontWeight**。
- `<text>` 默认 `xml:space="default"` 会折叠空格但 `getBBox()` 按原串计宽 → 「空格不算宽/盒子变长」。
  统一走 `src/utils/svgText.ts` 的 `normalizeSvgLine`（只把制表/换行换空格，**首尾空格保留**）+
  `xmlSpace="preserve"`；判空仍用 `.trim()`。
- 中文 ink ≈ 0.88em、拉丁 cap ≈ 0.716em，基线按 ink 推，别用 fontSize 居中。

**图标 / 视图箱**
- 宽扁图形塞进方形 viewBox 会被 letterbox 缩小 → 生成脚本带 `tight_viewbox`。
- PDF 里格子的白色底盘要从字形里剔除，否则整块白底；`ROLE_OVERRIDE` 可按图标换角色槽。

**布局 / CSS**
- 组件盒高必须 64px 铺满整行（ExitNum 曾缩到 57.6px 露台阶）。
- 画板左右**不能留 1px 内边距**；行首/行尾组件要 `flushLeft/flushRight`（不给 −1px 负边距），
  否则被 `overflow:hidden` 裁 1px、露底板色。行容器 `overflow` 要两轴 `hidden`。
- 行间背景接缝用 `MultiRowBackground` 的 hard-stop 渐变，别用两个 div。
- 组件虚线框 `outlineOffset: -2px` 画在盒内（否则压住行边界，看着像「关不掉的白缝」）。
- `body` 高度用 `100dvh`，否则移动端地址栏收放整页跳。
- **底板配色铁律（用户逐条拍板：拖上去就定死）**：新拖入组件在落板那刻把当前生效色写进 props
  （`bakeDropColors`），之后改板色**绝不回头覆盖已上板组件**；渲染层只原样渲染，禁止按板色回写
  （加过一次又删，回归过一次）。只有侧栏新拖入才固化（`fresh` 参数），板内搬家原样搬运。
  细则：① 间距/空格/分隔线全主题背景永远透明且不固化板色；② 成都/香港/北京旧 默认 transparent；
  ③ 重庆/北京新/东京/上海 保留局部默认，全局板色有设定才覆盖；④ 前景色全局覆盖局部、**默认色不能为空**；
  ⑤ 其它默认值不介入；⑥ 透明一律用各主题 `colors.transparent` 常量，禁写字面量。
- `background` / `background2` 必须成对处理（北京两行分色，只改一个 = 只有第一行变）。自查：
  `grep -rn '"transparent"' src/components/themes/ | grep -v define/colors.ts`（应无输出）。

**dnd-kit / 编辑器交互**
- `{...listeners}` 之后写同名 `onPointerDown` 会**覆盖** dnd-kit 监听 → 拖不动；要用 capture 变体。
- 但 `onPointerUpCapture` **绝不能 stopPropagation**（PointerSensor 在 document 等 pointerup，
  掐断会「点一下就开始拖」）。
- 触屏拖完浏览器补发兼容性鼠标事件会误触「点按」→ 用 pointer 事件 + `hasMovedRef(>10px)` 判定；
  菜单外部关闭用 mousedown + 400ms 宽限期 + Semi 浮层白名单。**不能用 pointerdown 做外部关闭**
  （绕过 Semi 只拦 mousedown 的保护，选个下拉整个菜单就没了）。
- TouchSensor 长按**只给组件列表卡片**，画板组件要摘掉 `onTouchStart`。sensors：
  `PointerSensor distance:8` + `TouchSensor delay:250 tolerance:8`。
- `margin: 0 -1px` 压接缝 + hover z-40 会盖住分割线 → 透明热区 `hitPad`（补到 14px/zoom）
  + `.guide-item-hit-expand z-50`。
- 删除区 droppable 用**可见矩形**（`visibleRect.ts` + `data-trash-root`），否则「拖出画布」误判成删除。
- 拖到双行容器边缘时 collision 可能清空 `pool` → `pool[0].id` 白屏（已加空兜底；**改 collision 前先读双行容器那节**）。
- DragOverlay 位移要除以真实屏幕缩放；`DraggableItem` 用 `useLayoutEffect`+ResizeObserver 绘制前量。
- 拖拽期间忽略画布手势；document 上非被动 `touchmove` preventDefault；viewport 已禁整页缩放。

**画板行序拖动（`GuideBoard.tsx` 的 `.row-drag-handle`）**
- 每行左侧一个把手（`position:absolute; right:100%`，挂在画板外，**不占行内布局**、
  不会挪动组件），只在 rows 数 > 1 时出现；类名 `row-drag-handle guide-item-hint`，
  导出流程按 `guide-item-hint` 过滤，所以**不会烘进导出图**。
- 换序是「让位」动画（同 dnd-kit 思路，但**没走 dnd-kit**，怕和行 droppable 的
  `row1..rowN` id 打架、抢 collision）：被拖行 `translateY` 跟手，其它行按目标位整体
  平移一格（`transform` + 160ms 过渡），松手才 `arrayMove`；落位再补一次 200ms 过渡。
- **位置判定必须用 `offsetTop/offsetHeight`（局部坐标、不含 transform）**：用
  `getBoundingClientRect` 会把正在过渡的行当成真实位置，目标位会抖。
- 行块 = 行 + 它下面的分隔线（`data-row-wrap` 是 `flex-direction: column` 的外层），
  这样让位时分隔线跟着行一起走；行块高度不同（末行没有分隔线），落位偏移要按
  `arrayMove` 之后的新顺序重新累加，否则会差 5px。
- 存档：行序就是 `rows` 数组顺序，换序只改 state，**松手才 `onConfigChange(true)`**
  （经过 500ms 防抖 → 落盘 + 记一次撤销），拖动中间态不进历史；撤销/重做、导出、
  多存档都自动跟随（已实测：拖完 Ctrl+Z 回原序、Ctrl+Shift+Z 再换回来）。
- 拖拽路径实测 60fps（4 行 × 3 组件，最长帧 16.8ms）：**不要**在 pointermove 里做
  `getBoundingClientRect` 之类的强制布局读，也别每次 move 都改 DOM 结构。

**双行容器（成都 `TwoRowContainer`，Frame 复用同一套契约）**
- 宽度 `W = max(30, minWidth, 最宽行跨度 × 0.5 + 1)`；两行等宽；内层 `.two-row-inner` 宽写死
  `W / SCALE` —— **间距能撑开的前提就是内层有确定宽度**（fit-content 时间距必收成 0）。
- 量宽用**子元素实际占据区间**（`max(offsetLeft+offsetWidth) − min(offsetLeft)`），不能累加 offsetWidth：
  `-1px` 压接缝会被逐条算成宽度，条目越多右边空得越多。
- 文本组件宽度来自 `getBBox()`；**只 await 一次 `fonts.ready` 会留残影**（远程中文字体后到），
  现改为 首量 + `fonts.ready` + `loadingdone` + 60/240/800ms 重试。
- 间距（`flex:1`）不算进自然宽；`data-guide-spacing` 跳过它，且**要把该行所有间距的 offsetWidth
  从跨度里扣掉**（否则间距后面的组件 offsetLeft 含已撑开宽度 → 容器每周期 +1px 无限变宽）。
- `.two-row-inner` 必须 `alignItems: stretch`（间距是 height:100%，父级 center 就塌成 0）。
- 落点：**行尾一律算「追加到这一行」**；只有左端 `min(20px, 宽×0.15)` 判「插到容器前」；
  行级命中（带 containerId/rowIndex）要排在裸容器前，否则拿不到 rowIndex 会静默退回主行。

**浮层贴边**
- 编辑弹窗带 `anchor`：右侧放不下**翻到左侧**；下方溢出上移贴边。
- 颜色面板要连跟 ~90 帧纠偏，写 CSS 独立属性 `translate`（`transform` 被 Semi 入场动画占用），
  **每帧先清自己的 translate 再量**，否则来回振荡。
- `utils/portalClamp.ts` 两个必踩坑：① 写 `translate` 会触发自己的 MutationObserver → 死循环
  （用重入锁 + `takeRecords()` + 差 <0.5px 不写）；② Semi 未显示浮层停在 `(-9999,-9999)`，
  见到 <−5000 的哨兵只清自己的 translate 就跳过。
- 间距/空格命中热区按**屏幕宽**判（`offsetWidth × zoom < 14`）。

**导出图片**
- 宽高都能改、按画板原始宽高比联动；打开时**从 DOM 现量**（`guide.offsetWidth/clientHeight`），
  不用 App 上报的 `guideHeight`（ResizeObserver 只在挂载时认一次节点，会失联给旧值）。
- 默认 **2×**、不乘 DPR；倍率 `0.5…16`、step 0.5。高度基准取 `clientHeight`（行数×64），导出时去掉边框。
- **不能改真实节点的 transform**：modern-screenshot 克隆会丢 `transform-origin` → 内容整体偏移/空白。
  正确做法：`transform: scale(宽/画板宽)` + `transformOrigin: "top left"` 放进 `domToPng` 的 `style`。
  `width` 选项只改克隆根盒子，子元素宽度不重排；别再叠加 `scale` 选项。
- 画板边框**不能删**（`border:none` 会让内容偏 (−2,−2)）→ 用 `borderColor: transparent` 保留占位。
- 实测 1× 导出与画板**逐像素一致**（含灰度抗锯齿）；modern-screenshot 会内嵌全部 @font-face 子集
  （Noto Sans SC ≈1010 条、SVG ~69MB、首次 10s+），导出超时优先从这里下手。

**工程 / i18n**
- `pnpm lint` 不可用；用 `pnpm exec biome check`。
- `chongqing/NumAlphabet.tsx` 是用户手改的（Frutiger）——**不许 revert**。
- `docs/` 整体 gitignore，原始素材不入库；locales 保持 2 空格缩进 + 末尾换行，别整文件重排。
- **繁体是 zh-HK**（旗标 🇭🇰）：港式用「綫」不写「線」、「裏」不写「裡」、「分頁」；
  **zh-TW / zh-Hant / zh-MO 全部路由到 zh-HK**（`routeLanguage()` 是唯一入口，别名码要在
  `supportedLngs` 里，否则 i18next 过滤阶段就回落成 zh-CN）。**别建 zh-TW 目录。**
- **11 语言**：zh-CN / zh-HK / yue-HK / en-US / ja-JP / ko-KR / ru-RU / de-DE / fr-FR / es-ES / pt-PT。
  `Header.tsx` 的 `languages` 顺序 = 菜单顺序，`i18n.ts` 的 `supportedLngs` 必须同步；
  俄语要 `_one/_few/_many/_other`，其余 `_one/_other`，中文只有 `_other`。
- **Blueaka 是 GBK 字体**：「é/è」和西里尔字母都是全角 → `global.css` 已按 `html[lang]` 给
  ru/de/fr/es/pt 换系统字体；**新增拉丁/西里尔语言必须加进那条选择器**。
- **改简中必须同步 `src/locales/zh-CN.json`**（打包兜底副本），否则界面显示裸 key。其它 10 语言走后端加载。
- 「组件虚线框」开关在**侧栏主题下方**（别挪回顶栏，法德俄标签会把顶栏顶爆）。
- 版本号徽标：`v26.10.30.127` = `v`+日期+总提交数（`vite.config.ts` 的 `__APP_VERSION__`）；
  dev 固定 `v.dev`。生产按序取：**写死的仓库** `LYXOfficial/MoeRT-GuideGen` 的 GitHub API
  → 本地 `git rev-list`（浅克隆先 unshallow）→ `v.dev`。**仓库名必须写死**，从 `git remote`
  解析在镜像/浅克隆下会静默失败。私有仓库构建配 `GITHUB_TOKEN`。

**深色模式 / 多存档 / 存档版本号**
- 深色：`html.dark`（Tailwind）+ `body[theme-mode=dark]`（Semi），`useDarkMode.ts` 管状态，
  `index.html` 首帧内联脚本防闪白；覆盖内联色**不能用 `!important`**（会盖掉导出用的
  `borderColor: transparent`，画板边框改走 `--guide-board-border-override`）；Semi Slider 把手要单独压暗；
  深色 hover 覆盖写在 `@media (hover: hover)` 里。
- 多存档：`guide-archives`（索引）+ `guide-archive:<id>`（每档一份 SaveData）；自动保存只写活动存档，
  切换/导入期间 `suspendSaveRef` 冻结；导入支持多选 + 全页拖放（`dragover` 必须 preventDefault）、
  逐文件校验并给出定位（`findBadSaveItem`）；导出全部存档打 zip（`utils/zip.ts`，无第三方依赖）；
  崩溃页导出是纯 HTML 弹窗，不依赖 Semi / React。
- 撤销/重做：历史放 `useRef` 同步读写，`normalizeHistoryState`（剥 element）+ `stableSerialize` 比内容，
  还原期间 `pause/resume` 挡过渡态，还原后关掉属性弹窗。**根因**：还原用 `{key, ...props}` 重建
  element，`JSON.stringify` 不相等 → 被当新操作 push 并 `splice` 掉 redo。
- 存档版本号：唯一取值点 `saveMigrations.ts` 的 `LATEST_SAVE_VERSION`；`isSaveData` 校验用**区间**；
  **追加式改动不升版本号**，破坏性改动才升 + 在 `MIGRATIONS` 里补迁移（迁移结果不写回 localStorage）。
  当前 **2**：`MIGRATIONS[1]` 把北京旧版 `Text` 的旧 `letterSpacing` 拆成 `letterSpacingZh/En`（老值双份回填、
  旧键删除，递归进容器 `props.children`）；rows 形状不对时原样留下给 `isSaveData` 拒收。
  索引 `INDEX_VERSION` 是另一套，版本不匹配会 `return null` → 「存档全部消失」，改它必须补迁移。

## 8. 用户反馈（历史 36 条已全部落实，细节见 git log）

保留仍有指导意义的结论（其余要么已并入 §7，要么是一次性问题）：
- **一次只做他说的那件事**：他要的是「抄参考」，不是我的再创作（第 1 条整轮返工的教训）。
- 尺寸/比例一律**先量像素再动手**，回复里给测量表；「大概差不多」会被打回。
- 出口长B = 出口长A **换色**（白底绿字），不是另画一套大字。
- 出入口编号：字母数字**一对一**，卡片式编辑器（同成都 StationNumber），不要括号说明。
- 不要 `South-West`，要 `Southwest`（只首字母大写）。
- 删除非空行要二次确认；总行数 >1 时第一行也要有减号。
- 「填充→间距」「空白→空格」是用户亲自改的名，别改回去。
- 撤销/重做根因：还原时用 `{key, ...props}` 重建 element，`JSON.stringify` 与原状态不等 →
  被当成新操作 push 并 `splice` 掉 redo 分支。修法见 §7「撤销/重做」。
- 导出「字体有细微差别」不是字体问题，是导出流程（origin 丢失 / border 盒 / 倍率），见 §7。

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
- **文字（Text）边缘对齐 + 中英字距分设**（2026-11-01）：`align` 在左/中/右后追加 `justify`，
  文案叫「边缘对齐」（用户嫌「分散对齐」怪）。做法 = 把该行墨迹摊满块宽：canvas
  `actualBoundingBoxLeft/Right`（`measureInk`）取首字墨迹左缘 / 尾字墨迹右缘，
  `x = -inkLeft` 把首字墨迹贴 0，字距加 `(块宽 − 行墨迹宽)/(字符数−1)`（恒 ≥ 0，单字行不摊）。
  **必须按墨迹而不是排字原点**：汉字 side bearing 与拉丁不同，按原点贴边会缩进 1–3px
  （「出口/Way out」实测左 2.0 / 右 3.0 缩进 → 改后两行都是 1.0/63.0，逐像素对齐）。
  字距拆成 `letterSpacingZh / letterSpacingEn`（em），旧 `letterSpacing` 已删；
  存档 v1→v2 迁移把老值双份回填（见 §7「存档版本号」）。
- 色板新增 `black: "#000000"`「纯黑」（排在 `white` 后；`textblue` 带蓝调，白底要真黑时用它）。
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

## 11. 上海地铁主题（上海地铁风格 / DB31/T 1104）

- key `themes.shanghai`，**THEME_INDEX = 6**，代码 `src/components/themes/shanghai/`；
  建主题时同步过：`themereg.ts`、`Background.tsx` 的 `THEME_INDEX`、
  `GuideBoard.tsx` 的 `bakeDropColors`（`currentTheme === 6`）、`DraggableItem.tsx` 的
  `ShanghaiSpacing / ShanghaiSpecLine` 注册、11 份语言包 + `src/locales/zh-CN.json` 兜底副本。
- **规范来源**：上海市地方标准 **DB31/T 1104《城市轨道交通导向标识系统设计规范》**
  （2018 首发，2025-11 修订征求意见稿）。
  和北京不同，**上海没有公开的 VI 包 / vitool 等价物**：标准正文 + 附录 A（线路色）+
  附录 B（图形符号）+ 附录 C 就是全部素材，且附图是 **150 ppi 位图**（每格 ≈48×48 原生像素），
  **图标只能描摹，不能像 visys.pdf 那样抠矢量路径**。
- **资料目录**（`docs/` 整体 gitignore，不入库）：
  `docs/shanghai/raw/01_standard/`（PDF、`pages/` 整页 PNG、`figures/` 附图裁切）、
  `raw/02_line-colors/`（线路色、`line-colors.json`）、`raw/03_logo/`（申通标志）、
  `raw/05_scripts/icons/`（`final_trace.py` 裁图+描摹、`generate.py` 生成 TSX）、
  `notes/`（`规范要点.md` / `颜色与字体.md` / `组件规格.md` / `图标提取.md`）。

### 11.1 组件与尺寸（12 个）

LineNum / TextLineNum / Text / BigZh / BigEn / NumAlphabet / DualText / Arrow / Icon /
SpecLine / Spacing / Blank。行高 64px = 牌面高，**所有尺寸都按 64px 行高换算**。

| 组件 | 要点（🖐 = 用户亲手调过，只能最小 diff） |
|---|---|
| `LineNum` 🖐 | 数字线路标，**边长锁死 40**；左右各留 `gapX`（默认 5、可调）；编号允许手输逗号（`2,5`），逗号按 **0.62 倍字号**渲染；**无 offsetY**；文字色字段叫 **`textColor`**（不叫 `foreground`，否则会被全局「默认前景色」覆盖） |
| `TextLineNum` 🖐 | 文字线路标，版式**全部写死**：牌高 **40.5**、中文 **20**、英文 **9**、左右内边距 **8**、中英间距 **4**、圆角 **3**、左右透明边 **6**；编辑器只剩 文字 / 线路色上下段 / `textColor` / 边框 / 背景。字段 `chinese/english/color1/color2/textColor/border/background` |
| `Text` 🖐 | 多行中英，**28 / 13px**，墨迹对齐 + 墨迹居中 |
| `BigZh` 🖐 | 中文大字，**单行**（`Input`，换行当空格），**28px**，左右写死 **5px**，**没有 `lineHeight`**（用户：本来就是单行） |
| `BigEn` 🖐 | 英文大字 **15px**、多行、左右写死 **5px** |
| `NumAlphabet` 🖐 | 大号数字/字母，**56px**，默认前景取 `exitForeground`，500 字重用 `size*0.02` 描边模拟中黑，逗号同样 0.62 倍 |
| `DualText` 🖐 | **两组**「中文 + 英文」（图 54：老沪闵路 / Laohumin Rd. ＋ 龙华寺 / Long Hua Temple），默认 **11 / 7**、`align: left`、组内行距 1.5、组间距 4、前景 `exitForeground`；**哪组两个字段都空就整组跳过**（第一版只做了一组，是错的） |
| `Arrow` | 边长锁死 **44**；直行 8 方向 + **拐弯 8 组合**（尾巴朝向-箭头朝向：上-右 / 右-下 / 下-左 / 左-上 / 上-左 / 右-上 / 下-右 / 左-下） |
| `Icon` | 边长锁死 **50**、左右留白 **2**；编辑器只有 图标 / 旋转 / 前景色 / 背景色 |
| `SpecLine` 🖐 | 宽 **2**，线体 y = 8→56（上下各留 8，用户嫌 3px 太贴边） |
| `Spacing` / `Blank` | 全透明（含落板后），displayName 与其它主题统一为「间距 / 空格」 |

其余通用铁律：**`offsetY` 正数向上**（用户指出正负反了，所有文字组件的 `dy` 都已取负）；
徽章类白描边 1.3、数字字号 40 等实测值见 `docs/shanghai/notes/组件规格.md`。

### 11.2 颜色

- 底色 `background #2D2B2E`（标准 6.4.1「深灰 C0 M0 Y0 K92-95」）；`foreground #FFFFFF`；
  **出站信息黄 `exitYellow #FFCF00`（C0 M18 Y94 K0）**；申通标志红 `#E3001B`。
- 线路色 **24 组**：附录 A 的 CMYK 经 **ISO Coated (FOGRA27)** 转 sRGB；含 `line1`–`line23` +
  `pujiang`（浦江线）/ `suburban`（市域线）/ 磁浮双色 `maglev1 #215E57` + `maglev2 #C54D1F`。
  换算表与官方网络图对照见 `docs/shanghai/notes/颜色与字体.md`。

### 11.3 字体

中文思源黑体（继承北京那套 Noto Sans SC / `sourcehansans.css`）+ **Helvetica**
（项目已有 `public/fonts/Helvetica.ttf`，`shanghai/fonts/helvetica.css` 注册）。
注意该 ttf **只有 400 一个字重**，需要「中黑」的地方一律用**描边**模拟，别写 `font-weight: 500`
指望浏览器给字形。

### 11.4 图形符号（28 个）

`icons/pictograms-real.tsx`（28 glyph，单色 `fill={color}` + `fillRule="evenodd"`）+
`icons/logo-real.tsx`（申通标志）+ `icons/arrow-real.tsx`（直行 / 拐弯 / 右箭头）+ `icon-registry.ts`。

- 管线（详见 `docs/shanghai/notes/图标提取.md`）：150 dpi 原生页裁图 → 上采样 → 二值化 →
  清理 → `potrace` → 等比归一到 `viewBox 0 0 24 24`（铺满 23.2、四周留 0.4）；
  **不做「填白洞」后处理**（那会把女厕两条腿粘成一块）。
- 通用阈值 **130**（150 会把腿缝、票券白缝糊死）。
  **四个卫生间图标例外**（`restroom` / `_men` / `_women` / `_third`，2026-11-01 重描）：
  ×8 上采样 + `UnsharpMask(radius=2, percent=250)` + 阈值 **118**。源图里手缝 146–165、
  腿缝 118–134 灰阶，130 会把整条缝判成实心 → 「手粘在身上、两条腿并成一块」。
  改这几个参数后**必须反渲染到 400px 目视检查手缝、腿缝**（50px 下 0.3 个 viewBox 单位的缝看不出来）。
- 全部按附录 B 原图（「禁止通行」是**圆环 + 横杠**；「服务中心」用 p45_08 柜台版，
  p46 那版画的是男+女，等于厕所）。

### 11.5 背景与落板配色

- **背景彻底单色**（用户拍板 2026-11-01）：`shanghai/Background.tsx` **已删掉 `MultiRowBackground`**，
  只留 `BackgroundBox`（一个 div 直接铺 `backgroundColor`，`position: relative` 给绝对定位的牌面用）；
  所有组件 props 里**没有 `background2`**，编辑器只给一项「背景色」。
- **背景色跟随底板**（用户拍板 2026-11-01）：上海归到「重庆 / 北京新 / 东京」那一档 ——
  `GuideBoard.tsx` 的 `bakeDropColors` 里 `currentTheme === 6`：组件 defaultProps 的 background
  默认是**主题深灰**（不是透明），落板时若有「底板背景色」就固化板色，没有就保留主题色。
  间距 / 空格 / 分隔线仍永远透明、不固化。
- 面板文案**不带单位注释**（「字距」不写「（em）」，「尺寸」不写「（px）」）；
  「线路色（下段）」不写「可空」（填成和上段一样就是单色）。

### 11.6 i18n

键布局 `themes.shanghai.*`（`displayName` / `components.<Comp>.props.*` / `colors.*`），
11 语言全量。**坑（踩过两次）**：`public/locales/zh-CN/translation.json` 改完必须同步
**`src/locales/zh-CN.json`**（打包兜底资源），否则简中界面里主题名会显示成裸 key
`themes.shanghai.displayName`。其它 10 种语言走 `public/locales/` 的后端加载，不用同步。

### 11.7 上海主题的坑

- **文字按墨迹对齐**：中文与拉丁的 side bearing 不同，按排字原点对齐会让英文探出 1–2px
  （左对齐探左、右对齐探右）。`define/text.ts` 用 canvas `actualBoundingBoxLeft/Right`
  取墨迹范围，`inkShift()` 按墨迹边缘对齐；`BigZh`/`BigEn` 的上下居中同样用
  `actualBoundingBoxAscent/Descent`（`offsetY = 0` 时墨迹正中，不再是 est 0.88em）。
- **`BackgroundBox` 必须 `position: relative`**：删掉 `MultiRowBackground` 后 `TextLineNum`
  的牌面靠绝对定位摆位，父层没有定位上下文就会跑到画板外面。
- **Semi 的 `Select.Option` 只认 `label`**：传给 `children` 会被忽略 —— 图标下拉的 18px 预览
  必须塞进 `label`（ReactNode）。下拉**不要搜索框**（用户要求）。
- **拐弯箭头镜像顺序**：CSS 变换从右往左生效，正确写法是 `rotate(...) scaleX(-1)`
  （先镜像再旋转）；写反会得到错的方向。拐弯方向表单项按 `shape` 互斥显示。
- **箭头不是「实心三角 + 台阶肩」**，是 **V 形人字臂 + 矩形杆**（臂外端竖直平切、下沿斜收回杆侧）。
  **标准里没有 90° 弯折箭头**：图 54 那条是直行右箭头；`TurnRightGlyph` 是按同一套比例
  构造的（折角取 180° 调头箭头的内外半径）。要「严格照抄图 54」就用 `RightArrowGlyph`。
- **图标源位图只有 ~48px**：票据类细线（`ticket_service` / `ticket_office`）描摹后比源图略粗，
  是分辨率上限，不是参数问题。

## 12. 东京地铁主题（東京メトロ）

- key `themes.tokyo-metro`，**THEME_INDEX = 5**，代码 `src/components/themes/tokyo/`；
  资料/实测/门匾参考图在 `docs/tokyo/`（不入库）。**只研究长条横幅**：竖排方向牌、
  带地图的出入口総合案内、现场临时贴纸一律不作参考（用户反复强调）。
- 16 组件：LineBadge / Route / OperatorLogo / Arrow / Icon / ExitTip / ExitNum / StationName /
  Direction / TextJa / TextJaEn / TextQuad / SpecLine / Spacing / Blank / Frame。
- **线路标**：CI 指南 P8 几何（内白圆 0.765A、环厚 0.1175A、字母 ink 0.248A、数字 0.267A、
  间隙 0.073A）；无数字时字母 ×1.35、单字母再 ×1.75；数字按**墨迹**居中 + 0.02A 字距；
  圆/圆角方、环厚两档；大 52 / 小 36；Futura。
- **OperatorLogo**：文案由 `operator` 决定、**不可编辑**（防「都営地下鉄 + 東京メトロ」错配）。
  メトロ = [亮蓝 `#00a3d9` 方块 + Heart M 0.94H][深蓝 `#0b1f33` 方块 + 「東京メトロ」0.19H 一行]，
  两块**等大正方形**首尾相贴、各自 `2px solid #fff` 白边、`borderRadius: 2`（四角一致，
  **不许 0px 单角覆盖**）、右块底色写死、**无英文行**；都営 = 一整块绿 `#00a041` 圆角牌
  （宽度随内容、非正方形）+ 白色 T 符号 + 「都営地下鉄 / TOEI SUBWAY」两行（0.28H / 0.16H）。
- **ExitTip**：无圆角、贴顶，默认 `exitnumbackground #3d4757`。**ExitNum**：只有数字/字母
  （没有「出口/Exit」黑块）、Arial、垂直居中、默认黄底 `#ffc72c` 黑字。
- **Icon**：157 项官方图记（`guideline_2025.pdf` p12–p31 矢量提取，**勿手改坐标**）+
  两个彩色运营者 logo；下拉无输入过滤、带 18px 预览、名称走 i18n。
  **画的是「官方基准框 + 图形」而不是裸图形**（2026-11-01，用户指出边框被丢掉）：
  框 = 99.09×99.09pt 圆角方（圆角 6.25%）/ ⌀105.26 圆 / 方角方三种，p13 箭头与 p25–p26 禁止**官方无框**；
  图形在框内**不一定居中**，归一化矩形存在 `icons/pictogram-frames.ts`（`x/y/w/h`，框边长 = 1）。
  `height` = **框边长**（默认 52）、`plateColor` 白牌 / `borderColor` / `borderWidth`（默认 1.5）/
  `showFrame`（**默认关**：没有显式值就不画框，老存档不会被塞进白牌）；
  描边用 `boxShadow: inset 0 0 0 Npx <color>`（不占布局、跟着圆角裁）。
  反白用法（现场蓝底白图）= plateColor 蓝 + foreground 白 + borderWidth 0。
- **Direction**：目的地+「方面」+经由+罗马字+英文线路名+**可增删徽章组**（成都 StationNumber
  那套卡片 UI，新增默认 `A`）；**无行距字段**；三行容器锁 `lineHeight: 1`（否则「日英之间空一截」）。
- **TextQuad**：日/英各一行，中韩同排（`zhkoSameLine` 可关）。文字组件**无折行宽度**，
  换行用 TextArea 回车；`define/wrap.ts` 已删除。
- **Frame**：默认高 48、`marginX` 留白、`plateColor`（白牌）与 `background` 分离；子项按
  `框高/64` 缩放；内容靠左、`transformOrigin: top left`、内层锁 `height: 64`。
  **测宽顺序**：量未缩放宽 `W` → 框宽 `W×scale+padding×2+1` → 内层宽写 `W`（反过来推会把
  内层算窄，末项被裁、间距撑不开）。**框内禁止放间距**（`addItemToTwoRowContainer` 拒收）。
- **颜色**：深蓝 `#0b1f33` / 白底黑字（`background3`+`foreground3`）/ 出口黄 `#ffc72c`+黑；
  线路色 **73 条** = 9 条メトロ（CI P9）+ 53 条都市圈其它运营商（键名 `line`+缩写，
  文案「缩写 + 当地线路名」）。**仍缺**（不硬填）：TT/TX/SR/HS/横浜市営 B·G/新京成 SL/東葉 TR；
  双色徽章 R、NT 只存主色。
- **字体**：和文 Noto Sans JP；站号字母+数字 **Futura Bold**（自托管图床 woff2）；欧文
  **Frutiger**（标牌用语，复用 chongqing 已注册的 `Frutiger` → `/fonts/Frutiger-Normal.ttf`，
  **只有 Roman，700 靠合成粗体**）。注：官方 CI PDF 内嵌欧文是 Helvetica（`pdffonts` 实测）
  ——品牌层 Helvetica、标牌层 Frutiger。

### 12.1 东京主题的坑

- **容器判定**：`GuideBoard` 曾有两处写死 `includes('TwoRowContainer')`，Frame 不含该子串 →
  「拖进去没反应 / 框内排序空转」都表现为**静默无操作**。现统一用 `isContainerItemType()`
  （`GuideBoard.tsx` 导出，`Editor.tsx` 同用）。新增容器件必须检查该谓词覆盖的每一处。
- **Frame 复用双行容器契约**：行 droppable `type: "two-row-container-row"` + `rowIndex: 0`、
  子项 `context: "two-row"`、内层挂 `two-row-inner`。**不要再注册 `two-row-container` 层**：
  两个矩形重合时指针可能命中容器本身、拿不到 rowIndex，会静默退回主行。
- **`public/` 不能被 JS import**（Vite 报错白屏）：简中兜底改 `src/locales/zh-CN.json`，
  **改 `public/locales/zh-CN/translation.json` 后必须同步这份副本**（同 §11 那条坑）。
- **缩放后发糊**：平移层/缩放层/卡片曾常驻 `will-change: transform`，合成层缓存 1× 位图，
  放大即拉伸→「糊着，点一下才清楚」。现在只在手势期间开（停手 160ms 关→重光栅化）；
  **完全去掉会让平移变卡**，所以是「手势开、静止关」。
- 图记名走 `themes.tokyo-metro.pictograms.<id>`，缺键回退 `pictogramLabel(p, lang)`。
