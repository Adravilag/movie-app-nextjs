"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AutoRedirect({ to = '/', delay = 3000 }: { to?: string; delay?: number }) {
  const router = useRouter();
  const [count, setCount] = useState(Math.ceil(delay / 1000));

  useEffect(() => {
    const t = setTimeout(() => router.push(to), delay);
    const iv = setInterval(() => setCount(c => Math.max(0, c - 1)), 1000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [router, to, delay]);

  return (
    <p className="text-slate-400">Redirigiendo en {count}s...</p>
  );
}
