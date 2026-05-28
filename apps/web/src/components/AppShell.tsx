import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  // A small "session" identifier in the corner — pure typography, no data.
  const stamp = location.pathname.replace(/^\//, '').toUpperCase() || 'HOME';

  return (
    <div className="relative mx-auto flex min-h-full max-w-2xl flex-col px-5 pb-12 pt-6 sm:px-8">
      <header className="mb-10 flex items-baseline justify-between border-b border-rule pb-4">
        <Link
          to="/"
          className="group flex items-baseline gap-3 transition-opacity hover:opacity-80"
        >
          <span className="block h-2 w-2 -translate-y-0.5 rounded-full bg-amber shadow-[0_0_12px_2px_rgba(245,166,35,0.5)]" />
          <span className="font-serif text-xl tracking-tight text-paper">
            Name <span className="italic-soft text-amber-warm">That</span> Tune
          </span>
        </Link>
        <div className="hidden items-baseline gap-4 sm:flex">
          <span className="serial">side a · 33 1/3</span>
          <span className="serial">no. {stamp.slice(0, 6).padEnd(6, ' ')}</span>
        </div>
      </header>

      <main key={location.pathname} className="flex-1 animate-pageIn">
        {children}
      </main>

      <footer className="mt-14 flex items-center justify-between border-t border-rule pt-4">
        <span className="serial">an offline-first listening cabinet</span>
        <span className="serial opacity-60">previews · itunes search api</span>
      </footer>
    </div>
  );
}
