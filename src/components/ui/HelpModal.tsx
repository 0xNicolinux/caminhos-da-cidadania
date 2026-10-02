import React from 'react';
import { gameStateStore } from '../../game/state/GameStateStore';
import { ArrowLeft, Keyboard, Smartphone, Target } from 'lucide-react';

export const HelpModal: React.FC = () => {
  const handleClose = () => {
    gameStateStore.setView('theater');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 font-mono">
      <div className="max-w-xl w-full bg-slate-900 border-4 border-amber-500 rounded-xl p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700 flex items-center space-x-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR</span>
        </button>

        <div className="text-center pt-2">
          <h2 className="text-2xl font-black text-amber-400">COMO JOGAR</h2>
          <p className="text-slate-300 text-xs">Instruções para dominar Nova Esperança</p>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start space-x-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <Keyboard className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">Teclado (Desktop)</div>
              <p>Mova o personagem com WASD ou Setas. Pressione Espaço ou Enter para interagir com o NPC (❗) próximo.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-300">Touch (Mobile)</div>
              <p>Use o D-pad virtual na tela para andar e o botão AÇÃ O para interagir com NPCs.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <Target className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-300">Missões & Quiz</div>
              <p>Responda as perguntas dentro do tempo limite. Respostas certas em sequência geram combos de pontos!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
