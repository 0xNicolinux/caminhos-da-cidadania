export const HAIR_COLORS = ['#3b2f2f', '#1b1b1b', '#a0522d', '#e8c547', '#d9d9d9'];
export const SKIN_COLORS = ['#f1c27d', '#c68642', '#8d5524', '#e0ac69'];

export interface CharacterPalette {
  hair: string;
  skin: string;
  clothing: string;
  pants: string;
}

export function getPlayerPalette(path: 'protection' | 'security' = 'protection'): CharacterPalette {
  return {
    hair: HAIR_COLORS[0]!,
    skin: SKIN_COLORS[0]!,
    clothing: path === 'protection' ? '#3a86ff' : '#2b9348',
    pants: '#22304a',
  };
}

export function getNpcPalette(npcName: string, shirtColor: string): CharacterPalette {
  const hash = npcName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    hair: HAIR_COLORS[hash % HAIR_COLORS.length]!,
    skin: SKIN_COLORS[hash % SKIN_COLORS.length]!,
    clothing: shirtColor,
    pants: '#4a4e69',
  };
}
