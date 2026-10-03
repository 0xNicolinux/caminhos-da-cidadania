function textoObrigatorio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function validarPergunta(pergunta, indice) {
  const camposTexto = ['categoria', 'pergunta', 'resposta', 'explicacao'];
  if (!pergunta || typeof pergunta !== 'object' ||
      camposTexto.some(campo => !textoObrigatorio(pergunta[campo])) ||
      !Array.isArray(pergunta.alternativas) ||
      pergunta.alternativas.length === 0 ||
      !pergunta.alternativas.every(textoObrigatorio)) {
    throw new Error(`Pergunta ${indice + 1} inválida em missoes.json`);
  }
}

function converterMissao(missao, indice) {
  if (!missao || typeof missao !== 'object' ||
      !textoObrigatorio(missao.titulo) ||
      !textoObrigatorio(missao.personagem) ||
      !Number.isInteger(missao.x) || missao.x < 0 || missao.x >= 20 ||
      !Number.isInteger(missao.y) || missao.y < 0 || missao.y >= 12 ||
      !textoObrigatorio(missao.cor) ||
      !Array.isArray(missao.perguntas) || missao.perguntas.length === 0) {
    throw new Error(`Missão ${indice + 1} inválida em missoes.json`);
  }

  missao.perguntas.forEach(validarPergunta);
  return {
    titulo: missao.titulo,
    personagem: missao.personagem,
    x: missao.x,
    y: missao.y,
    cor: missao.cor,
    perguntas: missao.perguntas.map(pergunta => ({
      categoria: pergunta.categoria,
      pergunta: pergunta.pergunta,
      resposta: pergunta.resposta,
      alternativas: [...pergunta.alternativas],
      explicacao: pergunta.explicacao
    }))
  };
}

export async function carregarMissoes() {
  const resposta = await fetch('./missoes.json');
  if (!resposta.ok) throw new Error(`Falha ao carregar missoes.json: ${resposta.status}`);

  const dados = await resposta.json();
  if (!dados || !Array.isArray(dados.P) || !dados.P.length ||
      !Array.isArray(dados.S) || !dados.S.length || !dados.final) {
    throw new Error('Formato inválido em missoes.json');
  }

  return {
    missoes: {
      P: dados.P.map((missao, indice) => converterMissao(missao, indice)),
      S: dados.S.map((missao, indice) => converterMissao(missao, indice))
    },
    missaoFinal: converterMissao(dados.final, 0)
  };
}
