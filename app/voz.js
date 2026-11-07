// Escolhe a voz em português do Brasil que soa mais natural.
// A preferida é a do Chrome ("Google português do Brasil").
let vozEscolhida = null;
let iniciado = false;

function pontosDaVoz(v) {
  const nome = v.name.toLowerCase();
  let pontos = 0;
  if (nome.includes("google")) pontos += 10;
  if (/natural|online|neural/.test(nome)) pontos += 4;
  if (/francisca|thalita|luciana|fernanda|vitoria|vitória/.test(nome)) pontos += 2;
  if (!v.localService) pontos += 1;
  return pontos;
}

function escolherVoz() {
  const vozes = speechSynthesis.getVoices();
  const lingua = (v) => v.lang.replace("_", "-").toLowerCase();
  const brasileiras = vozes.filter((v) => lingua(v) === "pt-br");
  const candidatas = brasileiras.length
    ? brasileiras
    : vozes.filter((v) => lingua(v).startsWith("pt"));
  vozEscolhida = candidatas.sort((a, b) => pontosDaVoz(b) - pontosDaVoz(a))[0] || null;
}

export function vozBrasileira() {
  if (!iniciado) {
    iniciado = true;
    escolherVoz();
    // Em muitos navegadores a lista de vozes só chega depois de um tempo
    speechSynthesis.addEventListener("voiceschanged", escolherVoz);
  }
  return vozEscolhida;
}

// Voz alegre e devagar das brincadeiras.
// Devolve { falar(texto, quandoTerminar), parar(), falando }.
export function criarVoz(depois) {
  let falaAtual = 0;
  const estado = { falando: false };

  estado.falar = (texto, quandoTerminar) => {
    speechSynthesis.cancel();
    const minhaFala = ++falaAtual;
    estado.falando = true;

    let terminou = false;
    const terminar = () => {
      if (terminou || minhaFala !== falaAtual) return;
      terminou = true;
      estado.falando = false;
      if (quandoTerminar) quandoTerminar();
    };

    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    const voz = vozBrasileira();
    if (voz) fala.voice = voz;
    fala.rate = 0.85;
    fala.pitch = 1.2;
    fala.onend = terminar;
    fala.onerror = terminar;
    speechSynthesis.speak(fala);

    // Segurança: se o aparelho não tiver voz, libera depois de um tempo
    depois(terminar, 2000 + texto.length * 150);
  };

  estado.parar = () => {
    falaAtual++;
    estado.falando = false;
    speechSynthesis.cancel();
  };

  return estado;
}
