// Som de cada bicho quando ela toca nele.
// Se existir uma gravação em public/sons/<palavra>.mp3 (ex.: public/sons/vaca.mp3),
// toca a gravação. Senão, a voz fala o som do bicho (ex.: "Muuu!").

const temArquivo = {}; // lembra quais gravações existem, para não procurar de novo
let atual = null;
let vez = 0;
const DURACAO_MAXIMA = 3000; // gravações compridas param em 3 segundos

// Toca o som e depois chama depois(somFalado): somFalado é o texto que a voz
// deve falar antes da frase ("Muuu! ") ou "" se a gravação já tocou.
export function tocarSom(tipo, depois) {
  pararSom();
  speechSynthesis.cancel();
  const minha = vez;
  let feito = false;
  const fim = (somFalado) => {
    if (feito || minha !== vez) return;
    feito = true;
    depois(somFalado);
  };

  const arquivo = `/sons/${tipo.palavra.toLowerCase()}.mp3`;
  if (temArquivo[arquivo] === false) {
    fim(`${tipo.som} `);
    return;
  }

  const audio = new Audio(arquivo);
  atual = audio;
  audio.onended = () => fim("");
  audio.onerror = () => {
    temArquivo[arquivo] = false;
    fim(`${tipo.som} `);
  };
  audio.onplaying = () => (temArquivo[arquivo] = true);
  audio.play().catch(() => fim(`${tipo.som} `));
  setTimeout(() => {
    if (minha !== vez) return;
    audio.pause();
    fim("");
  }, DURACAO_MAXIMA);
}

export function pararSom() {
  vez++;
  if (atual) atual.pause();
  atual = null;
}
