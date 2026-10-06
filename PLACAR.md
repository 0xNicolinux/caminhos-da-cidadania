# Placar de líderes

O jogo usa Supabase para armazenar os melhores resultados de cada jogador. A configuração do projeto fica em `src/config.js`.

## 1. Criar o projeto no Supabase

1. Acesse https://supabase.com e faça login.
2. Crie um novo projeto.
3. Copie a URL do projeto e a chave pública/anônima.
4. No arquivo `src/config.js`, ajuste:

```js
export const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_SEU_TOKEN';
```

Observações:

- Use a chave pública do projeto, normalmente iniciada por `sb_publishable_...`.
- Não use a `service_role` no navegador.
- Se deixar `SUPABASE_URL` e `SUPABASE_KEY` vazios, o jogo fica sem placar online.

## 2. Criar a tabela `scores`

No SQL editor do Supabase, rode:

```sql
create extension if not exists "pgcrypto";

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(nome) >= 2 and length(nome) <= 16),
  pts int not null check (pts >= 0 and pts <= 9999),
  hit int not null default 0 check (hit >= 0),
  tot int not null default 0 check (tot >= 0),
  caminho text not null check (caminho in ('P', 'S')),
  tempo int not null default 0 check (tempo >= 0),
  created_at timestamptz not null default now()
);
```

Esses campos são usados pela lógica do jogo:

- `nome`: jogador exibido no placar;
- `pts`: pontuação final;
- `hit`: acertos;
- `tot`: total de perguntas da missão;
- `caminho`: caminho do jogador (`P` = Estatutos, `S` = Segurança);
- `tempo`: tempo do desafio;
- `created_at`: data de envio.

## 3. Ativar políticas de acesso

Para permitir leitura pública e envio de pontuação pelo navegador, adicione:

```sql
alter table public.scores enable row level security;

create policy "Permitir leitura pública do placar"
on public.scores
for select
using (true);

create policy "Permitir inserção pública no placar"
on public.scores
for insert
with check (true);
```

Se quiser, também pode bloquear `update` e `delete` para manter o placar somente em leitura e inserção.

## 4. Testar a conexão

Depois de salvar `src/config.js`, rode o projeto localmente:

```bash
python3 -m http.server 8000
```

Acesse:

```text
http://localhost:8000
```

Se o placar estiver funcionando, a tela de nome e o botão de placar passarão a operar com o banco online. Se não funcionar, o jogo mostrará mensagens de erro do Supabase no console e na interface.

## 5. Solução de problemas comuns

### Erro: "Chave do Supabase inválida"

- Verifique se o valor em `SUPABASE_KEY` não está vazio.
- Confirme se a chave é a pública/anônima e não uma chave de administração.

### Erro: "Tabela scores não encontrada"

- Rode novamente o SQL de criação da tabela.
- Confirme o nome exato da tabela: `scores`.

### Erro: "Falta uma coluna na tabela scores"

- Verifique se todas as colunas da tabela foram criadas:
  `nome`, `pts`, `hit`, `tot`, `caminho`, `tempo`, `created_at`.

### Erro: "Sem permissão no banco"

- Verifique se as políticas `SELECT` e `INSERT` foram criadas corretamente.
- Confirme que o projeto está com RLS habilitado.

## 6. Dicas

- O placar pode ser desativado temporariamente deixando `SUPABASE_URL` e `SUPABASE_KEY` vazios.
- Para manter o jogo funcionando sem internet, o melhor é manter a configuração vazia ou testar localmente com a rede ativa.
- O código do jogo espera a tabela `scores` e os campos listados acima; manter essa estrutura evita erros de integração.
