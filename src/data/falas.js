/* ===== FALAS =====
   Todas as frases do jogo ficam aqui, longe da lógica do main.js.
   Cada lista é embaralhada e consumida inteira antes de repetir qualquer frase (ver sorteio em utils/random.js).
   {n} vira um número (combo, sequência de erros etc.).

   Guia de tom (para quem for acrescentar falas):
   - Falar como gente de verdade: "tá", "pra", "né", "bora" são bem-vindos; "Você está acertando com consistência" não.
   - Nada de gíria pesada, palavrão ou ironia com serviço público: é jogo educativo.
   - Não prometer o que o jogo não faz (não existe "tentar de novo" na mesma pergunta, e a próxima pergunta não é mais fácil).
   - Evitar flexão de gênero na fala dirigida ao jogador ("atento", "obrigado", "novo"): o personagem não tem gênero definido.
   - Frases curtas: o balão quebra em linhas de ~22 caracteres e some em poucos segundos. */

/* Fala do personagem da missão no card de resposta */
export const CARD = {
  ok: ['Isso aí, acertou!', 'É isso mesmo!', 'Boa! Prestou atenção, hein.', 'Mandou bem!', 'Perfeito, é por aí.', 'Acertou em cheio!', 'Boa resposta!', 'Isso! Tá no caminho certo.'],
  combo: ['Combo! Pegou o ritmo, hein.', '{n} seguidas, que beleza!', 'Tá com tudo! Continua assim.', '{n} acertos seguidos. Bora manter!', 'Agora você pegou o jeito do assunto.'],
  no: ['Não foi dessa vez, mas a explicação ajuda.', 'Quase! Dá uma olhada na explicação.', 'Foi por pouco.', 'Essa confunde muita gente. Lê a explicação aí.', 'Errar faz parte. Agora o assunto fica mais claro.'],
  seq: ['Tá puxado, né? Respira e vai com calma.', '{n} erros seguidos, mas isso acontece.', 'As explicações ajudam, vale ler com calma.', 'Sem pressa. Na próxima, lê a pergunta com calma.'],
  quebra: ['Poxa, o combo acabou. Mas dá pra começar outro.', 'Tava numa sequência boa, hein. Recomeça!', 'Pena, o combo de {n} acabou aqui.', 'Faz parte. Bora montar outro combo.'],
  tempo: ['Ih, o tempo acabou. Mas segue o jogo!', 'O tempo passa rápido, né? Sem estresse.', 'Não deu tempo dessa vez. Dá uma olhada na explicação.', 'Acabou o tempo, mas na próxima você consegue.'],
  missao: ['Missão cumprida! Valeu pela ajuda.', 'Pronto, essa tá resolvida!', 'Boa! Deu tudo certo no final.', 'Valeu por ajudar!', 'Mais uma resolvida. Bora pra próxima?'],
  classe: ['Subiu de nível! Parabéns.', 'Olha só, você evoluiu de classe!', 'Mais uma etapa vencida. Continua assim!', 'Tá crescendo, hein? Boa!', 'Evoluiu de classe. Mais que merecido!'],
  finalBom: ['Mandou muito bem! Resultado excelente.', 'Que atuação, hein! Você conectou bem os assuntos.', 'Excelente! Dá pra ver que você prestou atenção em tudo.', 'Show! Foi um resultado e tanto.'],
  finalMedio: ['Foi um bom resultado, dá pra se orgulhar.', 'Não foi perfeito, mas você foi bem.', 'Mandou bem no geral. Ainda dá pra melhorar um pouco.', 'Bom resultado! Numa próxima jogada fica ainda melhor.'],
  finalRuim: ['Dessa vez foi difícil, mas aprender é isso mesmo.', 'Não foi o resultado que você queria, mas serviu de aprendizado.', 'Tem coisa pra rever, mas você chegou até o fim. Vale tentar de novo!', 'Numa próxima jogada o assunto já fica bem mais claro.']
};

