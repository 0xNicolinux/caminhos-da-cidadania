import { audio, fanfare, groove, sfx, stageSfx } from './audio.js';
import { LOGO_E, LOGO_S } from '../assets/logos.js';

const $ = selector => document.querySelector(selector);

const TH = { el: null, c: null, x: null, P: 3, W: 0, H: 0, t0: 0, phase: 0, done: false, feet: 0, open: 0, raf: 0, played: {}, pos: [], posY: [] };
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DANCERS = [
  { skin: '#b5774a', hair: '#1b1b1b', style: 'short', h: 0, g: 1, name: 'NÍCOLAS ADRIEL' },
  { skin: '#e8b98a', hair: '#2a1a12', style: 'long', h: -1, g: 1, name: 'MARCELA STOLV' },
  { skin: '#a86b42', hair: '#1b1b1b', style: 'short2', h: 1, g: 0, name: 'GUSTAVO HENRIQUE' },
  { skin: '#b07148', hair: '#1b1b1b', style: 'long', h: 0, g: 1, name: 'BRUNA OLIVEIRA' }
];
function R(x, y, w, h, c) { TH.x.fillStyle = c; TH.x.fillRect(Math.round(x), Math.round(y), w, h) }
function pline(x0, y0, x1, y1, th, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (; ;) { R(x0 - (th >> 1), y0 - (th >> 1), th, th, c); if (x0 == x1 && y0 == y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx } if (e2 <= dx) { e += dx; y0 += sy } }
}

function drawDancer(d, x, y, ph, walk) {
  const s = Math.sin(ph), sw = Math.round(s * 3), beat = Math.sin(ph * 2);
  const squat = walk ? 0 : 2 + Math.round(Math.abs(s)), hx = x + sw, hy = y - 15 + squat - d.h, tilt = Math.round(s * 1.6);
  const J = '#2f5ea8', JD = '#21457e', O = '#ff7a1a', OD = '#d45a00', OL = '#ffa04d';
  TH.x.globalAlpha = .35; R(x - 9, y + 1, 19, 2, '#000'); TH.x.globalAlpha = 1;
  const lf = walk ? x - 3 + Math.round(s * 3) : x - 7, rf = walk ? x + 3 - Math.round(s * 3) : x + 6;
  pline(lf, y - 1, hx - 6 - (walk ? 0 : 2), (y + hy) / 2 + 1, 3, JD); pline(hx - 6 - (walk ? 0 : 2), (y + hy) / 2 + 1, hx - 3, hy, 3, J);
  pline(rf, y - 1, hx + 6 + (walk ? 0 : 2), (y + hy) / 2 + 1, 3, JD); pline(hx + 6 + (walk ? 0 : 2), (y + hy) / 2 + 1, hx + 3, hy, 3, J);
  R(lf - 3, y - 1, 5, 2, '#1d1424'); R(rf - 1, y - 1, 5, 2, '#1d1424');
  R(hx - 5, hy - 1, 11, 2, '#1f3d70');
  R(hx - 5, hy - 6, 11, 5, O); R(hx - 5 + tilt, hy - 12, 11, 6, O); R(hx + 4 + tilt, hy - 12, 2, 11, OD); R(hx - 4 + tilt, hy - 11, 2, 4, OL);
  const shY = hy - 11, lx = hx - 6 + tilt, rx = hx + 6 + tilt;
  const lfy = shY + 3 - (walk ? 0 : (beat > 0 ? 3 : 0)), rfy = shY + 3 - (walk ? 0 : (beat < 0 ? 3 : 0));
  const lex = lx - 4 - (walk ? 0 : Math.round(Math.max(0, s) * 2)), rex = rx + 4 + (walk ? 0 : Math.round(Math.max(0, -s) * 2));
  pline(lx, shY, lex, shY + 5, 3, O); pline(rx, shY, rex, shY + 5, 3, O);
  pline(lex, shY + 5, hx - 2 + tilt, lfy, 2, d.skin); pline(rex, shY + 5, hx + 2 + tilt, rfy, 2, d.skin);
  R(hx - 4 + tilt, lfy - 1, 3, 3, d.skin); R(hx + 2 + tilt, rfy - 1, 3, 3, d.skin);
  const bx = hx - 4 + tilt + Math.round(s * .6), by = hy - 21;
  R(bx + 3, by + 7, 3, 2, d.skin); R(bx, by, 9, 8, d.skin);
  R(bx + 2, by + 3, 1, 2, '#1b1b1b'); R(bx + 6, by + 3, 1, 2, '#1b1b1b'); R(bx + 3, by + 6, 3, 1, '#7a2e2e');
  const H = d.hair;
  if (d.g) { R(bx + 1, by + 2, 3, 3, '#1b1b1b'); R(bx + 5, by + 2, 3, 3, '#1b1b1b'); R(bx + 2, by + 3, 1, 1, '#bfe3ff'); R(bx + 6, by + 3, 1, 1, '#bfe3ff'); R(bx + 4, by + 3, 1, 1, '#1b1b1b') }
  if (d.style == 'short') { R(bx - 1, by - 2, 11, 3, H); R(bx - 1, by, 2, 3, H); R(bx + 8, by, 2, 2, H) }
  else if (d.style == 'short2') { R(bx - 1, by - 3, 11, 4, H); R(bx - 1, by, 2, 2, H); R(bx + 3, by - 4, 4, 1, H) }
  else if (d.style == 'puff') { R(bx - 3, by - 6, 15, 7, H); R(bx - 3, by, 3, 5, H); R(bx + 9, by, 3, 5, H); R(bx - 1, by - 7, 11, 2, H) }
  else if (d.style == 'cap') { R(bx - 1, by - 3, 11, 4, '#ffc233'); R(bx + 8, by, 5, 2, '#ffc233'); R(bx - 1, by + 1, 2, 2, H); R(bx + 1, by + 7, 7, 1, H) }
  else { R(bx - 1, by - 2, 11, 3, H); R(bx - 2, by, 3, 11 + Math.round(Math.abs(s)), H); R(bx + 8, by, 3, 11 + Math.round(Math.abs(s)), H) }
}

