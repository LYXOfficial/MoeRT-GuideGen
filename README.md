# MoeRT-GuideGen

在线体验：https://guidegen.0v0.my/

## Introduction

轨道交通导视牌（导向标识牌）Web 编辑器，所见即所得。

- 内置重庆轨道交通、成都地铁、MTR、北京地铁（新版 / 旧样式）、东京地下铁、上海地铁、广州地铁八套主题风格，可随时切换；
- 以「行 + 组件」自由拼搭：线路号、线路名、车站名、出口、方向箭头、服务设施图标（电梯 / 楼梯 / 洗手间等）以及双行容器；
- 点击组件即可编辑属性，行可增删，牌面宽度、分隔线、组件虚线框均可调节；
- 撤销 / 重做、localStorage 多存档管理与自动保存、工程 JSON 导入 / 单存档下载导出、导出高清 PNG；
- 多语言 11 种（简体中文、繁體中文、粵語、English、日本語、한국어、Русский、Deutsch、Français、Español、Português）；
- 自适应桌面与移动 / 触屏：视口小于 1024px 自动切换为紧凑布局 + 底部组件抽屉；
- 同一浏览器多标签页互斥编辑（防止两个标签页互相覆盖存档），被占用的标签页可一键「强制接管」；
- 深色 / 浅色模式，可跟随系统。

## Usage

1. 添加组件：桌面端从左侧组件栏、移动端点顶栏「组件列表」展开底部抽屉，把组件拖入画板相应行；每行右侧的 `+` / `-` 可增删行。
2. 编辑属性：点击画板上的组件弹出属性面板（文字、颜色、对齐等），右键与左键效果一致；删除可在属性面板中完成，桌面端也可把组件拖回组件栏。
3. 双行容器：可往容器上下两行拖入组件；容器内条目可点击编辑 / 删除、可拖出到普通行；抓住容器顶部的小灰条可整体选中或拖动容器。
4. 画板设置：调节牌面宽度、分隔线显隐、「组件虚线框」开关；`Ctrl/⌘ + Z` 撤销、`Ctrl/⌘ + Y` 重做；滚轮 / 双指缩放，可用「适配」按钮把画板恢复到位。
5. 多存档与导出：顶栏文件夹图标打开「存档管理」，可新建 / 切换 / 重命名 / 复制 / 下载 / 删除存档；「导入存档」会新建一个存档并切过去，「清除全部存档」也在弹窗底部。画板内容自动保存在当前存档（localStorage），刷新后自动还原；顶栏「导出图片」可设置宽度导出 PNG，单个存档可在存档管理里下载为工程 JSON。

## Deployment

- `pnpm install` 安装依赖
- `pnpm dev` 本地开发，默认端口 5173
- `pnpm build` 生成 `dist` 静态文件，部署到任意静态文件服务器即可。
- `pnpm preview` 本地预览，默认端口 4173

## Development

- 技术栈：React 18 + TypeScript + Vite；样式用 Tailwind CSS v4（`src/global.css`），中文字体 Blueaka 由 `src/blueaka.css` 按 unicode-range 分片引入；UI 组件 @douyinfe/semi-ui；拖拽 @dnd-kit；截图导出 modern-screenshot；多语言 i18next（翻译资源在 `public/locales/*/translation.json`）。
- 主要文件：`src/components/Editor.tsx`（画布布局与拖拽编排）、`src/components/GuideBoard.tsx`（行与双行容器的状态、编辑弹窗）、`src/components/themes/<主题名>/`（主题组件 / 配色 / 字体，按数组顺序注册于 `themereg.ts`，数组下标即 THEME_INDEX）、`src/hooks/`（撤销重做、媒体查询）。
- 双行容器说明：容器本身是行内 item，内部两行存在其 `props.children` 中，编辑 / 删除 / 拖拽进出 / 存档还原 / 宽度自适应在 GuideBoard 与主题组件中做了递归处理（对单行组件透明）。
- 移动端适配：视口 < 1024px 进入紧凑布局（底部组件抽屉、手势平移、双指缩放）；拖拽使用统一指针传感器与距离激活；悬浮 hover 效果仅在支持 hover 的设备上显示。
- 常用命令：`pnpm dev` 开发；`pnpm build` 先类型检查再构建到 `dist/`；`pnpm preview` 预览产物；`pnpm exec biome check src` 静态检查（仓库的 `eslint` 脚本暂未配置，日常以 biome 为准）。

## Gallery

