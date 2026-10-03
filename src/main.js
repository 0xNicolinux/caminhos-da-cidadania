import { NOME, TIT } from './data/game-config.js';
import { carregarMissoes } from './data/missions.js';
import { embaralhar as emb, sortearSemRepetir as sorteio } from './utils/random.js';
import { LOGO_E, LOGO_S } from './assets/logos.js';
import {
  audio,
  definirTemaMusical,
  fanfare,
  musicaAtiva,
  sfx,
  snd
} from './game/audio.js';
import {
  configurarAbertura,
  creditos,
  musicaAberturaExecutada,
  theaterHide,
  theaterShow
} from './game/intro.js';

const $ = s => document.querySelector(s), cv = $('#c'), g = cv.getContext('2d'), ov = $('#ov'), st = $('#st'), T = 32, W = 20, H = 12;
function ajustarResolucaoCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const largura = Math.max(1, Math.round(cv.clientWidth * pixelRatio));
  const altura = Math.max(1, Math.round(cv.clientHeight * pixelRatio));
  if (cv.width !== largura) cv.width = largura;
  if (cv.height !== altura) cv.height = altura;
  g.setTransform(cv.width / 640, 0, 0, cv.height / 384, 0, 0);
  g.imageSmoothingEnabled = false;
}
window.addEventListener('resize', ajustarResolucaoCanvas);
ajustarResolucaoCanvas();
const BL = [[1, 1, 3, 3, '#c9ada7', 'ESCOLA'], [5, 1, 3, 3, '#a3c4bc', 'SAÚDE'], [15, 1, 4, 3, '#d4a373', 'PREFEITURA'],
[1, 8, 3, 3, '#7b9acc', 'CONSELHO'], [12, 8, 3, 3, '#e9c46a', 'CENTRO COM.'], [16, 8, 3, 3, '#8d99ae', 'SEGURANÇA']];
let M = {}, F = null;
window.snd = () => {
  snd();
  const indicador = musicaAtiva() ? '🔊' : '🔇';
  $('#snd').textContent = indicador;
  $('#thSnd').textContent = indicador;
};

/* ===== SPRITES ===== */
const PX = { h: 0, s: 1, c: 2, p: 3 }, BODY = ['..hhhhhh..', '.hhhhhhhh.', '.hssssssh.', '.hsessesh.', '..ssssss..', '.cccccccc.', 'sccccccccs', 'sccccccccs', '.cccccccc.', '.pppppppp.', '.pppppppp.'],
  LEG = [['.ppp..ppp.', '.ppp..ppp.', '.kkk..kkk.'], ['..pp..pp..', '..pp..pp..', '..kk..kk..']], SC = {},
  HAIR = ['#3b2f2f', '#1b1b1b', '#a0522d', '#e8c547', '#d9d9d9'], SKIN = ['#f1c27d', '#c68642', '#8d5524', '#e0ac69'];
function spr(c, d, f) {
  const k = c + d + f; if (SC[k]) return SC[k]; const cn = document.createElement('canvas'); cn.width = 24; cn.height = 32; const x = cn.getContext('2d'), r = [...BODY];
  if (d == 'u') r[2] = r[3] = '.hhhhhhhh.'; if (d == 'l') { r[2] = '.hsssshhh.'; r[3] = '.hsesshhh.' } if (d == 'r') { r[2] = '.hhhssssh.'; r[3] = '.hhhssesh.' }
  const rows = [...r, ...LEG[f]], shade = (hex, n) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, parseInt(hex.slice(i, i + 2), 16) + n)).toString(16).padStart(2, '0')).join('');
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch == '.') return;
    const px = 2 + i * 2, py = 2 + j * 2, color = ch == 'k' ? '#202735' : ch == 'e' ? '#17202c' : c[PX[ch]];
    const edge = ch == 'h' ? shade(c[0], -28) : ch == 's' ? shade(c[1], -30) : ch == 'e' ? '#303640' : ch == 'k' ? '#303640' : shade(color, -38);
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { const adjacent = rows[j + dy]?.[i + dx]; if (adjacent == '.' || adjacent === undefined) { x.fillStyle = edge; x.fillRect(px + dx * 2, py + dy * 2, 2, 2) } }
    x.fillStyle = color; x.fillRect(px, py, 2, 2);
    if (ch == 'c' || ch == 'p') { x.fillStyle = shade(color, 24); x.fillRect(px, py, 1, 1); x.fillStyle = shade(color, -30); x.fillRect(px + 1, py + 1, 1, 1) }
  }));
  x.fillStyle = shade(c[2], 38); x.fillRect(10, 12, 4, 2); x.fillStyle = shade(c[2], -34); x.fillRect(14, 16, 2, 3);
  x.fillStyle = '#d8b66d'; x.fillRect(5, 29, 5, 1); x.fillRect(14, 29, 5, 1);
  return SC[k] = cn
}
const PP = k => [HAIR[0], SKIN[0], (k || S.p) == 'P' ? '#3a86ff' : '#2b9348', '#22304a'], NP = m => [HAIR[m.personagem.length % 5], SKIN[m.personagem.length % 4], m.cor, '#4a4e69'];

/* ===== MUNDO ===== */
const bg = document.createElement('canvas'); bg.width = 640; bg.height = 384;
const luz = document.createElement('canvas'), ton = document.createElement('canvas');   /* camadas de iluminação pré-renderizadas em mundo() */
const EM = ['📚', '🏥', '🏛️', '⚖️', '🤝', '🚔'], LP = [[4.5, 4.5], [14.5, 4.5], [4.5, 7.6], [15.4, 7.6]], WN = [], PROPS = [];
const TREES = [[4.5, 2.8], [13.2, 2.8], [6.5, 9.9]], ARBUSTOS = [[4.7, 8.95], [14.35, 1.6]],
  FLORES = [[5.2, 9.5], [7.7, 10.8], [13.7, 3.1]], ANIMAIS = [
    { tipo: 'gato', x: 6, y: 10.4, cor: '#c98b4c', luz: '#f0c982' },
    { tipo: 'cachorro', x: 8, y: 9.2, cor: '#9c613b', luz: '#d6a36c' }
  ], BORBOLETAS = [{ x: 5.2, y: 9.5, cor: '#ef83aa', fase: 0 }, { x: 7.7, y: 10.8, cor: '#f0cf58', fase: 2.1 }, { x: 13.7, y: 3.1, cor: '#8bd0c0', fase: 4.2 }],
  PWR = [[.7, 1.5], [19.3, 1.5], [.7, 11.5], [19.3, 11.5]], PARE = [[8.75, 4.1, 'verso-leste'], [11.25, 7.9, 'frente']],
  CARS = [
    { axis: 'h', x: 2.2, y: 6.5, dir: 1, speed: 1.4, color: '#d84f43', fumaca: 0, movendo: true },
    { axis: 'h', x: 17.2, y: 5.5, dir: -1, speed: 1.3, color: '#e8b941', fumaca: 0, movendo: true },
    { axis: 'v', x: 9.5, y: .6, dir: 1, speed: 1.15, color: '#4b9b81', fumaca: 0, movendo: true },
    { axis: 'v', x: 10.5, y: 11.4, dir: -1, speed: 1.1, color: '#619ac7', fumaca: 0, movendo: true }
  ], CIV = [
    { x: 6.4, y: 7.45, vel: .95, dono: 1, shirt: '#d05b4b', pants: '#33445b', skin: '#c68642', hair: '#342528' },
    { x: 11.55, y: 2.25, vel: .9, shirt: '#327eaa', pants: '#4b3945', skin: '#e0ac69', hair: '#231d22' },
    { x: 5.2, y: 7.5, vel: 1.9, corre: 1, shirt: '#e8e8e8', pants: '#2a6f97', skin: '#e0ac69', hair: '#231d22' },
    { x: 15.5, y: 7.5, vel: .9, shirt: '#d98aa0', pants: '#4a3d4f', skin: '#f1c27d', hair: '#5b3a29' }
  ];
