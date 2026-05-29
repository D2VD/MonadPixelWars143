import type { Address, Hash } from 'viem';

export type PixelCoordinate = {
  x: number;
  y: number;
};

export type PixelEvent = PixelCoordinate & {
  user: Address;
  color: number;
  timestamp: number;
  totalPlacements: number;
  transactionHash?: Hash;
  blockNumber?: bigint;
};

export type LeaderboardEntry = {
  address: Address;
  placements: number;
};

export type PlacementPhase = 'idle' | 'confirming' | 'pending' | 'success' | 'error';
