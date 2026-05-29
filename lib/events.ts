import type { Address, GetContractEventsReturnType, PublicClient } from 'viem';
import { monadPixelWarsAbi } from '@/contracts/abi';
import { pixelIndex } from './canvas';
import { CONTRACT_ADDRESS, DEPLOYMENT_BLOCK } from './contract';
import type { LeaderboardEntry, PixelEvent } from '@/types/pixel';

type PixelLogs = GetContractEventsReturnType<typeof monadPixelWarsAbi, 'PixelPlaced', true>;

export function normalizePixelLogs(logs: PixelLogs): PixelEvent[] {
  return logs
    .map((log) => {
      const { user, x, y, color, timestamp, totalPlacements } = log.args;
      if (!user || x === undefined || y === undefined || color === undefined || !timestamp || !totalPlacements) {
        return undefined;
      }
      return {
        user,
        x: Number(x),
        y: Number(y),
        color: Number(color),
        timestamp: Number(timestamp),
        totalPlacements: Number(totalPlacements),
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
      } satisfies PixelEvent;
    })
    .filter((event): event is PixelEvent => Boolean(event));
}

export async function fetchPixelEvents(publicClient: PublicClient, fromBlock = DEPLOYMENT_BLOCK, toBlock?: bigint) {
  if (!CONTRACT_ADDRESS) return [];
  const logs = await publicClient.getContractEvents({
    address: CONTRACT_ADDRESS,
    abi: monadPixelWarsAbi,
    eventName: 'PixelPlaced',
    fromBlock,
    toBlock,
    strict: true,
  });
  return normalizePixelLogs(logs);
}

export function applyEventsToPixels(pixels: Uint32Array, events: PixelEvent[]) {
  for (const event of events) {
    pixels[pixelIndex(event.x, event.y)] = event.color;
  }
  return pixels;
}

export function buildLeaderboard(events: PixelEvent[], limit = 8): LeaderboardEntry[] {
  const counts = new Map<Address, number>();
  for (const event of events) {
    counts.set(event.user, (counts.get(event.user) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([address, placements]) => ({ address, placements }))
    .sort((a, b) => b.placements - a.placements)
    .slice(0, limit);
}
