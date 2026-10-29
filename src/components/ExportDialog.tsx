import { Input, Modal, Slider } from "@douyinfe/semi-ui";
import { Form } from "@douyinfe/semi-ui";
import { Button } from "@douyinfe/semi-ui";
import { Toast } from "@douyinfe/semi-ui";
import { useEffect, useState } from "react";
import { domToPng } from "modern-screenshot";
import { IconImage } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { exportFileName } from "../utils/archiveStore";

interface ExportDialogProps {
  visible: boolean;
  onCancel: () => void;
  guideHeight: number;
}

/** 倍率范围与步进：0.5× 一档，0.5× ~ 16×；默认 2×（1× 在高分屏上偏糊） */
const EXPORT_DEFAULT_SCALE = 2;
const EXPORT_MIN_SCALE = 0.5;
const EXPORT_MAX_SCALE = 16;
const EXPORT_SCALE_STEP = 0.5;

export const ExportDialog = ({
  visible,
  onCancel,
  guideHeight,
}: ExportDialogProps) => {
  const { t } = useTranslation();
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(0);
  const [baseWidth, setBaseWidth] = useState(512);
  const [baseHeight, setBaseHeight] = useState(192);
  const [isExporting, setIsExporting] = useState(false);

  // 当对话框显示时，获取当前指示牌宽度作为基准。
  // 默认导出宽度取「设备物理像素宽」（画板 CSS 宽 × devicePixelRatio）：
  // 预览是浏览器按设备像素比栅格化的，1:1 导出在高分屏上被放大一档，
  // 字会显得比预览细一圈（用户反馈的「导出的字和预览有点不一样」）。
  useEffect(() => {
    if (visible) {
      const guide = document.querySelector(".guide-board") as HTMLElement;
      if (guide) {
        // 宽高都从 DOM 现量：guideHeight 是 App 里 ResizeObserver 上报的，
        // 而那个 observer 只在挂载时认一次画板节点，换主题 / 重挂后可能已经失联，
        // 高度会停在旧值（出现过「三行 64 应该 192，对话框却给 263」这类怪数）
        const currentWidth = guide.offsetWidth || baseWidth;
        // 高度取**内容盒**（clientHeight）：上下各 2px 的画板边框只是编辑辅助线
        // （导出时会被去掉），算进画布就会多出 4px，三行 64px 会变成 196 而不是 192
        const currentHeight = guide.clientHeight || guideHeight || 192;
        // 默认值 = 画板实际尺寸 × 2，**不乘 devicePixelRatio**
        // （用户要求默认 2× 更清晰，最多 16×，用下面的倍率滑块调）
        setBaseWidth(currentWidth);
        setBaseHeight(currentHeight);
        setWidth(Math.round(currentWidth * EXPORT_DEFAULT_SCALE));
        setHeight(Math.round(currentHeight * EXPORT_DEFAULT_SCALE));
      }
    }
  }, [visible]);

  // 当前倍率（滑条直接按倍率取值，0.5× 一档）
  const currentMultiplier = baseWidth > 0 ? width / baseWidth : 1;

  // 宽高互算：改任一边，另一边按画板原始宽高比跟随（都是「导出像素」口径）
  const aspect = baseHeight / baseWidth; // 高 / 宽
  const setWidthKeepingRatio = (next: number) => {
    setWidth(next);
    setHeight(Math.max(1, Math.round(next * aspect)));
  };
  const setHeightKeepingRatio = (next: number) => {
    setHeight(next);
    setWidth(Math.max(1, Math.round(next / aspect)));
  };

  const handleExport = async () => {
    const guide = document.querySelector(".guide-board") as HTMLElement;
    if (!guide) {
      Toast.error(t("exportDialog.error.noElement"));
      return;
    }

    const operationBtns = guide.querySelectorAll(".operation-btn");
    // 组件灰框只是编辑辅助线，导出时要临时去掉
    const framedItems = Array.from(
      guide.querySelectorAll<HTMLElement>(".guide-item-frame")
    );
    // 快照整段内联 style，结束时整体还原：
    // 直接设置 border/transform 等快捷键，会把 React 管理的内联 border-color
    // 一并覆盖成其它值（如 currentColor），逐条还原会漏掉，留下黑框。
    const originalStyleAttr = guide.getAttribute("style");
    const originalOutlines = framedItems.map(el => el.style.outline);

    try {
      // 开始导出，显示loading
      setIsExporting(true);

      // 创建遮罩层（跟随当前深浅色模式）
      const isDark = document.documentElement.classList.contains("dark");
      const mask = document.createElement("div");
      mask.id = "export-mask";
      mask.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${isDark ? "rgba(22, 22, 26, 0.8)" : "rgba(255, 255, 255, 0.8)"};
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-size: 16px;
        color: ${isDark ? "#bfc2cc" : "#666"};
      `;
      mask.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: ${isDark ? "#232429" : "white"};
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,${isDark ? "0.4" : "0.1"});
        ">
          <div style="
            width: 32px;
            height: 32px;
            border: 3px solid ${isDark ? "#3a3b42" : "#e5e5e5"};
            border-top-color: #1890ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <div>${t("exportDialog.exporting") || "正在导出图片..."}</div>
        </div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(mask);

      // 1. 临时修改样式
      // 只把边框改透明、保留 2px 边框盒：直接 border:none 会让内容整体
      // 相对预览左上偏移 2px（导出图里行内容也会少 2px），对比时看起来像「错位」。
      // 画板外框是编辑辅助线，导出时不许出现，但它的布局占位要留着。
      guide.style.borderColor = "transparent";
      operationBtns.forEach(btn => {
        (btn as HTMLElement).style.display = "none";
      });
      framedItems.forEach(el => {
        el.style.outline = "none";
      });
      // 灰框和间距箭头都吃这个变量，直接在导出根节点上关掉，
      // 无论开关当前是什么状态，导出的图里都不会有它们
      guide.style.setProperty("--guide-item-outline", "transparent");

      // 2. 等待字体和样式应用
      await new Promise(resolve => setTimeout(resolve, 300));
      await document.fonts.ready;

      // 3. 计算缩放比例
      // 状态里可能还留着键入中的小值（输入时不夹下限），导出前夹回合法区间
      const hi = Math.round(baseWidth * 16);
      const lo = Math.round(baseWidth / 2);
      const exportWidth = Math.round(Math.min(hi, Math.max(lo, width)));
      const hHi = Math.round(baseHeight * 16);
      const hLo = Math.round(baseHeight / 2);
      const exportHeight = Math.round(
        Math.min(hHi, Math.max(hLo, height || baseHeight))
      );
      const scale = exportWidth / baseWidth;

      // 4. 缩放不能加在真实节点上：modern-screenshot 克隆时不会带上
      // transform-origin（克隆根回退成 50% 50%），只要导出宽度 ≠ 画板宽度，
      // 内容就会被平移出画布——小图只剩右下角、大图直接全空。
      // 统一改成在 domToPng 的 style 选项里给克隆根显式设置。

      // 5. 获取指示牌的真实背景色
      const computedStyle = getComputedStyle(guide);
      const backgroundColor =
        computedStyle.backgroundColor === "rgba(0, 0, 0, 0)" ||
        computedStyle.backgroundColor === "transparent" ||
        !computedStyle.backgroundColor
          ? "#ffffff"
          : computedStyle.backgroundColor;

      // 6. 使用 modern-screenshot 生成图片
      // borderColor 是 React 管理的内联：导出 await 窗口内若画板重渲染，
      // React 会把主题色写回去（旧「(−2,−2)px 错位」的复发形态），临克隆前再设一次
      guide.style.borderColor = "transparent";
      const dataUrl = await domToPng(guide, {
        width: exportWidth,
        height: exportHeight,
        // 目标像素宽高由 width/height 决定，内部分辨率交给上面的
        // transform 缩放（矢量放大，不损失清晰度），不要再叠一层 scale
        scale: 1,
        backgroundColor: backgroundColor,
        // 高质量设置
        quality: 1.0,
        // 样式处理
        style: {
          fontFamily: computedStyle.fontFamily,
          // 画板边框整个从克隆里去掉：画布按「内容盒」尺寸出（宽 = 画板宽设置、
          // 高 = 行数×64），去掉边框后内容正好铺满画布，不会有 2px 边带，
          // 也不会因为保留边框盒把内容整体压低/右移 2px
          borderWidth: "0px",
          // 子元素保留原始 CSS 像素宽，只有靠 transform 才能铺满目标画布；
          // origin 必须显式给 top left，否则克隆根使用默认中心点会整体偏移
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        },
        // 过滤不需要的元素
        filter: (node: Node) => {
          if (node instanceof Element) {
            // 空行的「拖拽组件到此行」占位提示（id="empty-<idx>"）：
            // 新档默认就有一行空行，不排除的话提示文字会烘进导出图
            if (node.id?.startsWith("empty-")) return false;
            const classList = Array.from(node.classList || []);
            // 选中态高亮（粉色蒙层 + 虚线框）：键盘路径触发导出时可能还挂着
            if (
              classList.includes("guide-item-selected-mask") ||
              classList.includes("guide-item-dashed-frame")
            ) {
              return false;
            }
            // 过滤掉操作按钮、拖拽相关元素
            return !classList.some(
              cls =>
                cls.includes("operation-btn") ||
                cls.includes("guide-item-hint") ||
                cls.includes("sortable-") ||
                cls.includes("dnd-kit-") ||
                cls.includes("drag-overlay")
            );
          }
          return true;
        },
        // 处理字体加载问题
        timeout: 30000,
      });

      // 7. 创建链接并下载
      const link = document.createElement("a");
      link.download = exportFileName("exported-image", "png");
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Toast.success({
        content: t("exportDialog.success"),
        duration: 3,
      });
      onCancel();
    } catch (error) {
      console.error("Export error:", error);
      Toast.error({
        content:
          t("exportDialog.error.exportFailed") +
          (error instanceof Error ? `: ${error.message}` : String(error)),
        duration: 5,
      });
    } finally {
      // 8. 恢复原始样式：整体还原内联 style（含 border-color，避免边框变黑）
      if (guide.getAttribute("style") !== originalStyleAttr) {
        guide.setAttribute("style", originalStyleAttr ?? "");
      }
      operationBtns.forEach(btn => {
        (btn as HTMLElement).style.display = "";
      });
      framedItems.forEach((el, i) => {
        el.style.outline = originalOutlines[i];
      });

      // 移除遮罩层
      const mask = document.getElementById("export-mask");
      if (mask) {
        document.body.removeChild(mask);
      }

      // 重置导出状态
      setIsExporting(false);
    }
  };

  return (
    <Modal
      title={t("exportDialog.title")}
      visible={visible}
      onCancel={onCancel}
      closeOnEsc={!isExporting}
      footer={null}
    >
      <Form className="mb-5">
        <Form.Label>{t("exportDialog.width")}</Form.Label>
        <Input
          value={width}
          onChange={val => {
            // Semi Input 的 min/max 属性对文本输入不生效（死配置）：
            // 负数/超大值直通会产出空白图或直接抛错，还白跑 10s+ 字体内嵌。
            // 输入过程只挡非法值和疯狂上限（不夹下限，允许「8」这种键入中间态），
            // 合法区间 [baseWidth/2, baseWidth*4] 在导出前统一夹紧
            const n = Number(val);
            if (!Number.isFinite(n) || n <= 0) return;
            setWidthKeepingRatio(
              Math.round(Math.min(n, Math.round(baseWidth * 16)))
            );
          }}
          min={baseWidth / 2}
          max={baseWidth * 16}
          style={{ width: "100%" }}
        />
        <Form.Label>{t("exportDialog.height")}</Form.Label>
        <Input
          value={height}
          suffix={t("exportDialog.keepRatio")}
          onChange={val => {
            const n = Number(val);
            if (!Number.isFinite(n) || n <= 0) return;
            setHeightKeepingRatio(
              Math.round(Math.min(n, Math.round(baseHeight * 16)))
            );
          }}
          min={baseHeight / 2}
          max={baseHeight * 16}
          style={{ width: "100%" }}
        />
        <Form.Label style={{ marginTop: 5 }}>
          {t("exportDialog.scale")}
        </Form.Label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingTop: 4,
          }}
        >
          <div style={{ flex: 1 }}>
            <Slider
              // 0.5× 一档，最小 0.5×、最大 16×；刻度只标几个关键档位
              min={EXPORT_MIN_SCALE}
              max={EXPORT_MAX_SCALE}
              step={EXPORT_SCALE_STEP}
              value={Math.min(
                EXPORT_MAX_SCALE,
                Math.max(EXPORT_MIN_SCALE, currentMultiplier)
              )}
              onChange={v => {
                if (typeof v !== "number") return;
                setWidthKeepingRatio(Math.round(baseWidth * v));
              }}
              // 刻度按真实倍率定位，左侧太密（1× 只有 3%）所以只标 0.5/2/4/8/16
              marks={{
                0.5: "0.5×",
                2: "2×",
                4: "4×",
                8: "8×",
                16: "16×",
              }}
              showBoundary={false}
              tooltipVisible={false}
            />
          </div>
          <span className="font-sans text-sm tabular-nums w-12 text-right">
            ×{(width / baseWidth).toFixed(1)}
          </span>
        </div>
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <Button
            type="tertiary"
            onClick={onCancel}
            style={{ marginRight: 8 }}
            disabled={isExporting}
          >
            {t("exportDialog.cancel")}
          </Button>
          <Button
            type="primary"
            onClick={handleExport}
            icon={<IconImage />}
            loading={isExporting}
            disabled={isExporting}
          >
            {isExporting
              ? t("exportDialog.exporting") || "导出中..."
              : t("exportDialog.export")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
