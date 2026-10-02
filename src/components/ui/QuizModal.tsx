import React, { useState, useEffect, useMemo } from 'react';
import { GameState } from '../../game/types';
import { getMissionsForPath } from '../../game/data/missions';
import { FINAL_MISSION } from '../../game/data/finalMission';
import { gameStateStore } from '../../game/state/GameStateStore';
import { Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  state: GameState;
}

export const QuizModal: React.FC<QuizModalProps> = ({ state }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const missions = useMemo(() => {
    return getMissionsForPath(state.path || 'protection');
  }, [state.path]);

  const currentMission = useMemo(() => {
    if (state.completedMissionsCount < missions.length) {
      return missions[state.completedMissionsCount] || missions[0]!;
    }
    return FINAL_MISSION;
  }, [missions, state.completedMissionsCount]);

  const currentQuestion = useMemo(() => {
    const qIndex = Math.min(state.currentQuestionIndex, currentMission.questions.length - 1);
    return currentMission.questions[qIndex]!;
  }, [currentMission, state.currentQuestionIndex]);

  // Shuffle answers once per question
  const shuffledOptions = useMemo(() => {
    const opts = [currentQuestion.correctAnswer, ...currentQuestion.wrongAnswers];
    return [...opts].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  // Reset question timer & states when question index changes
  useEffect(() => {
    setTimeLeft(30);
    setSelectedIdx(null);
    setShowExplanation(false);
  }, [state.currentQuestionIndex, currentQuestion]);

  // Timer Countdown
  useEffect(() => {
    if (showExplanation) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time's up -> Wrong answer
          handleOptionClick(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showExplanation, currentQuestion]);

  const handleOptionClick = (index: number) => {
    if (showExplanation) return;

    setSelectedIdx(index);
    setShowExplanation(true);

    const isCorrect = index >= 0 && shuffledOptions[index] === currentQuestion.correctAnswer;
    gameStateStore.answerQuestion(isCorrect, currentQuestion.category);
  };

  const handleNext = () => {
    if (state.currentQuestionIndex >= currentMission.questions.length) {
      if (currentMission.id === FINAL_MISSION.id) {
        gameStateStore.completeFinalMission();
      } else {
        gameStateStore.completeMission();
      }
    } else {
      setShowExplanation(false);
      setSelectedIdx(null);
    }
  };

  // Keyboard 1-4 shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showExplanation) {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNext();
        }
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < shuffledOptions.length) {
          handleOptionClick(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showExplanation, shuffledOptions]);

  const isAnswered = selectedIdx !== null || showExplanation;
  const isCorrect = selectedIdx !== null && shuffledOptions[selectedIdx] === currentQuestion.correctAnswer;

  return (
    <div className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-mono">
      <div className="max-w-2xl w-full bg-slate-900 border-4 border-amber-500 rounded-xl p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header Badge & Timer */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black bg-amber-500 text-slate-950 px-2.5 py-1 rounded uppercase">
              {currentQuestion.category}
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {currentMission.npcName} · Questão {Math.min(state.currentQuestionIndex + 1, currentMission.questions.length)}/
              {currentMission.questions.length}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-sm bg-rose-950/50 px-3 py-1 rounded border border-rose-800">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 10 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
            }`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>

        {/* Question Prompt */}
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
            {currentQuestion.prompt}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {shuffledOptions.map((opt, idx) => {
            const isThisSelected = selectedIdx === idx;
            const isThisCorrect = opt === currentQuestion.correctAnswer;

            let buttonStyle = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';

            if (showExplanation) {
              if (isThisCorrect) {
                buttonStyle = 'bg-emerald-900/90 text-emerald-100 border-emerald-500 font-bold';
              } else if (isThisSelected) {
                buttonStyle = 'bg-rose-900/90 text-rose-100 border-rose-500 font-bold';
              } else {
                buttonStyle = 'bg-slate-800/40 text-slate-500 border-slate-800 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionClick(idx)}
                className={`w-full text-left p-3 rounded-lg border-2 text-xs sm:text-sm transition-all flex items-start space-x-3 ${buttonStyle}`}
              >
                <span className="font-extrabold px-2 py-0.5 rounded bg-slate-950/60 text-amber-400 text-xs border border-slate-700">
                  {idx + 1}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation Box */}
        {showExplanation && (
          <div
            className={`p-4 rounded-lg border-2 space-y-2 animate-fadeIn ${
              isCorrect ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2 font-black text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>RESPOSTA CORRETA! (+{100 + state.combo * 20} PTS)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>RESPOSTA INCORRETA</span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {currentQuestion.explanation}
            </p>

            <button
              onClick={handleNext}
              className="mt-3 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg border-2 border-amber-300 flex items-center justify-center space-x-2 text-xs uppercase shadow transition-transform active:scale-95"
            >
              <span>{state.currentQuestionIndex >= currentMission.questions.length ? 'CONCLUIR MISSÃO' : 'PRÓXIMA PERGUNTA'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
