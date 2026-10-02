import Phaser from 'phaser';
import { TILE_SIZE, isCollision } from '../../data/city';
import { gameStateStore } from '../../state/GameStateStore';
import { getMissionsForPath } from '../../data/missions';
import { FINAL_MISSION } from '../../data/finalMission';
import { Mission } from '../../types';
import { audioSystem } from '../../systems/AudioSystem';

export class CityScene extends Phaser.Scene {
  private playerSprite!: Phaser.GameObjects.Sprite;
  private npcSprite!: Phaser.GameObjects.Sprite;
  private indicatorText!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    ENTER: Phaser.Input.Keyboard.Key;
  };

  private currentMission: Mission | null = null;
  private animTimer = 0;
  private walkFrame: 0 | 1 = 0;
  private isInteracting = false;
  private virtualMovement: { dx: number; dy: number } = { dx: 0, dy: 0 };
  private unsubscribeStore: (() => void) | null = null;

  constructor() {
    super({ key: 'CityScene' });
  }

  create() {
    this.add.image(0, 0, 'city_map').setOrigin(0, 0);

    const state = gameStateStore.getState();
    const path = state.path || 'protection';

    // Keyboard controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        ENTER: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      };
    }

    // Player Sprite
    const px = state.player.x * TILE_SIZE;
    const py = state.player.y * TILE_SIZE;
    const playerKey = `player_${path}_d_0`;
    this.playerSprite = this.add.sprite(px, py, playerKey).setOrigin(0.5, 0.7);

    // Setup NPC for active mission
    this.setupActiveNpc();

    // Listen to store changes (e.g. Virtual D-pad or mission update)
    this.unsubscribeStore = gameStateStore.subscribe((_newState, view) => {
      if (view === 'city') {
        this.setupActiveNpc();
      }
    });

    // Custom event listener for virtual D-pad inputs from React
    this.events.on('virtual-move', (data: { dx: number; dy: number }) => {
      this.virtualMovement = data;
    });

    this.events.on('virtual-action', () => {
      this.checkInteraction();
    });

    this.events.on('destroy', () => {
      if (this.unsubscribeStore) {
        this.unsubscribeStore();
      }
    });
  }

  private setupActiveNpc() {
    const state = gameStateStore.getState();
    const path = state.path || 'protection';
    const missions = getMissionsForPath(path);

    if (state.completedMissionsCount < missions.length) {
      this.currentMission = missions[state.completedMissionsCount] || null;
    } else {
      this.currentMission = FINAL_MISSION;
    }

    if (!this.currentMission) return;

    const npcX = (this.currentMission.gridX + 0.5) * TILE_SIZE;
    const npcY = (this.currentMission.gridY + 0.5) * TILE_SIZE;
    const npcKey = `npc_${this.currentMission.npcName}_d_0`;

    if (!this.npcSprite) {
      this.npcSprite = this.add.sprite(npcX, npcY, npcKey).setOrigin(0.5, 0.7);
    } else {
      this.npcSprite.setPosition(npcX, npcY);
      this.npcSprite.setTexture(npcKey);
      this.npcSprite.setVisible(true);
    }

    // Indicator !
    if (!this.indicatorText) {
      this.indicatorText = this.add
        .text(npcX, npcY - 32, '❗', {
          fontSize: '18px',
        })
        .setOrigin(0.5, 0.5);
    } else {
      this.indicatorText.setPosition(npcX, npcY - 32);
      this.indicatorText.setVisible(true);
    }
  }

  override update(time: number, delta: number) {
    if (!this.playerSprite || this.isInteracting) return;

    const state = gameStateStore.getState();
    const path = state.path || 'protection';

    let dx = 0;
    let dy = 0;

    // Keyboard inputs
    if (this.cursors) {
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) dx -= 1;
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) dx += 1;
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) dy -= 1;
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) dy += 1;
    }

    // Combine with virtual controls
    if (this.virtualMovement.dx !== 0) dx = this.virtualMovement.dx;
    if (this.virtualMovement.dy !== 0) dy = this.virtualMovement.dy;

    // Action Key check
    const actionPressed =
      (this.wasdKeys && (Phaser.Input.Keyboard.JustDown(this.wasdKeys.SPACE) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.ENTER))) ||
      (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.space));

    if (actionPressed) {
      this.checkInteraction();
    }

    let dir: 'u' | 'd' | 'l' | 'r' = state.player.direction;
    if (dx < 0) dir = 'l';
    else if (dx > 0) dir = 'r';
    else if (dy < 0) dir = 'u';
    else if (dy > 0) dir = 'd';

    const speed = 4.5; // tiles per second
    const dt = delta / 1000;

    let nextX = state.player.x;
    let nextY = state.player.y;

    const isMoving = dx !== 0 || dy !== 0;

    if (isMoving) {
      // Normalize diagonal speed
      const mag = Math.hypot(dx, dy);
      const ndx = (dx / mag) * speed * dt;
      const ndy = (dy / mag) * speed * dt;

      if (!isCollision(nextX + ndx, nextY)) {
        nextX += ndx;
      }
      if (!isCollision(nextX, nextY + ndy)) {
        nextY += ndy;
      }

      // Footstep sound
      this.animTimer += delta;
      if (this.animTimer > 200) {
        this.animTimer = 0;
        this.walkFrame = this.walkFrame === 0 ? 1 : 0;
        audioSystem.playSfx('step');
      }
    } else {
      this.walkFrame = 0;
    }

    gameStateStore.updatePlayerPosition({
      x: nextX,
      y: nextY,
      direction: dir,
      isWalking: isMoving,
    });

    this.playerSprite.setPosition((nextX + 0.5) * TILE_SIZE, (nextY + 0.5) * TILE_SIZE);
    this.playerSprite.setTexture(`player_${path}_${dir}_${this.walkFrame}`);

    // Pulse indicator text
    if (this.indicatorText && this.indicatorText.visible) {
      const pulse = Math.sin(time / 200) * 4;
      if (this.currentMission) {
        const npcY = (this.currentMission.gridY + 0.5) * TILE_SIZE;
        this.indicatorText.setY(npcY - 28 + pulse);
      }
    }
  }

  private checkInteraction() {
    if (!this.currentMission || this.isInteracting) return;

    const state = gameStateStore.getState();
    const dist = Math.hypot(state.player.x - this.currentMission.gridX, state.player.y - this.currentMission.gridY);

    if (dist < 1.8) {
      this.isInteracting = true;
      audioSystem.playSfx('go');

      // Mission trigger burst particles effect
      this.spawnBurstParticles((this.currentMission.gridX + 0.5) * TILE_SIZE, (this.currentMission.gridY + 0.5) * TILE_SIZE);

      this.time.delayedCall(300, () => {
        this.isInteracting = false;
        const missions = getMissionsForPath(state.path || 'protection');
        const idx = state.completedMissionsCount < missions.length ? state.completedMissionsCount : 4;
        gameStateStore.startMission(idx);
      });
    }
  }

  private spawnBurstParticles(x: number, y: number) {
    const colors = [0xffd166, 0xef476f, 0x06d6a0, 0x118ab2];
    for (let i = 0; i < 20; i++) {
      const p = this.add.rectangle(x, y, 4, 4, colors[i % colors.length]);
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.tweens.add({
        targets: p,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        scale: 0,
        duration: 500,
        onComplete: () => p.destroy(),
      });
    }
  }
}
