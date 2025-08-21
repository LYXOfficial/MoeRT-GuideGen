import ChongqingTheme from "./chongqing/theme";
import ChengduTheme from "./chengdu/theme";
import HongkongTheme from "./hongkong/theme";
import type Theme from "../../interfaces/theme";

const themes: [string, Theme][] = [
  ["themes.chongqing", ChongqingTheme],
  ["themes.chengdu", ChengduTheme],
  ["themes.hongkong", HongkongTheme],
];

export default themes;