CARS.forEach(c => c.v = c.speed);   /* velocidade atual (acelera/freia suavemente) */
let viaVerde = 'h', tempoVia = 0;
const LINHA_PARADA = { h: { esquerda: 7.32, direita: 12.62 }, v: { norte: 3.32, sul: 8.65 } };
function mundo() {
  const x = bg.getContext('2d'); let s = 7; const r = () => (s = s * 16807 % 2147483647) / 2147483647;
  x.fillStyle = '#608d50'; x.fillRect(0, 0, 640, 384);
  for (let i = 0; i < W; i++)for (let j = 0; j < H; j++)if ((i + j) % 2) { x.fillStyle = '#679653'; x.fillRect(i * T, j * T, T, T) }
  for (let k = 0; k < 230; k++) {
    const px = r() * 636 | 0, py = r() * 380 | 0; if ((py > 5 * T && py < 7 * T) || (px > 9 * T && px < 11 * T)) continue;
    x.fillStyle = ['#79a65d', '#4d8146', '#8ab36a', '#e4c966', '#e78055'][k % 5]; x.fillRect(px, py, k % 5 < 3 ? 2 : 3, k % 5 < 3 ? 2 : 3)
  }
  x.fillStyle = '#c8bc99'; x.fillRect(0, 4 * T, 640, T - 7); x.fillRect(0, 7 * T + 7, 640, T - 7); x.fillRect(8 * T, 0, T - 7, 384); x.fillRect(11 * T + 7, 0, T - 7, 384);
  x.fillStyle = '#b2a98e'; x.fillRect(0, 5 * T - 7, 640, 7); x.fillRect(0, 7 * T, 640, 7); x.fillRect(9 * T - 7, 0, 7, 384); x.fillRect(11 * T, 0, 7, 384);
  x.fillStyle = '#414c57'; x.fillRect(0, 5 * T, 640, 2 * T); x.fillRect(9 * T, 0, 2 * T, 384);
  x.fillStyle = '#52616a'; for (let i = 0; i < 640; i += 64)x.fillRect(i, 5 * T + 3, 32, 1); for (let j = 0; j < 384; j += 64)x.fillRect(9 * T + 3, j, 1, 32);
  x.fillStyle = '#e8c968'; for (let i = 0; i < 640; i += 32)if (i < 8 * T || i > 11 * T) x.fillRect(i + 8, 6 * T - 1, 15, 2); for (let j = 0; j < 384; j += 32)if (j < 5 * T || j > 7 * T) x.fillRect(10 * T - 1, j + 8, 2, 15);
  x.fillStyle = '#f2e8c8'; for (let i = 0; i < 4; i++) {
    x.fillRect(8 * T + 5, 5 * T + 6 + i * 16, 20, 3); x.fillRect(11 * T + 4, 5 * T + 6 + i * 16, 20, 3);
    x.fillRect(9 * T + 6 + i * 16, 4 * T + 10, 3, 18); x.fillRect(9 * T + 6 + i * 16, 7 * T + 3, 3, 18)
  }
  /* Árvores, postes e placas viram sprites separados, ordenados por profundidade (y da base) junto com jogador, NPCs e carros.
     Antes estavam "queimados" no fundo e o jogador sempre aparecia por cima, mesmo estando atrás deles. */
  const prop = (bx, by, w, h, base, fn) => { const cn = document.createElement('canvas'); cn.width = w; cn.height = h; const c = cn.getContext('2d'); c.translate(-bx, -by); fn(c); PROPS.push({ e: [base, () => g.drawImage(cn, bx, by)] }) };
  ARBUSTOS.forEach(([a, b], i) => {
    const X = Math.round(a * T), Y = Math.round(b * T), tons = [['#294c35', '#3d7042', '#5b9450'], ['#31553b', '#477b46', '#6b9d56'], ['#294a38', '#3f7650', '#65995b']][i];
    prop(X - 13, Y - 9, 26, 15, Y + 5, c => { c.fillStyle = 'rgba(25,38,27,.25)'; c.beginPath(); c.ellipse(X, Y + 4, 12, 3, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = tons[0]; c.fillRect(X - 11, Y - 5, 8, 8); c.fillRect(X - 5, Y - 8, 11, 11); c.fillRect(X + 4, Y - 5, 8, 8); c.fillStyle = tons[1]; c.fillRect(X - 9, Y - 7, 7, 6); c.fillRect(X - 3, Y - 10, 7, 7); c.fillRect(X + 3, Y - 7, 7, 6); c.fillStyle = tons[2]; c.fillRect(X - 5, Y - 8, 4, 3); c.fillRect(X + 3, Y - 6, 3, 3) })
  });
  FLORES.forEach(([a, b], i) => {
    const X = Math.round(a * T), Y = Math.round(b * T), petala = ['#f08aaa', '#f2d45f', '#f2a15e'][i];
    prop(X - 7, Y - 12, 14, 14, Y + 2, c => { c.fillStyle = 'rgba(27,40,25,.2)'; c.fillRect(X - 6, Y, 12, 2); c.fillStyle = '#477747'; c.fillRect(X - 1, Y - 6, 2, 8); c.fillRect(X - 4, Y - 2, 3, 2); c.fillRect(X + 1, Y - 4, 3, 2); c.fillStyle = petala; c.fillRect(X - 3, Y - 10, 3, 3); c.fillRect(X + 1, Y - 10, 3, 3); c.fillRect(X - 4, Y - 7, 3, 3); c.fillRect(X + 3, Y - 7, 3, 3); c.fillRect(X - 1, Y - 6, 3, 3); c.fillStyle = '#f6e9a0'; c.fillRect(X - 1, Y - 8, 3, 3) })
  });
  TREES.forEach(([a, b]) => {
    const X = Math.round(a * T), Y = Math.round(b * T); x.fillStyle = 'rgba(28,45,28,.28)'; x.fillRect(X - 16, Y + 5, 32, 8);
    prop(X - 16, Y - 21, 32, 34, Y + 13, x => {
      x.fillStyle = '#67452f'; x.fillRect(X - 3, Y - 4, 6, 17);
      x.fillStyle = '#28583a'; x.fillRect(X - 16, Y - 13, 32, 17); x.fillRect(X - 11, Y - 21, 22, 15); x.fillStyle = '#3c7845'; x.fillRect(X - 13, Y - 15, 15, 10); x.fillStyle = '#75a958'; x.fillRect(X - 7, Y - 20, 10, 5); x.fillRect(X + 4, Y - 10, 7, 5);
      x.fillStyle = '#f0cf68'; x.fillRect(X - 10, Y - 9, 3, 3); x.fillRect(X + 7, Y - 16, 3, 3)
    })
  });
  LP.forEach(([a, b]) => {
    const X = Math.round(a * T), Y = Math.round(b * T); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(X - 7, Y + 7, 14, 4);
    prop(X - 7, Y - 36, 14, 43, Y + 7, x => { x.fillStyle = '#293746'; x.fillRect(X - 2, Y - 29, 4, 36); x.fillRect(X - 5, Y - 31, 10, 3); x.fillStyle = '#ffe28a'; x.fillRect(X - 4, Y - 36, 8, 6); x.fillStyle = 'rgba(255,226,138,.25)'; x.fillRect(X - 7, Y - 30, 14, 2) })
  });
  [[PWR[0], PWR[1]]].forEach(([a, b]) => { const ax = a[0] * T, bx = b[0] * T, y = a[1] * T - 39; x.strokeStyle = '#554637'; x.lineWidth = 1; x.beginPath(); x.moveTo(ax, y); x.quadraticCurveTo((ax + bx) / 2, y + 8, bx, y); x.stroke() });
  PWR.forEach(([a, b]) => {
    const X = Math.round(a * T), Y = Math.round(b * T); x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(X - 5, Y - 1, 10, 4);
    prop(X - 10, Y - 42, 20, 43, Y, x => { x.fillStyle = '#60472f'; x.fillRect(X - 2, Y - 38, 4, 38); x.fillStyle = '#805d3c'; x.fillRect(X - 8, Y - 39, 16, 3); x.fillStyle = '#d9c889'; x.fillRect(X - 8, Y - 42, 3, 4); x.fillRect(X + 5, Y - 42, 3, 4); x.fillStyle = '#393b3e'; x.fillRect(X - 10, Y - 40, 2, 2); x.fillRect(X + 8, Y - 40, 2, 2) })
  });
  const CAMISAS = ['#487ca6', '#7b9d85', '#647f9a', '#7b6d9b', '#bb793c', '#425764'], PELES = ['#c68642', '#e0ac69', '#8d5524', '#f1c27d', '#c68642', '#e0ac69'], CABELOS = ['#342528', '#231d22', '#28212a', '#3b2f2f', '#342528', '#1b1b1b'];
  BL.forEach(([bx, by, bw, bh, c, n], i) => {
    const X = bx * T, Y = by * T, w = bw * T, h = bh * T;
    x.fillStyle = 'rgba(20,26,32,.35)'; x.fillRect(X + 7, Y + h - 1, w, 9); x.fillStyle = '#343843'; x.fillRect(X - 2, Y - 3, w + 4, h + 4);
    x.fillStyle = c; x.fillRect(X, Y, w, h); x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(X + 3, Y + 15, w - 6, 3); x.fillStyle = 'rgba(0,0,0,.13)'; x.fillRect(X + w - 7, Y + 15, 4, h - 18);
    x.fillStyle = 'rgba(0,0,0,.11)'; for (let k = 12; k < w; k += 18)x.fillRect(X + k, Y + 18, 2, h - 20);
    x.fillStyle = '#252b38'; x.fillRect(X - 2, Y - 3, w + 4, 16); x.fillStyle = '#d8bd78'; x.fillRect(X - 2, Y - 3, w + 4, 2); x.fillStyle = '#17202b'; x.fillRect(X + 5, Y, w - 10, 10);
    x.textAlign = 'center'; x.font = 'bold 8px monospace'; x.fillStyle = '#fff1c5'; x.fillText(n, X + w / 2, Y + 8);
    [X + 13, X + w - 29].forEach((a, j) => {
      x.fillStyle = '#26313d'; x.fillRect(a - 2, Y + 21, 20, 18); x.fillStyle = '#9bd0d0'; x.fillRect(a, Y + 23, 16, 14);
      if (j === 0) {
        if (i === 0) { x.fillStyle = '#486653'; x.fillRect(a + 2, Y + 25, 12, 7); x.fillStyle = '#e8d79a'; x.fillRect(a + 4, Y + 27, 5, 1); x.fillRect(a + 4, Y + 29, 8, 1) }
        else if (i === 1) { x.fillStyle = '#e7eadf'; x.fillRect(a + 2, Y + 29, 12, 3); x.fillStyle = '#6ca6ae'; x.fillRect(a + 3, Y + 26, 6, 3); x.fillStyle = '#d74b4b'; x.fillRect(a + 11, Y + 25, 2, 2) }
        else if (i === 2) { x.fillStyle = '#654b38'; x.fillRect(a + 2, Y + 29, 12, 2); x.fillStyle = '#d7bd78'; x.fillRect(a + 3, Y + 25, 3, 4); x.fillRect(a + 8, Y + 26, 4, 3) }
        else if (i === 3) { x.fillStyle = '#70523d'; x.fillRect(a + 2, Y + 25, 2, 9); x.fillRect(a + 12, Y + 25, 2, 9); x.fillRect(a + 4, Y + 27, 7, 1); x.fillRect(a + 4, Y + 31, 7, 1); x.fillStyle = '#dfc87d'; x.fillRect(a + 5, Y + 25, 2, 2); x.fillRect(a + 9, Y + 29, 2, 2) }
        else if (i === 4) { x.fillStyle = '#73513a'; x.fillRect(a + 6, Y + 30, 5, 3); x.fillStyle = '#52864d'; x.fillRect(a + 7, Y + 26, 2, 5); x.fillRect(a + 4, Y + 27, 4, 2); x.fillRect(a + 9, Y + 25, 4, 2) }
        else { x.fillStyle = '#354754'; x.fillRect(a + 2, Y + 27, 12, 6); x.fillStyle = '#75a88d'; x.fillRect(a + 4, Y + 29, 8, 1); x.fillRect(a + 4, Y + 31, 5, 1); x.fillStyle = '#8eaa79'; x.fillRect(a + 8, Y + 24, 2, 2) }
      } else {
        x.fillStyle = CABELOS[i]; x.fillRect(a + 4, Y + 23, 8, 4); x.fillStyle = PELES[i]; x.fillRect(a + 5, Y + 26, 6, 4); x.fillStyle = '#303640'; x.fillRect(a + 5, Y + 29, 6, 2); x.fillStyle = CAMISAS[i]; x.fillRect(a + 3, Y + 30, 10, 6); x.fillRect(a + 2, Y + 31, 2, 4); x.fillRect(a + 12, Y + 31, 2, 4);
        if (i === 1) { x.fillStyle = '#d84c4c'; x.fillRect(a + 7, Y + 31, 2, 3); x.fillRect(a + 6, Y + 32, 4, 1) }
        if (i === 5) { x.fillStyle = '#e8c968'; x.fillRect(a + 10, Y + 32, 2, 2) }
      }
      x.fillStyle = '#d9f0da'; x.fillRect(a + 2, Y + 24, 4, 2); x.fillStyle = '#627f85'; x.fillRect(a + 7, Y + 23, 2, 14); x.fillRect(a, Y + 29, 16, 2); WN.push([a, Y + 23])
    });
    const door = X + w / 2 - 10, dy = Y + h - 28; x.fillStyle = '#ddc693'; x.fillRect(door - 2, dy - 2, 24, 30); x.fillStyle = '#49342d'; x.fillRect(door, dy, 20, 28); x.fillStyle = '#76513a'; x.fillRect(door + 3, dy + 3, 14, 25); x.fillStyle = '#e8c968'; x.fillRect(door + 15, dy + 14, 2, 3); x.fillStyle = '#f0d9a0'; x.fillRect(door - 4, Y + h, 28, 4);
    x.fillStyle = '#263e31'; x.fillRect(X + 5, Y + h - 15, 8, 7); x.fillRect(X + w - 13, Y + h - 15, 8, 7); x.fillStyle = '#71a45a'; x.fillRect(X + 7, Y + h - 20, 4, 6); x.fillRect(X + w - 11, Y + h - 19, 4, 5);
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(X + 2, Y + 17, 2, h - 19);
    x.fillStyle = '#f0d9a0'; x.fillRect(X + w / 2 - 9, Y + h - 33, 18, 2); x.font = '14px serif'; x.fillText(EM[i], X + w / 2, Y + h - 34)
  });
  const oct = (c, r) => { c.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4, px = Math.cos(a) * r, py = Math.sin(a) * r; i ? c.lineTo(px, py) : c.moveTo(px, py) } c.closePath() };
  PARE.forEach(([a, b, face]) => {
    const X = Math.round(a * T), Y = Math.round(b * T), verso = face == 'verso-leste';
    x.fillStyle = 'rgba(20,24,29,.28)'; x.fillRect(X - 4, Y + 20, 8, 3);
    prop(X - 10, Y - 10, 20, 32, Y + 21, x => {
      x.fillStyle = '#39444b'; x.fillRect(X - 2, Y + 5, 4, 16); x.fillStyle = '#a8b1ad'; x.fillRect(X - 1, Y + 9, 1, 10); x.fillStyle = '#68716f'; x.fillRect(X - 4, Y + 19, 8, 2); x.save(); x.translate(X, Y);
      x.fillStyle = verso ? '#566267' : '#fff1d6'; oct(x, 9); x.fill();
      x.fillStyle = verso ? '#8d9797' : '#d83d3d'; oct(x, 7.5); x.fill();
      x.save(); oct(x, 7.5); x.clip();   /* tudo o que vem a seguir fica preso ao contorno da placa: nada pode vazar para a lateral */
      if (verso) { x.fillStyle = '#39444b'; x.fillRect(-4, -6, 8, 12); x.fillStyle = '#b7bfbb'; x.fillRect(-3, -5, 6, 10); x.fillStyle = '#687579'; x.fillRect(4, -7, 4, 14); x.fillStyle = '#b7bfbb'; x.fillRect(4, -7, 1, 14); x.fillStyle = '#414a4f'; x.fillRect(7, -7, 1, 14); x.fillStyle = '#fff7e8'; x.font = 'bold 3px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.save(); x.translate(5.5, 0); x.rotate(Math.PI / 2); x.fillText('PARE', 0, 0); x.restore() }
      else { x.fillStyle = '#fff7e8'; x.font = 'bold 4px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PARE', 0, 0) }
      x.restore(); x.restore()
    })
  });
  preLuz()
  const lowerLeft = PWR[2], lowerRight = PWR[3], lowerWireY = lowerLeft[1] * T - 39; x.strokeStyle = '#554637'; x.lineWidth = 1; x.beginPath(); x.moveTo(lowerLeft[0] * T, lowerWireY); x.quadraticCurveTo(320, lowerWireY + 8, lowerRight[0] * T, lowerWireY); x.stroke();
}

