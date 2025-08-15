import { useTranslation } from "react-i18next";
import { Card, List, Typography } from "@douyinfe/semi-ui";
import themes from "./themes/themereg";
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import type { GuideItem } from "../interfaces/guide";

const currentTheme = themes[0][1];
interface ComponentItemProps {
  name: string;
  Component: React.ComponentType<any>;
  type: string;
  props?: Record<string, any>;
}

const DraggableComponentItem: React.FC<ComponentItemProps> = ({
  name,
  Component,
  type,
  props = {},
}) => {
  const { t } = useTranslation();
  const [id] = useState(
    () => `${type}-${Math.random().toString(36).substring(2)}`
  );

  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
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
            className={`cursor-grab w-full touch-none ${isDragging ? 'opacity-50' : ''}`}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
      }}
    >
      <Card className="mb-2 hover:shadow-lg transition-shadow" shadows="hover">
        <div
          className="h-16 flex items-center justify-center"
          style={{ fontFamily: currentTheme.fontFamily }}
        >
          <Component {...props} />
        </div>
        <Typography.Text className="text-center block mt-2 font-sans">
          {t(name+".displayName")}
        </Typography.Text>
      </Card>
    </div>
  );
};

export default function ComponentsList() {
  const { t } = useTranslation();

  // 直接使用组件列表，无需转换
  const components = currentTheme.components;

  return (
    <div className="w-300px border-r border-gray-200 p-4 overflow-y-auto h-screen">
      <Typography.Title heading={4} className="mb-4 font-sans">
        {t("componentsList.title")}
      </Typography.Title>

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
            />
          </List.Item>
        )}
      />
    </div>
  );
}
