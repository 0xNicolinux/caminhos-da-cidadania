/* Configuração do placar (Supabase). Veja PLACAR.md.
   Use a chave PUBLISHABLE (começa com sb_publishable_...) — ou a anon legada, que está sendo descontinuada.
   Ela é PÚBLICA por design (vai no navegador de qualquer jeito);
   a proteção dos dados vem das regras RLS do banco. NUNCA use aqui a chave "service_role".
   Deixe vazio para jogar sem placar. */
export const SUPABASE_URL = 'https://uhcfhmlbxdpzxudzvdsu.supabase.co';   // ex.: 'https://abcdxyz.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_47e017ka3cApGLQqi9VWAQ_UmZ8uFyh';   // ex.: 'sb_publishable_xxxxxxxx'
