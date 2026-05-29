'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { monadMainnet } from '@/lib/chains';
import { DEPLOYMENT_BLOCK } from '@/lib/contract';
import { fetchPixelEvents } from '@/lib/events';
import { usePixelStore } from '@/store/pixelStore';
import { ActivityFeed } from './ActivityFeed';
import { ColorPalette } from './ColorPalette';
import { Leaderboard } from './Leaderboard';
import { PixelCanvas } from './PixelCanvas';
import { PlacementPanel } from './PlacementPanel';

export function CanvasArena() {
  const [zoom, setZoom] = useState(5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient({ chainId: monadMainnet.id });
  const { address } = useAccount();
  const loadEvents = usePixelStore((state) => state.loadEvents);
  const setWalletAddress = usePixelStore((state) => state.setWalletAddress);
  const setEventError = usePixelStore((state) => state.setEventError);
  const eventError = usePixelStore((state) => state.eventError);

  const refresh = useCallback(async () => {
    if (!publicClient) return;
    setLoading(true);
    try {
      const latestBlock = await publicClient.getBlockNumber();
      const events = await fetchPixelEvents(publicClient, DEPLOYMENT_BLOCK, latestBlock);
      loadEvents(events, latestBlock);
    } catch (error) {
      console.error(error);
      setEventError('Could not load PixelPlaced events. Check RPC, contract address, and deployment block.');
    } finally {
      setLoading(false);
    }
  }, [loadEvents, publicClient, setEventError]);

  useEffect(() => setWalletAddress(address), [address, setWalletAddress]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const interval = window.setInterval(refresh, 5000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return (
    <section id="arena" className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[.04] p-3">
          <div>
            <h2 className="text-xl font-black">Canvas Arena</h2>
            <p className="text-sm text-white/50">128 × 128 pixels · reconstructed from onchain events</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl bg-white/10 px-3 py-2 font-bold hover:bg-white/15" onClick={() => setZoom((value) => Math.max(3, value - 1))}>−</button>
            <button className="rounded-xl bg-white/10 px-3 py-2 font-bold hover:bg-white/15" onClick={() => setZoom((value) => Math.min(12, value + 1))}>+</button>
            <button className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15" onClick={() => setPan({ x: 0, y: 0 })}>Reset view</button>
            <button className="rounded-xl bg-[#7B3FF2]/80 px-3 py-2 text-sm font-bold hover:bg-[#7B3FF2]" onClick={refresh}>{loading ? 'Refreshing…' : 'Refresh canvas'}</button>
          </div>
        </div>
        {eventError && <div className="rounded-2xl border border-red-300/30 bg-red-400/10 p-4 text-sm text-red-100">{eventError}</div>}
        <PixelCanvas zoom={zoom} pan={pan} onPanChange={setPan} />
      </div>
      <aside className="space-y-5">
        <ColorPalette />
        <PlacementPanel />
        <Leaderboard />
        <ActivityFeed />
      </aside>
    </section>
  );
}
