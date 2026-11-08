import { sortearBicho } from "./bichos";
import { vozBrasileira } from "./voz";
import { pararSom, tocarSom } from "./sons";

// A série de bichos continua de uma palavra para a outra (e de um nome para o outro):
// vem 1 gato; se ela pega, vêm 2 gatos; depois 4; depois 8; e aí recomeça com outro bicho.
const MAXIMO_DO_BANDO = 8;
const serie = { tipo: null, quantos: 1 };

// "dois gatos", "duas vacas": o número muda com o bicho
function numero(n, tipo) {
  const ela = tipo.pronome === "ela";
  const nomes = [
    "zero", ela ? "uma" : "um", ela ? "duas" : "dois", "três", "quatro",
    "cinco", "seis", "sete", "oito",
  ];
  return nomes[n] || String(n);
}

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
    fala.rate = 1.05; // ela já conhece as letras: a voz pode ir mais ligeira
    fala.pitch = 1.2; // tom um pouco mais alto, mais alegre
    fala.onend = terminar;
    fala.onerror = terminar;
    speechSynthesis.speak(fala);

    // Segurança: se o aparelho não tiver voz, libera depois de um tempo
    depois(terminar, 2000 + texto.length * 120);
  }

  // Primeiro o bicho faz o som dele, depois a voz fala a frase
  function somEFala(tipo, texto, quandoTerminar) {
    falando = true; // segura os toques enquanto o som toca
    falaAtual++; // cancela o aviso de "terminou" da fala anterior
    tocarSom(tipo, (somFalado) => falar(somFalado + texto, quandoTerminar));
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
  const VELOCIDADE_CHEGADA = 220; // pixels por segundo
  const ESPACO_DA_CARGA = 80; // espaço em cima do bicho para as letras
  let bando = null; // um bando por vez: 1, 2, 4 ou 8 bichos iguais

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

    if (!atual || bando || falando) return;
    const letra = atual.letras[atual.quantas];
    letra.classList.add("proxima");
    const seta = document.createElement("span");
    seta.className = "seta";
    seta.textContent = "👇";
    letra.appendChild(seta);
  }

  // Como a voz chama o bando: "o gato", "dois gatos", "duas vacas"...
  function quemVeio(tipo, n) {
    return n === 1 ? tipo.nome : `${numero(n, tipo)} ${tipo.muitos}`;
  }
  // "ele"/"ela" para um bicho, "eles"/"elas" para vários
  function eles(tipo, n) {
    return n === 1 ? tipo.pronome : tipo.pronome + "s";
  }

  // O que a voz fala enquanto o bando foge, para lembrar de pegar
  const lembretes = [
    (t, n) => `Corre! ${quemVeio(t, n)} ${n === 1 ? "está" : "estão"} fugindo! Pega!`,
    (t, n) => (n === 1 ? `Toca ${t.no} para pegar ${t.pronome}!` : `Toca nos ${t.muitos} para pegar!`),
    (t, n) => `Olha ${n === 1 ? t.nome : `os ${t.muitos}`} correndo! Pega!`,
    () => `Quase! Pega!`,
  ];

  function nomeLetra(l) {
    return nomeDaLetra[l] || l;
  }

  function aLetra(texto) {
    return `${texto.length > 1 ? "as letras" : "a letra"} ${soletrar(texto)}`;
  }

  // Depois de pegar o bando, diz qual é a próxima letra para tocar
  function pedirProximaLetra(novoNome) {
    const atual = palavraAtual();
    if (!atual || modoFesta) return;
    const letra = nomeLetra(atual.palavra[atual.quantas]);
    // Se o próximo bando vai ser maior, conta antes, para ela ficar animada
    const vem = serie.quantos > 1 ? ` Vão vir ${quemVeio(serie.tipo, serie.quantos)}!` : "";
    falar(
      novoNome
        ? `Agora o próximo nome!${vem} Toca na letra ${letra}!`
        : `${vem} Toca na letra ${letra}!`
    );
  }

  function soletrar(texto) {
    return [...texto].map((l) => nomeDaLetra[l] || l).join(", ");
  }

  // Quanto mais bichos, menores eles ficam (mas nunca pequenos demais para o dedinho)
  const ENCOLHER = { 1: 1, 2: 0.8, 4: 0.65, 8: 0.5 };

  function chamarBando(item) {
    const passo = item.quantas;
    // Quando a série recomeça, sorteia um bicho novo; senão vem o dobro do mesmo
    if (!serie.tipo) serie.tipo = sortearBicho();
    const tipo = serie.tipo;
    const quantos = serie.quantos;
    const pedaco = item.palavra.slice(0, passo + 1);
    const letra = item.letras[passo].getBoundingClientRect();
    const tamanho = quantos === 1 ? tipo.tamanho : Math.max(4, tipo.tamanho * ENCOLHER[quantos]);

    bando = {
      item, tipo, pedaco, quantos,
      membros: [],
      pegos: 0,
      falouChegada: false,
      tempoLembrete: 6,
      ultimo: performance.now(),
    };

    for (let i = 0; i < quantos; i++) {
      const el = document.createElement("div");
      el.className = quantos > 1 ? "bicho do-bando" : "bicho";
      el.style.fontSize = tamanho + "rem";
      el.style.setProperty("--cor", getComputedStyle(item).getPropertyValue("--cor"));
      el.innerHTML = `<div class="carga"></div><div class="corpo"><span class="passo">${tipo.emoji}</span></div>`;
      el.querySelector(".carga").textContent = pedaco;
      document.body.appendChild(el);

      const tam = el.getBoundingClientRect();
      // Os bichos do bando ficam em roda em volta da letra, sem um tampar o outro
      const angulo = (i / quantos) * Math.PI * 2;
      const raio = quantos === 1 ? 0 : tam.width * (quantos > 4 ? 1.1 : 0.7);
      const alvoX = letra.left + letra.width / 2 - tam.width / 2 + Math.cos(angulo) * raio;
      const alvoY = letra.top + letra.height / 2 - tam.height / 2 + Math.sin(angulo) * raio;
      const daEsquerda = Math.random() < 0.5;

      const b = {
        el,
        w: tam.width,
        h: tam.height,
        x: daEsquerda ? -tam.width : window.innerWidth,
        y: alvoY,
        vx: daEsquerda ? 1 : -1,
        vy: 0,
        alvo: {
          x: Math.min(Math.max(alvoX, 0), window.innerWidth - tam.width),
          y: Math.min(Math.max(alvoY, ESPACO_DA_CARGA), window.innerHeight - tam.height),
        },
        velocidade: 90 + passo * 12 + Math.random() * 30,
        tempoParaVirar: 0,
        estado: "chegando",
      };
      el.addEventListener("pointerdown", (evento) => pegarBicho(evento, b));
      bando.membros.push(b);
    }

    // Conta o que vai acontecer; o bando só pega a letra quando a voz terminar
    const meu = bando;
    const vem = quantos === 1 ? "vem" : "vêm";
    falar(
      `Olha! Lá ${vem} ${quemVeio(tipo, quantos)}! ${eles(tipo, quantos)} ${quantos === 1 ? "vai" : "vão"} pegar a letra ${nomeLetra(item.palavra[passo])}!`,
      () => {
        meu.falouChegada = true;
        if (bando === meu) talvezPegarAsLetras();
      }
    );

    atualizarDicas(); // tira a mãozinha enquanto o bando está na tela
    proximoQuadro(moverBando);
  }

  // Quando todos chegaram e a voz terminou, o bando pega as letras e sai correndo
  function talvezPegarAsLetras() {
    const meu = bando;
    if (!meu.falouChegada || !meu.membros.every((b) => b.estado === "esperando")) return;
    meu.membros.forEach((b) => {
      b.estado = "pegando";
      b.el.classList.add("carregando");
    });
    meu.item.letras.forEach((l, i) => {
      if (i < meu.pedaco.length) l.classList.add("levada");
    });
    const n = meu.quantos;
    falar(`Ih! ${quemVeio(meu.tipo, n)} ${n === 1 ? "pegou" : "pegaram"} ${aLetra(meu.pedaco)}!`, () => {
      if (bando !== meu || meu.pegos > 0) return;
      falar(`Corre, pega ${n === 1 ? meu.tipo.pronome : "todos"}!`);
    });

    depois(() => {
      if (bando !== meu) return;
      meu.membros.forEach((b) => {
        if (b.estado === "pegando") b.estado = "fugindo";
      });
    }, 500);
  }

  function novaDirecao(b) {
    const angulo = Math.random() * Math.PI * 2;
    b.vx = Math.cos(angulo) * b.velocidade;
    b.vy = Math.sin(angulo) * b.velocidade;
    b.tempoParaVirar = 1.5 + Math.random() * 2;
  }

  function moverBando(agora) {
    const meu = bando;
    if (!meu) return;
    const s = Math.min((agora - meu.ultimo) / 1000, 0.05);
    meu.ultimo = agora;

    // Se ela demorar para pegar, a voz lembra de tempos em tempos
    if (meu.membros.some((b) => b.estado === "fugindo")) {
      if (!falando) meu.tempoLembrete -= s;
      if (meu.tempoLembrete <= 0) {
        meu.tempoLembrete = 7;
        const soltos = meu.membros.filter((b) => b.estado === "fugindo").length;
        falar(lembretes[Math.floor(Math.random() * lembretes.length)](meu.tipo, soltos));
      }
    }

    meu.membros.forEach((b) => moverBicho(b, s));

    // Os que já saíram da tela vão embora de vez
    meu.membros = meu.membros.filter((b) => {
      if (b.estado !== "foi") return true;
      b.el.remove();
      return false;
    });
    if (meu.membros.length === 0) {
      bando = null;
      atualizarDicas();
      return;
    }
    proximoQuadro(moverBando);
  }

  function moverBicho(b, s) {
    if (b.estado === "chegando") {
      const dx = b.alvo.x - b.x;
      const dy = b.alvo.y - b.y;
      const d = Math.hypot(dx, dy);
      const andar = VELOCIDADE_CHEGADA * s;
      if (d <= andar) {
        b.x = b.alvo.x;
        b.y = b.alvo.y;
        // Espera a voz terminar de contar (e os outros chegarem) antes de pegar a letra
        b.estado = "esperando";
        talvezPegarAsLetras();
      } else {
        b.vx = (dx / d) * VELOCIDADE_CHEGADA;
        b.vy = (dy / d) * VELOCIDADE_CHEGADA;
        b.x += b.vx * s;
        b.y += b.vy * s;
      }
    } else if (b.estado === "fugindo") {
      b.tempoParaVirar -= s;
      if (b.tempoParaVirar <= 0) novaDirecao(b);
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
      if (b.x < -b.w - 50 || b.x > window.innerWidth + 50) b.estado = "foi";
    }

    if (b.vx > 0) b.el.classList.add("direita");
    else if (b.vx < 0) b.el.classList.remove("direita");
    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
  }

  // Ela pegou um bicho! Ele sai correndo feliz.
  // Quando pega o último do bando, as letras voltam para o nome.
  function pegarBicho(evento, b) {
    evento.preventDefault();
    evento.stopPropagation();
    const meu = bando;
    // Só dá para pegar depois que ele pegou a letra
    if (!meu || !["pegando", "fugindo"].includes(b.estado)) return;

    const caixa = b.el.getBoundingClientRect();
    explosao(caixa.left + caixa.width / 2, caixa.top + caixa.height / 2, ["⭐", "✨", "🌟", "🎉"], meu.quantos > 2 ? 12 : 25, 180);

    b.estado = "indo";
    b.el.classList.remove("carregando");
    b.el.classList.add("feliz");
    b.vx = b.x + b.w / 2 < window.innerWidth / 2 ? -350 : 350;
    meu.pegos++;
    meu.tempoLembrete = 6;

    // Ainda tem bicho solto: a voz vai contando "um, dois, três..."
    if (meu.pegos < meu.quantos) {
      falar(`${numero(meu.pegos, meu.tipo)}!`);
      return;
    }

    // Pegou todos! Na próxima vem o dobro (até 8; depois recomeça com outro bicho)
    if (serie.quantos < MAXIMO_DO_BANDO) {
      serie.quantos *= 2;
    } else {
      serie.quantos = 1;
      serie.tipo = null;
    }

    const item = meu.item;
    item.quantas = meu.pedaco.length;
    item.letras.forEach((l, i) => {
      l.classList.remove("levada");
      l.classList.toggle("acesa", i < item.quantas);
    });

    const n = meu.quantos;
    const soletrado = soletrar(meu.pedaco);
    const aee = n === 1 ? `Aee! Pegou ${meu.tipo.nome}!` : `Aee! Pegou ${n === 2 ? "os dois" : "todos"}!`;
    const devolveu = `${eles(meu.tipo, n)} ${n === 1 ? "devolveu" : "devolveram"}`;
    if (item.quantas === item.letras.length) {
      item.classList.add("completo");
      festaDoNome(item);

      // Se os 3 nomes estão completos, a festa da família começa
      // assim que a voz terminar de falar este nome
      const todosCompletos = itens.every((i) => i.classList.contains("completo"));
      somEFala(
        meu.tipo,
        `${aee} ${devolveu} ${oQue}! ${soletrado}... ${item.dataset.falar}`,
        todosCompletos
          ? opcoes.aoTerminar ? festaDaPalavra : comecarFestaDaFamilia
          : () => pedirProximaLetra(true)
      );
    } else {
      somEFala(
        meu.tipo,
        `${aee} ${devolveu} ${aLetra(meu.pedaco)}! Tchau!`,
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

      // Um bando por vez, e espera a voz terminar
      if (bando || falando) return;

      // Só a palavra da vez responde ao toque
      if (item !== palavraAtual()) return;

      // Vem o bando pegar a próxima letra!
      chamarBando(item);
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
    pararSom();
    speechSynthesis.cancel();
    modoFesta = false;
    clearInterval(intervaloDosFogos);
    timers.forEach(clearTimeout);
    quadros.forEach(cancelAnimationFrame);
    if (bando) bando.membros.forEach((b) => b.el.remove());
    bando = null;
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
