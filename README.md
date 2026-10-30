# Caminhos da Cidadania

Jogo educativo para navegador desenvolvido por uma equipe de estudantes da turma de Assistente de Análise de Dados do **SENAI/ENERGISA**. A experiência utiliza uma cidade interativa, personagens e missões para abordar cidadania, direitos, proteção e prevenção.

## Sobre a experiência

O jogador percorre diferentes locais da cidade, interage com personagens e responde a desafios relacionados à convivência e à participação social. As perguntas apresentam explicações contextualizadas para apoiar a reflexão sobre as escolhas feitas durante a jornada.

O projeto foi desenvolvido no contexto da turma **SENAI — ENERGISA · APB-044.029**.

## Equipe

- Nícolas Adriel
- Marcela Santos
- Gustavo Dantas
- Bruna Telles

## Objetivos pedagógicos

- Reconhecer direitos e deveres de crianças, adolescentes, jovens e idosos.
- Compreender a importância da proteção integral e da participação social.
- Refletir sobre vulnerabilidade, prevenção e ação coletiva.
- Relacionar temas de cidadania a situações do cotidiano.

## Acessar e jogar

A versão publicada está disponível em:

**[Jogar Caminhos da Cidadania](https://0xnicolinux.github.io/caminhos-da-cidadania/)**

### Controles

- **Computador:** utilize as setas do teclado ou as teclas WASD para movimentar o personagem.
- **Celulares e tablets:** toque em um ponto do mapa para caminhar até ele; toque em outro ponto para alterar o destino.
- **Áudio:** a reprodução é habilitada após a primeira interação com a página, respeitando as restrições de autoplay dos navegadores.

### Executar localmente

O jogo utiliza módulos JavaScript e carrega `missoes.json` por meio de `fetch`. Por isso, abrir o `index.html` diretamente com `file://` não é suficiente: utilize um servidor HTTP local.

Na raiz do projeto, execute:

~~~bash
python3 -m http.server 8000
~~~

Acesse [http://localhost:8000](http://localhost:8000).

## Funcionalidades

- Cidade interativa com estética retrô.
- Personagens, cenários e narrativa visual.
- Missões relacionadas a temas de cidadania.
- Perguntas de múltipla escolha.
- Explicações e feedback educativo.
- Placar de líderes opcional com Supabase.

As instruções de configuração do placar estão em [PLACAR.md](./PLACAR.md); os parâmetros correspondentes ficam em `src/config.js`.

## Tecnologias

- **HTML5** — estrutura da aplicação.
- **CSS3** — apresentação e layout.
- **JavaScript (ES Modules)** — lógica, interações e carregamento dos dados.
- **Canvas 2D** — renderização da experiência visual.
- **Supabase** — serviço utilizado pelo placar de líderes.

O projeto não depende de um processo de build com bundler para executar a experiência principal.

## Estrutura do projeto

~~~text
.
├── index.html
├── style.css
├── missoes.json
├── LICENSE
└── src/
    ├── main.js
    ├── assets/
    ├── data/
    │   ├── missions.js
    │   ├── game-config.js
    │   └── falas.js
    ├── game/
    └── utils/
~~~

## Licença

Consulte o arquivo [LICENSE](./LICENSE) para as condições de uso e distribuição.