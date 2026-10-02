import React from 'react';
import { GameState } from '../../game/types';
import { getRankTitle } from '../../game/data/ranks';
import { gameStateStore } from '../../game/state/GameStateStore';
import { Trophy, Award, Sparkles, RotateCcw } from 'lucide-react';

interface FinalScreenProps {
  state: GameState;
}

export const FinalScreen: React.FC<FinalScreenProps> = ({ state }) => {
  const rankTitle = state.path ? getRankTitle(state.path, state.completedMissionsCount) : 'Guardião';
  const accuracy = state.totalAnswered > 0 ? Math.round((state.correctAnswersCount / state.totalAnswered) * 100) : 100;

  let stars = '⭐⭐⭐';
  if (accuracy < 70) stars = '⭐';
  else if (accuracy < 85) stars = '⭐⭐';

  const handleRestart = () => {
    gameStateStore.resetToMenu();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 font-mono">
      <div className="max-w-xl w-full bg-slate-900 border-4 border-amber-500 rounded-xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold bg-amber-500 text-slate-950 px-3 py-1 rounded-full uppercase">
            <Sparkles className="w-4 h-4" />
            <span>CAMPANHA CONCLUÍDA!</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-amber-400">VITÓRIA DA REDE!</h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Você articulou os serviços de Nova Esperança e fortaleceu a cidadania!
          </p>
        </div>

        {/* Rank & Rating Badge */}
        <div className="bg-slate-950/80 border-2 border-amber-500/60 p-4 rounded-lg space-y-2">
          <div className="text-3xl tracking-widest">{stars}</div>
          <div className="text-lg font-bold text-amber-300 uppercase">{rankTitle}</div>
          <div className="text-xs text-slate-400">Classificação Final Obtida</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="font-bold text-slate-100 text-sm">{state.score}</div>
            <div className="text-slate-400 text-[10px]">PONTUAÇÃO</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="font-bold text-slate-100 text-sm">{accuracy}%</div>
            <div className="text-slate-400 text-[10px]">PRECISÃO</div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <Sparkles className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <div className="font-bold text-slate-100 text-sm">{state.bestCombo}x</div>
            <div className="text-slate-400 text-[10px]">MAIOR COMBO</div>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg border-2 border-amber-300 flex items-center justify-center space-x-2 text-sm uppercase shadow transition-transform active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span>JOGAR NOVAMENTE</span>
        </button>
      </div>
    </div>
  );
};
