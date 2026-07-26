import React from 'react';
import { useOSStore } from '../store/useOSStore';

export default function SignalRunnerGame() {
  const session = useOSStore((s) => s.gameplay.sessions['signal-runner']);
  const playTurn = useOSStore((s) => s.playSignalRunnerTurn);
  const resetGame = useOSStore((s) => s.resetSignalRunner);

  if (!session) return null;

  const progress = Math.min(100, Math.floor((session.intel / 24) * 100));

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-cyan-300">Signal Runner</h2>
        <p className="mt-1 text-xs text-slate-300/85">
          Scan hostile sectors, collect intel, and finish before your energy depletes.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 border-b border-white/10 px-4 py-3 text-xs">
        <div className="rounded-md bg-white/5 p-2">
          <div className="text-slate-400">Turn</div>
          <div className="mt-1 text-base font-semibold">{session.turn}</div>
        </div>
        <div className="rounded-md bg-white/5 p-2">
          <div className="text-slate-400">Energy</div>
          <div className="mt-1 text-base font-semibold">{session.energy}</div>
        </div>
        <div className="rounded-md bg-white/5 p-2">
          <div className="text-slate-400">Intel</div>
          <div className="mt-1 text-base font-semibold">{session.intel}</div>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-300/80">
          <span>Mission Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-cyan-200/90">Current phase: {session.phase}</p>
      </div>

      <div className="flex gap-2 px-4 pb-3 pt-1">
        <button
          onClick={playTurn}
          className="rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Scan Sector
        </button>
        <button
          onClick={resetGame}
          className="rounded-md border border-white/25 px-3 py-1.5 text-xs transition hover:bg-white/10"
        >
          Reboot Mission
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto border-t border-white/10 px-4 py-3">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Command Log</div>
        <div className="space-y-1 text-xs text-slate-200/90">
          {session.log.map((line, index) => (
            <div key={`${line}-${index}`} className="rounded bg-white/5 px-2 py-1">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
