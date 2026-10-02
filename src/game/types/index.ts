export type GamePath = 'protection' | 'security';

export interface Question {
  id: string;
  category: string;
  prompt: string;
  correctAnswer: string;
  wrongAnswers: string[];
  explanation: string;
}

export interface Mission {
  id: string;
  title: string;
  npcName: string;
  gridX: number;
  gridY: number;
  color: string;
  questions: Question[];
}

export interface Building {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridHeight: number;
  color: string;
}

export interface NPC {
  id: string;
  name: string;
  missionId: string;
  gridX: number;
  gridY: number;
  color: string;
}

export interface PlayerState {
  x: number;
  y: number;
  direction: 'u' | 'd' | 'l' | 'r';
  isWalking: boolean;
}

export interface GameState {
  path: GamePath | null;
  score: number;
  completedMissionsCount: number;
  combo: number;
  bestCombo: number;
  totalAnswered: number;
  correctAnswersCount: number;
  currentMissionIndex: number;
  currentQuestionIndex: number;
  tagsHit: Record<string, number>;
  audioEnabled: boolean;
  player: PlayerState;
  highScore: number;
}

export type GameView = 'theater' | 'path_selection' | 'city' | 'quiz' | 'final' | 'credits' | 'help';