function drawStage(t) {
  const { W, H } = TH, X = TH.x, f = TH.feet, fy = f - 8, val = Math.max(10, Math.round(H * .07));
  const bands = ['#1b0f33', '#22133f', '#2a184b', '#331d58'];
  for (let i = 0; i < 4; i++)R(0, i * fy / 4, W, Math.ceil(fy / 4) + 1, bands[i]);
  for (let i = 4, k = 0; i < W; i += 9, k++) { const on = RM ? 1 : ((k + (t / 260 | 0)) % 3) != 0; R(i, val + 6, 3, 3, on ? (k % 2 ? '#ffc233' : '#ff7a1a') : '#4a2b2b') }
  for (let i = 4, k = 0; i < W; i += 9, k++) { const on = RM ? 1 : ((k + (t / 260 | 0)) % 3) != 1; R(i, fy - 6, 3, 3, on ? '#ff5d5d' : '#3a1f2f') }
  const pl = ['#7a4a24', '#8f5a2c']; let y = fy, h = 2, k = 0;
  while (y < H) { R(0, y, W, h, pl[k % 2]); R(0, y, W, 1, '#5e3618'); y += h; h = Math.min(10, h + 1); k++ }
  const cx = W / 2; X.fillStyle = '#5e361888'; for (let i = -12; i <= 12; i++) { const top = cx + i * 10, bot = cx + i * 34; pline(top, fy, bot, H, 1, '#6a3e1c') }
  R(0, fy - 2, W, 2, '#c9874a');
  X.globalCompositeOperation = 'lighter';
  const xs = TH.pos || [], ys = TH.posY || [];
  xs.forEach((px, i) => {
    const fyD = ys[i] !== undefined ? ys[i] : f;
    const sx = px + (RM ? 0 : Math.sin(t / 900 + i) * 6);
    X.globalAlpha = .09 + (RM ? 0 : .03 * Math.sin(t / 300 + i));
    X.fillStyle = '#ffe2a0'; X.beginPath(); X.moveTo(sx - 3, 0); X.lineTo(sx + 3, 0); X.lineTo(px + 16, fyD + 3); X.lineTo(px - 16, fyD + 3); X.fill();
    X.globalAlpha = .22; X.beginPath(); X.ellipse(px, fyD + 1, 15, 4, 0, 0, 7); X.fill()
  });
  X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
}
function drawCurtain(open) {
  const { W, H } = TH, val = Math.max(10, Math.round(H * .07)), min = Math.round(W * .08), cw = Math.round(min + (W / 2 - min) * (1 - open));
  const C = ['#a8182a', '#d0302f', '#e8503a', '#d0302f'];
  for (let side = 0; side < 2; side++) {
    const g = side ? Math.max(4, cw / 12) : Math.max(4, cw / 12);
    for (let i = 0; i < cw; i += g) {
      const x = side ? W - cw + i : i;
      const w = Math.min(Math.ceil(g), cw - i);
      R(x, 0, w, H, C[(i / g | 0) % 4]);
      R(x, 0, 1, H, '#7a0f1e');
    }
    R(side ? W - cw : cw - 2, 0, 2, H, '#5a0a16');
  }
  R(0, H - 6, cw, 6, '#ffc233');
  R(W - cw, H - 6, cw, 6, '#ffc233');
  for (let x = 0; x < W; x++)R(x, 0, 1, val, C[(x >> 2) % 4]);
  for (let x = 0; x < W; x += 12) { R(x, val, 12, 3, '#d0302f'); R(x + 2, val + 3, 8, 2, '#a8182a') }
  R(0, val - 3, W, 3, '#ffc233');
  return val;
}
function theaterResize() {
  if (!TH.c) return;
  const vw = innerWidth, vh = innerHeight, sp = document.getElementById('thSpot').getBoundingClientRect();
  TH.P = Math.max(2, Math.min(8, Math.floor(Math.min(vw / 125, Math.max(sp.height, 90) / 46))));
  TH.W = TH.c.width = Math.ceil(vw / TH.P); TH.H = TH.c.height = Math.ceil(vh / TH.P);
  TH.feet = Math.round((sp.bottom - 30) / TH.P); TH.x.imageSmoothingEnabled = false;
  TH.el.style.setProperty('--val', Math.max(10, Math.round(TH.H * .07)) * TH.P + 'px');
  const gap = Math.min(46, Math.floor(TH.W / 3.8));
  const offs = [-1.5, -.5, .5, 1.5];
  TH.pos = offs.map(k => Math.round(TH.W / 2 + k * gap));
  // PARÁBOLA SUAVE: centro no fundo (mais alto), pontas à frente (mais baixas)
  const baseY = TH.feet;
  const arcAmpl = Math.round(TH.H * 0.10);
  TH.posY = offs.map(k => {
    const t = Math.abs(k) / 1.5;                      // 0 no centro, 1 nas pontas
    const curve = 1 - Math.cos(t * Math.PI / 2);          // cosseno suave
    return Math.round(baseY + arcAmpl * curve);
  });
}
function setPhase(n) {
  if (TH.phase === n) return; TH.phase = n; TH.el.className = 'p' + n;
  if (n == 3) stageSfx('curtain'); if (n == 4 && !TH.played.f) { TH.played.f = 1; stageSfx('enter') } if (n == 5) stageSfx('drop'); if (n == 6 && !TH.played.m) { TH.played.m = 1; fanfare('menu') }
}
function animateIntro(now) {
  if (!TH.el || TH.el.classList.contains('off')) { TH.raf = 0; return }
  const e = TH.done ? 1e9 : now - TH.t0;
  if (e < 700) setPhase(0); else if (e < 1100) setPhase(2); else if (e < 2300) setPhase(3); else if (e < 3100) setPhase(4); else if (e < 3700) setPhase(5); else setPhase(6);
  const open = e < 1100 ? 0 : Math.min(1, (e - 1100) / 1200), eo = 1 - Math.pow(1 - open, 3);
  drawStage(now);
  const ent = Math.min(1, Math.max(0, (e - 2100) / 900));
  if (e > 2100) {
    const bpm = 112, ph = RM ? Math.sin(now / 1200) * .4 : now / 1000 * Math.PI * bpm / 60;
    DANCERS.forEach((d, i) => {
      const side = i < 2 ? -1 : 1,
        off = (1 - ent) * (1 - ent) * side * TH.W * .7,
        baseY = TH.posY[i],
        y = ent < 1 ? baseY - (1 - ent) * (1 - ent) * TH.H * 0.25 : baseY;
      drawDancer(d, TH.pos[i] + off, y, ent < 1 ? now / 90 : ph, ent < 1);
    });
  }
  groove(TH.phase, TH.el.classList.contains('off'));
  drawCurtain(eo);
  TH.raf = requestAnimationFrame(animateIntro);
}
function theaterShow() {
  TH.el.classList.remove('off'); if (!TH.el.className.includes('p')) TH.el.className = 'p0';
  if (!TH.t0) { TH.t0 = performance.now(); if (RM) TH.done = true }
  requestAnimationFrame(theaterResize); theaterResize();
  if (!TH.raf) TH.raf = requestAnimationFrame(animateIntro)
}
function theaterHide() { if (TH.el) TH.el.className = 'off'; TH.phase = -1 }
function theaterSkip() { if (!TH.done) { TH.done = true; audio() } }
function thModal(h) { const m = $('#thModal'); m.innerHTML = '<div class="box">' + h + '</div>'; m.hidden = false; const b = m.querySelector('[data-close]'); b && (b.onclick = () => { sfx('sel'); m.hidden = true; $('#bj').focus() }, b.focus()) }
function creditos() {
  sfx('sel'); thModal(`<div class="kicker">NOS BASTIDORES</div><h3>CAMINHOS DA CIDADANIA</h3>
<p>Bem-vindo(a) a <b>Nova Esperança</b>. Aqui, conhecimento não é decoração: ele muda a forma como você entende cada situação.</p>
<div class="featureGrid"><div class="feature"><b>ESTATUTOS</b><span>ECA, juventude e pessoa idosa</span></div><div class="feature"><b>SEGURANÇA</b><span>Riscos e prevenção</span></div><div class="feature"><b>POLÍTICAS PÚBLICAS</b><span>Participação social e PNSP</span></div></div>
<div class="creditsPanel"><div class="creditsTitle">EQUIPE RESPONSÁVEL PELO DESENVOLVIMENTO</div>
<div class="teamGrid"><div class="teamMember"><b>EQUIPE</b><span>Nícolas Adriel</span></div><div class="teamMember"><b>EQUIPE</b><span>Gustavo Henrique</span></div><div class="teamMember"><b>EQUIPE</b><span>Marcela Stolv</span></div><div class="teamMember"><b>EQUIPE</b><span>Bruna Oliveira</span></div></div>
<div class="classLine">TURMA <span class="neon">SENAI — ENERGISA · APB-044.029</span></div>
<div class="creditsTitle" style="margin-top:10px">EMPRESAS / INSTITUIÇÕES ENVOLVIDAS</div>
<div class="partners"><div class="partner"><img src="${LOGO_E}" alt="Energisa"></div><div class="partner"><img src="${LOGO_S}" alt="SENAI"></div></div></div>
<button data-close class="big" style="text-align:center">FECHAR</button>`)
}

export function configurarAbertura({ alternarFullscreen, alternarSom }) {
  TH.el = document.getElementById('theater'); TH.c = document.getElementById('thc'); TH.x = TH.c.getContext('2d');
  addEventListener('resize', theaterResize);
  TH.el.addEventListener('pointerdown', () => { audio(); if (TH.phase < 6) theaterSkip() });
  addEventListener('keydown', () => { if (TH.phase >= 0 && TH.phase < 6 && !TH.el.classList.contains('off')) theaterSkip() });
  $('#thFs').onclick = alternarFullscreen;
  $('#thSnd').onclick = () => { audio(); alternarSom() };
}

export function musicaAberturaExecutada() { return !!TH.played.m }

export { theaterShow, theaterHide, creditos };
