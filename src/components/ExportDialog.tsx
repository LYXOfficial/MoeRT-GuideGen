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

  // 当对话框显示时，获取当前指示牌宽度作为基准
  useEffect(() => {
    if (visible) {
      const guide = document.querySelector(".guide-board") as HTMLElement;
      if (guide) {
        const currentWidth = guide.offsetWidth;
        setBaseWidth(currentWidth);
        setWidth(currentWidth);
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
    const originalBorder = guide.style.border;
    const originalTransform = guide.style.transform;
    const originalWidth = guide.style.width;

    try {
      // 开始导出，显示loading
      setIsExporting(true);

      // 创建遮罩层
      const mask = document.createElement("div");
      mask.id = "export-mask";
      mask.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-size: 16px;
        color: #666;
      `;
      mask.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        ">
          <div style="
            width: 32px;
            height: 32px;
            border: 3px solid #e5e5e5;
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
      guide.style.border = "none";
      operationBtns.forEach(btn => {
        (btn as HTMLElement).style.display = "none";
      });

      // 2. 等待字体和样式应用
      await new Promise(resolve => setTimeout(resolve, 300));
      await document.fonts.ready;

      // 3. 计算缩放比例
      const scale = width / baseWidth;

      // 4. 临时应用缩放到元素上，确保内容正确缩放
      guide.style.transform = `scale(${scale})`;
      guide.style.transformOrigin = "top left";
      guide.style.width = `${baseWidth}px`;

      // 等待重新布局
      await new Promise(resolve => setTimeout(resolve, 100));

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
        // 对于大尺寸图片，使用更高的内部分辨率
        scale: scale > 2 ? 2 : 1,
        backgroundColor: backgroundColor,
        // 高质量设置
        quality: 1.0,
        // 样式处理
        style: {
          fontFamily: computedStyle.fontFamily,
        },
        // 过滤不需要的元素
        filter: (node: Node) => {
          if (node instanceof Element) {
            const classList = Array.from(node.classList || []);
            // 过滤掉操作按钮、拖拽相关元素
            return !classList.some(
              cls =>
                cls.includes("operation-btn") ||
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

      // 5. 创建链接并下载
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
      // 7. 恢复原始样式
      guide.style.border = originalBorder;
      guide.style.transform = originalTransform;
      guide.style.width = originalWidth;
      operationBtns.forEach(btn => {
        (btn as HTMLElement).style.display = "";
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
      <Form className="mb-20px">
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
