import React from 'react';
import { gameStateStore } from '../../game/state/GameStateStore';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';

export const PathSelection: React.FC = () => {
  const handleSelectPath = (path: 'protection' | 'security') => {
    gameStateStore.selectPath(path);
  };

  const handleBackToMenu = () => {
    gameStateStore.setView('theater');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 font-mono">
      <div className="max-w-3xl w-full bg-slate-900 border-4 border-amber-500 p-6 rounded-xl space-y-6 shadow-2xl relative">
        <button
          onClick={handleBackToMenu}
          className="absolute top-4 left-4 p-2 bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700 flex items-center space-x-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR</span>
        </button>

        <div className="text-center space-y-2 pt-2">
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400">ESCOLHA SEU CAMINHO</h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Duas portas estão abertas na cidade de Nova Esperança. Qual área você vai liderar hoje?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Proteção */}
          <button
            onClick={() => handleSelectPath('protection')}
            className="group flex flex-col items-center text-left bg-slate-800/80 hover:bg-blue-950/80 border-2 border-blue-500 p-5 rounded-lg transition-all shadow-md hover:scale-[1.02] active:scale-95 space-y-3"
          >
            <div className="p-3 bg-blue-600 text-white rounded-full group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-blue-400 uppercase">CAMINHO PROTEÇÃO</h3>
              <p className="text-xs text-slate-300 mt-1">
                Foco em Estatutos, ECA, direitos de crianças, jovens e idosos, e a atuação do Conselho Tutelar.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-300 bg-blue-900/60 px-3 py-1 rounded border border-blue-700">
              ENTRAR EM PROTEÇÃO →
            </span>
          </button>

          {/* Segurança */}
          <button
            onClick={() => handleSelectPath('security')}
            className="group flex flex-col items-center text-left bg-slate-800/80 hover:bg-emerald-950/80 border-2 border-emerald-500 p-5 rounded-lg transition-all shadow-md hover:scale-[1.02] active:scale-95 space-y-3"
          >
            <div className="p-3 bg-emerald-600 text-white rounded-full group-hover:scale-110 transition-transform">
              <Lock className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-emerald-400 uppercase">CAMINHO SEGURANÇA</h3>
              <p className="text-xs text-slate-300 mt-1">
                Foco em prevenção à violência, diagnóstico de vulnerabilidades, enfrentamento a maus-tratos e o PNSP.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded border border-emerald-700">
              ENTRAR EM SEGURANÇA →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
