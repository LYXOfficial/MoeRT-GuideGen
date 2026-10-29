/**
 * 取色器常量下拉的互斥规则：
 * - 选「背景色」时不给任何「xx前景色」常量
 * - 选「前景色」时不给任何「xx背景色」常量
 * （含 background2 / foreground2 / exitforeground 这类同族键）
 */
export function excludeColorKeysFor(
  palette: Record<string, string>,
  fieldKey: string
): string[] {
  const keys = Object.keys(palette);
  if (fieldKey === "background") {
    return keys.filter(k => k.includes("foreground"));
  }
  if (fieldKey === "foreground") {
    return keys.filter(k => k.includes("background"));
  }
  return [];
}
