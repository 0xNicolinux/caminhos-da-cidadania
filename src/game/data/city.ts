import { Building } from '../types';

export const MAP_COLS = 20;
export const MAP_ROWS = 12;
export const TILE_SIZE = 32;
export const MAP_WIDTH = MAP_COLS * TILE_SIZE; // 640
export const MAP_HEIGHT = MAP_ROWS * TILE_SIZE; // 384

export const BUILDINGS: Building[] = [
  { id: 'escola', name: 'ESCOLA', gridX: 1, gridY: 1, gridWidth: 4, gridHeight: 3, color: '#c9ada7' },
  { id: 'saude', name: 'SAÚDE', gridX: 8, gridY: 1, gridWidth: 4, gridHeight: 3, color: '#a3c4bc' },
  { id: 'prefeitura', name: 'PREFEITURA', gridX: 15, gridY: 1, gridWidth: 4, gridHeight: 3, color: '#d4a373' },
  { id: 'conselho', name: 'CONSELHO', gridX: 1, gridY: 8, gridWidth: 4, gridHeight: 3, color: '#7b9acc' },
  { id: 'centro_comunitaria', name: 'CENTRO COM.', gridX: 8, gridY: 8, gridWidth: 4, gridHeight: 3, color: '#e9c46a' },
  { id: 'seguranca', name: 'SEGURANÇA', gridX: 15, gridY: 8, gridWidth: 4, gridHeight: 3, color: '#8d99ae' },
];

export function isCollision(x: number, y: number): boolean {
  if (x < 0.3 || x > MAP_COLS - 0.3 || y < 0.4 || y > MAP_ROWS - 0.2) {
    return true;
  }
  return BUILDINGS.some(
    (b) =>
      x + 0.25 > b.gridX &&
      x - 0.25 < b.gridX + b.gridWidth &&
      y + 0.2 > b.gridY &&
      y - 0.3 < b.gridY + b.gridHeight
  );
}
