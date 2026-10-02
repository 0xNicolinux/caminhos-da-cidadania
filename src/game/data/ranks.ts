import { GamePath } from '../types';

export const RANKS: Record<GamePath, string[]> = {
  protection: [
    'Iniciante',
    'Aprendiz da Rede',
    'Agente de Proteção',
    'Articulador da Rede',
    'Guardião da Cidadania'
  ],
  security: [
    'Iniciante',
    'Aprendiz de Segurança',
    'Agente de Prevenção',
    'Analista da Comunidade',
    'Gestor da Segurança'
  ]
};

export function getRankTitle(path: GamePath, completedMissionsCount: number): string {
  const list = RANKS[path];
  const idx = Math.min(completedMissionsCount, list.length - 1);
  return list[idx] || list[0]!;
}
