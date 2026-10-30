export interface PropForm {
  key: string;
  label: string;
  element: React.ReactElement;
  /**
   * 条件显示：返回 false 时编辑弹窗里隐藏这一项。
   * 例：站名关掉「显示徽章」后，徽章那一组参数就不该出现。
   */
  visible?: (props: Record<string, any>) => boolean;
}

export interface EditorConfig {
  forms: PropForm[];
}

export interface SaveData {
  version: number;
  config: {
    width: number;
    showSpecLine: boolean;
    theme: string;
    /** 底板背景色覆盖（可选，老存档没有此字段） */
    boardBackground?: string;
    /** 默认前景色覆盖（可选，老存档没有此字段） */
    boardForeground?: string;
  };
  rows: Array<
    Array<{
      id: string;
      type: string;
      props: Record<string, any>;
    }>
  >;
}
