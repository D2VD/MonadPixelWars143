# Monad Pixel Wars

**One pixel. One move. Shape the Monad canvas.**

Monad Pixel Wars is a production-ready MVP for an onchain collaborative pixel canvas inspired by r/place and built for Monad Mainnet. Players connect an EVM wallet, pick a coordinate and palette color, and place one pixel as a Monad transaction. The MVP is free except for gas and enforces a 30 second cooldown per wallet.

## Tech stack

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS, HTML5 Canvas API
- **Web3:** wagmi, viem, RainbowKit, WalletConnect
- **State/data:** Zustand, TanStack Query, event-driven canvas reconstruction
- **Animation/UI:** Framer Motion, responsive neon arcade styling
- **Contract:** Solidity `^0.8.24`, manual Remix deployment
- **Deployment:** Vercel frontend, Remix contract deployment on Monad Mainnet

## Monad Mainnet

- Chain ID: `143`
- Native token: `MON`
- RPC: `https://rpc.monad.xyz`
- Explorer: `https://monadvision.com`

### Configure Monad Mainnet in a wallet

Add a custom EVM network with the values above. MetaMask, Rabby, OKX Wallet, WalletConnect-compatible wallets, and injected EVM wallets are supported through RainbowKit/wagmi.

## Smart contract deployment with Remix

1. Open <https://remix.ethereum.org>.
2. Create `MonadPixelWars.sol`.
3. Paste the contents of `contracts/MonadPixelWars.sol`.
4. Compile with Solidity `0.8.24` or newer.
5. Switch your wallet to Monad Mainnet.
6. In Remix Deploy & Run, choose **Injected Provider**.
7. Deploy `MonadPixelWars`.
8. Copy the deployed contract address.
9. Copy the ABI from Remix, or use the ABI in `contracts/abi.ts` for the frontend.
10. Open the contract on MonadVision and record the deployment block.
11. Add the address and deployment block to the frontend environment variables.

The MVP contract stores packed `uint32` colors, validates a fixed palette, emits `PixelPlaced` events for history, and keeps an owner-only `withdraw()` function for future paid priority placement. Priority placement, seasons, and factions are intentionally not callable in the MVP.

## Environment variables

Copy the example file and fill it after deploying the contract:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContract
NEXT_PUBLIC_DEPLOYMENT_BLOCK=123456
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

`NEXT_PUBLIC_DEPLOYMENT_BLOCK` is important because the client reconstructs the canvas from events and should not scan from genesis. If it is empty, the app falls back to block `0`, which is convenient for local smoke testing but too slow for production.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Useful checks:

```bash
npm run typecheck
npm run build
```

## Deploy frontend to Vercel

1. Push this repository to GitHub.
2. Import it in Vercel.
3. Add the three `NEXT_PUBLIC_*` environment variables.
4. Deploy.
5. After contract redeploys, update `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_DEPLOYMENT_BLOCK` and redeploy the frontend.

## Event reconstruction strategy

The frontend does **not** render 16,384 React divs and does **not** read every pixel from contract storage on each render.

Initial load:

1. The viem public client queries `PixelPlaced` logs from `NEXT_PUBLIC_DEPLOYMENT_BLOCK` to latest.
2. Zustand resets a local `Uint32Array` canvas snapshot.
3. Events are applied in order using `index = y * 128 + x`.
4. HTML5 Canvas draws the 128×128 battlefield with nearest-neighbor rendering.

Live refresh:

- The arena polls every 5 seconds and also exposes a manual refresh button.
- New events are applied into the local snapshot and recent activity feed.
- If an event query fails, the UI shows a retry-friendly error instead of crashing.

## Folder structure

```text
app/
  page.tsx
  layout.tsx
  providers.tsx
components/
  Hero.tsx
  CanvasArena.tsx
  PixelCanvas.tsx
  ColorPalette.tsx
  PlacementPanel.tsx
  CooldownTimer.tsx
  ActivityFeed.tsx
  Leaderboard.tsx
  WalletButton.tsx
lib/
  chains.ts
  contract.ts
  colors.ts
  canvas.ts
  format.ts
  events.ts
store/
  pixelStore.ts
contracts/
  MonadPixelWars.sol
  abi.ts
types/
  pixel.ts
```

## Future scaling roadmap

The MVP is deliberately simple and event-driven so it can grow without a backend today.

Future backend indexer:

- Supabase/Postgres event indexer for `PixelPlaced`
- Snapshot JSON endpoint for fast first paint
- Leaderboard and territory stats APIs
- Timelapse frame generation

Future product features:

1. **Priority paid placement** — lower cooldown, small MON fee, separate priority cooldown.
2. **Seasons** — weekly/monthly resets and archived canvases.
3. **Timelapse replay** — replay historical placements from logs or indexed frames.
4. **Factions** — users join teams and compete over territory.
5. **Heatmap** — surface contested zones and overwrite density.
6. **Shareable coordinates** — deep links like `?x=10&y=20`.

## MVP exclusions

The MVP intentionally does not include paid priority mode, guilds, seasons, a backend indexer, NFTs, tokens, chat, authentication, arbitrary color picking, or AI features.
