import LineNum from "./themes/chongqing/LineNum";
import LineText from "./themes/chongqing/LineText.tsx";
import Arrow from "./themes/chongqing/Arrow.tsx";
import themes from "./themes/themereg.ts";
import Text from "./themes/chongqing/Text.tsx";
import StationName from "./themes/chongqing/StationName.tsx";
import Spacing from "./themes/chongqing/Spacing.tsx";
import colors from "./themes/chongqing/define/colors.ts";
import NumAlphabet from "./themes/chongqing/NumAlphabet.tsx";
import SpecLine from "./themes/chongqing/SpecLine.tsx";

const currentTheme = 0;

export default function GuideBoard() {
  return (
    <div
      className="m-auto h-66px w-512px border-1px border-solid bg-white flex align-center"
      style={{
        borderColor: themes[currentTheme][1].colors.defaultBorder,
        backgroundColor: themes[currentTheme][1].colors.defaultBackground,
        color: themes[currentTheme][1].colors.defaultForeground,
        fontFamily: themes[currentTheme][1].fontFamily,
      }}
    >
      <Arrow type="left" foreground="white" background={colors.line1}/>
      <Text chinese="朝天门方向" foreground="white" english="To Chaotianmen" background={colors.line1}/>
      <Spacing background={colors.line1}/>
      <NumAlphabet text="1" type="block" foreground="black" background="white"/>
      <Spacing background={colors.line1}/>
      <Text chinese="璧山方向" foreground="white" english="To Bishan" align="right" background={colors.line1}/>
      <Arrow type="right" foreground="white" background={colors.line1}/>
    </div>
  );
}
