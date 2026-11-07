import { useEffect, useRef, useState } from "react";
import { sortearBicho, TOTAL_DE_BICHOS } from "./bichos";
import { criarVoz } from "./voz";

// "Encontre os animais": os bichos passeiam pelo pasto, a palavra de um deles
// aparece no meio e a voz pede para pegar esse bicho. Quem é pego vai para o
// cercadinho do celeiro, e o número em cima do celeiro conta quantos já estão lá.
// Bicho que já foi pego não volta mais: quando todos estiverem presos, acabou.
export default function Animais() {
  const pastoRef = useRef(null);
  const [rodada, setRodada] = useState(0);
  const [acabou, setAcabou] = useState(false);

  // Cada rodada começa uma brincadeira nova, do zero
  useEffect(() => iniciarCaca(pastoRef.current, () => setAcabou(true)), [rodada]);

  function jogarDeNovo() {
    setAcabou(false);
    setRodada((r) => r + 1);
  }

  return (
    <div className="pasto" ref={pastoRef}>
      <div className="palavra-alvo" />
      {acabou && (
        <button className="escolha jogar-de-novo" style={{ "--cor": "#43a047" }} onClick={jogarDeNovo}>
          <span className="figura">🔄</span>
          Jogar de novo
        </button>
      )}
      <div className="fazenda">
        <div className="cercadinho">
          <div className="cerca h cima" />
          <div className="cerca h baixo" />
          <div className="cerca v esquerda" />
        </div>
        <div className="celeiro">
          <div className="contador">0</div>
          <Celeiro />
        </div>
      </div>
    </div>
  );
}

// Celeiro vermelho, com telhado escuro, acabamento branco e portas com X
function Celeiro() {
  return (
    <svg viewBox="0 0 120 110" aria-label="Celeiro">
      <path d="M12 108 L12 48 L28 22 L60 8 L92 22 L108 48 L108 108 Z" fill="#c62828" />
      {/* tábuas */}
      <path d="M24 108 V42 M36 108 V28 M84 108 V28 M96 108 V42" stroke="#a51f1f" strokeWidth="2" />
      <path d="M12 108 L12 48 L28 22 L60 8 L92 22 L108 48 L108 108" stroke="white" strokeWidth="3" fill="none" />
      {/* telhado */}
      <path d="M5 51 L26 18 L60 2 L94 18 L115 51" stroke="#4e1212" strokeWidth="7" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {/* janela do feno */}
      <rect x="49" y="26" width="22" height="18" fill="#4e1a1a" stroke="white" strokeWidth="3" />
      <path d="M49 26 L71 44 M71 26 L49 44" stroke="white" strokeWidth="2" />
      {/* portas */}
      <rect x="38" y="60" width="44" height="48" fill="#a51f1f" stroke="white" strokeWidth="3" />
      <path d="M60 60 V108 M38 60 L60 108 M60 60 L38 108 M60 60 L82 108 M82 60 L60 108" stroke="white" strokeWidth="2.5" />
    </svg>
  );
}

const QUANTOS = 5; // sempre pelo menos 5 bichos andando no pasto
const CABEM_NO_CERCADO = 8; // passando disso, os mais antigos entram no celeiro
const CERCA = 12; // grossura da cerca do cercadinho (igual ao CSS)
const PEQUENO = 0.55; // tamanho do bicho dentro do cercadinho
const LADOS = ["cima", "esquerda", "direita"]; // por onde os bichos chegam
const DENTRO = 30; // quanto o bicho anda para dentro da tela antes de passear

