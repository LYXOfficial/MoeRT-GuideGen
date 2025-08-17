export default interface Theme {
  colors: {
    defaultBackground: string;
    defaultForeground: string;
    defaultBorder: string;
    colors: {
      [key: string]: string;
    };
  };
  fontFamily: string;
  components: Component[];
}
export interface Component {
  displayName: string;
  component: React.FC<any>;
  defaultProps: any;
}
