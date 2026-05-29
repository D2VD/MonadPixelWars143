'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletButton() {
  return <ConnectButton chainStatus="name" accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} showBalance={false} />;
}
