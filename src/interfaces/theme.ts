export default interface Theme {
  colors: {
    defaultBackground: string;
    defaultForeground: string;
    defaultBorder: string;
  };
  fontFamily: string;
  components: Component[];
}
export interface Component{
  displayName: string;
  component: React.ReactElement;
}