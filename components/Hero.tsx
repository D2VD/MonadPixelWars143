'use client';

import { motion } from 'framer-motion';
import { WalletButton } from './WalletButton';

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-2xl md:p-10 arcade-grid">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#7B3FF2]/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-4xl">
        <p className="mb-4 inline-flex rounded-full border border-[#7B3FF2]/40 bg-[#7B3FF2]/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
          Monad-native onchain canvas
        </p>
        <h1 className="neon-text text-5xl font-black tracking-tight md:text-7xl">Monad Pixel Wars</h1>
        <p className="mt-4 text-2xl font-semibold text-[#C7B8FF]">One pixel. One move. Shape the Monad canvas.</p>
        <p className="mt-5 max-w-2xl text-lg text-white/72">
          A collaborative onchain canvas where every pixel placement is a Monad transaction. Coordinate, compete, and overwrite history one cooldown at a time.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <WalletButton />
          <a href="#arena" className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-center font-bold text-cyan-100 transition hover:bg-cyan-300/20">
            Start Painting
          </a>
        </div>
      </motion.div>
    </section>
  );
}
