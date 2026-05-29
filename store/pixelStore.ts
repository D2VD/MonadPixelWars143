'use client';

import type { Address } from 'viem';
import { create } from 'zustand';
import { createBlankCanvas, pixelIndex } from '@/lib/canvas';
import { DEFAULT_COLOR } from '@/lib/colors';
import { applyEventsToPixels, buildLeaderboard } from '@/lib/events';
import type { LeaderboardEntry, PixelCoordinate, PixelEvent, PlacementPhase } from '@/types/pixel';

type PixelState = {
  canvasPixels: Uint32Array;
  selectedPixel: PixelCoordinate | null;
  selectedColor: number;
  walletAddress?: Address;
  cooldownEndsAt: number;
  totalPlacements: number;
  userPlacements: number;
  isPlacing: boolean;
  placementPhase: PlacementPhase;
  lastTxHash?: `0x${string}`;
  latestEvents: PixelEvent[];
  leaderboard: LeaderboardEntry[];
  lastLoadedBlock?: bigint;
  eventError?: string;
  setPixel: (x: number, y: number, color: number) => void;
  setSelectedPixel: (pixel: PixelCoordinate | null) => void;
  setSelectedColor: (color: number) => void;
  setWalletAddress: (address?: Address) => void;
  setCooldownEndsAt: (timestamp: number) => void;
  setUserPlacements: (placements: number) => void;
  setPlacementPhase: (phase: PlacementPhase, txHash?: `0x${string}`) => void;
  applyPixelEvent: (event: PixelEvent) => void;
  resetCanvas: () => void;
  loadEvents: (events: PixelEvent[], lastLoadedBlock?: bigint) => void;
  setEventError: (message?: string) => void;
};

export const usePixelStore = create<PixelState>((set, get) => ({
  canvasPixels: createBlankCanvas(),
  selectedPixel: null,
  selectedColor: DEFAULT_COLOR,
  cooldownEndsAt: 0,
  totalPlacements: 0,
  userPlacements: 0,
  isPlacing: false,
  placementPhase: 'idle',
  latestEvents: [],
  leaderboard: [],
  setPixel: (x, y, color) =>
    set((state) => {
      const nextPixels = new Uint32Array(state.canvasPixels);
      nextPixels[pixelIndex(x, y)] = color;
      return { canvasPixels: nextPixels };
    }),
  setSelectedPixel: (pixel) => set({ selectedPixel: pixel }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  setCooldownEndsAt: (timestamp) => set({ cooldownEndsAt: timestamp }),
  setUserPlacements: (placements) => set({ userPlacements: placements }),
  setPlacementPhase: (phase, txHash) => set({ placementPhase: phase, isPlacing: phase === 'confirming' || phase === 'pending', lastTxHash: txHash }),
  applyPixelEvent: (event) =>
    set((state) => {
      const nextEvents = [event, ...state.latestEvents.filter((item) => item.transactionHash !== event.transactionHash)].slice(0, 100);
      const nextPixels = new Uint32Array(state.canvasPixels);
      nextPixels[pixelIndex(event.x, event.y)] = event.color;
      return {
        canvasPixels: nextPixels,
        latestEvents: nextEvents,
        totalPlacements: Math.max(state.totalPlacements, event.totalPlacements),
        leaderboard: buildLeaderboard(nextEvents),
      };
    }),
  resetCanvas: () => set({ canvasPixels: createBlankCanvas(), latestEvents: [], totalPlacements: 0, leaderboard: [], lastLoadedBlock: undefined }),
  loadEvents: (events, lastLoadedBlock) => {
    const pixels = applyEventsToPixels(createBlankCanvas(), events);
    const latestEvents = [...events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
    const wallet = get().walletAddress?.toLowerCase();
    set({
      canvasPixels: pixels,
      latestEvents,
      totalPlacements: events.at(-1)?.totalPlacements ?? events.length,
      userPlacements: wallet ? events.filter((event) => event.user.toLowerCase() === wallet).length : get().userPlacements,
      leaderboard: buildLeaderboard(events),
      lastLoadedBlock,
      eventError: undefined,
    });
  },
  setEventError: (message) => set({ eventError: message }),
}));
