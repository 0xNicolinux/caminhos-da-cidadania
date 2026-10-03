const SACOS = new Map();

export function embaralhar(valores) {
  for (let i = valores.length; i-- > 1;) {
    const j = Math.random() * (i + 1) | 0;
    [valores[i], valores[j]] = [valores[j], valores[i]];
  }
  return valores;
}

export function sortearSemRepetir(chave, opcoes) {
  if (!Array.isArray(opcoes) || opcoes.length === 0) {
    throw new RangeError('O sorteio precisa de ao menos uma opção');
  }

  let saco = SACOS.get(chave);
  if (!saco || !saco.f.length) {
    const anterior = saco && saco.u;
    const fila = embaralhar([...opcoes]);
    if (anterior !== undefined && fila.length > 1 && fila[fila.length - 1] === anterior) {
      [fila[0], fila[fila.length - 1]] = [fila[fila.length - 1], fila[0]];
    }
    saco = { f: fila, u: anterior };
    SACOS.set(chave, saco);
  }

  const valor = saco.f.pop();
  saco.u = valor;
  return valor;
}
