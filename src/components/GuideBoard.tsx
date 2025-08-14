import LineNum from "./themes/chongqing/LineNum";
import LineText from "./themes/chongqing/LineText.tsx";
import Arrow from "./themes/chongqing/Arrow.tsx";
import themes from "./themes/themereg.ts";

const currentTheme=0;

export default function GuideBoard() {
  return (
    <div className="m-auto h-64px w-512px border-1px border-solid bg-white p-1px flex align-center"
    style={{
      borderColor: themes[currentTheme][1].colors.defaultBorder,
      backgroundColor: themes[currentTheme][1].colors.defaultBackground,
      color: themes[currentTheme][1].colors.defaultForeground,
      fontFamily: themes[currentTheme][1].fontFamily,
    }}>
      <Arrow />
      <LineNum />
      <LineText />
    </div>
  );
}
