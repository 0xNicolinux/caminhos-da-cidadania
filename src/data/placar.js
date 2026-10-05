/* Placar online (Supabase). Configure em src/config.js — veja PLACAR.md. */
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

const TABELA = 'scores', CHAVE_NOME = 'caminhos-da-cidadania:nome';
export const placarAtivo = () => !!(SUPABASE_URL.trim() && SUPABASE_KEY.trim());

const BASE = SUPABASE_URL.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, ''), CHAVE = SUPABASE_KEY.trim();
/* Chaves novas (sb_publishable_...) vão SÓ no header apikey: em Authorization o Supabase tenta ler como JWT e responde "Invalid JWT".
   Só a chave legada (JWT, começa com "eyJ") também vai em Authorization. */
const cab = () => { const h = { apikey: CHAVE, 'Content-Type': 'application/json' }; if (CHAVE.startsWith('eyJ')) h.Authorization = 'Bearer ' + CHAVE; return h };

/* Traduz o erro do Supabase em algo que dá para agir em cima */
async function erroDaApi(r, padrao) {
  let j = {}; try { j = await r.json() } catch { }
  console.error('[placar]', r.status, j);
  const t = `${j.message || ''} ${j.hint || ''}`, c = j.code || '';
  let m = padrao;
  if (/invalid (jwt|api key)|no api key/i.test(t) || (r.status === 401 && !c)) m = 'Chave do Supabase inválida. Confira src/config.js.';
  else if (c === '42501' || r.status === 403) m = 'Sem permissão no banco. Falta a policy de INSERT/SELECT (veja PLACAR.md).';
  else if (c === '23514') {
    const regra = (t.match(/constraint "([^"]+)"/) || [])[1] || 'desconhecida';
    m = /tempo/.test(regra) ? 'Partida rápida demais para valer no placar.'
      : /pts|hit/.test(regra) ? 'Pontuação acima do máximo permitido.'
      : 'Pontuação recusada pelas regras do banco (' + regra + ').';
    return new Error(m + ' [23514 · ' + regra + ']');
  }
  else if (c === 'PGRST204' || c === '42703' || /column/i.test(t)) m = 'Falta uma coluna na tabela scores. Rode o SQL do PLACAR.md.';
  else if (c === 'PGRST205' || c === '42P01' || r.status === 404) m = 'Tabela scores não encontrada. Rode o SQL do PLACAR.md.';
  else if (/muitos envios/i.test(t)) m = 'Muitos envios agora. Tente em instantes.';
  return new Error(m + (c ? ` [${c}]` : ` [${r.status}]`));
}
export const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const nomeSalvo = () => { try { return localStorage.getItem(CHAVE_NOME) || '' } catch { return '' } };

export const guardarNome = n => { try { localStorage.setItem(CHAVE_NOME, n) } catch { } };

const comTimeout = (url, opt, ms = 8000) => { const c = new AbortController(), t = setTimeout(() => c.abort(), ms); return fetch(url, { ...opt, signal: c.signal }).finally(() => clearTimeout(t)) };

export function limparNome(v) { return String(v).replace(/[<>&"'`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16) }

export async function enviarPontuacao({ nome, pts, hit, tot, caminho, tempo }) {
  nome = limparNome(nome);
  if (nome.length < 2) throw new Error('Digite um nome com ao menos 2 letras.');
  guardarNome(nome);
  const corpo = { nome, pts, hit, tot, caminho, tempo };
  const r = await comTimeout(`${BASE}/rest/v1/${TABELA}`, {
    method: 'POST', headers: { ...cab(), Prefer: 'return=minimal' },
    body: JSON.stringify(corpo)
  }).catch(() => { throw new Error('Sem conexão com o placar. Verifique a internet.') });
  if (!r.ok) { console.error('[placar] enviado:', corpo); throw await erroDaApi(r, 'Não foi possível enviar agora. Tente de novo.') }
  return nome;
}

/* Todas as pontuações, da maior para a menor (até N). filtro: 'P' | 'S' | undefined (geral) */
export async function buscarPlacar(filtro, n = 10) {
  const q = `select=nome,pts,hit,tot,caminho&order=pts.desc,created_at.asc&limit=${n}` + (filtro ? `&caminho=eq.${filtro}` : '');
  const r = await comTimeout(`${BASE}/rest/v1/${TABELA}?${q}`, { headers: cab() }).catch(() => { throw new Error('Sem conexão com o placar.') });
  if (!r.ok) throw await erroDaApi(r, 'Placar indisponível no momento.');
  return r.json();
}

/* GERAL: soma da melhor pontuação de cada jogador em cada caminho (Estatutos + Segurança), por nome */
export async function buscarGeral(n = 10) {
  const r = await comTimeout(`${BASE}/rest/v1/${TABELA}?select=nome,pts,caminho&order=pts.desc&limit=1000`, { headers: cab() }).catch(() => { throw new Error('Sem conexão com o placar.') });
  if (!r.ok) throw await erroDaApi(r, 'Placar indisponível no momento.');
  const mapa = new Map();
  for (const x of await r.json()) {
    const k = x.nome.toLowerCase(), j = mapa.get(k) || { nome: x.nome, P: null, S: null };
    if (j[x.caminho] === null || x.pts > j[x.caminho]) j[x.caminho] = x.pts;   /* rows já vêm da maior p/ menor */
    mapa.set(k, j);
  }
  return [...mapa.values()].map(j => ({ nome: j.nome, P: j.P, S: j.S, pts: (j.P || 0) + (j.S || 0), geral: true }))
    .sort((a, b) => b.pts - a.pts).slice(0, n);
}
export async function posicaoGeral(nome) {
  const i = (await buscarGeral(1000)).findIndex(x => x.nome.toLowerCase() === nome.toLowerCase());
  return i < 0 ? null : i + 1;
}

/* Posição aproximada: quantas pontuações são maiores que a sua, mais 1 */
export async function posicaoNoPlacar(pts) {
  const r = await comTimeout(`${BASE}/rest/v1/${TABELA}?select=id&pts=gt.${pts | 0}`, { method: 'HEAD', headers: { ...cab(), Prefer: 'count=exact' } });
  const n = +((r.headers.get('content-range') || '').split('/')[1]);
  return r.ok && Number.isFinite(n) ? n + 1 : null;
}

const MEDALHA = ['1º', '2º', '3º'];
export function htmlLista(lista, destaque) {
  if (!lista.length) return '<p class="plc-vazio">Ninguém no placar ainda. Seja o primeiro!</p>';
  return `<ol class="plc-lista">${lista.map((x, i) => `<li class="${destaque && x.nome.toLowerCase() === destaque.toLowerCase() ? 'eu' : ''}"><span class="pos">${MEDALHA[i] || i + 1 + 'º'}</span><span class="nm">${esc(x.nome)}<small>${x.geral ? `Estatutos ${x.P ?? '—'} · Segurança ${x.S ?? '—'}` : `${x.caminho == 'P' ? 'Estatutos' : 'Segurança'} · ${x.hit}/${x.tot}`}</small></span><b>${x.pts}</b></li>`).join('')}</ol>`;
}
