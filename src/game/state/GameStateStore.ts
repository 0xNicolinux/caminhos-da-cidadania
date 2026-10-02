import { GameState, GamePath, GameView, PlayerState } from '../types';
import { audioSystem } from '../systems/AudioSystem';

type Listener = (state: GameState, view: GameView) => void;

class GameStateStore {
  private state: GameState;
  private currentView: GameView = 'theater';
  private listeners: Set<Listener> = new Set();

  constructor() {
    let storedHighScore = 0;
    try {
      storedHighScore = Number(localStorage.getItem('cc_highscore') || '0') || 0;
    } catch {
      // localStorage disabled or error
    }

    this.state = {
      path: null,
      score: 0,
      completedMissionsCount: 0,
      combo: 0,
      bestCombo: 0,
      totalAnswered: 0,
      correctAnswersCount: 0,
      currentMissionIndex: 0,
      currentQuestionIndex: 0,
      tagsHit: {},
      audioEnabled: true,
      player: {
        x: 9.5,
        y: 5.5,
        direction: 'd',
        isWalking: false,
      },
      highScore: storedHighScore,
    };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public getView(): GameView {
    return this.currentView;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState(), this.getView());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    const currentView = this.getView();
    this.listeners.forEach((listener) => listener(currentState, currentView));
  }

  public setView(view: GameView) {
    this.currentView = view;
    this.notify();
  }

  public selectPath(path: GamePath) {
    this.state.path = path;
    this.state.score = 0;
    this.state.completedMissionsCount = 0;
    this.state.combo = 0;
    this.state.bestCombo = 0;
    this.state.totalAnswered = 0;
    this.state.correctAnswersCount = 0;
    this.state.currentMissionIndex = 0;
    this.state.currentQuestionIndex = 0;
    this.state.tagsHit = {};
    this.state.player = {
      x: 9.5,
      y: 5.5,
      direction: 'd',
      isWalking: false,
    };

    this.currentView = 'city';
    audioSystem.setTheme('a');
    this.notify();
  }

  public updatePlayerPosition(player: PlayerState) {
    this.state.player = { ...player };
    this.notify();
  }

  public startMission(missionIndex: number) {
    this.state.currentMissionIndex = missionIndex;
    this.state.currentQuestionIndex = 0;
    this.currentView = 'quiz';
    this.notify();
  }

  public answerQuestion(isCorrect: boolean, categoryTag?: string) {
    this.state.totalAnswered++;
    if (categoryTag) {
      this.state.tagsHit[categoryTag] = (this.state.tagsHit[categoryTag] || 0) + 1;
    }

    if (isCorrect) {
      this.state.correctAnswersCount++;
      this.state.combo++;
      if (this.state.combo > this.state.bestCombo) {
        this.state.bestCombo = this.state.combo;
      }
      const pts = 100 + this.state.combo * 20;
      this.state.score += pts;
      if (this.state.score > this.state.highScore) {
        this.state.highScore = this.state.score;
        try {
          localStorage.setItem('cc_highscore', String(this.state.highScore));
        } catch {
          // ignore error
        }
      }
      audioSystem.playSfx('ok');
    } else {
      this.state.combo = 0;
      audioSystem.playSfx('err');
    }

    this.state.currentQuestionIndex++;
    this.notify();
  }

  public completeMission() {
    this.state.completedMissionsCount++;
    if (this.state.completedMissionsCount === 4) {
      audioSystem.setTheme('b');
    }
    audioSystem.playSfx('win');
    this.currentView = 'city';
    this.notify();
  }

  public completeFinalMission() {
    this.state.completedMissionsCount++;
    audioSystem.playFanfare();
    this.currentView = 'final';
    this.notify();
  }

  public toggleAudio(): boolean {
    const enabled = audioSystem.toggle();
    this.state.audioEnabled = enabled;
    this.notify();
    return enabled;
  }

  public resetToMenu() {
    this.state.path = null;
    this.state.score = 0;
    this.state.completedMissionsCount = 0;
    this.state.combo = 0;
    this.state.currentMissionIndex = 0;
    this.state.currentQuestionIndex = 0;
    this.currentView = 'path_selection';
    this.notify();
  }
}

export const gameStateStore = new GameStateStore();
