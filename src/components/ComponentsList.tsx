import { useTranslation } from "react-i18next";
import { Card, List, Typography, Select, Modal } from "@douyinfe/semi-ui";
import themes from "./themes/themereg";
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import type { GuideItem } from "../interfaces/guide";

interface ComponentsListProps {
  currentTheme: number;
  onThemeChange: (theme: number) => void;
}

interface ComponentItemProps {
  name: string;
  Component: React.ComponentType<any>;
  type: string;
  props?: Record<string, any>;
  currentTheme: number;
}

const DraggableComponentItem: React.FC<ComponentItemProps> = ({
  name,
  Component,
  type,
  props = {},
  currentTheme,
}) => {
  const { t } = useTranslation();
  const [id] = useState(
    () => `${type}-${Math.random().toString(36).substring(2)}`
  );

  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id,
      data: {
        type,
        item: {
          id,
          type,
          props,
          element: <Component {...props} />,
        } as GuideItem,
      },
    });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cursor-grab select-none w-full touch-none ${isDragging ? "opacity-50" : ""}`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      <Card
        className="mb-2 hover:shadow-lg transition-shadow"
        shadows="hover"
        style={{
          backgroundColor: themes[currentTheme][1].colors.defaultBackground,
        }}
      >
        <div
          className="h-16 flex items-center justify-center"
          style={{ fontFamily: themes[currentTheme][1].fontFamily }}
        >
          <Component {...props} />
        </div>
        <Typography.Text
          className="text-center block mt-2 font-sans"
          style={{
            color: themes[currentTheme][1].colors.defaultForeground,
          }}
        >
          {t(`${name}.displayName`)}
        </Typography.Text>
      </Card>
    </div>
  );
};

export default function ComponentsList({
  currentTheme,
  onThemeChange,
}: ComponentsListProps) {
  const { t } = useTranslation();
  const theme = themes[currentTheme][1];
  const components = theme.components;
  const [themeChangeVisible, setThemeChangeVisible] = useState(false);
  const [nextTheme, setNextTheme] = useState(0);

  // 处理主题选择 - 添加防抖逻辑
  const handleThemeSelect = (themeIndex: number) => {
    if (themeIndex !== currentTheme) {
      setNextTheme(themeIndex);
      setThemeChangeVisible(true);
    }
  };

  // 确认切换主题
  const confirmThemeChange = () => {
    onThemeChange(nextTheme);
    setThemeChangeVisible(false);
  };

  return (
    <div className="w-300px border-r border-gray-200 p-4 overflow-y-auto h-full">
      <div className="mb-4">
        <Typography.Title heading={4} className="font-sans block">
          {t("componentsList.theme")}
        </Typography.Title>
        <Select
          value={currentTheme}
          onChange={value => handleThemeSelect(value as number)}
          className="w-full mt-2"
          size="large"
        >
          {themes.map(([name], index) => (
            <Select.Option key={index} value={index} className="font-sans">
              {t(`${name}.displayName`)}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Typography.Title heading={4} className="mb-4 font-sans">
        {t("componentsList.title")}
      </Typography.Title>

      {/* 主题切换确认弹窗 */}
      <Modal
        title={t("componentsList.themeChange.title")}
        visible={themeChangeVisible}
        onOk={confirmThemeChange}
        onCancel={() => setThemeChangeVisible(false)}
        okText={t("componentsList.themeChange.dialog.confirm")}
        cancelText={t("componentsList.themeChange.dialog.cancel")}
      >
        <Typography.Text>
          {t("componentsList.themeChange.confirm")}
        </Typography.Text>
      </Modal>

      <List
        className="grid w-full gap-2"
        dataSource={components}
        renderItem={component => (
          <List.Item className="w-full" key={component.displayName}>
            <DraggableComponentItem
              name={component.displayName}
              Component={component.component}
              type={component.displayName}
              props={component.defaultProps}
              currentTheme={currentTheme}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
