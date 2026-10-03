let AC, MG, mus = 1, theme = 'a', step = 0, nT = 0, grT = 0, grStep = 0;

const NT = nota => 440 * 2 ** ((nota - 69) / 12);
const PR = {
  a: { r: [60, 57, 65, 67], iv: [0, 4, 7, 12], t: .2 },
  b: { r: [57, 53, 60, 55], iv: [0, 3, 7, 12], t: .135 }
};

function tone(frequencia, tempo, duracao, tipo = 'square', volume = .05, deslize) {
  const oscilador = AC.createOscillator(), ganho = AC.createGain();
  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(frequencia, tempo);
  if (deslize) oscilador.frequency.exponentialRampToValueAtTime(deslize, tempo + duracao);
  ganho.gain.setValueAtTime(volume, tempo);
  ganho.gain.exponentialRampToValueAtTime(.001, tempo + duracao);
  oscilador.connect(ganho);
  ganho.connect(MG);
  oscilador.start(tempo);
  oscilador.stop(tempo + duracao + .02);
}

export function audio() {
  if (AC) {
    if (AC.state == 'suspended') {
      AC.resume().catch(erro => console.error('Não foi possível retomar o áudio:', erro));
    }
    return;
  }

  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    MG = AC.createGain();
    MG.gain.value = mus;
    MG.connect(AC.destination);
    nT = AC.currentTime + .1;
    setInterval(agendarMusica, 90);
  } catch (erro) {
    console.error('Não foi possível iniciar o áudio:', erro);
  }
}

export function sfx(chave) {
  if (!AC || !mus) return;
  const t = AC.currentTime;
  if (chave == 'ok') [72, 76, 79, 84].forEach((nota, i) => tone(NT(nota), t + i * .07, .14, 'square', .07));
  else if (chave == 'no') tone(220, t, .35, 'sawtooth', .08, 80);
  else if (chave == 'sel') tone(NT(76), t, .06, 'square', .05);
  else if (chave == 'tx') tone(NT(64 + Math.random() * 6 | 0), t, .03, 'square', .02);
  else if (chave == 'st') tone(90, t, .05, 'triangle', .07);
  else if (chave == 'go') [67, 72, 76].forEach((nota, i) => tone(NT(nota), t + i * .06, .1, 'square', .06));
  else if (chave == 'win') [60, 64, 67, 72, 67, 72, 76, 84].forEach((nota, i) => tone(NT(nota), t + i * .09, .2, 'square', .07));
}

function agendarMusica() {
  if (!AC) return;
  if (!mus) {
    nT = AC.currentTime;
    return;
  }
  if (nT < AC.currentTime - .5) nT = AC.currentTime + .1;
  const p = PR[theme];
  while (nT < AC.currentTime + .3) {
    const k = step & 7, r = p.r[step >> 3 & 3];
    tone(NT(r + p.iv[[0, 1, 2, 3, 2, 1, 2, 3][k]]), nT, p.t * .9, 'square', .03);
    if (k % 4 == 0) tone(NT(r - 24), nT, p.t * 3, 'triangle', .12);
    if (k == 0 && (step >> 3 & 7) > 3) tone(NT(r + 19), nT, p.t * 3, 'square', .02);
    nT += p.t;
    step++;
  }
}

export function fanfare(kind) {
  if (!AC || !mus) return;
  const sets = {
    menu: [523, 659, 784, 1047],
    mission: [392, 494, 587, 784],
    final: [261, 330, 392, 523, 659, 784, 1047],
    achievement: [659, 784, 988, 1319]
  };
  (sets[kind] || sets.menu).forEach((nota, i) => tone(NT(nota), AC.currentTime + i * .075, .16, 'square', .045));
}

export function snd() {
  mus = mus ? 0 : 1;
  if (MG) MG.gain.value = mus;
  return !!mus;
}

export function musicaAtiva() {
  return !!mus;
}

export function definirTemaMusical(novoTema) {
  theme = novoTema;
}

export function stageSfx(chave) {
  if (!AC || !mus) return;
  const t = AC.currentTime;
  if (chave == 'curtain') {
    for (let i = 0; i < 10; i++) tone(900 - i * 70, t + i * .06, .08, 'triangle', .025);
  }
  if (chave == 'enter') [60, 64, 67, 72, 67, 72].forEach((nota, i) => tone(NT(nota), t + i * .1, .14, 'square', .05));
  if (chave == 'drop') {
    tone(1400, t, .3, 'sine', .05, 300);
    tone(NT(48), t + .18, .5, 'triangle', .09);
  }
}

export function groove(fase, escondido) {
  if (!AC || !mus || fase < 4 || fase > 6 || escondido) return;
  const t = AC.currentTime;
  if (!grT || grT < t) grT = t + .05;
  while (grT < t + .25) {
    const k = grStep % 8;
    if (k == 0 || k == 4) tone(150, grT, .09, 'sine', .14, 55);
    if (k == 2 || k == 6) tone(NT(50), grT, .05, 'square', .028);
    tone(6000, grT, .02, 'square', .008);
    if (k == 7) tone(NT(55), grT, .06, 'triangle', .03);
    grT += .135;
    grStep++;
  }
}
