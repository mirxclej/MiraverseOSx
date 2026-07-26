import React from 'react';
import { useOSStore } from '../store/useOSStore';
import { GAME_REGISTRY, getGame } from './index';

export default function GameplayHub() {
  const activeGameId = useOSStore((s) => s.gameplay.activeGameId);
  const setActiveGame = useOSStore((s) => s.setActiveGame);

  const activeGame = getGame(activeGameId);
  const ActiveGameComponent = activeGame.component;

  return (
    <div className="flex h-full bg-black/50">
      <aside className="w-56 border-r border-white/10 bg-black/35 p-3">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
          Gameplay
        </div>
        <div className="space-y-1.5">
          {GAME_REGISTRY.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-xs transition ${
                game.id === activeGame.id
                  ? 'bg-cyan-500/25 text-cyan-200'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold">{game.title}</div>
              <div className="mt-0.5 text-[11px] text-white/55">{game.subtitle}</div>
            </button>
          ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <ActiveGameComponent />
      </main>
    </div>
  );
}
