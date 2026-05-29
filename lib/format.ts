import type { Address, Hash } from 'viem';

export function shortAddress(address?: Address | string) {
  if (!address) return 'Disconnected';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function explorerTx(hash?: Hash | string) {
  return hash ? `https://monadvision.com/tx/${hash}` : undefined;
}

export function secondsUntil(timestampSeconds?: number) {
  if (!timestampSeconds) return 0;
  return Math.max(0, timestampSeconds - Math.floor(Date.now() / 1000));
}

export function timeAgo(timestampSeconds: number) {
  const delta = Math.max(0, Math.floor(Date.now() / 1000) - timestampSeconds);
  if (delta < 10) return 'just now';
  if (delta < 60) return `${delta}s ago`;
  const minutes = Math.floor(delta / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}
