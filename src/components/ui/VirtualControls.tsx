import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle } from 'lucide-react';

interface VirtualControlsProps {
  onMove: (data: { dx: number; dy: number }) => void;
  onAction: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({ onMove, onAction }) => {
  const [activeDir, setActiveDir] = useState<string | null>(null);

  const handleTouchStart = (dir: 'u' | 'd' | 'l' | 'r', dx: number, dy: number) => {
    setActiveDir(dir);
    onMove({ dx, dy });
  };

  const handleTouchEnd = () => {
    setActiveDir(null);
    onMove({ dx: 0, dy: 0 });
  };

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 flex items-end justify-between pointer-events-none z-20 font-mono">
      {/* D-Pad Container */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1 bg-slate-900/80 p-2 rounded-full border-2 border-slate-700 backdrop-blur-sm shadow-xl">
        <div />
        <button
          onTouchStart={() => handleTouchStart('u', 0, -1)}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('u', 0, -1)}
          onMouseUp={handleTouchEnd}
          className={`p-3 rounded-t-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 active:bg-amber-500 active:text-slate-950 ${
            activeDir === 'u' ? 'bg-amber-500 text-slate-950' : ''
          }`}
          aria-label="Move Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          onTouchStart={() => handleTouchStart('l', -1, 0)}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('l', -1, 0)}
          onMouseUp={handleTouchEnd}
          className={`p-3 rounded-l-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 active:bg-amber-500 active:text-slate-950 ${
            activeDir === 'l' ? 'bg-amber-500 text-slate-950' : ''
          }`}
          aria-label="Move Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center p-2 text-slate-600">
          <Circle className="w-3 h-3 fill-current" />
        </div>

        <button
          onTouchStart={() => handleTouchStart('r', 1, 0)}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('r', 1, 0)}
          onMouseUp={handleTouchEnd}
          className={`p-3 rounded-r-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 active:bg-amber-500 active:text-slate-950 ${
            activeDir === 'r' ? 'bg-amber-500 text-slate-950' : ''
          }`}
          aria-label="Move Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          onTouchStart={() => handleTouchStart('d', 0, 1)}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('d', 0, 1)}
          onMouseUp={handleTouchEnd}
          className={`p-3 rounded-b-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 active:bg-amber-500 active:text-slate-950 ${
            activeDir === 'd' ? 'bg-amber-500 text-slate-950' : ''
          }`}
          aria-label="Move Down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* Action Button A */}
      <div className="pointer-events-auto">
        <button
          onClick={onAction}
          className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border-4 border-amber-300 shadow-xl flex items-center justify-center text-sm active:scale-95 transition-transform"
          aria-label="Action"
        >
          AÇÃO
        </button>
      </div>
    </div>
  );
};
