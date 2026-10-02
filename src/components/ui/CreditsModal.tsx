import React from 'react';
import { gameStateStore } from '../../game/state/GameStateStore';
import { ArrowLeft, Users, Award } from 'lucide-react';

export const CreditsModal: React.FC = () => {
  const handleClose = () => {
    gameStateStore.setView('theater');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 font-mono">
      <div className="max-w-xl w-full bg-slate-900 border-4 border-amber-500 rounded-xl p-6 space-y-6 shadow-2xl relative text-center">
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700 flex items-center space-x-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR</span>
        </button>

        <div className="pt-2">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">NOS BASTIDORES</div>
          <h2 className="text-2xl font-black text-amber-400">CRÉDITOS DO PROJETO</h2>
        </div>

        {/* Team Members */}
        <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-amber-300 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>EQUIPE DE DESENVOLVIMENTO</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-200 font-medium">
            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">Nícolas Adriel</div>
            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">Gustavo Henrique</div>
            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">Marcela Stolv</div>
            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">Bruna Oliveira</div>
          </div>
        </div>

        {/* Course / Class */}
        <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-xs uppercase">
            <Award className="w-4 h-4" />
            <span>TURMA & PARCERIA</span>
          </div>
          <p className="text-sm font-extrabold text-slate-100">SENAI — ENERGISA · APB-044.029</p>
        </div>

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
          Caminhos da Cidadania · Reconstrução NHP React + Phaser
        </div>
      </div>
    </div>
  );
};
