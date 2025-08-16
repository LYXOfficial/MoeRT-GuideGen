import { Input, Modal } from "@douyinfe/semi-ui";
import { Form } from "@douyinfe/semi-ui";
import { Button } from "@douyinfe/semi-ui";
import { Toast } from "@douyinfe/semi-ui";
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { IconImage } from "@douyinfe/semi-icons";

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
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(0);
  const [baseWidth, setBaseWidth] = useState(512);

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
      Toast.error("找不到指示牌元素");
      return;
    }

    const operationBtns = guide.querySelectorAll(".operation-btn");
    const originalBorder = guide.style.border;

    try {
      // 1. 临时修改样式
      guide.style.border = "none";
      operationBtns.forEach(btn => {
        (btn as HTMLElement).style.display = "none";
      });

      // 关键修复：强制等待一个短暂的延迟（100毫秒）
      // 这给浏览器足够的时间来应用上面的样式更改，特别是字体。
      await new Promise(resolve => setTimeout(resolve, 100));

      // 2. 执行截图
      const canvas = await html2canvas(guide, {
        backgroundColor: null,
        scale: width / baseWidth,
        useCORS: true,
      });

      // 3. 创建链接并下载
      const link = document.createElement("a");
      link.download = `MoeRT_GuideGen_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      Toast.success({
        content: "导出成功！",
        duration: 3,
      });
      onCancel();
    } catch (error) {
      Toast.error({
        content:
          "导出失败：" +
          (error instanceof Error ? error.message : String(error)),
        duration: 3,
      });
    } finally {
      // 4. 恢复原始样式
      guide.style.border = originalBorder;
      operationBtns.forEach(btn => {
        (btn as HTMLElement).style.display = "";
      });
    }
  };

  return (
    <Modal
      title="导出指示牌"
      visible={visible}
      onCancel={onCancel}
      closeOnEsc={true}
      footer={null}
    >
      <Form className="mb-20px">
        <Form.Label>宽度 (像素)</Form.Label>
        <Input
          value={width}
          onChange={val => setWidth(Number(val) || baseWidth)}
          min={baseWidth / 2}
          max={baseWidth * 4}
          style={{ width: "100%" }}
        />
        <Form.Label>高度 (像素)</Form.Label>
        <Input
          value={height}
          disabled
          suffix="保持等比例"
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <Button type="tertiary" onClick={onCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" onClick={handleExport} icon={<IconImage />}>
            导出
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
