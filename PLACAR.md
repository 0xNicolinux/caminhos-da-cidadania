# Placar de líderes (Supabase, grátis)

O jogador digita o nome ao clicar em **COMEÇAR JORNADA** e a pontuação é salva sozinha ao concluir a última missão.

1. Crie um projeto em https://supabase.com (plano Free).
2. No **SQL Editor**, rode:

```sql
create table public.scores (
  id bigint generated always as identity primary key,
  nome text not null check (char_length(nome) between 2 and 16),
  pts int not null check (pts between 0 and 630),
  hit int not null check (hit between 0 and 21),
  tot int not null check (tot between 1 and 21),
  caminho text not null check (caminho in ('P','S')),
  tempo int not null check (tempo >= 0),
  created_at timestamptz not null default now(),
  constraint scores_hit_max  check (hit <= tot),
  constraint scores_pts_max  check (pts <= tot * 30),
  constraint scores_tempo_min check (tempo >= tot * 2)
);
create index on public.scores (pts desc, created_at);

alter table public.scores enable row level security;
create policy "ler placar"    on public.scores for select to anon using (true);
create policy "enviar placar" on public.scores for insert to anon with check (true);
-- sem policy de update/delete: ninguém altera nem apaga pelo navegador

-- limite de envios (anti-flood): no máximo 30 por minuto, no total
create or replace function public.limitar_envio() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.scores where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'muitos envios, tente em instantes';
  end if;
  return new;
end $$;
create trigger limitar_envio before insert on public.scores
for each row execute function public.limitar_envio();
```

   Se você já criou a tabela da versão anterior, rode apenas:
   `alter table public.scores add column tempo int not null default 999 check (tempo >= 0);`
   e depois crie o trigger acima.

3. Pegue as credenciais:
   - **Project URL:** botão **Connect** no topo do painel, ou **Project Settings → Data API** (formato `https://xxxx.supabase.co`, sem `/rest/v1` no final).
   - **Chave:** **Project Settings → API Keys**. Na aba **API Keys**, copie a **Publishable key** (`sb_publishable_...`); se não existir, clique em **Create new API Keys**. As chaves legadas `anon`/`service_role` estão sendo descontinuadas.
4. Cole em `src/config.js` e faça commit. A publishable é pública por design (o GitHub Pages não tem como escondê-la); quem protege os dados são as regras acima. **Nunca** use a secret (`sb_secret_...`) nem a `service_role`.

## Funciona fora do GitHub Pages?
Sim. O Supabase aceita chamadas de qualquer origem, então funciona no site publicado e em `http://localhost:8000`. Só **não** funciona abrindo o `index.html` direto (`file://`), por causa dos módulos ES.

## Erro `[23514]` (pontuação recusada)
Uma regra do banco barrou a linha, e o nome da regra aparece na mensagem. Se for `scores_tempo_min`, a partida durou menos de 2 segundos por pergunta. Para quem já criou a tabela com a regra antiga, rode:

```sql
alter table public.scores drop constraint if exists scores_check;
alter table public.scores add constraint scores_hit_max   check (hit <= tot);
alter table public.scores add constraint scores_pts_max   check (pts <= tot * 30);
alter table public.scores add constraint scores_tempo_min check (tempo >= tot * 2);
```
Os valores enviados aparecem no console (F12), na linha `[placar] enviado:`. Para testar sem esperar, você pode remover a regra de tempo: `alter table public.scores drop constraint scores_tempo_min;`

## Se aparecer erro ao enviar
A mensagem agora diz o motivo (e o código fica no console, F12). Os mais comuns: chave inválida (confira `config.js`), falta de policy de INSERT/SELECT, coluna `tempo` ausente, ou pontuação fora das regras (ex.: terminar mais rápido que 3s por pergunta).

## Limites
O jogo roda no navegador: um jogador técnico consegue enviar pontuações falsas dentro dos limites acima.
Para moderar, apague linhas em **Table Editor**.
