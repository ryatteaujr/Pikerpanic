export interface MezzanineCollectibleStyle {
  fill: number;
  stroke: number;
  text: string;
  glow: number;
}

const collectibleStyles: Record<string, MezzanineCollectibleStyle> = {
  TOOLS: { fill: 0x2c83c6, stroke: 0x9fe8ff, text: '#e9fbff', glow: 0x65d6ff },
  PAINT: { fill: 0x8e44ad, stroke: 0xf0b7ff, text: '#fff1ff', glow: 0xd987ff },
  BOX: { fill: 0x1faa68, stroke: 0xa8ffd1, text: '#ecfff5', glow: 0x68f39a },
  PIPE: { fill: 0xf0c44c, stroke: 0xfff0a8, text: '#1d1a08', glow: 0xffdf61 },
};

const fallbackStyle: MezzanineCollectibleStyle = {
  fill: 0x2c83c6,
  stroke: 0x9fe8ff,
  text: '#e9fbff',
  glow: 0x65d6ff,
};

export function getMezzanineCollectibleStyle(label: string): MezzanineCollectibleStyle {
  return collectibleStyles[label] ?? fallbackStyle;
}