function iniciarCaca(pasto, aoAcabar) {
  const timers = new Set();
  let quadro = null;

  function depois(fn, ms) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  }

  const voz = criarVoz(depois);
  const cartao = pasto.querySelector(".palavra-alvo");
  const fazenda = pasto.querySelector(".fazenda");
  const cercadinho = pasto.querySelector(".cercadinho");
  const celeiro = pasto.querySelector(".celeiro");
  const contador = pasto.querySelector(".contador");
  let animais = [];
  let alvo = null; // o bicho que ela precisa pegar agora
  let comemorando = false;
  let tempoDica = 0;
  let pegos = 0;
  const jaVieram = new Set(); // emojis dos bichos que já entraram no pasto

  // Medidas da tela: o pasto vai até onde começa a fazenda
  function medidas() {
    const W = pasto.clientWidth;
    const H = pasto.clientHeight;
    const c = cercadinho.getBoundingClientRect();
    const cel = celeiro.getBoundingClientRect();
    return {
      W,
      fundoDoPasto: fazenda.getBoundingClientRect().top,
      cercado: {
        esquerda: c.left + CERCA,
        direita: c.right, // do lado do celeiro não tem cerca
        cima: c.top + CERCA,
        baixo: c.bottom - CERCA,
      },
      porta: { x: cel.left + cel.width / 2, y: cel.bottom - cel.height * 0.2 },
      H,
    };
  }

  // Estrelinhas saindo de um ponto da tela
  function explosao(x, y, emojis, total, distanciaMax = 180) {
    for (let i = 0; i < total; i++) {
      const el = document.createElement("span");
      el.className = "festa";
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const angulo = Math.random() * Math.PI * 2;
      const distancia = 60 + Math.random() * distanciaMax;
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.fontSize = 1.5 + Math.random() * 2 + "rem";
      el.style.animationDelay = Math.random() * 0.3 + "s";
      el.style.setProperty("--x", Math.cos(angulo) * distancia + "px");
      el.style.setProperty("--y", Math.sin(angulo) * distancia + "px");
      el.style.setProperty("--giro", Math.random() * 720 - 360 + "deg");
      document.body.appendChild(el);
      depois(() => el.remove(), 2200);
    }
  }

  // Bichos grandes (elefante, girafa) ficam maiores que os pequenos (formiga)
  function tamanhoDoBicho(tipo) {
    const { W, H } = medidas();
    const base = Math.min(W, H) / 9;
    return Math.max(44, base * (0.8 + (tipo.tamanho - 3) * 0.08));
  }

  function novaDirecao(a) {
    const angulo = Math.random() * Math.PI * 2;
    const velocidade = a.estado === "no-cercado" ? a.velocidade * 0.4 : a.velocidade;
    a.vx = Math.cos(angulo) * velocidade;
    a.vy = Math.sin(angulo) * velocidade;
    a.tempoParaVirar = 2 + Math.random() * 3;
  }

  function posicionar(a) {
    if (a.vx > 0) a.el.classList.add("direita");
    else if (a.vx < 0) a.el.classList.remove("direita");
    a.el.style.transform = `translate(${a.x}px, ${a.y}px)`;
  }

  // Bate nas bordas de uma área e volta
  function baterNasBordas(a, esquerda, cima, direita, baixo) {
    const maxX = Math.max(esquerda, direita - a.w);
    const maxY = Math.max(cima, baixo - a.h);
    if (a.x < esquerda) { a.x = esquerda; a.vx = Math.abs(a.vx); }
    if (a.x > maxX) { a.x = maxX; a.vx = -Math.abs(a.vx); }
    if (a.y < cima) { a.y = cima; a.vy = Math.abs(a.vy); }
    if (a.y > maxY) { a.y = maxY; a.vy = -Math.abs(a.vy); }
  }

  // Um bicho novo chega por cima ou pelos lados da tela
  function entrarAnimal(lado = LADOS[Math.floor(Math.random() * LADOS.length)]) {
    // Cada bicho entra uma vez só; quando todos já vieram, não entra mais ninguém
    if (jaVieram.size >= TOTAL_DE_BICHOS) return;
    const tipo = sortearBicho([...jaVieram]);
    jaVieram.add(tipo.emoji);
    const el = document.createElement("div");
    el.className = "animal";
    el.dataset.palavra = tipo.palavra;
    el.style.fontSize = tamanhoDoBicho(tipo) + "px";
    el.innerHTML = `<div class="corpo"><span class="sacode"><span class="passo">${tipo.emoji}</span></span></div>`;
    pasto.appendChild(el);

    const caixa = el.getBoundingClientRect();
    const { W, fundoDoPasto } = medidas();
    const a = {
      el, tipo,
      w: caixa.width,
      h: caixa.height,
      estado: "entrando",
      velocidade: 60 + Math.random() * 40,
      tempoParaVirar: 0,
    };
    const entrada = 130;
    // A posição de entrada fica longe das bordas, senão o bicho atravessa a tela
    // reto, nunca começa a passear e some pelo outro lado
    const sorteio = (min, max) => min + Math.random() * Math.max(0, max - min);
    if (lado === "cima") {
      a.x = sorteio(DENTRO, W - DENTRO - a.w);
      a.y = -a.h;
      a.vx = 0;
      a.vy = entrada;
    } else {
      a.x = lado === "esquerda" ? -a.w : W;
      a.y = sorteio(DENTRO, fundoDoPasto - DENTRO - a.h);
      a.vx = lado === "esquerda" ? entrada : -entrada;
      a.vy = 0;
    }
    el.addEventListener("pointerdown", (evento) => tocar(a, evento));
    animais.push(a);
    posicionar(a);
  }

  // Escolhe um dos bichos que estão no pasto e mostra a palavra dele
  function novoAlvo(primeiro) {
    const candidatos = animais.filter((a) => a.estado === "andando" || a.estado === "entrando");
    if (!candidatos.length) return;
    alvo = candidatos[Math.floor(Math.random() * candidatos.length)];
    tempoDica = 0;
    cartao.textContent = alvo.tipo.palavra;
    cartao.classList.remove("aparecer", "acertou");
    void cartao.offsetWidth; // recomeça a animação
    cartao.classList.add("aparecer");
    voz.falar(primeiro ? `Vamos brincar! Pega ${alvo.tipo.nome}!` : `Agora pega ${alvo.tipo.nome}!`);
  }

  // O bicho pego vai pequenininho para um lugar no cercadinho
  function mandarProCercado(a) {
    const { cercado } = medidas();
    a.estado = "indo-pro-cercado";
    a.w = (a.w - 28) * PEQUENO + 28;
    a.h = (a.h - 28) * PEQUENO + 28;
    a.el.style.fontSize = parseFloat(a.el.style.fontSize) * PEQUENO + "px";
    a.destino = {
      x: cercado.esquerda + Math.random() * Math.max(0, cercado.direita - cercado.esquerda - a.w),
      y: cercado.cima + Math.random() * Math.max(0, cercado.baixo - cercado.cima - a.h),
    };
  }

  // Bicho chegou no cercadinho: conta mais um em cima do celeiro
  function chegouNoCercado(a) {
    a.estado = "no-cercado";
    a.el.classList.remove("feliz");
    a.el.classList.add("pequeno");
    novaDirecao(a);
    pegos++;
    contador.textContent = pegos;
    contador.classList.remove("pulou");
    void contador.offsetWidth;
    contador.classList.add("pulou");

    // Cercadinho cheio: o bicho mais antigo entra no celeiro
    const noCercado = animais.filter((b) => b.estado === "no-cercado");
    if (noCercado.length > CABEM_NO_CERCADO) noCercado[0].estado = "entrando-no-celeiro";
  }

  function tocar(a, evento) {
    evento.preventDefault();
    evento.stopPropagation();
    if (comemorando || !alvo) return;

    // Bicho do cercadinho só faz o som dele
    if (a.estado === "no-cercado") {
      voz.somEFala(a.tipo, `Esse é ${a.tipo.nome}! Pega ${alvo.tipo.nome}!`);
      return;
    }
    if (a.estado !== "andando" && a.estado !== "entrando") return;

    if (a !== alvo) {
      // Bicho errado: ele balança e a voz diz quem é
      a.el.classList.remove("errou");
      void a.el.offsetWidth;
      a.el.classList.add("errou");
      voz.somEFala(a.tipo, `Esse é ${a.tipo.nome}! Pega ${alvo.tipo.nome}!`);
      return;
    }

    // Acertou! Festa, o bicho vai para o celeiro e entra outro no pasto
    comemorando = true;
    alvo = null;
    const caixa = a.el.getBoundingClientRect();
    explosao(caixa.left + caixa.width / 2, caixa.top + caixa.height / 2, ["⭐", "✨", "🌟", "🎉"], 30);
    a.el.classList.remove("dica", "errou");
    a.el.classList.add("feliz");
    cartao.classList.add("acertou");
    mandarProCercado(a);
    entrarAnimal();

    const total = pegos + 1;
    if (total >= TOTAL_DE_BICHOS) {
      fimDeJogo(a);
      return;
    }
    voz.somEFala(
      a.tipo,
      `Aee! Você pegou ${a.tipo.nome}! Agora tem ${total} ${total === 1 ? "bicho" : "bichos"} no celeiro!`,
      () => {
        comemorando = false;
        novoAlvo(false);
      }
    );
  }

  // Pegou o último bicho: festa grande e a brincadeira acaba
  function fimDeJogo(a) {
    const { W, H } = medidas();
    depois(() => {
      cartao.textContent = "PARABÉNS!";
      cartao.classList.remove("aparecer", "acertou");
      void cartao.offsetWidth;
      cartao.classList.add("aparecer");
      explosao(W / 2, H / 2, ["⭐", "✨", "🌟", "🎉", "🎊", "🏆"], 60, 400);
    }, 1200);
    voz.somEFala(a.tipo, `Aee! Você pegou ${a.tipo.nome}!`, () => {
      voz.falar("Muito bem! Você pegou todos os animais!");
      depois(aoAcabar, 1500);
    });
  }

  // Anda em linha reta até um ponto; devolve true quando chega
  function irAte(a, x, y, velocidade, s) {
    const dx = x - a.x;
    const dy = y - a.y;
    const d = Math.hypot(dx, dy);
    if (d <= velocidade * s) {
      a.x = x;
      a.y = y;
      return true;
    }
    a.vx = (dx / d) * velocidade;
    a.vy = (dy / d) * velocidade;
    a.x += a.vx * s;
    a.y += a.vy * s;
    return false;
  }

  let ultimo = performance.now();

  function mover(agora) {
    const s = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    const { W, fundoDoPasto, cercado, porta } = medidas();

    for (const a of [...animais]) {
      if (a.estado === "entrando") {
        a.x += a.vx * s;
        a.y += a.vy * s;
        // Anda um pouco para dentro da tela antes de começar a passear
        const dentro =
          a.x >= DENTRO && a.y >= DENTRO && a.x + a.w <= W - DENTRO && a.y + a.h <= fundoDoPasto - DENTRO;
        // Segurança (tela pequena ou girada): se passou do meio, já fica no pasto
        const passou =
          (a.vx > 0 && a.x > W / 2) || (a.vx < 0 && a.x + a.w < W / 2) || (a.vy > 0 && a.y > fundoDoPasto / 2);
        if (dentro || passou) {
          a.estado = "andando";
          novaDirecao(a);
          baterNasBordas(a, 0, 0, W, fundoDoPasto);
        }
      } else if (a.estado === "andando") {
        a.tempoParaVirar -= s;
        if (a.tempoParaVirar <= 0) novaDirecao(a);
        a.x += a.vx * s;
        a.y += a.vy * s;
        baterNasBordas(a, 0, 0, W, fundoDoPasto);
      } else if (a.estado === "indo-pro-cercado") {
        if (irAte(a, a.destino.x, a.destino.y, 300, s)) chegouNoCercado(a);
      } else if (a.estado === "no-cercado") {
        a.tempoParaVirar -= s;
        if (a.tempoParaVirar <= 0) novaDirecao(a);
        a.x += a.vx * s;
        a.y += a.vy * s;
        baterNasBordas(a, cercado.esquerda, cercado.cima, cercado.direita, cercado.baixo);
      } else if (a.estado === "entrando-no-celeiro") {
        if (irAte(a, porta.x - a.w / 2, porta.y - a.h / 2, 120, s)) {
          a.estado = "sumindo";
          a.el.classList.add("sumindo");
          depois(() => {
            a.el.remove();
            animais = animais.filter((b) => b !== a);
          }, 500);
        }
      }
      posicionar(a);
    }

    // Se ela demorar, o bicho certo começa a brilhar e a voz ajuda
    if (alvo && !comemorando && !voz.falando) {
      tempoDica += s;
      if (tempoDica > 9) {
        tempoDica = 0;
        alvo.el.classList.add("dica");
        voz.falar(`Procura ${alvo.tipo.nome}! ${alvo.tipo.pronome === "ele" ? "Ele" : "Ela"} está brilhando!`);
      }
    }

    quadro = requestAnimationFrame(mover);
  }

  // Começo: os 5 primeiros bichos chegam um de cada vez
  for (let i = 0; i < QUANTOS; i++) {
    depois(() => entrarAnimal(LADOS[i % LADOS.length]), i * 700);
  }
  depois(() => novoAlvo(true), QUANTOS * 700 + 1200);
  quadro = requestAnimationFrame(mover);

  // Limpeza: para voz, animação e timers e tira os bichos da tela
  return () => {
    voz.parar();
    cancelAnimationFrame(quadro);
    timers.forEach(clearTimeout);
    animais.forEach((a) => a.el.remove());
    animais = [];
    document.querySelectorAll(".festa").forEach((el) => el.remove());
    cartao.textContent = "";
    cartao.className = "palavra-alvo";
    contador.textContent = "0";
  };
}
