import React, { useState, useEffect } from 'react';
import { gameStateStore } from '../../game/state/GameStateStore';
import { Play, HelpCircle, Award, Sparkles } from 'lucide-react';

export const TheaterIntro: React.FC = () => {
  const [curtainOpen, setCurtainOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurtainOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleStartGame = () => {
    gameStateStore.setView('path_selection');
  };

  const handleOpenCredits = () => {
    gameStateStore.setView('credits');
  };

  const handleOpenHelp = () => {
    gameStateStore.setView('help');
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden font-mono p-4">
      {/* Background Stage Lights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Retro Curtains */}
      <div
        className={`absolute top-0 left-0 w-1/2 h-full bg-red-900 border-r-4 border-amber-500/50 shadow-2xl transition-transform duration-1000 ease-in-out z-10 ${
          curtainOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      />
      <div
        className={`absolute top-0 right-0 w-1/2 h-full bg-red-900 border-l-4 border-amber-500/50 shadow-2xl transition-transform duration-1000 ease-in-out z-10 ${
          curtainOpen ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Stage Backdrop */}
      <div className="relative z-0 max-w-2xl w-full text-center space-y-6 bg-slate-900/90 border-4 border-amber-500 p-6 sm:p-8 rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.2)]">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-bold bg-amber-500 text-slate-950 px-3 py-1 rounded-full uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Espetáculo Educativo</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400">
            CAMINHOS DA CIDADANIA
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-medium">
            Explore a cidade fictícia de <span className="text-amber-400 font-bold">Nova Esperança</span>, atenda as pessoas e defenda os direitos no jogo educativo pixel-art!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleStartGame}
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg border-2 border-amber-300 flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>INICIAR JOGO</span>
          </button>

          <button
            onClick={handleOpenHelp}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg border border-slate-700 flex items-center justify-center space-x-2 shadow transition-transform active:scale-95"
          >
            <HelpCircle className="w-5 h-5" />
            <span>COMO JOGAR</span>
          </button>

          <button
            onClick={handleOpenCredits}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg border border-slate-700 flex items-center justify-center space-x-2 shadow transition-transform active:scale-95"
          >
            <Award className="w-5 h-5" />
            <span>CRÉDITOS</span>
          </button>
        </div>

        {/* Partners */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-center space-x-6 text-xs text-slate-400 uppercase font-bold">
          <span>APOIO INSTITUCIONAL:</span>
          <span className="text-amber-400">SENAI</span>
          <span>·</span>
          <span className="text-emerald-400">ENERGISA</span>
        </div>
      </div>
    </div>
  );
};
