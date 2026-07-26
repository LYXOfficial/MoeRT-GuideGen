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
  };
  rows: Array<
    Array<{
      id: string;
      type: string;
      props: Record<string, any>;
    }>
  >;
}
