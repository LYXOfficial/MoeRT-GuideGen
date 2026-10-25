# MoeRT-GuideGen

在线体验：https://guidegen.0v0.my/

## Introduction

轨道交通导视牌（导向标识牌）Web 编辑器，所见即所得。

- 内置重庆轨道交通、成都地铁、MTR、北京地铁（新版 / 旧样式）五套主题风格，可随时切换；未来计划添加上海+广州；
- 以「行 + 组件」自由拼搭：线路号、线路名、车站名、出口、方向箭头、服务设施图标（电梯 / 楼梯 / 洗手间等）以及双行容器；
- 点击组件即可编辑属性，行可增删，牌面宽度、分隔线、组件虚线框均可调节；
- 撤销 / 重做、localStorage 多存档管理与自动保存、工程 JSON 导入 / 单存档下载导出、导出高清 PNG；
- 多语言（简体 / 繁体中文、English、日本語、한국어）；
- 自适应桌面与移动 / 触屏：视口小于 1024px 自动切换为紧凑布局 + 底部组件抽屉。

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
- 主要文件：`src/components/Editor.tsx`（画布布局与拖拽编排）、`src/components/GuideBoard.tsx`（行与双行容器的状态、编辑弹窗）、`src/components/themes/<chongqing|chengdu|hongkong>/`（主题组件 / 配色 / 字体，注册于 `themereg.ts`）、`src/hooks/`（撤销重做、媒体查询）。
- 双行容器说明：容器本身是行内 item，内部两行存在其 `props.children` 中，编辑 / 删除 / 拖拽进出 / 存档还原 / 宽度自适应在 GuideBoard 与主题组件中做了递归处理（对单行组件透明）。
- 移动端适配：视口 < 1024px 进入紧凑布局（底部组件抽屉、手势平移、双指缩放）；拖拽使用统一指针传感器与距离激活；悬浮 hover 效果仅在支持 hover 的设备上显示。
- 常用命令：`pnpm dev` 开发；`pnpm build` 先类型检查再构建到 `dist/`；`pnpm preview` 预览产物；`pnpm exec biome check src` 静态检查（仓库的 `eslint` 脚本暂未配置，日常以 biome 为准）。

## Gallery

![](https://img.0v0.my/2025/08/14/65765d7ca1103.webp)

![](https://img.0v0.my/2026/09/09/e9ca495d71a0d.webp)

![](https://img.0v0.my/2026/09/09/15fb4ec7b95cc.webp)

![](https://img.0v0.my/2026/09/11/761cc8ed84187.webp)

![](https://img.0v0.my/2026/09/09/6f6c5ad452fcd.webp)

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

## 碎碎念

*成都和重庆的标准均发生了一些变化（如下所示），但是个人并不喜欢这些新“改善”，所以我将尽量不会制作这些“标准”的歪七扭八的导视风格*

![](https://img.0v0.my/2026/09/09/c8774bfe8c5c1.webp)
![](https://img.0v0.my/2026/09/09/6ea767230c0ca.webp)

但尽管CRT的这个新换乘槽点多多，我还是尽力做出来了，即数字略微放大并略微下沉，并且对站名元素也无影响

![](https://img.0v0.my/2026/09/09/5778c1b8f5468.webp)
![](https://img.0v0.my/2026/09/09/9fd04be0b323e.webp)


附CRT新规范DBJ50/T-274-2024《轨道交通客运服务标志标准》（仅供参考）：

https://www.kqqw.com/db50/452899.html

## 特别鸣谢

除了早年 Copilot 里蹬到的 Claude GPT Gemini外，后来北京地铁使用的模型是

GLM-5.3 GLM-5.3-Flash DeepSeek-V4-Flash-Vision-Exp Deepseek-V4-Flash-0731 Deepseek-V4.1-Flash Deepseek-V4.1-Flash-1017

以及工具 Claude Code、DeepSeek Harness、ZCode

感谢Z/和k1s2y让我蹬到了虽然不太好用还有点慢但能用的GLM5.3F，感谢梁子开源的超便宜模型和 dsh。