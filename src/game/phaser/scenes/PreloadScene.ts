import Phaser from 'phaser';
import { BUILDINGS, MAP_COLS, MAP_ROWS, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from '../../data/city';
import { generateCharacterTexture } from '../utils/SpriteGenerator';
import { HAIR_COLORS, SKIN_COLORS } from '../../data/characters';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    this.createCityBackgroundTexture();
    this.createPlayerTextures();
    this.createNpcTextures();
    this.scene.start('CityScene');
  }

  private createCityBackgroundTexture() {
    if (this.textures.exists('city_map')) return;

    const canvas = document.createElement('canvas');
    canvas.width = MAP_WIDTH;
    canvas.height = MAP_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let seed = 7;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    // Grass base
    ctx.fillStyle = '#5a8f4e';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Checkered grass pattern
    ctx.fillStyle = '#548a49';
    for (let i = 0; i < MAP_COLS; i++) {
      for (let j = 0; j < MAP_ROWS; j++) {
        if ((i + j) % 2 === 1) {
          ctx.fillRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Foliage / Trees & Flowers
    for (let k = 0; k < 170; k++) {
      ctx.fillStyle = ['#6fa35c', '#4a7d41', '#6fa35c', '#f4d35e', '#ee6c4d', '#f5efd9'][k % 6]!;
      const sz = k % 6 < 3 ? 2 : 3;
      const rx = Math.floor(rng() * MAP_WIDTH);
      const ry = Math.floor(rng() * MAP_HEIGHT);
      ctx.fillRect(rx, ry, sz, sz);
    }

    // Roads
    ctx.fillStyle = '#3a3a3c';
    // Horizontal central avenue
    ctx.fillRect(0, 5 * TILE_SIZE - 2, MAP_WIDTH, TILE_SIZE * 2 + 4);
    // Vertical streets
    ctx.fillRect(5.5 * TILE_SIZE - 2, 0, TILE_SIZE * 2, MAP_HEIGHT);
    ctx.fillRect(13.5 * TILE_SIZE - 2, 0, TILE_SIZE * 2, MAP_HEIGHT);

    // Sidewalks
    ctx.fillStyle = '#8e8e93';
    ctx.fillRect(0, 5 * TILE_SIZE - 6, MAP_WIDTH, 4);
    ctx.fillRect(0, 7 * TILE_SIZE + 2, MAP_WIDTH, 4);
    ctx.fillRect(5.5 * TILE_SIZE - 6, 0, 4, MAP_HEIGHT);
    ctx.fillRect(7.5 * TILE_SIZE + 2, 0, 4, MAP_HEIGHT);
    ctx.fillRect(13.5 * TILE_SIZE - 6, 0, 4, MAP_HEIGHT);
    ctx.fillRect(15.5 * TILE_SIZE + 2, 0, 4, MAP_HEIGHT);

    // Road markings (yellow dashed lines)
    ctx.fillStyle = '#f4a261';
    for (let x = 10; x < MAP_WIDTH; x += 30) {
      ctx.fillRect(x, 6 * TILE_SIZE - 2, 16, 4);
    }

    // Buildings
    BUILDINGS.forEach((b) => {
      const bx = b.gridX * TILE_SIZE;
      const by = b.gridY * TILE_SIZE;
      const bw = b.gridWidth * TILE_SIZE;
      const bh = b.gridHeight * TILE_SIZE;

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(bx + 4, by + 6, bw, bh);

      // Building Body
      ctx.fillStyle = b.color;
      ctx.fillRect(bx, by, bw, bh);

      // Roof
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(bx, by, bw, 12);

      // Border outline
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      // Door
      ctx.fillStyle = '#2b2118';
      ctx.fillRect(bx + bw / 2 - 10, by + bh - 20, 20, 20);

      // Windows
      ctx.fillStyle = '#e0f1f5';
      const windowY = by + 20;
      ctx.fillRect(bx + 12, windowY, 18, 14);
      ctx.fillRect(bx + bw - 30, windowY, 18, 14);

      // Sign background & text
      ctx.fillStyle = '#1d2d44';
      ctx.fillRect(bx + 8, by + 4, bw - 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.name, bx + bw / 2, by + 12);
    });

    this.textures.addCanvas('city_map', canvas);
  }

  private createPlayerTextures() {
    const dirs: Array<'u' | 'd' | 'l' | 'r'> = ['u', 'd', 'l', 'r'];
    const paths: Array<'protection' | 'security'> = ['protection', 'security'];

    paths.forEach((p) => {
      const clothingColor = p === 'protection' ? '#3a86ff' : '#2b9348';
      const colors: [string, string, string, string] = [
        HAIR_COLORS[0]!,
        SKIN_COLORS[0]!,
        clothingColor,
        '#22304a',
      ];

      dirs.forEach((d) => {
        [0, 1].forEach((f) => {
          const key = `player_${p}_${d}_${f}`;
          generateCharacterTexture(this, key, colors, d, f as 0 | 1);
        });
      });
    });
  }

  private createNpcTextures() {
    const npcs = [
      { name: 'Marta', color: '#e76f51' },
      { name: 'Seu Raul', color: '#264653' },
      { name: 'Júlia', color: '#9b5de5' },
      { name: 'Dona Lúcia', color: '#bc6c25' },
      { name: 'Carlos', color: '#2a9d8f' },
      { name: 'Ana', color: '#e63946' },
      { name: 'Profª Helena', color: '#f77f00' },
      { name: 'Cap. Duarte', color: '#457b9d' },
      { name: 'Rosa', color: '#ffd166' },
    ];

    npcs.forEach((npc) => {
      const hash = npc.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hair = HAIR_COLORS[hash % HAIR_COLORS.length]!;
      const skin = SKIN_COLORS[hash % SKIN_COLORS.length]!;
      const colors: [string, string, string, string] = [hair, skin, npc.color, '#4a4e69'];

      const dirs: Array<'u' | 'd' | 'l' | 'r'> = ['u', 'd', 'l', 'r'];
      dirs.forEach((d) => {
        [0, 1].forEach((f) => {
          const key = `npc_${npc.name}_${d}_${f}`;
          generateCharacterTexture(this, key, colors, d, f as 0 | 1);
        });
      });
    });
  }
}