/* Balões dos moradores quando o jogador faz algo (ou deixa de fazer) */
export const REACAO = {
  ok: ['Boa!', 'Mandou bem!', 'É isso aí!', 'Acertou, hein!', 'Isso mesmo!', 'Olha só!'],
  no: ['Foi quase!', 'Na próxima vai!', 'Acontece.', 'Calma, vai dar certo.', 'Faz parte, vai.'],
  tempo: ['Ih, acabou o tempo.', 'Dessa vez o tempo ganhou.', 'Faltou tempo, né?', 'O tempo voa, hein.'],
  combo: ['Combo, hein!', 'Tá no ritmo!', 'Que sequência!', 'Tá pegando o jeito!'],
  missao: ['Missão cumprida!', 'Mais uma resolvida!', 'Boa, bora pra próxima!', 'Valeu por ajudar!'],
  classe: ['Subiu de nível!', 'Tá evoluindo!', 'Olha quem subiu de classe!', 'Subiu de classe, hein!']
};

/* Comentários de rua: por desempenho, ao chegar perto, quando o jogador fica parado e conversa solta */
export const RUA = {
  novo: ['Chegou agora por aqui?', 'No começo confunde, mas logo você pega o jeito.', 'Fica à vontade, é só começar.', 'Dá uma volta por aí, você se acostuma rápido.'],
  bem: ['Pelo que ouvi, você tá se saindo bem.', 'Tá mandando bem, hein.', 'Continua assim que dá certo.', 'Você parece saber o que tá fazendo.'],
  mal: ['Calma, no começo é assim mesmo.', 'Vale ler a explicação com calma, ajuda muito.', 'Presta atenção nos detalhes da pergunta.', 'Tá quase lá, não desiste.'],
  parado: ['Tá esperando alguém?', 'Se quiser, dá uma volta. Tem coisa pra ver.', 'Tá perdido? Procura quem tá com o aviso em cima.', 'Aqui parado não vai resolver, bora andar.'],
  perto: ['Oi, tudo bem?', 'E aí?', 'Opa, com licença.', 'Bom te ver por aqui.'],
  ocioso: ['Hoje tá abafado, né?', 'Esse cruzamento vive cheio.', 'Será que vai chover?', 'Esse bairro não para nunca.', 'Atravessa na faixa, hein.', 'Já viu que movimento hoje?']
};

/* Conversas entre dois moradores (alternam as falas; manter cada fala com até ~45 caracteres) */
export const DIAL = {
  neutro: [
    ['Viu como tá o trânsito hoje?', 'Vi! Tá corrido, hein.'],
    ['Soube da reunião do bairro?', 'Soube! Vou passar lá depois.'],
    ['Esse cruzamento é perigoso.', 'É, eu sempre olho pros dois lados.'],
    ['Que calor hoje, hein.', 'Nem fala. Vem pra sombra.'],
    ['Viu o cachorro ali?', 'Vi! Tá todo feliz.'],
    ['Tá tudo tão calmo hoje.', 'Ainda bem, né?']
  ],
  novo: [
    ['Você é daqui do bairro?', 'Mais ou menos. Tô conhecendo ainda.'],
    ['Tá se adaptando?', 'Tô tentando. É muita rua!'],
    ['Esse lugar é grande, hein.', 'É, mas a gente vai pegando o jeito.']
  ],
  bem: [
    ['Você tá sacando tudo, hein.', 'Que nada, tô só tentando.'],
    ['Aprendeu rápido!', 'É a prática, ajuda muito.'],
    ['Tá bem melhor que antes.', 'Pelo menos isso, né?']
  ],
  mal: [
    ['Ainda tá pegando o jeito, né?', 'É, vou prestar mais atenção.'],
    ['Se ficar na dúvida, lê de novo.', 'Boa ideia. Vou com mais calma.'],
    ['Tem muita coisa pra aprender aqui.', 'Tem mesmo, mas dá pra ir aos poucos.']
  ]
};

/* Carinho nos bichos e sons que eles fazem */
export const PET = {
  cachorro: ['Quem é o bonitinho? Quem é?', 'Olha esse focinho!', 'Esse aí é mais feliz que eu.', 'Aposto que ele entende de cidadania.', 'Carinho autorizado!', 'Vem cá, amigão!', 'Ai, que fofura!'],
  gato: ['Psiu, psiu... gatinho!', 'Esse aí me ignora com classe.', 'Cuidado, ele arranha. Eu sei.', 'Que olhar de desprezo!', 'Ele é o verdadeiro dono da praça.', 'Vem cá, bichano...', 'Ele nem liga pra mim.']
};

export const EMO = {
  cachorro: ['AU!', 'AU AU!', 'ARF!', 'AUUU!'],
  gato: ['MIAU', 'miau~', 'prrr...', 'MIAAU!']
};