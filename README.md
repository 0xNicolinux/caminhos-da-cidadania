# Caminhos da Cidadania

Jogo educativo em navegador desenvolvido pela turma de Assistente de Análise de Dados do SENAI/ENERGISA. A proposta do projeto é explorar cidadania, direitos, proteção e prevenção por meio de uma cidade interativa, conectando temas sociais à prática de aprendizagem em tecnologia e análise de dados.

## Sobre o projeto

Caminhos da Cidadania foi pensado como uma experiência lúdica para aproximar estudantes e público em geral de temas importantes sobre convivência, direitos e participação social. Ao longo da jornada, o jogador percorre locais da cidade, conversa com personagens e responde desafios que estimulam a reflexão sobre como a cidadania é construída no cotidiano.

### Equipe responsável pelo desenvolvimento

- Nícolas Adriel
- Marcela Stolv
- Gustavo Henrique
- Bruna Oliveira

### Parceiros e instituição envolvida

- SENAI
- ENERGISA
- Turma: SENAI — ENERGISA · APB-044.029
- Quantidade de estudantes: 4

## Objetivos pedagógicos

- reconhecer direitos e deveres de crianças, adolescentes, jovens e idosos;
- compreender a importância da proteção integral e da participação social;
- refletir sobre vulnerabilidade, prevenção e ação coletiva;
- conectar conteúdos de cidadania com situações reais da comunidade;
- desenvolver uma experiência digital que dialogue com a formação profissional da turma.

## Como jogar

1. Acesse a versão online:

```text
https://0xnicolinux.github.io/caminhos-da-cidadania/
```

2. Ou rode localmente. Abrir o `index.html` direto (`file://`) **não funciona**, porque o jogo usa módulos ES e carrega o `missoes.json` via `fetch`, e o navegador bloqueia os dois nesse modo. Use um servidor local.

### Executando localmente

No terminal, na raiz do projeto:

```bash
python3 -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Controles

- Em celulares e tablets, toque em um ponto do mapa para o personagem caminhar até lá. Toque em outro ponto para mudar o destino.
- No computador, use as setas ou WASD para andar.
- O áudio é liberado na primeira interação com a página, pois navegadores bloqueiam reprodução automática antes de um toque ou tecla.

## Funcionalidades

- mundo urbano interativo em estilo retrô;
- personagens e cenários com narrativa visual;
- missões baseadas em temas de cidadania;
- perguntas de múltipla escolha com explicação contextualizada;
- feedback educativo para reforçar o aprendizado;
- estrutura em JavaScript puro, sem dependências externas de build.

## Estrutura do projeto

```text
.
├── index.html
├── style.css
├── missoes.json
├── README.md
├── LICENSE
├── src/
│   ├── main.js
│   ├── assets/
│   ├── data/          (missions.js, game-config.js, falas.js)
│   ├── game/
│   └── utils/
└──
```

## Tecnologias

- HTML5
- CSS3
- JavaScript (ES Modules)
- Canvas

## Requisitos

- navegador moderno com suporte a JavaScript;
- acesso local ao projeto ou servidor simples.

## Contribuição

Contribuições são bem-vindas. Para colaborar:

1. faça um fork do projeto;
2. crie uma branch com sua alteração;
3. implemente a melhoria ou correção;
4. abra um pull request descrevendo o que foi ajustado.

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
