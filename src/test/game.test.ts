import { describe, it, expect, beforeEach } from 'vitest';
import { PROTECTION_MISSIONS, SECURITY_MISSIONS, getMissionsForPath } from '../game/data/missions';
import { FINAL_MISSION } from '../game/data/finalMission';
import { getRankTitle, RANKS } from '../game/data/ranks';
import { gameStateStore } from '../game/state/GameStateStore';
import { isCollision, MAP_COLS, MAP_ROWS } from '../game/data/city';

describe('Game Educational Content & Data Models', () => {
  it('has 4 Protection missions and 4 Security missions', () => {
    expect(PROTECTION_MISSIONS).toHaveLength(4);
    expect(SECURITY_MISSIONS).toHaveLength(4);
  });

  it('contains valid questions, options, and explanations for each mission', () => {
    [...PROTECTION_MISSIONS, ...SECURITY_MISSIONS, FINAL_MISSION].forEach((mission) => {
      expect(mission.id).toBeTruthy();
      expect(mission.title).toBeTruthy();
      expect(mission.npcName).toBeTruthy();
      expect(mission.questions.length).toBeGreaterThan(0);

      mission.questions.forEach((q) => {
        expect(q.prompt).toBeTruthy();
        expect(q.correctAnswer).toBeTruthy();
        expect(q.wrongAnswers.length).toBeGreaterThanOrEqual(1);
        expect(q.explanation).toBeTruthy();
      });
    });
  });

  it('returns correct missions by path', () => {
    expect(getMissionsForPath('protection')).toEqual(PROTECTION_MISSIONS);
    expect(getMissionsForPath('security')).toEqual(SECURITY_MISSIONS);
  });

  it('correctly calculates ranks for Protection and Security paths', () => {
    expect(getRankTitle('protection', 0)).toBe(RANKS.protection[0]);
    expect(getRankTitle('protection', 4)).toBe(RANKS.protection[4]);

    expect(getRankTitle('security', 0)).toBe(RANKS.security[0]);
    expect(getRankTitle('security', 4)).toBe(RANKS.security[4]);
  });
});

describe('City Map Collision System', () => {
  it('detects out of bounds collisions', () => {
    expect(isCollision(-1, 5)).toBe(true);
    expect(isCollision(MAP_COLS + 1, 5)).toBe(true);
    expect(isCollision(5, -1)).toBe(true);
    expect(isCollision(5, MAP_ROWS + 1)).toBe(true);
  });

  it('detects building collisions', () => {
    // Building Escola is at grid (1,1) width 4 height 3
    expect(isCollision(2, 2)).toBe(true);
    // Center road (9.5, 5.5) should be free
    expect(isCollision(9.5, 5.5)).toBe(false);
  });
});

describe('GameStateStore & Quiz Rules', () => {
  beforeEach(() => {
    gameStateStore.resetToMenu();
  });

  it('initializes with default menu state', () => {
    const state = gameStateStore.getState();
    expect(state.path).toBeNull();
    expect(state.score).toBe(0);
    expect(state.combo).toBe(0);
    expect(state.completedMissionsCount).toBe(0);
  });

  it('selects path and transitions to city view', () => {
    gameStateStore.selectPath('protection');
    const state = gameStateStore.getState();
    expect(state.path).toBe('protection');
    expect(gameStateStore.getView()).toBe('city');
  });

  it('calculates score and combo on correct and incorrect answers', () => {
    gameStateStore.selectPath('protection');

    // 1st correct answer: +100 (100 + 1 * 20) = 120
    gameStateStore.answerQuestion(true, 'Direitos');
    let state = gameStateStore.getState();
    expect(state.score).toBe(120);
    expect(state.combo).toBe(1);

    // 2nd correct answer: +100 (100 + 2 * 20) = 140 -> score = 260
    gameStateStore.answerQuestion(true, 'Proteção');
    state = gameStateStore.getState();
    expect(state.score).toBe(260);
    expect(state.combo).toBe(2);

    // Incorrect answer breaks combo
    gameStateStore.answerQuestion(false, 'Direitos');
    state = gameStateStore.getState();
    expect(state.score).toBe(260);
    expect(state.combo).toBe(0);
  });

  it('completes missions and advances progress', () => {
    gameStateStore.selectPath('protection');
    gameStateStore.completeMission();
    const state = gameStateStore.getState();
    expect(state.completedMissionsCount).toBe(1);
    expect(gameStateStore.getView()).toBe('city');
  });
});
