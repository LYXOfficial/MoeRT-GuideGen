import type { FC } from "react";
import type { GlyphProps } from "./glyph-types";
import {
  NoEntryGlyph,
  ElevatorAccessibleGlyph,
  AccessibilityGlyph,
  RampGlyph,
  GateInGlyph,
  GateOutGlyph,
  TicketServiceGlyph,
  SecurityGlyph,
  ShoppingGlyph,
  ServiceCenterGlyph,
  TicketOfficeGlyph,
  StationInGlyph,
  StationOutGlyph,
  RestroomGlyph,
  RestroomThirdGlyph,
  RestroomMenGlyph,
  RestroomWomenGlyph,
  NursingRoomGlyph,
  WaitingAreaGlyph,
  MetroGlyph,
  SuburbanRailGlyph,
  MaglevGlyph,
  TaxiGlyph,
  TrainGlyph,
  AirplaneGlyph,
  CoachGlyph,
  BusGlyph,
  ParkingGlyph,
} from "./pictograms-real";
import { MetroLogoGlyph } from "./logo-real";

export interface IconGlyphEntry {
  /** i18n 后缀：themes.shanghai.components.Icon.props.icon.<key> */
  key: string;
  glyph: FC<GlyphProps>;
}

/**
 * 上海图形符号清单，顺序按标准附录 B 的原始顺序（B.1 无障碍 → B.2 进出站/重要设施 →
 * B.3 服务设施 → B.4 常用交通），最后是申通标志。
 */
export const ICON_GLYPHS: IconGlyphEntry[] = [
  { key: "metro_logo", glyph: MetroLogoGlyph },

  { key: "gate_in", glyph: GateInGlyph },
  { key: "gate_out", glyph: GateOutGlyph },
  { key: "ticket_service", glyph: TicketServiceGlyph },
  { key: "service_center", glyph: ServiceCenterGlyph },
  { key: "restroom", glyph: RestroomGlyph },
  { key: "security", glyph: SecurityGlyph },
  { key: "shopping", glyph: ShoppingGlyph },

  { key: "ticket_office", glyph: TicketOfficeGlyph },
  { key: "station_in", glyph: StationInGlyph },
  { key: "station_out", glyph: StationOutGlyph },
  { key: "restroom_third", glyph: RestroomThirdGlyph },
  { key: "restroom_men", glyph: RestroomMenGlyph },
  { key: "restroom_women", glyph: RestroomWomenGlyph },
  { key: "nursing_room", glyph: NursingRoomGlyph },
  { key: "waiting_area", glyph: WaitingAreaGlyph },

  { key: "elevator_accessible", glyph: ElevatorAccessibleGlyph },
  { key: "accessibility", glyph: AccessibilityGlyph },
  { key: "ramp", glyph: RampGlyph },
  { key: "no_entry", glyph: NoEntryGlyph },

  { key: "metro", glyph: MetroGlyph },
  { key: "suburban_rail", glyph: SuburbanRailGlyph },
  { key: "maglev", glyph: MaglevGlyph },
  { key: "taxi", glyph: TaxiGlyph },
  { key: "train", glyph: TrainGlyph },
  { key: "airplane", glyph: AirplaneGlyph },
  { key: "coach", glyph: CoachGlyph },
  { key: "bus", glyph: BusGlyph },
  { key: "parking", glyph: ParkingGlyph },
];
