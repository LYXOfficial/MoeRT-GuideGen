export interface PropForm {
  key: string;
  label: string;
  element: React.ReactElement;
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
