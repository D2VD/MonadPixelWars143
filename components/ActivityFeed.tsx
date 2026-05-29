'use client';

import { colorToHex } from '@/lib/colors';
import { explorerTx, shortAddress, timeAgo } from '@/lib/format';
import { usePixelStore } from '@/store/pixelStore';

export function ActivityFeed() {
  const latestEvents = usePixelStore((state) => state.latestEvents);

  return (
    <div className="pixel-card rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black">Live Activity</h2>
        <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_16px_rgba(163,255,18,.9)]" />
      </div>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {latestEvents.length === 0 ? (
          <p className="rounded-2xl bg-black/30 p-4 text-sm text-white/55">No placements loaded yet. Deploy the contract, set env vars, and start the first war mark.</p>
        ) : (
          latestEvents.slice(0, 12).map((event, index) => (
            <div key={`${event.transactionHash ?? index}-${event.x}-${event.y}`} className="flex items-center justify-between gap-3 rounded-2xl bg-black/30 p-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded shadow" style={{ backgroundColor: colorToHex(event.color) }} />
                <div>
                  <p className="font-mono text-white">{shortAddress(event.user)} → ({event.x},{event.y})</p>
                  <p className="text-xs text-white/45">{timeAgo(event.timestamp)}</p>
                </div>
              </div>
              {event.transactionHash && <a className="text-cyan-200 hover:text-cyan-100" href={explorerTx(event.transactionHash)} target="_blank" rel="noreferrer">tx ↗</a>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
