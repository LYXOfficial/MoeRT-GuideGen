import ChongqingTheme from "./chongqing/theme";
import ChengduTheme from "./chengdu/theme";
import HongkongTheme from "./hongkong/theme";
import BeijingTheme from "./beijing/theme";
import BeijingOldTheme from "./beijing-old/theme";
import TokyoTheme from "./tokyo/theme";
import type Theme from "../../interfaces/theme";

const themes: [string, Theme][] = [
  ["themes.chongqing", ChongqingTheme],
  ["themes.chengdu", ChengduTheme],
  ["themes.hongkong", HongkongTheme],
  ["themes.beijing", BeijingTheme],
  ["themes.beijingOld", BeijingOldTheme],
  ["themes.tokyo-metro", TokyoTheme],
];

export default themes;
