import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { CityScene } from './scenes/CityScene';
import { MAP_WIDTH, MAP_HEIGHT } from '../data/city';

interface PhaserGameProps {
  virtualMove?: { dx: number; dy: number };
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ virtualMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BootScene, PreloadScene, CityScene],
      backgroundColor: '#0f172a',
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameRef.current && virtualMove) {
      const cityScene = gameRef.current.scene.getScene('CityScene');
      if (cityScene) {
        cityScene.events.emit('virtual-move', virtualMove);
      }
    }
  }, [virtualMove]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full max-w-full max-h-full flex items-center justify-center bg-slate-950 overflow-hidden"
    />
  );
};
