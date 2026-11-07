// Todos os bichinhos que podem vir pegar as letras (nos dois jogos).
// Os emojis olham para a esquerda; o jogo vira o bicho quando ele anda para a direita.
const BICHOS = [
  { emoji: "🐜", palavra: "FORMIGA", nome: "a formiga", pronome: "ela", so: "formiga", no: "na formiga", tamanho: 3 },
  { emoji: "🐌", palavra: "CARACOL", nome: "o caracol", pronome: "ele", so: "caracol", no: "no caracol", tamanho: 4 },
  { emoji: "🐢", palavra: "TARTARUGA", nome: "a tartaruga", pronome: "ela", so: "tartaruga", no: "na tartaruga", tamanho: 5 },
  { emoji: "🐈", palavra: "GATO", nome: "o gato", pronome: "ele", so: "gato", no: "no gato", tamanho: 6 },
  { emoji: "🐕", palavra: "CACHORRO", nome: "o cachorro", pronome: "ele", so: "cachorro", no: "no cachorro", tamanho: 7 },
  { emoji: "🐘", palavra: "ELEFANTE", nome: "o elefante", pronome: "ele", so: "elefante", no: "no elefante", tamanho: 8.5 },
  { emoji: "🦖", palavra: "DINOSSAURO", nome: "o dinossauro Tirex", pronome: "ele", so: "Tirex", no: "no dinossauro", tamanho: 8.5 },
  { emoji: "🐖", palavra: "PORCO", nome: "o porco", pronome: "ele", so: "porquinho", no: "no porco", tamanho: 6 },
  { emoji: "🐐", palavra: "CABRITO", nome: "o cabrito", pronome: "ele", so: "cabrito", no: "no cabrito", tamanho: 6 },
  { emoji: "🐎", palavra: "CAVALO", nome: "o cavalo", pronome: "ele", so: "cavalo", no: "no cavalo", tamanho: 8 },
  { emoji: "🐫", palavra: "CAMELO", nome: "o camelo", pronome: "ele", so: "camelo", no: "no camelo", tamanho: 8 },
  { emoji: "🦆", palavra: "PATO", nome: "o pato", pronome: "ele", so: "pato", no: "no pato", tamanho: 5 },
  { emoji: "🐓", palavra: "GALINHA", nome: "a galinha", pronome: "ela", so: "galinha", no: "na galinha", tamanho: 5 },
  { emoji: "🐄", palavra: "VACA", nome: "a vaca", pronome: "ela", so: "vaquinha", no: "na vaca", tamanho: 8 },
  { emoji: "🐑", palavra: "OVELHA", nome: "a ovelha", pronome: "ela", so: "ovelha", no: "na ovelha", tamanho: 6 },
  { emoji: "🦒", palavra: "GIRAFA", nome: "a girafa", pronome: "ela", so: "girafa", no: "na girafa", tamanho: 8.5 },
  { emoji: "🦓", palavra: "ZEBRA", nome: "a zebra", pronome: "ela", so: "zebra", no: "na zebra", tamanho: 7.5 },
  { emoji: "🐇", palavra: "COELHO", nome: "o coelho", pronome: "ele", so: "coelho", no: "no coelho", tamanho: 5 },
];

export const TOTAL_DE_BICHOS = BICHOS.length;

// Quantas vezes cada bicho já ficou sem aparecer. Quanto mais tempo ele
// espera, maior a chance de ser sorteado — assim todos acabam aparecendo.
// Fica guardado no navegador para continuar valendo depois de recarregar.
const CHAVE = "espera-dos-bichos";
let espera = {};
let ultimo = null;

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
    espera = salvo.espera || {};
    ultimo = salvo.ultimo || null;
  } catch {
    espera = {};
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ espera, ultimo }));
  } catch {
    // sem armazenamento: o sorteio continua funcionando só nesta visita
  }
}

let carregado = false;

// excluir: emojis que não podem vir agora (por exemplo, os que já estão na tela)
export function sortearBicho(excluir = []) {
  if (!carregado) {
    carregar();
    carregado = true;
  }

  // Peso = (rodadas esperando + 1)³; o último que veio não repete em seguida
  const pesos = BICHOS.map((b) => (b.emoji === ultimo || excluir.includes(b.emoji) ? 0 : ((espera[b.emoji] || 0) + 1) ** 3));
  if (pesos.every((p) => p === 0)) {
    // todos excluídos: libera o último que veio
    BICHOS.forEach((b, i) => (pesos[i] = excluir.includes(b.emoji) ? 0 : 1));
  }
  const total = pesos.reduce((s, p) => s + p, 0);
  let sorte = Math.random() * total;
  let escolhido = BICHOS[BICHOS.length - 1];
  for (let i = 0; i < BICHOS.length; i++) {
    sorte -= pesos[i];
    if (sorte < 0) {
      escolhido = BICHOS[i];
      break;
    }
  }

  BICHOS.forEach((b) => (espera[b.emoji] = (espera[b.emoji] || 0) + 1));
  espera[escolhido.emoji] = 0;
  ultimo = escolhido.emoji;
  salvar();
  return escolhido;
}
