import { Input, Modal } from "@douyinfe/semi-ui";
import { Form } from "@douyinfe/semi-ui";
import { Button } from "@douyinfe/semi-ui";
import { Toast } from "@douyinfe/semi-ui";
import { useEffect, useState } from "react";
import { domToPng } from "modern-screenshot";
import { IconImage } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";

interface ExportDialogProps {
  visible: boolean;
  onCancel: () => void;
  guideHeight: number;
}

export const ExportDialog = ({
  visible,
  onCancel,
  guideHeight,
}: ExportDialogProps) => {
  const { t } = useTranslation();
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(0);
  const [baseWidth, setBaseWidth] = useState(512);
  const [isExporting, setIsExporting] = useState(false);

  // 当对话框显示时，获取当前指示牌宽度作为基准。
  // 默认导出宽度取「设备物理像素宽」（画板 CSS 宽 × devicePixelRatio）：
  // 预览是浏览器按设备像素比栅格化的，1:1 导出在高分屏上被放大一档，
  // 字会显得比预览细一圈（用户反馈的「导出的字和预览有点不一样」）。
  useEffect(() => {
    if (visible) {
      const guide = document.querySelector(".guide-board") as HTMLElement;
      if (guide) {
        const currentWidth = guide.offsetWidth;
        // 3x 屏再乘下去文件太大，2x 已经足够接近预览观感
        const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
        setBaseWidth(currentWidth);
        setWidth(Math.round(currentWidth * dpr));
      }
    }
  }, [visible]);

  // 当宽度改变时，按比例更新高度
  useEffect(() => {
    const ratio = width / baseWidth;
    setHeight(Math.round(guideHeight * ratio));
  }, [width, guideHeight, baseWidth]);

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
      const scale = width / baseWidth;

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
      const dataUrl = await domToPng(guide, {
        width: width,
        height: height,
        // 目标像素宽高由 width/height 决定，内部分辨率交给上面的
        // transform 缩放（矢量放大，不损失清晰度），不要再叠一层 scale
        scale: 1,
        backgroundColor: backgroundColor,
        // 高质量设置
        quality: 1.0,
        // 样式处理
        style: {
          fontFamily: computedStyle.fontFamily,
          // 子元素保留原始 CSS 像素宽，只有靠 transform 才能铺满目标画布；
          // origin 必须显式给 top left，否则克隆根使用默认中心点会整体偏移
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        },
        // 过滤不需要的元素
        filter: (node: Node) => {
          if (node instanceof Element) {
            const classList = Array.from(node.classList || []);
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
      link.download = `MoeRT_GuideGen_Image_${Date.now()}.png`;
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
      closeOnEsc={true}
      footer={null}
    >
      <Form className="mb-5">
        <Form.Label>{t("exportDialog.width")}</Form.Label>
        <Input
          value={width}
          onChange={val => setWidth(Number(val) || baseWidth)}
          min={baseWidth / 2}
          max={baseWidth * 4}
          style={{ width: "100%" }}
        />
        <Form.Label>{t("exportDialog.height")}</Form.Label>
        <Input
          value={height}
          disabled
          suffix={t("exportDialog.keepRatio")}
          style={{ width: "100%" }}
        />
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
