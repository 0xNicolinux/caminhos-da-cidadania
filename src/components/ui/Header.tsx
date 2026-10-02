import React from 'react';
import { GameState } from '../../game/types';
import { getRankTitle } from '../../game/data/ranks';
import { gameStateStore } from '../../game/state/GameStateStore';
import { Volume2, VolumeX, Maximize2, Sparkles, Trophy } from 'lucide-react';

interface HeaderProps {
  state: GameState;
}

export const Header: React.FC<HeaderProps> = ({ state }) => {
  const toggleAudio = () => {
    gameStateStore.toggleAudio();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const pathName = state.path === 'protection' ? 'PROTEÇÃO' : state.path === 'security' ? 'SEGURANÇA' : null;
  const rank = state.path ? getRankTitle(state.path, state.completedMissionsCount) : null;
  const totalMissions = 4;
  const progressPct = Math.min(100, Math.round((state.completedMissionsCount / totalMissions) * 100));

  return (
    <header className="w-full bg-slate-900 border-b-4 border-amber-500 p-2 sm:p-3 flex items-center justify-between shadow-lg text-xs sm:text-sm font-mono tracking-wider z-20">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 bg-amber-500 text-slate-950 font-extrabold px-2 py-1 rounded border-2 border-amber-300">
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">CAMINHOS DA CIDADANIA</span>
          <span className="sm:hidden">CIDADANIA</span>
        </div>

        {pathName && (
          <div className="hidden md:flex items-center space-x-2 text-slate-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            <span className="text-amber-400 font-bold">{pathName}</span>
            <span>·</span>
            <span className="text-slate-300">{rank}</span>
          </div>
        )}
      </div>

      {state.path && (
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{state.score} PTS</span>
          </div>

          {state.combo > 1 && (
            <div className="animate-pulse text-xs font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500">
              {state.combo}x COMBO!
            </div>
          )}

          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-slate-400 text-xs">PROGRESSO:</span>
            <div className="w-24 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleAudio}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          title={state.audioEnabled ? 'Mutar Áudio' : 'Ativar Áudio'}
          aria-label="Toggle Audio"
        >
          {state.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          title="Tela Cheia"
          aria-label="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