function preLuz() {
  const l = luz.getContext('2d'); luz.width = ton.width = 640; luz.height = ton.height = 384; l.globalCompositeOperation = 'lighter';
  LP.forEach(([a, b]) => { const X = Math.round(a * T), Y = Math.round(b * T) - 28, q = l.createRadialGradient(X, Y, 2, X, Y, 66); q.addColorStop(0, 'rgba(255,200,90,.45)'); q.addColorStop(1, 'rgba(255,200,90,0)'); l.fillStyle = q; l.fillRect(X - 66, Y - 66, 132, 132) });
  const k = ton.getContext('2d'), q = k.createLinearGradient(0, 0, 0, 384); q.addColorStop(0, 'rgba(255,130,50,.14)'); q.addColorStop(1, 'rgba(30,20,90,.28)'); k.fillStyle = q; k.fillRect(0, 0, 640, 384)
}
function ent(p, d, f, x, y, b) { g.fillStyle = 'rgba(12,18,24,.24)'; g.beginPath(); g.ellipse(x, y + 9, 8, 2.5, 0, 0, Math.PI * 2); g.fill(); g.drawImage(spr(p, d, f), x - 9, y - 14 + b, 18, 24) }
const tom = (hex, n) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, parseInt(hex.slice(i, i + 2), 16) + n)).toString(16).padStart(2, '0')).join('');
/* Pedestre: anda, para, olha para os lados (frente/costas/perfil), gesticula e mexe a boca quando fala. */
function desenharCivil(p, t) {
  const x = Math.round(p.x * T), y = Math.round(p.y * T), anda = p.mov, f = p.pass * 7, amp = p.corre ? 3 : 2, passo = anda ? Math.round(Math.sin(f) * amp) : 0,
    bob = anda ? Math.round(Math.abs(Math.sin(f)) * (p.corre ? 2 : 1)) : Math.round(Math.sin(t / 420 + p.fase)),
    fala = !!p.fala && t < p.fala.ate, boca = fala && (t / 130 | 0) % 2 == 1, d = p.face;
  g.save(); g.globalAlpha = p.alpha;
  g.fillStyle = 'rgba(17,23,28,.22)'; g.beginPath(); g.ellipse(x, y + 1, 7, 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#202735'; g.fillRect(x - 5, y - 28 - bob, 10, 11); g.fillRect(x - 7, y - 19 - bob, 14, 11); g.fillRect(x - 5 + passo, y - 9 - bob, 5, 10); g.fillRect(x + 1 - passo, y - 9 - bob, 5, 10);
  g.fillStyle = p.pants; g.fillRect(x - 4 + passo, y - 8 - bob, 4, 7); g.fillRect(x + 1 - passo, y - 8 - bob, 4, 7); g.fillStyle = '#27232c'; g.fillRect(x - 5 + passo, y - 2 - bob, 5, 2); g.fillRect(x + 1 - passo, y - 2 - bob, 5, 2);
  g.fillStyle = p.shirt; g.fillRect(x - 5, y - 17 - bob, 10, 9); g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(x - 3, y - 16 - bob, 2, 5);
  if (fala && !anda) { g.fillStyle = p.shirt; g.fillRect(x - 7, y - 17 - bob, 2, 4); g.fillRect(x + 5, y - 17 - bob, 2, 4); g.fillRect(x - 6, y - 20 - bob, 4, 2); g.fillRect(x + 2, y - 20 - bob, 4, 2); g.fillStyle = p.skin; g.fillRect(x - 7, y - 21 - bob, 3, 2); g.fillRect(x + 4, y - 21 - bob, 3, 2) }
  else { g.fillStyle = p.skin; g.fillRect(x - 7, y - 15 - bob + passo, 2, 6); g.fillRect(x + 5, y - 15 - bob - passo, 2, 6) }
  g.fillStyle = p.skin; g.fillRect(x - 3, y - 25 - bob, 6, 7); g.fillStyle = p.hair;
  if (d == 'u') g.fillRect(x - 4, y - 27 - bob, 8, 9);
  else { g.fillRect(x - 4, y - 27 - bob, 8, 4); if (d != 'l') g.fillRect(x - 4, y - 24 - bob, 2, 4); if (d != 'r') g.fillRect(x + 2, y - 24 - bob, 2, 4) }
  g.fillStyle = '#25202a';
  if (d == 'd') { g.fillRect(x - 2, y - 22 - bob, 1, 2); g.fillRect(x + 1, y - 22 - bob, 1, 2) } else if (d == 'r') g.fillRect(x + 1, y - 22 - bob, 2, 2); else if (d == 'l') g.fillRect(x - 3, y - 22 - bob, 2, 2);
  if (boca && d != 'u') { g.fillStyle = '#7a3b3b'; g.fillRect(d == 'd' ? x - 1 : d == 'r' ? x + 1 : x - 2, y - 19 - bob, 2, 1) }
  g.restore()
}

function coracao(x, y, t) {
  const k = (t / 900) % 1, yy = Math.round(y - k * 8), xx = x - 2; g.save(); g.globalAlpha = 1 - k; g.fillStyle = '#ef476f';
  g.fillRect(xx, yy, 2, 2); g.fillRect(xx + 3, yy, 2, 2); g.fillRect(xx - 1, yy + 1, 7, 2); g.fillRect(xx, yy + 3, 5, 1); g.fillRect(xx + 1, yy + 4, 3, 1); g.fillRect(xx + 2, yy + 5, 1, 1); g.restore()
}

/* Cachorro e gato: sprite desenhado de lado (espelhado quando vira) com várias poses.
   andar/correr usam a distância percorrida (a.pass) para as patas acompanharem o chão. */
function desenharAnimal(a, t) {
  const X = Math.round(a.x * T), Y = Math.round(a.y * T), gato = a.tipo == 'gato', c = a.cor, l = a.luz, dk = tom(c, -34), mc = '#3b3430',
    R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h) };
  let pose = a.est;
  if (a.mov) pose = a.est == 'farejar' ? 'farejar' : (a.vv > 2 ? 'correr' : 'andar');
  else if (!['sentar', 'lamber', 'dormir', 'deitar'].includes(pose)) pose = 'sentar';
  g.save(); g.translate(X, Y);
  g.fillStyle = 'rgba(24,28,25,.26)'; g.beginPath(); g.ellipse(0, 1, pose == 'dormir' || pose == 'deitar' ? 11 : 9, 2.5, 0, 0, Math.PI * 2); g.fill();
  if (a.dir < 0) g.scale(-1, 1);
  const run = pose == 'correr', s = Math.sin(a.pass * (run ? 9 : 11)), b = a.mov && Math.abs(s) > .75 ? -1 : 0, o = Math.round(s * (run ? 3 : 2)),
    sw = Math.round(Math.sin(t / (a.carinho > t ? 90 : 280) + a.pass));
  if (gato) {
    if (pose == 'dormir') {
      const bo = Math.sin(t / 700) > 0 ? 0 : 1;
      R(-10, -4, 4, 3, c); R(-8, -6 + bo, 15, 6 - bo, c); R(-7, -2, 13, 1, dk); R(5, -8, 5, 5, c); R(5, -10, 2, 3, c); R(8, -10, 2, 3, c); R(7, -6, 2, 1, mc)
    }
    else if (pose == 'sentar' || pose == 'lamber') {
      const lam = pose == 'lamber', h = lam ? -12 : -15;
      R(-10, -2, 6, 2, c); R(-11 + (sw > 0 ? 1 : 0), -5, 2, 4, c); R(-6, -6, 8, 6, c); R(-1, -10, 6, 9, c); R(0, -2, 2, 2, dk);
      R(1, h, 7, 6, c); R(1, h - 3, 3, 4, c); R(5, h - 3, 3, 4, c); R(2, h - 2, 1, 2, l);
      if (lam) { R(2, h + 3, 2, 1, mc); R(5 + ((t / 160 | 0) % 2), -9, 2, 5, c) }
      else { R(2, h + 2, 2, 2, l); R(6, h + 2, 1, 2, l); R(4, h + 4, 2, 1, mc) }
    }
    else {
      if (run) R(-12, -8 + b, 6, 2, c); else { R(-10, -8 + b, 4, 2, c); R(-11 + sw, -11 + b, 2, 4, c) }
      R(-3 + o, -3, 2, 3, dk); R(2 - o, -3, 2, 3, dk); R(-7, -7 + b, 11, 6, c); R(-6, -2 + b, 9, 1, dk); R(-6 - o, -3, 2, 3, c); R(0 + o, -3, 2, 3, c);
      R(2, -10 + b, 7, 7, c); R(2, -13 + b, 3, 4, c); R(6, -13 + b, 3, 4, c); R(3, -8 + b, 2, 2, l); R(7, -8 + b, 1, 2, l); R(4, -5 + b, 2, 1, mc)
    }
  } else {
    if (pose == 'deitar') { R(-12, -4 + (sw > 0 ? 0 : 1), 4, 2, c); R(-8, -5, 14, 5, c); R(-7, -1, 12, 1, dk); R(4, -8, 6, 5, c); R(8, -6, 3, 3, c); R(5, -10, 3, 3, dk); R(7, -7, 1, 1, l); R(10, -6, 1, 1, mc); R(7, -2, 4, 2, c) }
    else if (pose == 'sentar') { R(-11 + sw, -3, 5, 2, c); R(-7, -6, 8, 6, c); R(-1, -12, 6, 11, c); R(1, -3, 2, 3, dk); R(1, -17, 7, 6, c); R(4, -19, 4, 4, dk); R(7, -15, 2, 2, l); R(8, -12, 3, 1, mc) }
    else if (pose == 'farejar') {
      const w = Math.round(Math.sin(t / 90));
      R(-12 + w, -9 + b, 4, 2, c); R(-11 + w, -11 + b, 2, 3, c); R(-3 + o, -3, 2, 3, dk); R(2 - o, -3, 2, 3, dk); R(-8, -7 + b, 12, 6, c); R(-7, -2 + b, 10, 1, dk); R(-6 - o, -3, 2, 3, c); R(1 + o, -3, 2, 3, c);
      R(3, -6 + b, 6, 6, c); R(8, -3 + b, 4, 3, c); R(4, -9 + b, 3, 4, dk); R(7, -5 + b, 1, 1, l); R(11, -3 + b, 1, 1, mc)
    }
    else {
      const w = Math.round(Math.sin(t / (run ? 70 : 130)));
      R(-12 + w, -9 + b, 4, 2, c); R(-12 + w, -11 + b, 2, 3, c); R(-3 + o, -3, 2, 3, dk); R(2 - o, -3, 2, 3, dk); R(-8, -7 + b, 12, 6, c); R(-7, -2 + b, 10, 1, dk); R(-6 - o, -3, 2, 3, c); R(1 + o, -3, 2, 3, c);
      R(2, -10 + b, 7, 7, c); R(4, -12 + b, 4, 4, dk); R(7, -7 + b, 2, 2, l); R(9, -5 + b, 2, 1, mc); if (run) R(-14, -8 + b, 3, 2, c)
    }
  }
  g.restore();
  if (pose == 'dormir') for (let k = 0; k < 3; k++) {
    const u = ((t / 1100) + k / 3) % 1, sg = a.dir > 0 ? 1 : -1; g.save(); g.globalAlpha = Math.sin(u * Math.PI) * .9; g.fillStyle = '#fff';
    g.font = 'bold ' + (5 + k) + 'px monospace'; g.textAlign = 'center'; g.fillText('z', X + sg * (8 + u * 6), Y - 12 - u * 12); g.restore()
  }
  if (a.carinho > t) coracao(X, Y - (gato ? 22 : 24), t)
}

