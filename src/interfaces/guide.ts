// 定义 GuideItem 类型
export interface GuideItem {
  id: string
  type: string
  props: Record<string, any>
  element: React.ReactNode
}
