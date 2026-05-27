import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-brand-400">
          Name That Tune
        </Link>
        <span className="text-xs uppercase tracking-widest text-slate-500">Golf scoring</span>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-8 text-center text-xs text-slate-600">
        Previews &amp; metadata via the iTunes Search API.
      </footer>
    </div>
  );
}
