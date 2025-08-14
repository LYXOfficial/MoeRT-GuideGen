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
import Blank from "./themes/chongqing/Blank.tsx";

const currentTheme = 0;

export function GuideBoard({ children }: { children: React.ReactNode }) {
  return <div className="h-64px w-full flex align-center">{children}</div>;
}
export function LineEnd() {
  return (
    <span
      className="w-calc(100%-20px) mt-2px mb-2px ml-10px mr-10px box-border h-1px"
      style={{ backgroundColor: colors.border }}
    />
  );
}
export default function GuideBoardCols() {
  return (
    <div
      className="m-auto w-768px border-2px border-solid flex flex-col"
      style={{
        borderColor: themes[currentTheme][1].colors.defaultBorder,
        backgroundColor: themes[currentTheme][1].colors.defaultBackground,
        color: themes[currentTheme][1].colors.defaultForeground,
        fontFamily: themes[currentTheme][1].fontFamily,
      }}
    >
      <GuideBoard>
        <Arrow type="left" foreground="white" background={colors.line1} />
        <Text
          chinese="朝天门方向"
          foreground="white"
          english="To Chaotianmen"
          background={colors.line1}
        />
        <Spacing background={colors.line1} />
        <NumAlphabet
          text="1"
          type="block"
          foreground="black"
          background="white"
        />
        <Spacing background={colors.line1} />
        <Text
          chinese="璧山方向"
          foreground="white"
          english="To Bishan"
          align="right"
          background={colors.line1}
        />
        <Arrow type="right" foreground="white" background={colors.line1} />
      </GuideBoard>
      <LineEnd />
      <GuideBoard>
        <Arrow type="up" />
        <Text chinese="乘车" english="Train" />
        <LineNum num="5" lineColor={colors["line5"]} showText={false} />
        <LineNum num="18" lineColor={colors["line18"]} />
        <LineText
          chinese="江跳线"
          english="Jiangtiao Line"
          lineColor={colors["linejiangtiao"]}
        />
        <Spacing />
        <StationName chinese="跳磴" english="Tiaodeng" />
        <Spacing />
        <NumAlphabet text="2" type="fit" />
        <Text chinese="出入口" english="Entrance" />
      </GuideBoard>
      <LineEnd />
      <GuideBoard>
        <Arrow type="up-left" background={colors.facilitybackground} foreground={colors.facilityforeground} />
        <Text chinese="售票/加值" english="Ticketing/Top-up" background={colors.facilitybackground} foreground={colors.facilityforeground} />
        <Blank background={colors.facilitybackground} />
        <Spacing />
        <LineText chinese="空港线" english="Konggang Line" lineColor={colors.linekonggang} align="right"/>
        <Text chinese="换乘" english="Transfer" align="right" />
        <Arrow type="up-right"/>
        <Spacing />
        <Blank background={colors.exitbackground} />
        <NumAlphabet text="5/1/4" foreground={colors.exitforeground} background={colors.exitbackground}/>
        <Text chinese="出口" english="Exit" foreground={colors.exitforeground} background={colors.exitbackground} />
        <Arrow type="down" foreground={colors.exitforeground} background={colors.exitbackground} />
      </GuideBoard>
    </div>
  );
}
