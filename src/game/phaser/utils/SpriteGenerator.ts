import Phaser from 'phaser';

const PX = { h: 0, s: 1, c: 2, p: 3 };
const BODY = [
  '..hhhhhh..',
  '.hhhhhhhh.',
  '.hssssssh.',
  '.hsessesh.',
  '..ssssss..',
  '.cccccccc.',
  'sccccccccs',
  'sccccccccs',
  '.cccccccc.',
  '.pppppppp.',
  '.pppppppp.',
];
const LEG = [
  ['.ppp..ppp.', '.ppp..ppp.', '.kkk..kkk.'],
  ['..pp..pp..', '..pp..pp..', '..kk..kk..'],
];

export function generateCharacterTexture(
  scene: Phaser.Scene,
  key: string,
  colors: [string, string, string, string],
  dir: 'u' | 'd' | 'l' | 'r',
  frameIdx: 0 | 1
) {
  if (scene.textures.exists(key)) return;

  const canvas = document.createElement('canvas');
  canvas.width = 20;
  canvas.height = 28;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rows = [...BODY];
  if (dir === 'u') {
    rows[2] = '.hhhhhhhh.';
    rows[3] = '.hhhhhhhh.';
  } else if (dir === 'l') {
    rows[3] = '.hessshhh.';
  } else if (dir === 'r') {
    rows[3] = '.hhhssseh.';
  }

  const fullRows = [...rows, ...(LEG[frameIdx] || LEG[0]!)];

  fullRows.forEach((row, j) => {
    [...row].forEach((ch, i) => {
      if (ch === '.') return;
      if (ch === 'k') {
        ctx.fillStyle = '#2b2118';
      } else if (ch === 'e') {
        ctx.fillStyle = '#1b1b1b';
      } else {
        const colorIdx = PX[ch as keyof typeof PX];
        ctx.fillStyle = colors[colorIdx !== undefined ? colorIdx : 0] || '#ffffff';
      }
      ctx.fillRect(i * 2, j * 2, 2, 2);
    });
  });

  scene.textures.addCanvas(key, canvas);
}
