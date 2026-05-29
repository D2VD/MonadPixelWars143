'use client';

import { formatNumber, shortAddress } from '@/lib/format';
import { usePixelStore } from '@/store/pixelStore';

export function Leaderboard() {
  const leaderboard = usePixelStore((state) => state.leaderboard);
  const totalPlacements = usePixelStore((state) => state.totalPlacements);
  const userPlacements = usePixelStore((state) => state.userPlacements);

  return (
    <div className="pixel-card rounded-3xl p-5">
      <h2 className="mb-4 text-lg font-black">War Stats</h2>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40">total</p>
          <p className="text-2xl font-black text-white">{formatNumber(totalPlacements)}</p>
        </div>
        <div className="rounded-2xl bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40">yours</p>
          <p className="text-2xl font-black text-white">{formatNumber(userPlacements)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <p className="text-sm text-white/55">Leaderboard is calculated client-side from PixelPlaced events.</p>
        ) : (
          leaderboard.map((entry, index) => (
            <div key={entry.address} className="flex items-center justify-between rounded-2xl bg-black/30 px-3 py-2 text-sm">
              <span><span className="mr-2 text-[#A3FF12]">#{index + 1}</span>{shortAddress(entry.address)}</span>
              <span className="font-mono text-white">{entry.placements}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