/* Balão de fala: largura medida do texto, preso à tela, some com fade. */
function desenharBalao(a, t) {
  const f = a.fala; if (!f || t > f.ate || a.alpha === 0 || a.oculto) return;
  const tamanhoFonte = 12 * 640 / Math.max(1, cv.clientWidth), linhaAltura = tamanhoFonte * 1.3, margem = tamanhoFonte * .75;
  g.save(); g.font = `600 ${tamanhoFonte}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = Math.ceil(Math.max(...f.l.map(s => g.measureText(s).width))) + margem * 2, h = f.l.length * linhaAltura + margem * 2, cxp = a.x * T, alt = a.tipo ? 22 : 36;
  let bx = Math.round(cxp - w / 2), by = Math.round(a.y * T - alt - h - 3); bx = Math.max(3, Math.min(640 - w - 3, bx)); by = Math.max(3, by);
  g.globalAlpha = Math.max(0, Math.min(1, (f.ate - t) / 250, (t - f.ini) / 120 + .2));
  g.fillStyle = '#f2e6bd'; g.fillRect(bx, by, w, h); g.strokeStyle = '#786849'; g.lineWidth = 1; g.strokeRect(bx + .5, by + .5, w - 1, h - 1);
  const tx = Math.max(bx + 6, Math.min(bx + w - 6, Math.round(cxp))); g.fillStyle = '#f2e6bd'; g.fillRect(tx - 2, by + h - 1, 5, 2); g.fillRect(tx - 1, by + h + 1, 3, 2);
  g.fillStyle = '#202632'; f.l.forEach((s, i) => g.fillText(s, bx + w / 2, by + margem + linhaAltura * (i + .5))); g.restore()
}

function desenharPassaros(t) { for (let i = 0; i < 3; i++) { const x = ((t * .024 + i * 228) % 700) - 30, y = 18 + Math.sin(t * .003 + i * 2) * 5, asa = Math.sin(t * .018 + i * 2) > 0 ? 2 : -1; g.fillStyle = '#354638'; g.fillRect(x - 3, y, 6, 2); g.fillRect(x - 6, y - asa, 3, 2); g.fillRect(x + 3, y - asa, 3, 2); g.fillRect(x + 3, y + 2, 3, 1); g.fillStyle = '#d9b65e'; g.fillRect(x + 5, y, 2, 1) } }
function desenharBorboleta(b, t) { const fase = t / 170 + b.fase, px = Math.round((b.x + Math.sin(fase) * .18) * T), py = Math.round((b.y + Math.cos(fase * .72) * .12) * T), asa = Math.sin(fase * 2) > 0 ? 3 : 2; g.fillStyle = '#423a43'; g.fillRect(px - 1, py - 2, 2, 5); g.fillStyle = b.cor; g.fillRect(px - asa - 1, py - 3, asa, 3); g.fillRect(px + 2, py - 3, asa, 3); g.fillRect(px - asa, py + 1, asa - 1, 2); g.fillRect(px + 2, py + 1, asa - 1, 2); g.fillStyle = '#fff1c5'; g.fillRect(px - asa, py - 2, 1, 1); g.fillRect(px + asa, py - 2, 1, 1) }
function desenharCarro(c) {
  const x = Math.round(c.x * T), y = Math.round(c.y * T); if (x < -50 || x > 690 || y < -50 || y > 434) return; g.save(); g.translate(x, y); if (c.axis == 'v') g.rotate(Math.PI / 2); const frente = c.dir > 0 ? 18 : -20;
  g.fillStyle = 'rgba(18,20,25,.32)'; g.beginPath(); g.ellipse(0, 1, 23, 12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#202630'; g.fillRect(-16, -11, 9, 4); g.fillRect(7, -11, 9, 4); g.fillRect(-16, 7, 9, 4); g.fillRect(7, 7, 9, 4);
  g.fillStyle = '#303640'; g.fillRect(-22, -10, 44, 20); g.fillStyle = c.color; g.fillRect(-21, -9, 42, 18);
  g.fillStyle = '#344b56'; g.fillRect(-11, -8, 22, 16); g.fillStyle = '#a9d7d1'; g.fillRect(-9, -6, 7, 12); g.fillRect(2, -6, 7, 12); g.fillStyle = '#536570'; g.fillRect(-1, -6, 2, 12);
  g.fillStyle = '#f8e4a2'; g.fillRect(frente, -5, 3, 4); g.fillRect(frente, 1, 3, 4); g.fillStyle = '#a83d39'; g.fillRect(-frente - 2, -5, 2, 4); g.fillRect(-frente - 2, 1, 2, 4); g.restore();
}
/* ===== CIDADE VIVA =====
   Pedestres, cachorro e gatos andam de verdade: cada um escolhe um destino, planeja o caminho numa grade (A*),
   respeita calçadas, faixas de pedestre e semáforo, entra e sai dos prédios, conversa quando encontra alguém
   e reage ao jogador. Os carros (em folga, mais abaixo) também passaram a parar para qualquer pedestre na faixa. */
const GR = .25, GC = W / GR, GL = H / GR,   /* grade de navegação: células de 1/4 de tile (80 × 48) */
  /* faixas de pedestre: 'eixo' é a via que elas atravessam (h = rua horizontal, v = rua vertical) */
  FAIXAS = [{ eixo: 'h', x0: 8.28, x1: 8.88, y0: 5, y1: 7 }, { eixo: 'h', x0: 11.1, x1: 11.72, y0: 5, y1: 7 },
  { eixo: 'v', x0: 9, x1: 11, y0: 4.3, y1: 4.88 }, { eixo: 'v', x0: 9, x1: 11, y0: 7.1, y1: 7.74 }],   /* encolhidas ~.2 tile no lado de onde o carro para, para ninguém ficar colado no para-choque */
  PORTAS = BL.map(b => ({ x: b[0] + b[2] / 2, y: b[1] + b[3] + .42, base: b[1] + b[3] + .04 })),   /* y = onde a pessoa para; base = o degrau da porta */
  GRADE = [new Uint8Array(GC * GL), new Uint8Array(GC * GL)], DESTINOS = [], CONVS = [],
  AGENTES = [...CIV, ...ANIMAIS], CIV_SET = new Set(CIV), CAO = ANIMAIS.find(a => a.tipo == 'cachorro');
let MISS = null, agora = 0, ambT = 0;

const naVia = (x, y) => (y > 5 && y < 7) || (x > 9 && x < 11),
  naFaixa = (x, y) => FAIXAS.find(f => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1),
  distanciaRua = (x, y) => Math.min(y < 5 ? 5 - y : y > 7 ? y - 7 : 0, x < 9 ? 9 - x : x > 11 ? x - 11 : 0),
  noMiss = (x, y) => MISS && Math.hypot(x - MISS[0], y - MISS[1]) < .8;   /* ninguém para em cima de quem está com o ❗ */
function andavelFixo(x, y, sem) { if (x < .35 || x > W - .35 || y < .5 || y > H - .3 || obstaculo(x, y, .2)) return false; return !naVia(x, y) || (!sem && !!naFaixa(x, y)) }
const andavel = (x, y, sem) => andavelFixo(x, y, sem) && !noMiss(x, y);
const pedestres = () => { const l = CIV.filter(p => !p.oculto && p.alpha > .2); l.push(CAO); return l };
const nivel = () => !S || S.tot < 3 ? 'novo' : S.hit / S.tot >= .6 ? 'bem' : 'mal';

/* ---- navegação ---- */
const VIZ = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]],
  pg = new Float32Array(GC * GL), pai = new Int32Array(GC * GL), fech = new Uint8Array(GC * GL),
  celX = i => (i % GC + .5) * GR, celY = i => (i / GC | 0) * GR + GR / 2;
const livreCel = (i, sem) => GRADE[sem ? 1 : 0][i] && !noMiss(celX(i), celY(i));
function celulaPerto(x, y, sem) {
  const ci = Math.max(0, Math.min(GC - 1, x / GR | 0)), cj = Math.max(0, Math.min(GL - 1, y / GR | 0));
  for (let r = 0; r <= 10; r++)for (let dj = -r; dj <= r; dj++)for (let di = -r; di <= r; di++) {
    if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
    const i = ci + di, j = cj + dj; if (i >= 0 && j >= 0 && i < GC && j < GL && livreCel(j * GC + i, sem)) return j * GC + i
  }
  return -1
}
function linhaLivre(a, b, sem) {
  const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / .08);
  for (let k = 1; k < n; k++) { const u = k / n; if (!andavel(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, sem)) return false } return true
}
function suavizar(p, sem) {
  const o = [p[0]]; let i = 0;
  while (i < p.length - 1) { let j = Math.min(p.length - 1, i + 18); while (j > i + 1 && !linhaLivre(p[i], p[j], sem)) j--; o.push(p[j]); i = j } return o
}
/* A* na grade; 'sem' = true proíbe até as faixas (gatos nunca atravessam rua). Atravessar a via custa mais, então todo mundo prefere a calçada. */
function planejar(x0, y0, x1, y1, sem) {
  const a = celulaPerto(x0, y0, sem), b = celulaPerto(x1, y1, sem); if (a < 0 || b < 0) return null;
  pg.fill(1e9); fech.fill(0); pai.fill(-1);
  const hf = [], hi = [],
    push = (f, i) => { let k = hf.length; hf.push(f); hi.push(i); while (k > 0) { const p = (k - 1) >> 1; if (hf[p] <= f) break; hf[k] = hf[p]; hi[k] = hi[p]; k = p } hf[k] = f; hi[k] = i },
    pop = () => {
      const top = hi[0], f = hf.pop(), i = hi.pop(), n = hf.length;
      if (n) { let k = 0; for (; ;) { let c = 2 * k + 1; if (c >= n) break; if (c + 1 < n && hf[c + 1] < hf[c]) c++; if (hf[c] >= f) break; hf[k] = hf[c]; hi[k] = hi[c]; k = c } hf[k] = f; hi[k] = i } return top
    };
  const bi = b % GC, bj = b / GC | 0, hh = (i, j) => { const dx = Math.abs(i - bi), dy = Math.abs(j - bj); return dx + dy - .586 * Math.min(dx, dy) };
  pg[a] = 0; push(hh(a % GC, a / GC | 0), a);
  while (hf.length) {
    const i = pop(); if (fech[i]) continue; fech[i] = 1; if (i === b) break; const ci = i % GC, cj = i / GC | 0;
    for (const [di, dj, c] of VIZ) {
      const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= GC || nj >= GL) continue; const k = nj * GC + ni; if (fech[k] || !livreCel(k, sem)) continue;
      if (di && dj && (!livreCel(cj * GC + ni, sem) || !livreCel(nj * GC + ci, sem))) continue;
      const ng = pg[i] + c + (naVia(celX(k), celY(k)) ? 20 : 0); if (ng < pg[k]) { pg[k] = ng; pai[k] = i; push(ng + hh(ni, nj), k) }
    }
  }
  if (a !== b && pai[b] < 0) return null;
  const pts = []; for (let k = b; k >= 0; k = pai[k])pts.push({ x: celX(k), y: celY(k) }); pts.reverse();
  pts[0] = { x: x0, y: y0 }; if (andavel(x1, y1, sem)) pts.push({ x: x1, y: y1 });
  return suavizar(pts, sem)
}
function destravar(a, sem) { for (let r = .1; r < 2.5; r += .1)for (let k = 0; k < 360; k += 30) { const x = a.x + Math.cos(k * Math.PI / 180) * r, y = a.y + Math.sin(k * Math.PI / 180) * r; if (andavel(x, y, sem) && !carroNoPonto(x, y, .3)) { a.x = x; a.y = y; return true } } return false }
function pontoPerto(x, y, rmin, rmax, sem) {
  for (let k = 0; k < 12; k++) {
    const an = Math.random() * 6.283, r = rmin + Math.random() * (rmax - rmin), px = x + Math.cos(an) * r, py = y + Math.sin(an) * r;
    if (andavel(px, py, sem) && !naVia(px, py) && distanciaRua(px, py) >= .75) return { x: px, y: py }
  } return null
}

/* Pedestres e animais só atravessam pela faixa quando o trecho está livre. */
function podeAtravessar(x, y) {
  const f = naFaixa(x, y); if (!f) return true;
  const h = f.eixo == 'h', pc = h ? (f.x0 + f.x1) / 2 : (f.y0 + f.y1) / 2, verde = viaVerde === f.eixo;
  return !CARS.some(c => {
    if (c.axis !== f.eixo || c.v <= .3) return false;
    const pos = h ? c.x : c.y, delta = (pc - pos) * c.dir, meia = h ? (f.x1 - f.x0) / 2 : (f.y1 - f.y0) / 2;
    if (Math.abs(pc - pos) < .8 + meia + .3) return true;
    return delta > -1 && delta < (verde ? 4.5 : 2)
  })
}
function carroNoPonto(x, y, m = .14) { return CARS.some(c => distanciaCarro(c, x, y, m) === 0) }
function distanciaCarro(c, x, y, m = .14) {
  const hw = (c.axis == 'h' ? .74 : .36) + m, hh = (c.axis == 'h' ? .36 : .74) + m;
  return Math.hypot(Math.max(0, Math.abs(x - c.x) - hw), Math.max(0, Math.abs(y - c.y) - hh))
}
function podeMoverPara(origem, x, y) {
  if (naVia(x, y) && !naFaixa(x, y)) return false;
  return naVia(origem.x, origem.y) || !naVia(x, y) || podeAtravessar(x, y)
}
function afastandoDeCarros(a, x, y) {
  for (const c of CARS) {
    const novaDistancia = distanciaCarro(c, x, y, .24), distanciaAtual = distanciaCarro(c, a.x, a.y, .24);
    if (novaDistancia === 0) {
      if (distanciaAtual > 0 || Math.hypot(x - c.x, y - c.y) <= Math.hypot(a.x - c.x, a.y - c.y)) return false
    }
  }
  return true
}

/* Anda um passo pelo caminho a.cam. Retorna true quando chegou ao fim. */
function andarAgente(a, dt, vel, sem) {
  if (!a.cam) return true;
  let al = a.cam[a.ci]; while (al && Math.hypot(al.x - a.x, al.y - a.y) < .07) al = a.cam[++a.ci];
  if (!al) { a.cam = null; a.mov = false; return true }
  let dx = al.x - a.x, dy = al.y - a.y; const d = Math.hypot(dx, dy); dx /= d; dy /= d;
  let sx = 0, sy = 0;   /* evita sobrepor animais e jogador, sem bloquear outros civis */
  const empurra = (ox, oy, od, lim, k) => {
    if (od >= lim) return; const f = (lim - od) / lim * k;   /* exatamente empilhados: desempata por uma direção própria de cada um */
    if (od < .001) { const an = (a.fase || 1) * 7; sx += Math.cos(an) * f; sy += Math.sin(an) * f } else { sx += ox / od * f; sy += oy / od * f }
  };
  for (const o of AGENTES) { if (o === a || o.oculto || (CIV_SET.has(a) && CIV_SET.has(o))) continue; const ox = a.x - o.x, oy = a.y - o.y; empurra(ox, oy, Math.hypot(ox, oy), .5, 1) }
  if (S) { const ox = a.x - S.x, oy = a.y - S.y; empurra(ox, oy, Math.hypot(ox, oy), .7, 1.4) }
  let vx = dx + sx * .9, vy = dy + sy * .9; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
  const passo = Math.min(vel * dt, d), nx = a.x + vx * passo, ny = a.y + vy * passo;
  if (!podeMoverPara(a, nx, ny)) {
    a.espera = (a.espera || 0) + dt; a.mov = false; a.vv = 0;
    { const ex = a.x + sx * vel * dt * 1.6, ey = a.y + sy * vel * dt * 1.6, ok = (x, y) => andavel(x, y, sem) && !naVia(x, y); if (sx || sy) { if (ok(ex, ey)) { a.x = ex; a.y = ey } else if (ok(ex, a.y)) a.x = ex; else if (ok(a.x, ey)) a.y = ey } }   /* quem espera no meio-fio também se afasta de quem chega, em vez de empilhar */
    a.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); return false
  }   /* espera no meio-fio */
  if (!afastandoDeCarros(a, nx, ny)) { a.espera = (a.espera || 0) + dt; a.mov = false; a.vv = 0; return false }
  a.espera = 0;
  let ok = true; if (andavel(nx, ny, sem)) { a.x = nx; a.y = ny } else if (andavel(nx, a.y, sem)) a.x = nx; else if (andavel(a.x, ny, sem)) a.y = ny; else ok = false;
  a.mov = ok; a.vv = ok ? vel : 0;
  if (ok) { a.pass += passo; a.hx = dx; a.hy = dy; if (Math.abs(dx) > Math.abs(dy)) a.face = dx > 0 ? 'r' : 'l'; else a.face = dy > 0 ? 'd' : 'u'; if (Math.abs(dx) > .2) a.dir = dx > 0 ? 1 : -1 }
  return false
}

/* ---- balões de fala (civis e bichos) ---- */
function quebrar(txt, max = 22) { const ls = []; let l = ''; txt.split(' ').forEach(w => { if (l && (l + ' ' + w).length > max) { ls.push(l); l = w } else l = l ? l + ' ' + w : w }); if (l) ls.push(l); return ls }
function falar(a, txt, dur = 3400) { a.fala = { l: quebrar(txt), ini: agora, ate: agora + dur } }
const livreDeFala = a => !a.fala || agora > a.fala.ate;

/* ---- pedestres ---- */
function sairDoPredio(p) { const P = PORTAS[p.porta]; p.est = 'sair'; p.prog = 0; p.oculto = false; p.alpha = 0; p.x = P.x; p.y = P.base; p.face = 'd' }
function atualizarCivil(p, dt, t) {
  if (p.est == 'dentro') { p.tm -= dt; if (p.tm <= 0) sairDoPredio(p); return }
  if (p.est == 'entrar') {
    const P = PORTAS[p.porta]; p.prog += dt / .7; p.alpha = Math.max(0, 1 - p.prog); p.x += (P.x - p.x) * Math.min(1, dt * 6); p.y = p.py0 + (P.base - p.py0) * Math.min(1, p.prog); p.face = 'u'; p.mov = p.prog < .8; p.pass += dt * .8;
    if (p.prog >= 1) { p.est = 'dentro'; p.oculto = true; p.alpha = 0; p.mov = false; p.tm = 5 + Math.random() * 9; p.fala = null } return
  }
  if (p.est == 'sair') {
    const P = PORTAS[p.porta]; p.prog += dt / .7; p.alpha = Math.min(1, p.prog); p.y = P.base + (P.y - P.base) * Math.min(1, p.prog); p.face = 'd'; p.mov = true; p.pass += dt * .8;
    if (p.prog >= 1) { p.est = 'parar'; p.tm = .3 + Math.random(); p.alpha = 1; p.mov = false } return
  }
  if (!andavel(p.x, p.y) && destravar(p) && p.est == 'andar') { novoDestino(p); return }
  if (p.est == 'parar') { p.mov = false; if (p.conv) return; p.tm -= dt; if (Math.random() < dt * .3) p.face = ['l', 'r', 'd', 'd'][Math.random() * 4 | 0]; if (p.tm <= 0) novoDestino(p); return }
  const fim = andarAgente(p, dt, p.vel, false);
  if (fim) { chegou(p); return }
  if (p.espera) { if (p.espera > 16) novoDestino(p); return }
  p.stk += dt; if (p.stk > 1.8) { if (Math.hypot(p.x - p.sx, p.y - p.sy) < .25) novoDestino(p); p.stk = 0; p.sx = p.x; p.sy = p.y }
}
function novoDestino(p) {
  p.stk = 0; p.sx = p.x; p.sy = p.y; p.espera = 0; p.interesse = null; p.alvoPorta = -1; p.cam = null;
  const dentro = CIV.filter(c => c.est == 'dentro' || c.est == 'entrar').length, r = Math.random(); let dest = null;
  if (r < .3 && dentro < 3) { const k = Math.random() * PORTAS.length | 0; if (k !== p.porta && andavel(PORTAS[k].x, PORTAS[k].y)) { dest = PORTAS[k]; p.alvoPorta = k } }
  else if (r < .45) { const o = CIV.filter(c => c !== p && !c.oculto && c.est != 'entrar' && c.est != 'sair'); if (o.length) { const q = o[Math.random() * o.length | 0]; dest = pontoPerto(q.x, q.y, .8, 1.2); if (dest) p.interesse = 'gente' } }
  else if (r < .55) { const a = ANIMAIS[Math.random() * ANIMAIS.length | 0]; dest = pontoPerto(a.x, a.y, .8, 1.1); if (dest) p.interesse = a }
  const quad = (x, y) => (x < 9 ? 0 : x > 11 ? 1 : 2) * 3 + (y < 5 ? 0 : y > 7 ? 1 : 2), mesmoLado = Math.random() < .7;   /* 70% das voltas ficam do mesmo lado da rua: menos fila nas faixas */
  for (let k = 0; k < 24 && !dest; k++) { const c = DESTINOS[Math.random() * DESTINOS.length | 0]; if (Math.hypot(c[0] - p.x, c[1] - p.y) > (k < 16 ? 2 : 1) && andavel(c[0], c[1]) && (!mesmoLado || k >= 16 || quad(c[0], c[1]) === quad(p.x, p.y))) dest = { x: c[0], y: c[1] } }
  const cam = dest && planejar(p.x, p.y, dest.x, dest.y, false);
  if (!cam || cam.length < 2) { p.est = 'parar'; p.tm = 1 + Math.random() * 2; p.alvoPorta = -1; p.interesse = null; return }
  p.cam = cam; p.ci = 1; p.est = 'andar'
}
function chegou(p) {
  p.cam = null; p.mov = false;
  if (p.alvoPorta >= 0) { p.porta = p.alvoPorta; p.alvoPorta = -1; p.est = 'entrar'; p.prog = 0; p.py0 = p.y; p.portaX = PORTAS[p.porta].x; p.portaY = PORTAS[p.porta].y; return }
  p.est = 'parar'; p.tm = 1.5 + Math.random() * 4; const i = p.interesse; p.interesse = null;
  if (i && i.tipo && Math.hypot(i.x - p.x, i.y - p.y) < 1.8) { p.face = i.x > p.x ? 'r' : 'l'; falar(p, sorteio('pet' + i.tipo, PET[i.tipo]), 3200); i.carinho = agora + 3400; i.pet = p }
  else tentarConversa(p)
}

/* ---- conversas entre pedestres ---- */
function tentarConversa(p) {
  if (Math.random() < .3) return;
  const q = CIV.find(c => c !== p && c.est == 'parar' && !c.conv && !c.oculto && agora > c.cdConv && Math.hypot(c.x - p.x, c.y - p.y) < 1.8);
  if (q && agora > p.cdConv) iniciarConversa(p, q)
}
function iniciarConversa(a, b) {
  const niv = nivel(), geral = Math.random() < .4, lin = sorteio(geral ? 'dialn' : 'dial' + niv, geral ? DIAL.neutro : DIAL[niv]), c = { a, b, lin, i: 0, prox: agora + 300 };
  a.conv = b.conv = c; a.est = b.est = 'parar'; a.tm = b.tm = 99; a.mov = b.mov = false; a.cam = b.cam = null; a.face = b.x > a.x ? 'r' : 'l'; b.face = a.face == 'r' ? 'l' : 'r'; CONVS.push(c)
}
function fimConversa(c) {
  const k = CONVS.indexOf(c); if (k >= 0) CONVS.splice(k, 1);
  [c.a, c.b].forEach(p => { if (p.conv === c) { p.conv = null; p.tm = .4 + Math.random() * 1.5; p.cdConv = agora + 15000 } })
}
function atualizarConversa(c, t) {
  if (c.a.est != 'parar' || c.b.est != 'parar') { fimConversa(c); return }
  if (t < c.prox) return;
  if (c.i >= c.lin.length) { fimConversa(c); return }
  falar(c.i % 2 ? c.b : c.a, c.lin[c.i], 3000); c.i++; c.prox = t + 3100
}
const baloesAtivos = () => AGENTES.filter(a => a.fala && agora < a.fala.ate).length;   /* teto de balões simultâneos, para a tela não virar história em quadrinhos */
function falaAmbiente(t) {
  if (t < ambT || baloesAtivos() >= 3) return; ambT = t + 9000 + Math.random() * 6000;
  const l = CIV.filter(p => !p.oculto && p.alpha > .9 && !p.conv && livreDeFala(p)), p = l[Math.random() * l.length | 0];
  if (p) falar(p, sorteio('amb', RUA.ocioso), 3200)
}

/* ---- reações ao jogador ---- */
function evento(tipo) { if (S) S.evt = { tipo, t0: agora + 1400, n: (tipo == 'ok' || tipo == 'no' || tipo == 'tempo') ? 1 : 2 } }
function vizinhoDoJogador(raio) {
  let b = null, bd = raio;
  CIV.forEach(p => { if (p.oculto || p.est == 'entrar' || p.est == 'sair' || !livreDeFala(p)) return; const d = Math.hypot(p.x - S.x, p.y - S.y); if (d < bd) { bd = d; b = p } }); return b
}
const olharJogador = p => { if (p.est == 'parar') p.face = S.x > p.x ? 'r' : 'l' };
function reagirAoJogador(dt, t) {
  if (!S) return;
  const aberto = ov.classList.contains('on');
  if (aberto) { S.parado = 0; if (S.evt) S.evt.t0 = Math.max(S.evt.t0, t + 1200); return }
  S.parado = S.mv ? 0 : S.parado + dt;
  if (S.evt) {
    if (t >= S.evt.t0) {
      const p = vizinhoDoJogador(9);
      if (p) { olharJogador(p); falar(p, sorteio('r_' + S.evt.tipo, REACAO[S.evt.tipo]), 3600); sfx('tx'); S.evt.t0 = t + 1800 + Math.random() * 900; if (--S.evt.n <= 0) S.evt = null }
      else if (t > S.evt.t0 + 9000) S.evt = null
    }
    return
  }
  if (S.parado > 10) { const p = vizinhoDoJogador(5.5); if (p) { olharJogador(p); falar(p, sorteio('parado', RUA.parado), 3600); S.parado = -7 } else S.parado = 4 }
  CIV.forEach(p => {
    if (t < p.cdProx || p.oculto || p.est == 'entrar' || p.est == 'sair' || !livreDeFala(p) || baloesAtivos() >= 4) return;
    if (Math.hypot(p.x - S.x, p.y - S.y) < 1.5) {
      p.cdProx = t + 14000 + Math.random() * 10000; olharJogador(p);
      const niv = nivel(), pool = Math.random() < .4 ? RUA.perto : RUA[niv]; falar(p, sorteio('rua' + (pool === RUA.perto ? 'p' : niv), pool), 3200)
    }
  })
}

/* ---- animais ---- */
function passeioAnimal(a, rmin, rmax, sem) {
  for (let k = 0; k < 10; k++) {
    const an = Math.random() * 6.283, r = rmin + Math.random() * (rmax - rmin), x = a.x + Math.cos(an) * r, y = a.y + Math.sin(an) * r;
    if (!andavel(x, y, sem) || naVia(x, y)) continue; const cam = planejar(a.x, a.y, x, y, sem); if (cam && cam.length > 1) { a.cam = cam; a.ci = 1; return true }
  } return false
}
function emote(a, pool, t, cd = 7000) { if (t < a.emoCd || !livreDeFala(a)) return; a.emoCd = t + cd + Math.random() * 4000; falar(a, sorteio('em' + a.tipo, pool), 1500) }
function atualizarGato(a, dt, t) {
  const j = S ? Math.hypot(a.x - S.x, a.y - S.y) : 99;
  if (a.est == 'fugir') { a.tf += dt; if (andarAgente(a, dt, 2.9, true) || a.tf > 6) { a.est = 'sentar'; a.tm = 2 + Math.random() * 3; a.mov = false; a.cam = null } return }
  if (j < (a.est == 'dormir' ? .85 : 1.2) && t > a.fugaCd && a.carinho < t) {   /* o jogador chegou perto: o gato sai correndo */
    for (let k = 0; k < 10; k++) {
      const an = Math.atan2(a.y - S.y, a.x - S.x) + (Math.random() - .5) * 1.6, r = 2.5 + Math.random() * 2, x = a.x + Math.cos(an) * r, y = a.y + Math.sin(an) * r;
      if (!andavel(x, y, true) || naVia(x, y)) continue; const cam = planejar(a.x, a.y, x, y, true); if (cam && cam.length > 1) { a.cam = cam; a.ci = 1; a.est = 'fugir'; a.tf = 0; a.fugaCd = t + 3000; if (Math.random() < .5) emote(a, EMO.gato, t, 3000); return }
    }
    a.fugaCd = t + 1500
  }
  if (a.carinho > t) { a.mov = false; a.cam = null; a.est = 'sentar'; if (a.pet) a.dir = a.pet.x > a.x ? 1 : -1; return }
  if (a.est == 'andar') { a.tf += dt; if (andarAgente(a, dt, .85, true) || a.tf > 9) { a.est = 'sentar'; a.tm = 2 + Math.random() * 4; a.mov = false; a.cam = null } return }
  a.mov = false; a.tm -= dt; if (a.tm > 0) return;
  const r = Math.random();
  if (r < .38 && passeioAnimal(a, 1.2, 3.5, true)) { a.est = 'andar'; a.tf = 0 }
  else if (r < .62) { a.est = 'sentar'; a.tm = 2 + Math.random() * 4; if (Math.random() < .5) a.dir *= -1 }
  else if (r < .82) { a.est = 'lamber'; a.tm = 2.5 + Math.random() * 2 }
  else { a.est = 'dormir'; a.tm = 9 + Math.random() * 10 }
}
function atualizarCao(a, dt, t) {
  const d = CIV.find(c => c.dono), dentro = d.est == 'dentro' || d.est == 'entrar' || d.est == 'sair', j = S ? Math.hypot(a.x - S.x, a.y - S.y) : 99;
  if (j < 1.5 && !dentro) emote(a, EMO.cachorro, t, 8000);
  if (a.carinho > t) { a.mov = false; a.cam = null; a.est = 'sentar'; if (a.pet) a.dir = a.pet.x > a.x ? 1 : -1; return }
  if (a.est == 'brincar' || a.est == 'farejar') {
    a.tf += dt; if (andarAgente(a, dt, a.est == 'brincar' ? 2.7 : .75, false) || a.tf > 9) { a.est = 'sentar'; a.tm = 1.5 + Math.random() * 2.5; a.mov = false; a.cam = null }
    if (Math.hypot(a.x - d.x, a.y - d.y) > 5) { a.est = 'seguir'; a.cam = null; a.seguindo = true }
    return
  }
  let tx, ty;
  if (dentro) { tx = d.portaX + a.lado * .5; ty = d.portaY + .2 }
  else if (d.mov && d.hx !== undefined) { tx = d.x - d.hx * .85 - d.hy * .3 * a.lado; ty = d.y - d.hy * .85 + d.hx * .3 * a.lado }
  else { tx = d.x + a.lado * .8; ty = d.y + .35 }
  const dalvo = Math.hypot(a.x - tx, a.y - ty);
  if (!a.seguindo && dalvo > (dentro ? .7 : d.mov ? .95 : 1.6)) { a.seguindo = true; a.rp = 0 }
  if (a.seguindo) {
    a.est = 'seguir'; a.rp -= dt;
    if (a.rp <= 0 || !a.cam) { a.rp = .7; a.cam = dalvo > .35 ? planejar(a.x, a.y, tx, ty, false) : null; a.ci = 1 }
    if (a.cam) andarAgente(a, dt, Math.min(2.8, Math.max(1.1, dalvo * 1.1 + (d.mov ? d.vel * .6 : 0))), false); else a.mov = false;
    if (dalvo < .4) { a.seguindo = false; a.cam = null; a.mov = false; a.est = 'sentar'; a.tm = 1 + Math.random() * 2 }
    return
  }
  a.mov = false; a.tm -= dt; if (a.tm > 0) return;
  const r = Math.random();
  if (dentro) { a.est = Math.random() < .5 ? 'sentar' : 'deitar'; a.tm = 3 + Math.random() * 3; return }
  if (r < .3 && passeioAnimal(a, 1, 2.2, false)) { a.est = 'farejar'; a.tf = 0 }
  else if (r < .5 && passeioAnimal(a, 2, 3.6, false)) { a.est = 'brincar'; a.tf = 0 }
  else if (r < .78) { a.est = 'sentar'; a.tm = 3 + Math.random() * 3 }
  else { a.est = 'deitar'; a.tm = 6 + Math.random() * 6 }
}

/* ---- laço principal da cidade ---- */
function iniciarCidade() {
  for (let s = 0; s < 2; s++)for (let j = 0; j < GL; j++)for (let i = 0; i < GC; i++)GRADE[s][j * GC + i] = andavelFixo(celX(j * GC + i), celY(j * GC + i), !!s) ? 1 : 0;
  for (let k = 0; k < GC * GL; k++)if (GRADE[0][k] && !naVia(celX(k), celY(k)) && distanciaRua(celX(k), celY(k)) >= .75) DESTINOS.push([celX(k), celY(k)]);
  const encaixa = (a, sem) => { if (!andavelFixo(a.x, a.y, sem)) { const c = celulaPerto(a.x, a.y, sem); if (c >= 0) { a.x = celX(c); a.y = celY(c) } } };
  CIV.forEach((p, i) => {
    encaixa(p, false);
    Object.assign(p, {
      est: 'parar', tm: .4 + Math.random() * 2.5 + i * .35, face: 'd', alpha: 1, pass: Math.random() * 6, fase: Math.random() * 6, mov: false, cdProx: 5000 + Math.random() * 5000, cdConv: 0,
      fala: null, cam: null, ci: 0, oculto: false, espera: 0, stk: 0, sx: p.x, sy: p.y, alvoPorta: -1, porta: -1, vel: p.vel || 1, hx: 0, hy: 1, conv: null
    })
  });
  ANIMAIS.forEach((a, i) => {
    encaixa(a, a.tipo == 'gato');
    Object.assign(a, { fase: Math.random() * 6, dir: Math.random() < .5 ? 1 : -1, est: 'sentar', tm: 1 + Math.random() * 3, pass: 0, mov: false, vv: 0, cam: null, ci: 0, fala: null, espera: 0, emoCd: 0, carinho: 0, fugaCd: 0, tf: 0, seguindo: false, rp: 0, lado: i % 2 ? 1 : -1, pet: null })
  })
}
function atualizarCidade(dt, t) {
  agora = t;
  const m = S && M[S.p] && cur(); MISS = m ? [m.x + .5, m.y + .5] : null;
  CIV.forEach(p => atualizarCivil(p, dt, t));
  ANIMAIS.forEach(a => a.tipo == 'gato' ? atualizarGato(a, dt, t) : atualizarCao(a, dt, t));
  CONVS.slice().forEach(c => atualizarConversa(c, t));
  falaAmbiente(t); reagirAoJogador(dt, t)
}

/* ===== FALAS =====
   Cada lista é embaralhada e consumida inteira antes de repetir qualquer frase (ver sorteio). {n} vira um número. */
/* Fala do personagem da missão no card de resposta */
const CARD = {
  ok: ['Acertou. Não sei se foi mérito ou sorte, mas vou anotar.', 'Olha só! Alguém andou prestando atenção.', 'Certo. Pode comemorar, mas só um pouquinho.', 'Isso! Eu até ia fingir surpresa, mas não deu.', 'Correto. A cidade respira aliviada.', 'Boa! Viu como não era tão difícil quanto parecia?', 'Acertou. Vou fingir que nunca duvidei de você.', 'Muito bem. Guarda esse entusiasmo pra próxima.', 'É isso aí. Já está parecendo cidadão de verdade.', 'Certo! Quem diria, hein?', 'Acertou. Ou estudou, ou chutou com muito estilo.', 'Perfeito. Só não deixa isso subir à cabeça.', 'Ponto pra você. A prefeitura agradece (mas não paga).', 'Mandou bem. Não vou elogiar de novo, tá?'],
  combo: ['{n} seguidas! Isso já está ficando suspeito.', '{n} acertos em sequência. Quem é você e onde está o jogador de antes?', 'Combo de {n}! Alguém acordou inspirado.', '{n} seguidas. Se continuar assim, vai me dar trabalho.', 'De novo! Isso é sorte ou talento? Ainda não decidi.', '{n} na fila e nenhum erro. A rede está orgulhosa.', 'Ei, devagar! Assim você me deixa sem pergunta difícil.', '{n} acertos. Dá pra imprimir e pendurar na parede.'],
  no: ['Não foi dessa vez. Mas foi criativo, isso eu reconheço.', 'Errou. Respira, lê a explicação e finge que foi proposital.', 'Ih, errou. Aposto que você tinha certeza, né?', 'Quase! Quer dizer... não. Não foi quase.', 'Errou com tanta confiança que eu quase marquei como certo.', 'A resposta estava ali, quietinha, esperando. Você passou reto.', 'Isso aí foi um chute de longa distância, hein.', 'Erro registrado. Um minuto de silêncio pela pontuação.', 'Tudo bem, errar faz parte. Só não precisava ser tão bonito.', 'Ah, não. A rede de proteção está levando as mãos à cabeça.', 'Se tivesse medalha de tentativa, você levava o ouro.', 'Interessante. Escolheu a opção que mais parecia certa e menos era.', 'Eu avisei? Não avisei, mas estava pensando em avisar.', 'Errou. Mas olha pelo lado bom: agora você sabe o que NÃO é.', 'Foi por pouco. Ok, foi por bastante.'],
  seq: ['De novo? Já estamos virando amigos de tanto você errar aqui.', '{n} erros seguidos. Isso é persistência ou teimosia?', 'Ei, está errando de propósito pra ver minha reação?', 'Sequência de erros detectada. Quer que eu chame a Rede de Proteção pra você?', 'Tudo bem... respira... lê a explicação desta vez, combinado?', 'Se continuar assim, vou começar a cobrar entrada.', '{n} seguidas, mas de erros. Impressionante à sua maneira.'],
  quebra: ['Eram {n} acertos seguidos... eram.', 'E lá se foi o combo de {n}. Um minuto de silêncio.', 'Estava indo tão bem! {n} seguidas e tchau.', 'O combo de {n} acabou. Chorar não adianta, mas pode.'],
  tempo: ['O tempo acabou! Pensou tanto que a cidade dormiu.', 'Sem resposta. Foi estratégia ou foi soneca?', '30 segundos e nada. Até o semáforo é mais rápido.', 'Tempo esgotado. O relógio ganhou de você.', 'Eu estava esperando você responder, mas a vida seguiu.', 'Ficou olhando pra tela, né? Acontece com os melhores.', 'Silêncio total. A pergunta até ficou sem graça.', 'O tempo acabou. A paciência da cidade também.', 'Time out! A ocorrência esfriou enquanto você pensava.', 'Pensar é bom, mas tem prazo de validade.'],
  missao: ['Missão cumprida! Pode respirar, a próxima já está chegando.', 'Terminou. Merece um café, um pão de queijo e um relatório.', 'Mais uma resolvida. A cidade está um pouquinho melhor, e você um pouquinho menos perdido.', 'Missão concluída. Vou avisar a prefeitura. Ela não vai ligar, mas vou avisar.', 'Fechamos mais um caso. Anotei aqui: "ajudou, mas com drama".', 'Pronto! Agora vai lá, outro ❗ te espera.', 'Concluído. Dá pra ver que você já pegou o jeito (mais ou menos).', 'Missão feita. Vai, cidadão, antes que eu arranje mais trabalho pra você.'],
  classe: ['Subiu de classe! Já pode pedir aumento (não vai ganhar).', 'Promoção! Título novo, mesmas pernas cansadas.', 'Nova classe desbloqueada. Não esquece quem acreditou em você... lá no fundo.', 'Evoluiu! Quem diria que ia chegar até aqui.', 'Classe nova! Pelo menos o crachá agora tem um título bonito.'],
  finalBom: ['Impressionante. Tem certeza de que não colou?', 'Quase perfeito. Quase. Eu só gosto de implicar.', 'A cidade nunca esteve em tão boas mãos. Não conta pra ninguém que eu disse.', 'Isso foi bonito de ver. Pode se achar um pouquinho.'],
  finalMedio: ['Foi bonito. Dá pra melhorar, mas foi bonito.', 'Nada mal! Metade da cidade já te respeita, a outra metade está pensando.', 'Passou bem. Não foi um desfile, mas passou.', 'Resultado honesto. A cidade agradece o esforço (e relevou os erros).'],
  finalRuim: ['Você terminou. Isso já é uma vitória, considerando o caminho.', 'Foi... uma jornada. Vale tentar de novo com mais atenção.', 'A cidade sobreviveu. Dá pra dizer que graças a você? Dá pra dizer que apesar.', 'Ainda bem que a rede é grande. Ela precisou segurar muita coisa.']
};

/* Balões dos moradores quando o jogador faz algo (ou deixa de fazer) */
const REACAO = {
  ok: ['Acertou! Eita, que milagre!', 'Olha lá, o cidadão aprendeu!', 'Mandou bem... dessa vez.', 'Anota aí: um ponto pra humanidade.', 'Acertou? Será que foi sorte?', 'Opa! Esse aí lê as instruções.', 'Quem diria, hein?', 'Acertou, mas não se acostuma.', 'Palmas! Mas só duas, tá?', 'Desse jeito vira vereador.'],
  no: ['Eita! Essa doeu até aqui.', 'Foi bonito o erro. Muito confiante!', 'Errou? A cidade já abriu um protocolo.', 'Não foi dessa vez, campeão.', 'Respira. Lê a explicação. Tenta de novo.', 'Isso foi chute ou estratégia?', 'Já leu o ECA ou só a capa?', 'Errar é humano. Você está sendo MUITO humano.', 'Ai, ai, ai... a rede está tremendo.', 'Pelo menos errou com estilo.'],
  tempo: ['Dormiu na pergunta, foi?', 'O relógio ganhou de você!', 'Pensou tanto que a cidade envelheceu.', 'Tempo esgotado. Deu pra ouvir o grilo.', 'Respondeu? Não? Ah, tá.'],
  combo: ['Combo! Quem é você?!', 'Tá pegando fogo! Cuidado pra não queimar.', 'Seguidinho assim vai me dar medo.', 'Esse jogador está inspirado hoje!', 'Alguém chama o prefeito! Temos um gênio.'],
  missao: ['Mais uma missão! A cidade agradece.', 'Concluiu, é? Deve estar cansado.', 'Missão cumprida. Merece um pão de queijo.', 'Mais um ❗ resolvido. Falta o resto, né?', 'Eita, esse trabalha!'],
  classe: ['Subiu de classe! Já pode pedir aumento.', 'Promovido! Cuidado com a vaidade.', 'Agora é título e tudo, hein?', 'Nova classe, mesma cara de perdido.', 'Evoluiu! A cidade está ficando chique.']
};

/* Comentários de rua: por desempenho, ao chegar perto, quando o jogador fica parado e conversa solta */
const RUA = {
  novo: ['Novo por aqui? Dá pra perceber.', 'O ❗ é aquele sinal piscando, sabe?', 'Calma, cidadão. O mapa não morde.', 'Se perdeu? Os prédios não andam.', 'Bem-vindo à cidade. Boa sorte.', 'Dica: ande até quem está piscando.', 'Olha o turista de novo!'],
  bem: ['Olha só, o cidadão sabe das coisas.', 'Esse aí já devia estar na prefeitura.', 'Cuidado, daqui a pouco te chamam de prefeito.', 'Estudou antes de vir, é?', 'Aí sim! Cidadania de respeito.', 'Já pode dar aula, hein.', 'Acerta até quando eu chuto.', 'Está bom demais. Desconfio de cola.'],
  mal: ['Esse aí erra mais que previsão do tempo.', 'Já leu o ECA ou só viu a capa?', 'A rede de proteção está preocupada contigo.', 'Dizem que errar é humano. Você está exagerando.', 'Bora estudar um pouquinho, cidadão?', 'Chutar também é estratégia... ruim.', 'Vai com calma. Ou vai com um livro.', 'Você erra com tanta confiança que dá orgulho.'],
  parado: ['Vai ficar parado aí? A cidade não anda sozinha.', 'Está esperando o ❗ vir até você?', 'Parado assim vai virar poste.', 'Fotossíntese? Ou preguiça?', 'O mapa é grande, as pernas são suas.', 'Ei, tá vivo? Mexe aí!', 'Congelou? Tem tecla pra isso.', 'Decisão difícil: andar ou não andar?'],
  perto: ['Licença, cidadão ilustre.', 'Pode passar. Com calma.', 'Ih, o fiscal chegou.', 'Está me seguindo, é?', 'Bom dia... ou o que for.', 'Anda rápido, hein. Corre atrás de quê?', 'Dá licença, a calçada é de todos.', 'Está perdido ou só passeando?', 'Você de novo?!'],
  ocioso: ['Que calor hoje, hein.', 'Será que o ônibus passa hoje?', 'Esse semáforo demora mais que reunião.', 'Vou ali na prefeitura. Já volto... talvez.', 'Sempre tem fila. Sempre.', 'Preciso resolver umas coisinhas.', 'Esse cachorro vive melhor que eu.', 'Hoje vou usar a faixa direitinho.', 'O gato me deu aquele olhar de novo.', 'Quem pagou o poste ali? Eu não.', 'Dizem que vai chover. Mentira.', 'Bom dia, praça!', 'Preciso de um café.', 'Olha o carro vermelho de novo!']
};

/* Conversas entre dois moradores (alternam as falas) */
const DIAL = {
  neutro: [['Viu o gato da praça?', 'Vi. Aquele manda mais que o prefeito.'], ['Vai pra prefeitura?', 'Vou. Já sei que vou esperar na fila.'], ['Esse semáforo, hein...', 'Demora mais que reunião de condomínio.'], ['Tá calor, né?', 'Calor? Isso aqui é um forno.'], ['Bora tomar um café?', 'Só se você pagar dessa vez.'], ['Lembra de olhar a faixa!', 'Eu olho! O carro é que não me olha.'], ['Viu o cachorro correndo?', 'Vi. Corre mais que eu atrás de ônibus.'], ['Hoje o dia está calmo.', 'Fala baixo, senão atrai problema.'], ['Ouvi dizer que a prefeitura vai abrir vaga.', 'Ouvi isso há três anos.'], ['Será que o Conselho resolve?', 'Resolve. Em algumas reuniões. Muitas.']],
  novo: [['Quem é aquele ali?', 'O novato. Anda como quem perdeu o mapa.'], ['Ele vai ajudar a cidade?', 'Vai tentar. É o que importa.'], ['Aquele jogador acabou de chegar.', 'Dá uns minutos. Ele se acostuma.'], ['Está procurando o ❗?', 'Provavelmente. Mas olha pro lado errado.']],
  bem: [['Aquele jogador acerta tudo.', 'Será que decorou o ECA inteiro?'], ['Viu a pontuação dele?', 'Vi. Dá vontade de pedir autógrafo.'], ['Esse aí é bom mesmo.', 'Só espero que não suba à cabeça.'], ['O jogador está voando hoje.', 'Se continuar, vira vereador.'], ['Ele errou alguma?', 'Dizem que sim. Eu nunca vi.']],
  mal: [['Viu o desempenho dele?', 'Vi. Dá vontade de abrir ocorrência.'], ['Ele errou de novo?', 'Erra com tanta confiança que parece certo.'], ['Aquele jogador está aí de novo.', 'Reze pela rede de proteção dele.'], ['Ele já leu o ECA?', 'Acho que só a capa. E olhou torto.'], ['Será que ele melhora?', 'Tem potencial. Muito, muito escondido.'], ['Pelo menos ele tenta.', 'Tentar é bonito. Acertar é opcional.']]
};

/* Carinho nos bichos e sons que eles fazem */
const PET = {
  cachorro: ['Quem é o bonitinho? Quem é?', 'Olha esse focinho!', 'Esse aí é mais feliz que eu.', 'Aposto que ele entende de cidadania.', 'Carinho autorizado!'],
  gato: ['Psiu, psiu... gatinho!', 'Esse aí me ignora com classe.', 'Cuidado, ele arranha. Eu sei.', 'Que olhar de desprezo!', 'Ele é o verdadeiro dono da praça.']
},
  EMO = { cachorro: ['AU!', 'AU AU!', 'ARF!', 'AUUU!'], gato: ['MIAU', 'miau~', 'prrr...', 'MIAAU!'] };

const PA = [], FUMACA = [];
function burst(m) { const x = (m.x + .5) * T, y = (m.y + .5) * T; for (let i = 0; i < 40; i++)PA.push({ x, y, vx: (Math.random() - .5) * 260, vy: -Math.random() * 280 - 40, l: 1.2, c: ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#fff'][i % 5] }); rain(25) }
function rain(n) { for (let i = 0; i < n; i++)PA.push({ x: Math.random() * 640, y: -10, vx: (Math.random() - .5) * 60, vy: Math.random() * 80, l: 2.4, c: ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#fff'][i % 5] }) }
function shake() { st.classList.remove('sh'); void st.offsetWidth; st.classList.add('sh') }
function desenhar(t, civis) {
  g.drawImage(bg, 0, 0); g.fillStyle = 'rgba(0,0,0,.07)';
  [0, 1, 2].forEach(i => { const cx = ((t / 60 + i * 260) % 800) - 120; g.fillRect(cx, 60 + i * 110, 90, 22); g.fillRect(cx + 20, 50 + i * 110, 50, 12) });
  desenharPassaros(t);
  WN.forEach(([a, b], i) => { g.globalAlpha = .035 + .025 * (Math.sin(t / 900 + i * 2.3) + 1) / 2; g.fillStyle = '#fff1c5'; g.fillRect(a, b, 16, 14); g.globalAlpha = 1 });
  FUMACA.forEach(p => { g.globalAlpha = .28 * p.vida / p.duracao; g.fillStyle = '#c2c5c2'; g.fillRect(Math.round(p.x), Math.round(p.y), p.tamanho, p.tamanho) }); g.globalAlpha = 1;
  g.imageSmoothingEnabled = false; const m = S && cur(), L = [];
  if (m) {
    const nx = (m.x + .5) * T, ny = (m.y + .5) * T, d = Math.abs(S.x - m.x - .5) > Math.abs(S.y - m.y - .5) ? (S.x < m.x + .5 ? 'l' : 'r') : 'd', z = Math.sin(t / 250);
    g.strokeStyle = m.cor; g.lineWidth = 3; g.globalAlpha = .75; g.beginPath(); g.ellipse(nx, ny + 9, 13 + z * 2, 5 + z, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
    L.push([ny, () => { ent(NP(m), d, 0, nx, ny, Math.sin(t / 300) > .5 ? -1 : 0); g.font = 'bold 18px monospace'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText('❗', nx, ny - 16 + Math.sin(t / 200) * 3) }])
  }
  CARS.forEach(c => L.push([c.y * T, () => desenharCarro(c)])); PROPS.forEach(p => L.push(p.e));
  BORBOLETAS.forEach(b => L.push([b.y * T, () => desenharBorboleta(b, t)]));
  if (S) { const px = S.x * T, py = S.y * T, f = S.mv ? (S.wk * 6 | 0) % 2 : 0; L.push([py, () => ent(PP(), S.d, f, px, py, f ? -1 : 0)]) }
  CIV.forEach(p => { if (p.alpha > 0) L.push([p.y * T, () => desenharCivil(p, t)]) }); ANIMAIS.forEach(a => L.push([a.y * T, () => desenharAnimal(a, t)]));
  L.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
  g.globalCompositeOperation = 'lighter'; g.drawImage(luz, 0, 0); g.globalCompositeOperation = 'source-over'; g.drawImage(ton, 0, 0); CIV.forEach(p => desenharBalao(p, t)); ANIMAIS.forEach(a => desenharBalao(a, t));   /* luz e tonalização pré-renderizadas (antes: 5 gradientes por frame) */
  PA.forEach(p => { g.globalAlpha = Math.min(1, p.l); g.fillStyle = p.c; g.fillRect(p.x, p.y, 5, 5) }); g.globalAlpha = 1
}

/* ===== JOGO ===== */
let S = null, keys = {}, last = 0, tw = null;
const lista = () => [...M[S.p], F], cur = () => lista()[S.done];
const show = (h, full) => { theaterHide(); ov.className = 'on' + (full ? ' full' : ''); ov.innerHTML = h; ov.scrollTop = 0 }, hide = () => { ov.className = '' };
function hud() { $('#hi').innerHTML = S ? `<b>${NOME[S.p]}</b> · ${TIT[S.p][S.classe]}<br>⭐ ${S.pts}${S.cb > 1 ? ' 🔥 x' + S.cb : ''} · missões ${Math.min(S.done, M[S.p].length)}/${M[S.p].length} ${deluxeProgress()}` : 'CAMINHOS DA<br>CIDADANIA' }
function type(el, txt, done) { let i = 0; clearInterval(tw); const sk = () => { clearInterval(tw); el.textContent = txt; ov.onclick = null; done() }; ov.onclick = sk; tw = setInterval(() => { i += 2; el.textContent = txt.slice(0, i); if (i % 6 == 0) sfx('tx'); if (i >= txt.length) sk() }, 28) }
function badge(t) { return `<span class="achievement">${t}</span>` }
function deluxeProgress() { if (!S) return ''; const pct = Math.min(100, Math.round((S.done / M[S.p].length) * 100)); return `<div class="bar"><i style="width:${pct}%"></i></div><small>${pct}% da campanha principal</small>` }
function pauseGame() {
  if (!S) return;
  show(`<div class="card"><div class="kicker">PAUSA</div><h3>CIDADE EM ESPERA</h3>
<p>Seu progresso desta jornada continua nesta página.</p>
<div class="two"><button id="resume" class="big">▶ CONTINUAR</button><button id="quit">⌂ MENU</button></div></div>`, 1);
  $('#resume').onclick = () => { hide(); hud() }; $('#quit').onclick = titulo
}

/* ===== FULLSCREEN ===== */
async function goFullscreen() {
  try { const el = document.documentElement; if (document.fullscreenElement) return; if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" }); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen() } catch (e) { }
  document.body.classList.add('immersive'); try { if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape') } catch (e) { } updateFSButton()
}
async function exitFullscreen() {
  try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen() } catch (e) { }
  document.body.classList.remove('immersive'); updateFSButton()
}
function toggleFullscreen() { audio(); if (document.fullscreenElement || document.webkitFullscreenElement || document.body.classList.contains('immersive')) exitFullscreen(); else goFullscreen() }
function updateFSButton() { const b = document.getElementById('fs'); if (!b) return; b.textContent = '⛶'; b.title = 'Tela inteira' }
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) document.body.classList.remove('immersive'); updateFSButton() });
window.addEventListener('resize', updateFSButton);

function titulo() {
  S = null; definirTemaMusical('a'); hud(); hide();
  $('#thMenu').innerHTML = `<button id="bj" class="big">▶ COMEÇAR JORNADA</button>
<div class="th-row"><button id="bc">? COMO JOGAR</button><button id="bk">★ CRÉDITOS</button></div>
<div class="th-sponsors"><small>APOIO</small><span><img src="${LOGO_E}" alt="Energisa"></span><span><img src="${LOGO_S}" alt="SENAI"></span></div>`;
  $('#thModal').hidden = true; theaterShow(); if (musicaAberturaExecutada()) fanfare('menu');
  $('#bj').onclick = () => { audio(); escolha() }; $('#bc').onclick = ajuda; $('#bk').onclick = creditos; $('#bj').focus({ preventScroll: true })
}
function ajuda() {
  sfx('sel'); show(`<div class="card">
<div class="kicker">MANUAL DO CIDADÃO</div><h3>COMO JOGAR</h3>
<p>🕹️ Use <b>setas/WASD</b> ou os botões de toque para explorar a cidade.</p>
<p>❗ A conversa começa automaticamente quando você chega perto dos personagens.</p>
<p>🧠 Responda com clique ou <b>1 a 4</b>. O jogo explica a resposta, inclusive quando você erra.</p>
<p>🔥 Acertos seguidos criam <b>COMBO</b> e aumentam sua pontuação.</p>
<p>⚠️ Cada erro ou tempo esgotado desconta <b>5 pontos</b>. A classe avança a cada <b>3 acertos</b>.</p>
<p>🏆 Complete as missões do caminho e encare a <b>ocorrência final</b>, que mistura os conteúdos.</p>
<div class="tip"><b>ESC</b> pausa a jornada quando você estiver andando.</div>
<div class="two"><button id="vb">← VOLTAR</button><button id="playhelp" class="big">JOGAR ▶</button></div>
</div>`, 1); $('#vb').onclick = titulo; $('#playhelp').onclick = escolha
}
function escolha() { sfx('sel'); show(`<h3>ESCOLHA SEU CAMINHO</h3><p>Duas portas estão abertas. Qual você segue?</p><div class="two">${['P', 'S'].map(k => `<button id="b${k}"><img class="pt" alt="" src="${spr(PP(k), 'd', 0).toDataURL()}"><b>${k == 'P' ? '🛡️ PROTEÇÃO' : '🚔 SEGURANÇA'}</b><br>${k == 'P' ? 'Estatutos: direitos de crianças, jovens e idosos, e a rede que protege.' : 'Riscos, prevenção, participação e o Plano Nacional.'}</button>`).join('')}</div>`, 1); $('#bP').onclick = () => ini('P'); $('#bS').onclick = () => ini('S') }
function ini(p) {
  S = { p, pts: 0, done: 0, classe: 0, h: {}, x: 8.5, y: 4.5, d: 'd', wk: 0, cb: 0, best: 0, tot: 0, hit: 0, q: 0, ach: [], seqErro: 0, parado: 0, evt: null, started: Date.now() }; keys = {}; definirTemaMusical('a'); sfx('go'); hud();
  show(`<h3>${p == 'P' ? 'REDE DE PROTEÇÃO' : 'EQUIPE DE SEGURANÇA'}</h3><p>${p == 'P' ? 'Você começa na Rede de Proteção da cidade.' : 'Você começa na equipe de segurança da cidade.'} Procure o ❗ no mapa. As classes do jogo são fictícias.</p><button id="go" class="big">COMEÇAR</button>`); $('#go').onclick = () => { sfx('sel'); hide() }; $('#go').focus()
}
function run(m, i = 0) {
  const s = m.perguntas[i], o = emb([s.resposta, ...s.alternativas]); S.q = 0;
  show(`<div class="who"><img class="pt" alt="" src="${spr(NP(m), 'd', 0).toDataURL()}"><div><h3>${m.titulo}</h3><small>${m.personagem} · pergunta ${i + 1} de ${m.perguntas.length}</small></div></div><div class="bar" id="tb"><i></i></div><p id="tx"></p><div id="op"></div>`);
  type($('#tx'), s.pergunta, () => {
    $('#op').innerHTML = o.map((x, k) => `<button data-k="${k}"><b>${k + 1}</b>${x}</button>`).join('');
    $('#op').querySelectorAll('button').forEach(b => b.onclick = () => resp(m, i, o, +b.dataset.k)); S.q = 1; S.tm = S.tmax = 30; S.cur = { m, i, o }
  })
}
function resp(m, i, o, k) {
  if (!S.q) return; S.q = 0; const s = m.perguntas[i], ok = k >= 0 && o[k] == s.resposta, h = S.h[s.categoria] = S.h[s.categoria] || [0, 0]; h[1]++; S.tot++; let gn = 0; const ant = S.cb;
  if (ok) { h[0]++; S.hit++; S.cb++; S.seqErro = 0; gn = 10 + 5 * Math.min(S.cb - 1, 3); S.pts += gn; burst(m); sfx('ok'); if (S.cb == 3 && !S.ach.includes('combo')) { S.ach.push('combo'); fanfare('achievement') } } else { S.cb = 0; S.seqErro++; S.pts = Math.max(0, S.pts - 5); shake(); sfx('no') } hud(); const linha = falaCard(ok, k, ant); evento(ok ? (S.cb >= 3 ? 'combo' : 'ok') : k < 0 ? 'tempo' : 'no');
  show(`<h3 class="${ok ? 'ok' : 'no'}">${ok ? '+' + gn + ' PONTOS' + (S.cb > 1 ? ' · COMBO x' + S.cb : '') : k < 0 ? 'TEMPO ESGOTADO · -5 PONTOS' : 'RESPOSTA ERRADA · -5 PONTOS'}</h3><p class="npcsay"><b>${m.personagem}</b> “${linha}”</p><p><b>${ok ? 'Certo!' : 'Resposta certa: ' + s.resposta}</b></p><p>${s.explicacao}</p><button id="nx" class="big">CONTINUAR</button>`);
  $('#nx').onclick = () => { sfx('sel'); i + 1 < m.perguntas.length ? run(m, i + 1) : fim(m) }; $('#nx').focus()
}
function falaCard(ok, k, ant) {
  let chave, v = 0;
  if (ok) { if (S.cb >= 2) { chave = 'combo'; v = S.cb } else chave = 'ok' }
  else if (k < 0) chave = 'tempo';
  else if (ant >= 3) { chave = 'quebra'; v = ant }
  else if (S.seqErro >= 2) { chave = 'seq'; v = S.seqErro }
  else chave = 'no';
  return sorteio('card' + chave, CARD[chave]).replace(/\{n\}/g, v)
}
function fim(m) {
  S.done++; if (m === F) return final(); const classeAnterior = S.classe; S.classe = Math.min(4, Math.floor(S.hit / 3)); hud(); sfx('win'); rain(50); if (S.done == M[S.p].length) definirTemaMusical('b');
  const avancou = S.classe > classeAnterior, chave = avancou ? 'classe' : 'missao', linhaF = sorteio('card' + chave, CARD[chave]); evento(chave);
  show(`<h3 class="ok">${avancou ? 'CLASSE AVANÇADA!' : 'MISSÃO CUMPRIDA!'}</h3><p class="npcsay"><b>${m.personagem}</b> “${linhaF}”</p><p>${avancou ? 'Nova classe' : 'Classe atual'}: <b>${TIT[S.p][S.classe]}</b></p><p>${S.done == M[S.p].length ? 'ALERTA! Uma grande ocorrência acaba de acontecer na praça...' : 'Um novo ❗ apareceu na cidade.'}</p><button id="ok" class="big">VOLTAR À CIDADE</button>`); $('#ok').onclick = () => { sfx('sel'); hide() }; $('#ok').focus()
}
function final() {
  S.classe = Math.min(4, Math.floor(S.hit / 3)); definirTemaMusical('a'); sfx('win'); rain(120); fanfare('final'); const a = S.hit / S.tot, stars = a > .85 ? '⭐⭐⭐' : a > .6 ? '⭐⭐' : '⭐', classeFinal = TIT[S.p][S.classe], linhaR = sorteio('cardfinal' + (a > .85 ? 'B' : a > .6 ? 'M' : 'R'), CARD[a > .85 ? 'finalBom' : a > .6 ? 'finalMedio' : 'finalRuim']);
  let bs = 0; try { bs = +localStorage.cc || 0; if (S.pts > bs) localStorage.cc = bs = S.pts } catch (e) { }
  const b = ['Proteção', 'Segurança', 'Participação', 'Prevenção', 'Direitos'].filter(k => S.h[k]).map(k => { const p = Math.round(100 * S.h[k][0] / S.h[k][1]); return `<div>${k} ${p}%<div class="bar"><i style="width:${p}%"></i></div></div>` }).join('');
  const o = S.p == 'P' ? 'S' : 'P';
  show(`<h3>${stars} ${classeFinal}</h3><p class="npcsay"><b>${F.personagem}</b> “${linhaR}”</p><p><b>"Você escolheu uma profissão. Mas a cidade nunca funcionou com apenas uma."</b></p>${b}<p>Estatutos protegem direitos, e as Políticas de Segurança organizam riscos e ações. Juntos formam uma rede.<br>Pontos: <b>${S.pts}</b> · Acertos: ${S.hit}/${S.tot} · Recorde: ${bs}</p><button id="o" class="big">JOGAR O CAMINHO ${NOME[o].toUpperCase()}</button><button id="r">Voltar ao início</button>`, 1);
  $('#o').onclick = () => ini(o); $('#r').onclick = titulo
}
function obstaculo(x, y, r = .22) {
  return BL.some(b => x + r > b[0] && x - r < b[0] + b[2] && y + r > b[1] && y - r < b[1] + b[3]) ||
    TREES.some(([a, b]) => Math.hypot(x - a, y - b) < r + .28) ||
    ARBUSTOS.some(([a, b]) => Math.hypot(x - a, y - b) < r + .28) ||
    /* os círculos ficam na BASE de cada poste (onde ele toca o chão), não no centro/topo do sprite */
    LP.some(([a, b]) => Math.hypot(x - a, y - b - .22) < r + .1) || PWR.some(([a, b]) => Math.hypot(x - a, y - b) < r + .1) || PARE.some(([a, b]) => Math.hypot(x - a, y - b - .62) < r + .08)
}
const caixaCarro = c => c.axis == 'h' ? [.92, .62] : [.58, .92];   /* meia-área do carro já somada ao raio do jogador */
const colideFixo = (x, y) => x < .3 || x > W - .3 || y < .4 || y > H - .2 || obstaculo(x, y);
function carroEm(x, y) { return CARS.find(c => { const [w, h] = caixaCarro(c); return Math.abs(x - c.x) < w && Math.abs(y - c.y) < h }) }
const colide = (x, y) => colideFixo(x, y) || !!carroEm(x, y);
/* Movimento do jogador: bloqueia obstáculos fixos e carros, mas deixa SAIR de uma sobreposição (antes ficava preso). */
function livrePara(nx, ny) {
  if (colideFixo(nx, ny)) return false; const c = carroEm(nx, ny); if (!c) return true;
  if (carroEm(S.x, S.y) !== c) return false; const [w, h] = caixaCarro(c), d = (x, y) => Math.max(Math.abs(x - c.x) / w, Math.abs(y - c.y) / h); return d(nx, ny) >= d(S.x, S.y)
}
function desencravar() { if (!colideFixo(S.x, S.y)) return; for (let r = .1; r < 3; r += .1)for (let a = 0; a < 360; a += 20) { const x = S.x + Math.cos(a * Math.PI / 180) * r, y = S.y + Math.sin(a * Math.PI / 180) * r; if (!colideFixo(x, y)) { S.x = x; S.y = y; return } } }
function colisaoVeicular(a, ax, ay, b, bx, by) { const aw = a.axis == 'h' ? .74 : .36, ah = a.axis == 'h' ? .36 : .74, bw = b.axis == 'h' ? .74 : .36, bh = b.axis == 'h' ? .36 : .74; return Math.abs(ax - bx) < aw + bw && Math.abs(ay - by) < ah + bh }

/* ===== TRÁFEGO ===== */
/* CAIXA = cruzamento + faixas de pedestres. O semáforo só abre a via cruzada quando nenhum carro toca nessa área. */
const CAIXA = { x0: 8.1, x1: 11.9, y0: 4.2, y1: 7.8 }, FREIO = 4.5, ACEL = 2.4;
let proxVia = 'v';
const noCruzamento = c => { const w = c.axis == 'h' ? .7 : .34, h = c.axis == 'h' ? .34 : .7; return c.x + w > CAIXA.x0 && c.x - w < CAIXA.x1 && c.y + h > CAIXA.y0 && c.y - h < CAIXA.y1 };
function atualizarSemaforo(dt) {
  tempoVia += dt;
  if (viaVerde) { if (tempoVia >= 8) { proxVia = viaVerde == 'h' ? 'v' : 'h'; viaVerde = ''; tempoVia = 0 } return }   /* todos vermelhos */
  if (tempoVia >= 1 && !CARS.some(noCruzamento)) { viaVerde = proxVia; tempoVia = 0 }
}
/* Distância livre à frente do carro (em tiles) até o primeiro motivo para parar. */
function folga(c, civis) {
  const h = c.axis == 'h', d = c.dir, pos = h ? c.x : c.y, lat = h ? c.y : c.x; let g = Infinity;
  const ver = (q, livre) => { const a = (q - pos) * d; if (a > -.8) g = Math.min(g, Math.max(0, a - livre)) };   /* só considera o que está à frente */
  if (c.axis != viaVerde) { const l = LINHA_PARADA[c.axis][h ? (d > 0 ? 'esquerda' : 'direita') : (d > 0 ? 'norte' : 'sul')], a = (l - pos) * d; if (a >= -.02) g = Math.min(g, Math.max(0, a)) }
  CARS.forEach(o => { if (o !== c && o.axis == c.axis && o.dir == d && Math.abs((h ? o.y : o.x) - lat) < .4) ver(h ? o.x : o.y, 1.55) });
  civis.forEach(q => {
    if (q && naVia(q.x, q.y) && (h ? Math.abs(q.y - c.y) : Math.abs(q.x - c.x)) < .52) {
      const pedestre = h ? q.x : q.y;
      if ((pedestre - pos) * d > -.8) ver(pedestre, 1.2)
    }
  });
  if (S && naVia(S.x, S.y) && (h ? Math.abs(S.y - c.y) : Math.abs(S.x - c.x)) < .52) {
    const jogador = h ? S.x : S.y;
    if ((jogador - pos) * d > -.8) ver(jogador, 1.35)
  }
  return g
}
function moverCarros(dt, civis) {
  atualizarSemaforo(dt);
  CARS.forEach(c => {
    const h = c.axis == 'h', g = folga(c, civis), alvo = Math.min(c.speed, Math.sqrt(2 * FREIO * Math.max(0, g)));
    c.v += Math.max(-FREIO * 1.6 * dt, Math.min(ACEL * dt, alvo - c.v)); c.movendo = c.v > .05;
    const desl = Math.min(c.v * dt, g); if (desl <= 0) return;
    let nx = c.x + (h ? c.dir * desl : 0), ny = c.y + (h ? 0 : c.dir * desl);
    /* o carro só reaparece do outro lado quando está 100% fora da tela (antes sumia com ~3px ainda visíveis) */
    if (h) { if (c.dir > 0 && nx > W + .8) nx = -.8; else if (c.dir < 0 && nx < -.8) nx = W + .8 } else { if (c.dir > 0 && ny > H + .8) ny = -.8; else if (c.dir < 0 && ny < -.8) ny = H + .8 }
    if (CARS.some(o => o !== c && colisaoVeicular(c, nx, ny, o, o.x, o.y))) { c.v = 0; c.movendo = false; return }   /* rede de segurança */
    c.x = nx; c.y = ny
  })
}
function atualizarFumaca(dt) {
  CARS.forEach(c => { if (!c.movendo) return; c.fumaca += dt; if (c.fumaca < .22) return; c.fumaca -= .22; const duracao = .8, horizontal = c.axis == 'h'; FUMACA.push({ x: (c.x - (horizontal ? c.dir * .74 : 0)) * T, y: (c.y - (horizontal ? 0 : c.dir * .74)) * T, vx: horizontal ? -c.dir * 8 + (Math.random() - .5) * 2 : (Math.random() - .5) * 2, vy: horizontal ? -1 + (Math.random() - .5) * 2 : -c.dir * 8 + (Math.random() - .5) * 2, tamanho: 2 + Math.random() * 2, vida: duracao, duracao }) });
  for (let i = FUMACA.length; i--;) { const p = FUMACA[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt; p.tamanho += dt * 2; if (p.vida <= 0) FUMACA.splice(i, 1) }
}
function mover(dt) {
  desencravar(); let dx = (keys.ArrowRight || keys.d || 0) - (keys.ArrowLeft || keys.a || 0), dy = (keys.ArrowDown || keys.s || 0) - (keys.ArrowUp || keys.w || 0); S.mv = dx || dy;
  if (S.mv) { if (dx && dy) dx *= .707, dy *= .707; S.d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); const v = 3.2 * dt, nx = S.x + dx * v, ny = S.y + dy * v;
    if (afastandoDeCarros(S, nx, S.y) && livrePara(nx, S.y)) S.x = nx;
    if (afastandoDeCarros(S, S.x, ny) && livrePara(S.x, ny)) S.y = ny;
    const w0 = S.wk; S.wk += dt; if ((S.wk * 4 | 0) != (w0 * 4 | 0)) sfx('st') }
  const m = cur(); if (m && Math.hypot(S.x - m.x - .5, S.y - m.y - .5) < 1.1) { keys = {}; S.mv = 0; sfx('go'); run(m) }
}
function loop(t) {
  const dt = Math.min(.05, (t - last) / 1000); last = t;
  atualizarCidade(dt, t); const civis = pedestres();
  moverCarros(dt, civis);
  atualizarFumaca(dt);
  if (S && !ov.classList.contains('on')) mover(dt);
  if (S && S.q) { S.tm -= dt; const b = $('#tb i'); if (b) { b.style.width = 100 * S.tm / S.tmax + '%'; b.style.background = S.tm < 8 ? 'var(--no)' : 'var(--ok)' } if (S.tm <= 0) resp(S.cur.m, S.cur.i, S.cur.o, -1) }
  PA.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 520 * dt; p.l -= dt }); for (let i = PA.length; i--;)if (PA[i].l <= 0) PA.splice(i, 1);
  desenhar(t, civis); requestAnimationFrame(loop)
}
addEventListener('keydown', e => {
  audio(); if (e.key === 'Escape' && S && !ov.classList.contains('on')) { pauseGame(); return } if (S && S.q && /^[1-4]$/.test(e.key)) { const b = ov.querySelectorAll('#op button')[e.key - 1]; b && b.click(); return }
  if (!ov.classList.contains('on')) { keys[e.key.length == 1 ? e.key.toLowerCase() : e.key] = 1; if (e.key.startsWith('Arrow')) e.preventDefault() }
});
addEventListener('keyup', e => { keys[e.key.length == 1 ? e.key.toLowerCase() : e.key] = 0 });
addEventListener('pointerdown', audio);
addEventListener('blur', () => { keys = {} }); document.addEventListener('visibilitychange', () => { if (document.hidden) keys = {} });
document.getElementById('fs').onclick = toggleFullscreen;
document.querySelectorAll('#pad button').forEach(b => { b.onpointerdown = e => { e.preventDefault(); keys[b.dataset.k] = 1 };['onpointerup', 'onpointerleave', 'onpointercancel'].forEach(ev => b[ev] = () => keys[b.dataset.k] = 0) });

configurarAbertura({ alternarFullscreen: toggleFullscreen, alternarSom: () => window.snd() });

iniciarCidade(); mundo(); requestAnimationFrame(loop);
carregarMissoes().then(({ missoes, missaoFinal }) => {
  M = missoes;
  F = missaoFinal;
  titulo();
}).catch(error => {
  console.error(error);
  $('#thMenu').innerHTML = '<p role="alert">Não foi possível carregar as missões. Verifique sua conexão e tente novamente.</p><button id="retry" class="big">TENTAR NOVAMENTE</button>';
  $('#retry').onclick = () => location.reload();
  theaterShow();
});