import { CanvasArena } from '@/components/CanvasArena';
import { Hero } from '@/components/Hero';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
      <Hero />
      <CanvasArena />
      <section className="pixel-card rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-[#A3FF12]">About the war</p>
            <h2 className="text-3xl font-black">A public canvas with onchain memory.</h2>
            <p className="mt-4 text-white/68">
              Monad Pixel Wars turns a simple pixel placement into shared state anyone can verify. The frontend rebuilds the 128×128 battlefield from PixelPlaced events instead of reading every pixel from the contract.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-white/70">
            <div className="rounded-2xl bg-black/30 p-4"><strong className="text-white">Cooldown:</strong> every wallet gets one free placement every 30 seconds.</div>
            <div className="rounded-2xl bg-black/30 p-4"><strong className="text-white">Cost:</strong> no protocol fee in MVP; players only pay Monad gas.</div>
            <div className="rounded-2xl bg-black/30 p-4"><strong className="text-white">Next:</strong> priority placements, seasons, factions, heatmaps, snapshots, and timelapse can be added later without changing the core event model.</div>
          </div>
        </div>
      </section>
    </main>
  );
}
