'use client';

import { useEffect, useState } from 'react';
import { secondsUntil } from '@/lib/format';

export function CooldownTimer({ cooldownEndsAt }: { cooldownEndsAt: number }) {
  const [remaining, setRemaining] = useState(() => secondsUntil(cooldownEndsAt));

  useEffect(() => {
    setRemaining(secondsUntil(cooldownEndsAt));
    const timer = window.setInterval(() => setRemaining(secondsUntil(cooldownEndsAt)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldownEndsAt]);

  if (remaining <= 0) {
    return <span className="text-lime-300">Ready to place</span>;
  }

  return <span className="text-yellow-200">You can place again in {remaining}s</span>;
}
