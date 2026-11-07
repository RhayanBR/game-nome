// Som de cada bicho quando ela toca nele.
// Só toca se existir uma gravação em public/sons/<palavra>.mp3 (ex.: public/sons/vaca.mp3).
// Sem gravação, não toca nada e a voz segue normal.

const temArquivo = {}; // lembra quais gravações existem, para não procurar de novo
let atual = null;
let vez = 0;
const DURACAO_MAXIMA = 3000; // gravações compridas param em 3 segundos

// Toca a gravação (se existir) e depois chama depois("").
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
    fim("");
    return;
  }

  const audio = new Audio(arquivo);
  atual = audio;
  audio.onended = () => fim("");
  audio.onerror = () => {
    temArquivo[arquivo] = false;
    fim("");
  };
  audio.onplaying = () => (temArquivo[arquivo] = true);
  audio.play().catch(() => fim(""));
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
