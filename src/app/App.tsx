import React, { useState, useEffect } from 'react';
import { gameStateStore } from '../game/state/GameStateStore';
import { GameState, GameView } from '../game/types';
import { Header } from '../components/ui/Header';
import { TheaterIntro } from '../components/ui/TheaterIntro';
import { PathSelection } from '../components/ui/PathSelection';
import { PhaserGame } from '../game/phaser/PhaserGame';
import { QuizModal } from '../components/ui/QuizModal';
import { FinalScreen } from '../components/ui/FinalScreen';
import { HelpModal } from '../components/ui/HelpModal';
import { CreditsModal } from '../components/ui/CreditsModal';
import { VirtualControls } from '../components/ui/VirtualControls';

export const App: React.FC = () => {
  const [state, setState] = useState<GameState>(gameStateStore.getState());
  const [view, setView] = useState<GameView>(gameStateStore.getView());
  const [virtualMove, setVirtualMove] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  useEffect(() => {
    const unsubscribe = gameStateStore.subscribe((newState, newView) => {
      setState(newState);
      setView(newView);
    });
    return unsubscribe;
  }, []);

  const handleVirtualAction = () => {
    // Action trigger for Phaser game engine
    const event = new CustomEvent('phaser-virtual-action');
    window.dispatchEvent(event);
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-mono relative">
      <Header state={state} />

      <main className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center">
        {view === 'theater' && <TheaterIntro />}
        {view === 'path_selection' && <PathSelection />}
        {view === 'city' && (
          <div className="relative w-full h-full flex items-center justify-center">
            <PhaserGame virtualMove={virtualMove} />
            <VirtualControls onMove={setVirtualMove} onAction={handleVirtualAction} />
          </div>
        )}
        {view === 'quiz' && <QuizModal state={state} />}
        {view === 'final' && <FinalScreen state={state} />}
        {view === 'help' && <HelpModal />}
        {view === 'credits' && <CreditsModal />}
      </main>
    </div>
  );
};
