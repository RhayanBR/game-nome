import { sortearBicho } from "./bichos";
import { vozBrasileira } from "./voz";

// Toda a brincadeira roda direto no DOM (animações quadro a quadro e voz).
// Devolve uma função de limpeza que para tudo e deixa a tela como no começo.
export function iniciarBrincadeira(lista, opcoes = {}) {
  // opcoes.aoTerminar: no jogo das Palavras, chamado quando a palavra fica completa
  // opcoes.falarNoComeco: frase que a voz fala assim que o jogo começa
  const oQue = opcoes.aoTerminar ? "a palavra toda" : "o nome todo";
  // Guarda timers e quadros de animação para poder cancelar na limpeza
  const timers = new Set();
  const quadros = new Set();

  function depois(fn, ms) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  }

  function proximoQuadro(fn) {
    const id = requestAnimationFrame((agora) => {
      quadros.delete(id);
      fn(agora);
    });
    quadros.add(id);
  }

  // Nome de cada letra em português, para a voz soletrar corretamente
  // (o alfabeto inteiro, escrito do jeito que se fala)
  const nomeDaLetra = {
    A: "a", B: "be", C: "ce", D: "de", E: "e", F: "efe", G: "ge",
    H: "aga", I: "i", J: "jota", K: "ca", L: "ele", M: "eme", N: "ene",
    O: "o", P: "pe", Q: "que", R: "erre", S: "esse", T: "te", U: "u",
    V: "ve", W: "dablio", X: "xis", Y: "ipsilon", Z: "ze",
  };


  // Enquanto a voz está falando, os cliques nas letras ficam bloqueados
  let falando = false;
  let falaAtual = 0;

  function falar(texto, quandoTerminar) {
    speechSynthesis.cancel();
    const minhaFala = ++falaAtual;
    falando = true;

    let terminou = false;
    const terminar = () => {
      if (terminou || minhaFala !== falaAtual) return;
      terminou = true;
      falando = false;
      if (quandoTerminar) quandoTerminar();
      atualizarDicas();
    };

    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    const voz = vozBrasileira();
    if (voz) fala.voice = voz;
    fala.rate = 0.85; // um pouco mais devagar, para a criança acompanhar
    fala.pitch = 1.2; // tom um pouco mais alto, mais alegre
    fala.onend = terminar;
    fala.onerror = terminar;
    speechSynthesis.speak(fala);

    // Segurança: se o aparelho não tiver voz, libera depois de um tempo
    depois(terminar, 2000 + texto.length * 150);
  }

  // Explosão de emojis saindo de um ponto da tela
  function explosao(x, y, emojis, total, distanciaMax = 280) {
    for (let i = 0; i < total; i++) {
      const el = document.createElement("span");
      el.className = "festa";
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const angulo = Math.random() * Math.PI * 2;
      const distancia = 80 + Math.random() * distanciaMax;
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.fontSize = 1.5 + Math.random() * 2.5 + "rem";
      el.style.animationDelay = Math.random() * 0.4 + "s";
      el.style.setProperty("--x", Math.cos(angulo) * distancia + "px");
      el.style.setProperty("--y", Math.sin(angulo) * distancia + "px");
      el.style.setProperty("--giro", Math.random() * 720 - 360 + "deg");
      document.body.appendChild(el);
      depois(() => el.remove(), 2400);
    }
  }

  // Corações saindo do meio do nome
  function festaDoNome(item) {
    const caixa = item.getBoundingClientRect();
    explosao(
      caixa.left + caixa.width / 2,
      caixa.top + caixa.height / 2,
      item.dataset.festa.split(" "),
      Number(item.dataset.quantidade)
    );
  }

  // Fogos de artifício estourando em lugares aleatórios da tela
  const fogos = ["🎆", "🎇", "✨", "💥", "⭐", "❤️"];
  let intervaloDosFogos = null;

  function soltarFogos() {
    explosao(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight,
      fogos,
      20,
      150
    );
  }

  // Estados da brincadeira
  const itens = [...lista.querySelectorAll("li")];
  let modoFesta = false;

  // Cada nome sai para um lado diferente, devagar, batendo nas bordas da tela
  const VELOCIDADE = 70; // pixels por segundo
  const direcoes = [225, 0, 135]; // Rhayan: cima-esquerda, Fatima: direita, Julia: baixo-esquerda
  let ultimoQuadro = 0;

  function passear(agora) {
    if (!modoFesta) return;
    const segundos = Math.min((agora - ultimoQuadro) / 1000, 0.05);
    ultimoQuadro = agora;

    itens.forEach((item) => {
      if (!item.classList.contains("passeando")) return;
      const b = item.base;
      item.dx += item.vx * segundos;
      item.dy += item.vy * segundos;

      const esquerda = b.left + item.dx;
      const topo = b.top + item.dy;
      if (esquerda < 0) item.vx = Math.abs(item.vx);
      if (esquerda + b.width > window.innerWidth) item.vx = -Math.abs(item.vx);
      if (topo < 0) item.vy = Math.abs(item.vy);
      if (topo + b.height > window.innerHeight) item.vy = -Math.abs(item.vy);

      item.style.transform = `translate(${item.dx}px, ${item.dy}px)`;
    });

    proximoQuadro(passear);
  }

  function comecarFestaDaFamilia() {
    // Se ela recomeçou algum nome enquanto a voz falava, não tem festa ainda
    if (modoFesta || !itens.every((i) => i.classList.contains("completo"))) return;
    modoFesta = true;

    itens.forEach((item, n) => {
      const caixa = item.getBoundingClientRect();
      item.base = { left: caixa.left, top: caixa.top, width: caixa.width, height: caixa.height };
      item.dx = 0;
      item.dy = 0;
      const angulo = (direcoes[n] * Math.PI) / 180;
      item.vx = Math.cos(angulo) * VELOCIDADE;
      item.vy = Math.sin(angulo) * VELOCIDADE;
      item.classList.add("passeando");
    });
    ultimoQuadro = performance.now();
    proximoQuadro(passear);

    soltarFogos();
    intervaloDosFogos = setInterval(soltarFogos, 700);
    falar("Essa é a família da Júlia! Papai e Mamãe!");
  }

  // Jogo das Palavras: fogos, a figura pula e depois vem outra palavra
  function festaDaPalavra() {
    const desenho = lista.parentElement?.querySelector(".desenho");
    if (desenho) desenho.classList.add("pulando");
    soltarFogos();
    intervaloDosFogos = setInterval(soltarFogos, 600);
    falar("Muito bem! Agora vamos para outra palavra!", () => {
      clearInterval(intervaloDosFogos);
      depois(opcoes.aoTerminar, 800);
    });
  }

  function voltarAoInicio() {
    modoFesta = false;
    clearInterval(intervaloDosFogos);
    itens.forEach((item) => {
      item.classList.remove("parado", "completo");
      item.quantas = 0;
      item.letras.forEach((l) => l.classList.remove("acesa"));
    });
    atualizarDicas();
  }

  // ---------- Os bichinhos que pegam as letras ----------
  const VELOCIDADE_CHEGADA = 160; // pixels por segundo
  const ESPACO_DA_CARGA = 80; // espaço em cima do bicho para as letras
  let bicho = null; // só um bicho na tela por vez

  // Uma palavra por vez, na ordem: Rhayan, depois Fatima, depois Julia
  function palavraAtual() {
    return itens.find((item) => item.quantas < item.letras.length) || null;
  }

  // Mostra qual letra tocar: só a palavra da vez fica ativa,
  // a próxima letra dela pisca e a mãozinha pula em cima
  function atualizarDicas() {
    lista.querySelectorAll(".seta").forEach((s) => s.remove());
    lista.querySelectorAll(".letra.proxima").forEach((l) => l.classList.remove("proxima"));

    const atual = modoFesta ? null : palavraAtual();
    // As palavras que ainda vão chegar ficam bem clarinhas
    itens.forEach((item) => {
      const futura = atual && item !== atual && item.quantas < item.letras.length;
      item.classList.toggle("esperando", Boolean(futura));
    });

    if (!atual || bicho || falando) return;
    const letra = atual.letras[atual.quantas];
    letra.classList.add("proxima");
    const seta = document.createElement("span");
    seta.className = "seta";
    seta.textContent = "👇";
    letra.appendChild(seta);
  }

  // O que a voz fala enquanto o bicho foge, para lembrar de pegar ele
  const lembretes = [
    (t) => `Corre! ${t.nome} está fugindo! Pega ${t.pronome}!`,
    (t) => `Toca ${t.no} para pegar ${t.pronome}!`,
    (t) => `Olha ${t.nome} correndo! Pega ${t.pronome}!`,
    (t) => `Quase! Pega ${t.pronome}!`,
  ];

  function nomeLetra(l) {
    return nomeDaLetra[l] || l;
  }

  function aLetra(texto) {
    return `${texto.length > 1 ? "as letras" : "a letra"} ${soletrar(texto)}`;
  }

  // Depois de pegar o bicho, diz qual é a próxima letra para tocar
  function pedirProximaLetra(novoNome) {
    const atual = palavraAtual();
    if (!atual || modoFesta) return;
    const letra = nomeLetra(atual.palavra[atual.quantas]);
    falar(novoNome ? `Agora o próximo nome! Toca na letra ${letra}!` : `Agora toca na letra ${letra}!`);
  }

  function soletrar(texto) {
    return [...texto].map((l) => nomeDaLetra[l] || l).join(", ");
  }

  function chamarBicho(item) {
    const passo = item.quantas;
    const tipo = sortearBicho();
    const pedaco = item.palavra.slice(0, passo + 1);

    const el = document.createElement("div");
    el.className = "bicho";
    el.style.fontSize = tipo.tamanho + "rem";
    el.style.setProperty("--cor", getComputedStyle(item).getPropertyValue("--cor"));
    el.innerHTML = `<div class="carga"></div><div class="corpo"><span class="passo">${tipo.emoji}</span></div>`;
    el.querySelector(".carga").textContent = pedaco;
    document.body.appendChild(el);

    const tam = el.getBoundingClientRect();
    // Vai até a letra que ele vai pegar
    const letra = item.letras[passo].getBoundingClientRect();
    const daEsquerda = Math.random() < 0.5;

    bicho = {
      el, item, tipo, pedaco,
      w: tam.width,
      h: tam.height,
      x: daEsquerda ? -tam.width : window.innerWidth,
      y: letra.top + letra.height / 2 - tam.height / 2,
      vx: daEsquerda ? 1 : -1,
      vy: 0,
      alvo: {
        x: letra.left + letra.width / 2 - tam.width / 2,
        y: letra.top + letra.height / 2 - tam.height / 2,
      },
      velocidade: 70 + passo * 10,
      tempoParaVirar: 0,
      estado: "chegando",
      ultimo: performance.now(),
      falouChegada: false,
      tempoLembrete: 6,
    };

    // Conta o que vai acontecer; o bicho só pega a letra quando a voz terminar
    const b = bicho;
    falar(`Olha! Lá vem ${tipo.nome}! ${tipo.pronome} vai pegar a letra ${nomeLetra(item.palavra[passo])}!`, () => {
      b.falouChegada = true;
      if (bicho === b && b.estado === "esperando") bichoPegaAsLetras();
    });

    el.addEventListener("pointerdown", pegarBicho);
    atualizarDicas(); // tira a mãozinha enquanto o bicho está na tela
    proximoQuadro(moverBicho);
  }

  // O bicho chegou na palavra: pega as letras e sai correndo
  function bichoPegaAsLetras() {
    const b = bicho;
    b.estado = "pegando";
    b.el.classList.add("carregando");
    b.item.letras.forEach((l, i) => {
      if (i < b.pedaco.length) l.classList.add("levada");
    });
    falar(`Ih! ${b.tipo.nome} pegou ${aLetra(b.pedaco)}!`, () => {
      if (bicho !== b || b.estado !== "fugindo") return;
      falar(`Olha, ${b.tipo.pronome} está fugindo! Corre, pega ${b.tipo.pronome}!`);
    });

    depois(() => {
      if (bicho !== b || b.estado !== "pegando") return;
      b.estado = "fugindo";
    }, 700);
  }

  function novaDirecao(b) {
    const angulo = Math.random() * Math.PI * 2;
    b.vx = Math.cos(angulo) * b.velocidade;
    b.vy = Math.sin(angulo) * b.velocidade;
    b.tempoParaVirar = 2 + Math.random() * 2;
  }

  function moverBicho(agora) {
    const b = bicho;
    if (!b) return;
    const s = Math.min((agora - b.ultimo) / 1000, 0.05);
    b.ultimo = agora;

    if (b.estado === "chegando") {
      const dx = b.alvo.x - b.x;
      const dy = b.alvo.y - b.y;
      const d = Math.hypot(dx, dy);
      const andar = VELOCIDADE_CHEGADA * s;
      if (d <= andar) {
        b.x = b.alvo.x;
        b.y = b.alvo.y;
        // Espera a voz terminar de contar antes de pegar a letra
        if (b.falouChegada) bichoPegaAsLetras();
        else b.estado = "esperando";
      } else {
        b.vx = (dx / d) * VELOCIDADE_CHEGADA;
        b.vy = (dy / d) * VELOCIDADE_CHEGADA;
        b.x += b.vx * s;
        b.y += b.vy * s;
      }
    } else if (b.estado === "fugindo") {
      b.tempoParaVirar -= s;
      if (b.tempoParaVirar <= 0) novaDirecao(b);
      // Se ela demorar para pegar, a voz lembra de tempos em tempos
      if (!falando) b.tempoLembrete -= s;
      if (b.tempoLembrete <= 0) {
        b.tempoLembrete = 7;
        falar(lembretes[Math.floor(Math.random() * lembretes.length)](b.tipo));
      }
      b.x += b.vx * s;
      b.y += b.vy * s;
      // Bate nas bordas da tela e volta
      const maxX = window.innerWidth - b.w;
      const maxY = window.innerHeight - b.h;
      if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
      if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); }
      if (b.y < ESPACO_DA_CARGA) { b.y = ESPACO_DA_CARGA; b.vy = Math.abs(b.vy); }
      if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); }
    } else if (b.estado === "indo") {
      b.x += b.vx * s;
      if (b.x < -b.w - 50 || b.x > window.innerWidth + 50) {
        b.el.remove();
        bicho = null;
        atualizarDicas();
        return;
      }
    }

    if (b.vx > 0) b.el.classList.add("direita");
    else if (b.vx < 0) b.el.classList.remove("direita");
    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    proximoQuadro(moverBicho);
  }

  // Ela pegou o bicho! As letras voltam para o nome
  function pegarBicho(evento) {
    evento.preventDefault();
    evento.stopPropagation();
    const b = bicho;
    // Só dá para pegar depois que ele pegou a letra
    if (!b || ["indo", "chegando", "esperando"].includes(b.estado)) return;

    const item = b.item;
    const caixa = b.el.getBoundingClientRect();
    explosao(caixa.left + caixa.width / 2, caixa.top + caixa.height / 2, ["⭐", "✨", "🌟", "🎉"], 25, 180);

    b.estado = "indo";
    b.el.classList.remove("carregando");
    b.el.classList.add("feliz");
    b.vx = b.x + b.w / 2 < window.innerWidth / 2 ? -350 : 350;

    item.quantas = b.pedaco.length;
    item.letras.forEach((l, i) => {
      l.classList.remove("levada");
      l.classList.toggle("acesa", i < item.quantas);
    });

    const soletrado = soletrar(b.pedaco);
    const aee = `Aee! Pegou ${b.tipo.nome}!`;
    if (item.quantas === item.letras.length) {
      item.classList.add("completo");
      festaDoNome(item);

      // Se os 3 nomes estão completos, a festa da família começa
      // assim que a voz terminar de falar este nome
      const todosCompletos = itens.every((i) => i.classList.contains("completo"));
      falar(
        `${aee} ${b.tipo.pronome} devolveu ${oQue}! ${soletrado}... ${item.dataset.falar}`,
        todosCompletos
          ? opcoes.aoTerminar ? festaDaPalavra : comecarFestaDaFamilia
          : () => pedirProximaLetra(true)
      );
    } else {
      falar(
        `${aee} ${b.tipo.pronome} devolveu ${aLetra(b.pedaco)}! Tchau, ${b.tipo.so}!`,
        () => pedirProximaLetra(false)
      );
    }
  }

  const cliques = itens.map((item) => {
    const letras = [...item.querySelectorAll(".letra")];
    item.palavra = letras.map((l) => l.textContent).join("");
    item.letras = letras;
    item.quantas = 0;

    const aoClicar = () => {
      // Na festa: clicar no nome faz ele parar de girar e voltar ao lugar
      if (modoFesta) {
        if (item.classList.contains("parado")) return;
        item.classList.remove("passeando");
        item.classList.add("parado");
        item.style.transform = ""; // volta deslizando para o lugar
        festaDoNome(item);
        if (itens.every((i) => i.classList.contains("parado"))) {
          depois(voltarAoInicio, 700);
        }
        return;
      }

      // Um bicho por vez, e espera a voz terminar
      if (bicho || falando) return;

      // Só a palavra da vez responde ao toque
      if (item !== palavraAtual()) return;

      // Vem um bichinho pegar a próxima letra!
      chamarBicho(item);
    };

    item.addEventListener("click", aoClicar);
    return aoClicar;
  });

  // Já começa mostrando onde tocar (e, se tiver, fala a frase de começo)
  atualizarDicas();
  if (opcoes.falarNoComeco) falar(opcoes.falarNoComeco);

  // Limpeza: para voz, animações e timers e devolve o DOM ao estado inicial
  return () => {
    falaAtual++; // invalida qualquer fala em andamento
    speechSynthesis.cancel();
    modoFesta = false;
    clearInterval(intervaloDosFogos);
    timers.forEach(clearTimeout);
    quadros.forEach(cancelAnimationFrame);
    if (bicho) bicho.el.remove();
    bicho = null;
    document.querySelectorAll(".festa").forEach((el) => el.remove());
    lista.querySelectorAll(".seta").forEach((s) => s.remove());
    itens.forEach((item, n) => {
      item.removeEventListener("click", cliques[n]);
      item.className = "";
      item.style.transform = "";
      item.letras.forEach((l) => (l.className = "letra"));
    });
  };
}
