'use client';

import { useEffect } from 'react';
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { monadPixelWarsAbi } from '@/contracts/abi';
import { monadMainnet } from '@/lib/chains';
import { colorName, colorToHex } from '@/lib/colors';
import { CONTRACT_ADDRESS } from '@/lib/contract';
import { explorerTx, secondsUntil } from '@/lib/format';
import { usePixelStore } from '@/store/pixelStore';
import { CooldownTimer } from './CooldownTimer';
import { WalletButton } from './WalletButton';

export function PlacementPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: monadMainnet.id });
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const selectedPixel = usePixelStore((state) => state.selectedPixel);
  const selectedColor = usePixelStore((state) => state.selectedColor);
  const cooldownEndsAt = usePixelStore((state) => state.cooldownEndsAt);
  const placementPhase = usePixelStore((state) => state.placementPhase);
  const lastTxHash = usePixelStore((state) => state.lastTxHash);
  const setCooldownEndsAt = usePixelStore((state) => state.setCooldownEndsAt);
  const setUserPlacements = usePixelStore((state) => state.setUserPlacements);
  const setPlacementPhase = usePixelStore((state) => state.setPlacementPhase);
  const applyPixelEvent = usePixelStore((state) => state.applyPixelEvent);

  const { writeContractAsync, data: hash } = useWriteContract();
  const { isLoading: isConfirmingReceipt } = useWaitForTransactionReceipt({ hash });
  const wrongNetwork = isConnected && chainId !== monadMainnet.id;
  const cooldownActive = secondsUntil(cooldownEndsAt) > 0;

  useEffect(() => {
    if (!address || !CONTRACT_ADDRESS || !publicClient) return;
    publicClient
      .readContract({ address: CONTRACT_ADDRESS, abi: monadPixelWarsAbi, functionName: 'getUserStats', args: [address] })
      .then(([placements, nextTime]) => {
        setUserPlacements(Number(placements));
        setCooldownEndsAt(Number(nextTime));
      })
      .catch(() => undefined);
  }, [address, publicClient, setCooldownEndsAt, setUserPlacements]);

  async function placePixel() {
    if (!CONTRACT_ADDRESS || !selectedPixel || !address) return;
    try {
      setPlacementPhase('confirming');
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: monadPixelWarsAbi,
        functionName: 'placePixel',
        args: [selectedPixel.x, selectedPixel.y, selectedColor],
        chainId: monadMainnet.id,
      });
      setPlacementPhase('pending', txHash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash });
      setPlacementPhase('success', txHash);
      setCooldownEndsAt(Math.floor(Date.now() / 1000) + 30);
      applyPixelEvent({
        user: address,
        x: selectedPixel.x,
        y: selectedPixel.y,
        color: selectedColor,
        timestamp: Math.floor(Date.now() / 1000),
        totalPlacements: usePixelStore.getState().totalPlacements + 1,
        transactionHash: txHash,
        blockNumber: receipt?.blockNumber,
      });
      setUserPlacements(usePixelStore.getState().userPlacements + 1);
    } catch (error) {
      console.error(error);
      setPlacementPhase('error');
    }
  }

  let buttonLabel = 'Place Pixel';
  let disabled = false;
  if (!CONTRACT_ADDRESS) {
    buttonLabel = 'Configure contract address';
    disabled = true;
  } else if (!isConnected) {
    buttonLabel = 'Connect wallet first';
    disabled = true;
  } else if (wrongNetwork) {
    buttonLabel = 'Switch to Monad';
  } else if (!selectedPixel) {
    buttonLabel = 'Select pixel first';
    disabled = true;
  } else if (cooldownActive) {
    buttonLabel = 'Cooldown active';
    disabled = true;
  } else if (placementPhase === 'confirming') {
    buttonLabel = 'Confirm in wallet';
    disabled = true;
  } else if (placementPhase === 'pending' || isConfirmingReceipt) {
    buttonLabel = 'Painting pixel on Monad…';
    disabled = true;
  }

  return (
    <div className="pixel-card rounded-3xl p-5">
      <h2 className="mb-4 text-lg font-black">Placement Console</h2>
      <div className="space-y-4 text-sm text-white/75">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-black/30 p-3">
          <span>Wallet</span>
          <WalletButton />
        </div>
        {wrongNetwork && (
          <div className="rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-yellow-100">
            You are on the wrong network. Switch to Monad Mainnet before placing pixels.
          </div>
        )}
        {!CONTRACT_ADDRESS && (
          <div className="rounded-2xl border border-red-300/30 bg-red-400/10 p-3 text-red-100">
            Missing NEXT_PUBLIC_CONTRACT_ADDRESS. The canvas can render locally, but onchain placement is disabled.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/30 p-3">
            <p className="text-white/45">Coordinate</p>
            <p className="font-mono text-lg text-white">{selectedPixel ? `${selectedPixel.x}, ${selectedPixel.y}` : '—'}</p>
          </div>
          <div className="rounded-2xl bg-black/30 p-3">
            <p className="text-white/45">Color</p>
            <p className="flex items-center gap-2 font-semibold text-white"><span className="h-4 w-4 rounded" style={{ backgroundColor: colorToHex(selectedColor) }} />{colorName(selectedColor)}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-black/30 p-3">
          <p className="text-white/45">Cooldown</p>
          <CooldownTimer cooldownEndsAt={cooldownEndsAt} />
        </div>
        <button
          type="button"
          disabled={disabled || isSwitching}
          onClick={() => (wrongNetwork ? switchChain({ chainId: monadMainnet.id }) : placePixel())}
          className="w-full rounded-2xl bg-[#7B3FF2] px-5 py-4 font-black text-white shadow-[0_0_35px_rgba(123,63,242,.45)] transition hover:bg-[#8d55ff] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
        >
          {isSwitching ? 'Switching…' : buttonLabel}
        </button>
        {lastTxHash && (
          <a href={explorerTx(lastTxHash)} target="_blank" rel="noreferrer" className="block text-center text-xs font-semibold text-cyan-200 hover:text-cyan-100">
            View latest transaction ↗
          </a>
        )}
        {placementPhase === 'success' && <p className="text-center text-lime-300">Pixel confirmed. Cooldown started.</p>}
        {placementPhase === 'error' && <p className="text-center text-red-300">Transaction failed or was rejected.</p>}
      </div>
    </div>
  );
}
