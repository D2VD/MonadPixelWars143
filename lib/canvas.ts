import { BLANK_PIXEL, colorToHex } from './colors';

export const CANVAS_WIDTH = 128;
export const CANVAS_HEIGHT = 128;
export const TOTAL_PIXELS = CANVAS_WIDTH * CANVAS_HEIGHT;

export function pixelIndex(x: number, y: number) {
  return y * CANVAS_WIDTH + x;
}

export function createBlankCanvas() {
  const pixels = new Uint32Array(TOTAL_PIXELS);
  pixels.fill(BLANK_PIXEL);
  return pixels;
}

export function drawPixelGrid(ctx: CanvasRenderingContext2D, pixels: Uint32Array, scale: number) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_WIDTH * scale, CANVAS_HEIGHT * scale);

  for (let y = 0; y < CANVAS_HEIGHT; y += 1) {
    for (let x = 0; x < CANVAS_WIDTH; x += 1) {
      ctx.fillStyle = colorToHex(pixels[pixelIndex(x, y)] || BLANK_PIXEL);
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }

  if (scale >= 8) {
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * scale + 0.5, 0);
      ctx.lineTo(x * scale + 0.5, CANVAS_HEIGHT * scale);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale + 0.5);
      ctx.lineTo(CANVAS_WIDTH * scale, y * scale + 0.5);
      ctx.stroke();
    }
  }
}
