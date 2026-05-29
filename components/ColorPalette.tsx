'use client';

import { PIXEL_COLORS } from '@/lib/colors';
import { usePixelStore } from '@/store/pixelStore';

export function ColorPalette() {
  const selectedColor = usePixelStore((state) => state.selectedColor);
  const setSelectedColor = usePixelStore((state) => state.setSelectedColor);

  return (
    <div className="pixel-card rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black">Battle Palette</h2>
        <span className="text-xs uppercase tracking-[0.25em] text-white/45">fixed colors</span>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-4">
        {PIXEL_COLORS.map((color) => {
          const active = selectedColor === color.value;
          return (
            <button
              key={color.value}
              type="button"
              aria-label={color.name}
              title={color.name}
              onClick={() => setSelectedColor(color.value)}
              className={`h-12 rounded-2xl border transition duration-200 ${active ? 'scale-105 border-white shadow-[0_0_26px_var(--swatch-glow)]' : 'border-white/15 hover:scale-105 hover:border-white/50'}`}
              style={{ backgroundColor: color.hex, '--swatch-glow': color.glow } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}
