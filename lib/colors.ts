export type PixelColor = {
  name: string;
  value: number;
  hex: string;
  glow: string;
};

export const PIXEL_COLORS: PixelColor[] = [
  { name: 'Monad Purple', value: 0x7b3ff2, hex: '#7B3FF2', glow: 'rgba(123,63,242,.62)' },
  { name: 'Deep Black', value: 0x05050a, hex: '#05050A', glow: 'rgba(5,5,10,.8)' },
  { name: 'White', value: 0xffffff, hex: '#FFFFFF', glow: 'rgba(255,255,255,.5)' },
  { name: 'Electric Blue', value: 0x22d3ee, hex: '#22D3EE', glow: 'rgba(34,211,238,.62)' },
  { name: 'Neon Pink', value: 0xff3df2, hex: '#FF3DF2', glow: 'rgba(255,61,242,.62)' },
  { name: 'Lime Green', value: 0xa3ff12, hex: '#A3FF12', glow: 'rgba(163,255,18,.62)' },
  { name: 'Orange', value: 0xff8a00, hex: '#FF8A00', glow: 'rgba(255,138,0,.62)' },
  { name: 'Yellow', value: 0xffe84d, hex: '#FFE84D', glow: 'rgba(255,232,77,.62)' },
  { name: 'Red', value: 0xff2e2e, hex: '#FF2E2E', glow: 'rgba(255,46,46,.62)' },
  { name: 'Cyan', value: 0x00fff0, hex: '#00FFF0', glow: 'rgba(0,255,240,.62)' },
  { name: 'Dark Gray', value: 0x242432, hex: '#242432', glow: 'rgba(36,36,50,.7)' },
  { name: 'Light Gray', value: 0xb8b8c7, hex: '#B8B8C7', glow: 'rgba(184,184,199,.55)' },
];

export const DEFAULT_COLOR = PIXEL_COLORS[0].value;
export const BLANK_PIXEL = 0x05050a;

export function colorToHex(color: number) {
  return `#${color.toString(16).padStart(6, '0').toUpperCase()}`;
}

export function colorName(color: number) {
  return PIXEL_COLORS.find((item) => item.value === color)?.name ?? colorToHex(color);
}
