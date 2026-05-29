'use client';

import { useEffect, useRef, useState } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, drawPixelGrid } from '@/lib/canvas';
import { colorToHex } from '@/lib/colors';
import { usePixelStore } from '@/store/pixelStore';
import type { PixelCoordinate } from '@/types/pixel';

type PixelCanvasProps = {
  zoom: number;
  pan: PixelCoordinate;
  onPanChange: (pan: PixelCoordinate) => void;
};

export function PixelCanvas({ zoom, pan, onPanChange }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const pixels = usePixelStore((state) => state.canvasPixels);
  const selectedPixel = usePixelStore((state) => state.selectedPixel);
  const selectedColor = usePixelStore((state) => state.selectedColor);
  const setSelectedPixel = usePixelStore((state) => state.setSelectedPixel);
  const [hover, setHover] = useState<PixelCoordinate | null>(null);

  const scale = zoom;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = CANVAS_WIDTH * scale;
    canvas.height = CANVAS_HEIGHT * scale;
    drawPixelGrid(ctx, pixels, scale);
    if (selectedPixel) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(2, scale / 4);
      ctx.strokeRect(selectedPixel.x * scale + 1, selectedPixel.y * scale + 1, scale - 2, scale - 2);
      ctx.strokeStyle = colorToHex(selectedColor);
      ctx.lineWidth = 2;
      ctx.strokeRect(selectedPixel.x * scale + 3, selectedPixel.y * scale + 3, Math.max(1, scale - 6), Math.max(1, scale - 6));
    }
  }, [pixels, scale, selectedPixel, selectedColor]);

  function eventToPixel(event: React.PointerEvent<HTMLCanvasElement>): PixelCoordinate | null {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / scale);
    const y = Math.floor((event.clientY - rect.top) / scale);
    if (x < 0 || y < 0 || x >= CANVAS_WIDTH || y >= CANVAS_HEIGHT) return null;
    return { x, y };
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#7B3FF2]/30 bg-black/70 shadow-[0_0_80px_rgba(123,63,242,.18)]">
      <div className="absolute left-4 top-4 z-10 rounded-2xl border border-white/10 bg-black/70 px-3 py-2 font-mono text-xs text-white/75 backdrop-blur">
        {hover ? `hover ${hover.x},${hover.y}` : selectedPixel ? `selected ${selectedPixel.x},${selectedPixel.y}` : 'select a pixel'}
      </div>
      <div className="h-[68vh] min-h-[420px] cursor-crosshair overflow-hidden">
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
        >
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-white/10 [image-rendering:pixelated]"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
            }}
            onPointerMove={(event) => {
              setHover(eventToPixel(event));
              if (dragRef.current && event.buttons === 1 && (Math.abs(event.clientX - dragRef.current.startX) > 4 || Math.abs(event.clientY - dragRef.current.startY) > 4)) {
                onPanChange({ x: dragRef.current.panX + event.clientX - dragRef.current.startX, y: dragRef.current.panY + event.clientY - dragRef.current.startY });
              }
            }}
            onPointerUp={(event) => {
              const drag = dragRef.current;
              dragRef.current = null;
              if (!drag || (Math.abs(event.clientX - drag.startX) <= 4 && Math.abs(event.clientY - drag.startY) <= 4)) {
                setSelectedPixel(eventToPixel(event));
              }
            }}
            onPointerLeave={() => setHover(null)}
          />
        </div>
      </div>
    </div>
  );
}