![](https://img.0v0.my/2025/08/14/65765d7ca1103.webp)

![](https://img.0v0.my/2026/09/09/e9ca495d71a0d.webp)

![](https://img.0v0.my/2026/09/09/15fb4ec7b95cc.webp)

![](https://img.0v0.my/2026/09/11/761cc8ed84187.webp)

![](https://img.0v0.my/2026/09/09/6f6c5ad452fcd.webp)

![](https://img.0v0.my/2026/10/31/e25ebd52e80b0f55.webp)

![](https://img.0v0.my/2026/10/31/715947c670ea0969.webp)

![](https://img.0v0.my/2026/11/02/b48d0eb3288f43c4.webp)

## 参考资料

DBJ50T-274-2017 《重庆市轨道交通客运服务标志标准》

http://www.jsfzzx.com/x/x_upfile/202008/2020083110510263962.pdf



成都于2019年改用的标准为《成都轨道交通线网导向系统技术标准》，旧版为DB5101/T 9—2018《成都市城市轨道交通线网导向系统设计导则》（https://www.biaozhunwang.com/difangbiaozhun/128917.html），但已无参考价值

但根据如下信息，这一套与重庆极度相似的JR风标准并没有以地方标准的形式被公布，所以只能结合实际情况还原制作：

https://www.chengdu.gov.cn/hd/zxft_details?siteCode=5101000028&site=cdsrmzf&url=/cdsrmzf/c169782/cdmdm_detail.shtml&id=3752104#2#3

MTR部分资源来源于Minecraft Transit Railway Mod

MTR字体来源于MTR Sung和思源宋体调整对齐拼接后的字体，对于简体字等特殊情况可能会有差异和不完美

成都地铁使用由微软雅黑拆分出西文部分的字体和中文系统字体回落，重庆轨道交通使用官方标准的所提到的Frutiger数字与Helvetica西文，中文回落为系统字体

北京地铁（新旧）参考：https://centralgo.site/download/，字体为思源黑体和 Arial

北京地铁（旧）参考：https://dbba.sacinfo.org.cn/portal/online/dd07f66ad7286140d052b7664d1617f27d9e050cee986b8b2bad00737b873859 公共交通客运标志 第2部分：城市轨道交通 DB11/T 657.2-2024 

东京地下铁参考：東京メトロ官方 CI 指南（标志 / 线路记号 / 站编号 / 线路色，从 https://www.tokyometro.jp/support/trademark/index.html 的 PDF 直链经 Wayback 取回）、東京都《标准案内サイン指针 铁道等编》（https://www.sangyo-rodo.metro.tokyo.lg.jp/tourism/shisaku/signs）、TREI 的サインシステム作品页（https://trei.jp/works/tokyo_metro_manual/）与 2015 年改定专号（https://www.tokyometro.jp/corporate/newsletter/metroNews20150317_54.pdf）；图形符号用「標準案内用図記号ガイドライン 2025」（https://www.ecomo.or.jp/barrierfree/pictogram/picto_top2025.html）。字体为思源黑体（Noto Sans JP）+ Futura PT + Helvetica

上海地铁参考：上海市地方标准 DB31/T 1104《城市轨道交通导向标识系统设计规范》（2018 首发，2025-11 修订征求意见稿），全文 PDF：https://upload.wikimedia.org/wikipedia/commons/c/c9/城市轨道交通导向标识系统设计规范（征求意见稿）.pdf ；官方网络示意图：http://www.smtdc.com/en/pdf/Shanghai%20Metro%20Network%20Map.pdf （原链已失效，取自 Wayback）；线路图另见上海地铁官网 https://www.shmetro.com 。底色深灰 / 出站黄 / 申通红 / 24 组线路色全部取自标准 6.4 条与附录 A 的 CMYK（ISO Coated 转 sRGB），图形符号按附录 B 的位图描摹（阈值 130），申通标志取自 https://commons.wikimedia.org/wiki/File:Shanghai_Metro_logo.svg 。字体为思源黑体 + Helvetica

广州地铁参考：官方没有公开的 VI 包 / 规范 PDF，版式取自 2024–2025 年实拍（11 号线云台寺站台门盖板与内环导向、万胜围站 4 号线吊顶导向牌、五羊邨站 2025-06 导向柱，均来自广州市政府网 / 南方+ / Wikimedia Commons），另用社区复刻的 2016 版导向系统（`GZMetro_VI-Library` v2.1）做父本校验；线路名与线路色取自官方线网 API `apis.gzmtr.com/app-map/metroweb/linestation`（Wayback 快照，25 条含佛山 / 有轨 / 城际）；羊角标志取自 https://commons.wikimedia.org/wiki/File:GZMTR_Logo.svg ；图形符号以国标 GB/T 10001.1-2012《公共信息图形符号 第 1 部分：通用符号》与 GB/T 10001.3《客运货运符号》为底稿（39 项已收录）。字体为思源黑体 + Arial（数字 / 西文），站名用思源宋体


## 碎碎念

*成都和重庆的标准均发生了一些变化（如下所示），但是个人并不喜欢这些新“改善”，所以我将尽量不会制作这些“标准”的歪七扭八的导视风格*

![](https://img.0v0.my/2026/09/09/c8774bfe8c5c1.webp)
![](https://img.0v0.my/2026/09/09/6ea767230c0ca.webp)
![](https://img.0v0.my/2026/09/09/9fd04be0b323e.webp)

回旋镖：还是做了（）

![](https://img.0v0.my/2026/09/09/5778c1b8f5468.webp)
![](https://img.0v0.my/2026/11/02/5739d5f87717100f.webp)


附CRT新规范DBJ50/T-274-2024《轨道交通客运服务标志标准》（仅供参考）：

https://www.kqqw.com/db50/452899.html

## 特别鸣谢

除了早年 Copilot 里蹬到的 Claude GPT Gemini外，后来北京/东京/上海/广州等使用的模型是

- GLM-5.3
- GLM-5.3-Flash
- DeepSeek-V4-Flash-Vision-Exp
- Deepseek-V4-Flash-0731
- Deepseek-V4.1-Flash
- Deepseek-V4.1-Flash-1017
- Muse Spark 1.3 Contributor

以及工具 Claude Code、DeepSeek Harness、ZCode

感谢Z/和k1s2y让我蹬到了虽然不太好用还有点慢但能用的GLM5.3F（悲：集群坠机三天了），感谢梁子开源的超便宜模型和 dsh，感谢OpenCode的超大碗订阅，10刀撬了60刀的MuseSpark和80刀（现在是100刀了）的DeepSeek。