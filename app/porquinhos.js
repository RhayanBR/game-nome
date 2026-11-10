import { useEffect, useRef, useState } from "react";
import { criarVoz } from "./voz";

// "Os três porquinhos": eles chegam fugindo do lobo e ela constrói as casas
// tocando nas peças (3 palhas, 5 madeiras, 8 tijolos). Os porquinhos entram e
// aparecem na janela. Aí ela toca no lobo para ele soprar: a palha voa com 2 sopros,
// a madeira treme e desaba com 5, e a de tijolo nem mexe (blonk!). O lobo fica cansado,
// aparece uma escada, ela toca nela, o lobo sobe no telhado, entra pela chaminé quente
// e sai voando para longe soltando fumaça. Os porquinhos ficam felizes para sempre.
export default function Porquinhos() {
  const raizRef = useRef(null);
  const [rodada, setRodada] = useState(0);
  const [venceu, setVenceu] = useState(false);

  // Cada rodada recomeça do "Era uma vez"
  useEffect(() => iniciarPorquinhos(raizRef.current, () => setVenceu(true)), [rodada]);

  function jogarDeNovo() {
    setVenceu(false);
    setRodada((r) => r + 1);
  }

  return (
    <div className="porquinhos" ref={raizRef}>
      <div className="chao" />
      <div className="casa">
        <div className="fantasma" />
        <div className="desenho-casa" />
        <div className="janela" />
        <div className="escada">🪜</div>
        <div className="porcos">
          <span className="porco"><span>🐖</span></span>
          <span className="porco"><span>🐖</span></span>
          <span className="porco"><span>🐖</span></span>
        </div>
      </div>
      <div className="lobo">
        <div className="folego" />
        <div className="numero-sopro" />
        <div className="corpo-lobo">
          <div dangerouslySetInnerHTML={{ __html: LOBO }} />
          <span className="tonto">💫</span>
        </div>
      </div>
      {venceu && (
        <button className="escolha de-novo-porquinhos" style={{ "--cor": "#8e24aa" }} onClick={jogarDeNovo}>
          <span className="figura">🔄</span>
          Jogar de novo
        </button>
      )}
    </div>
  );
}

const PECAS = [3, 5, 8]; // quantas peças ela toca para construir cada casa
const SOPROS = [2, 5, 5]; // quantos toques no lobo para soprar cada casa
const NUMEROS = ["", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito"];
const FASES = [
  { nome: "palha", peca: "🌾", pedir: "Vamos construir uma casa de palha! Toca na palha!" },
  { nome: "madeira", peca: "🪵", pedir: "Agora uma casa de madeira! Toca na madeira!" },
  { nome: "tijolo", peca: "🧱", pedir: "Agora uma casa de tijolo, bem forte! Toca nos tijolos!" },
];

// O lobo de corpo inteiro, olhando para a direita (para a casa).
// bochecha-lobo enche com --inflar; boca-o aparece soprando; olhos-tontos quando cansa.
const LOBO = `<svg viewBox="0 0 120 160">
<g stroke="#3a3f45" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M36 108 C12 106 2 84 8 64 C16 80 26 88 42 94 Z" fill="#7d838b"/>
  <rect x="40" y="118" width="14" height="30" rx="6" fill="#7d838b"/>
  <rect x="62" y="118" width="14" height="30" rx="6" fill="#7d838b"/>
  <ellipse cx="45" cy="151" rx="11" ry="6" fill="#5f656c"/>
  <ellipse cx="72" cy="151" rx="11" ry="6" fill="#5f656c"/>
  <ellipse cx="58" cy="104" rx="27" ry="30" fill="#8d939b"/>
  <ellipse cx="63" cy="110" rx="15" ry="20" fill="#d5d9de" stroke="none"/>
  <path d="M72 88 L88 106" stroke-width="10" stroke="#8d939b"/>
  <path d="M44 88 L34 108" stroke-width="10" stroke="#8d939b"/>
  <polygon points="40,40 44,10 58,30" fill="#8d939b"/>
  <polygon points="60,28 72,6 78,34" fill="#8d939b"/>
  <polygon points="45,32 46,18 53,29" fill="#f8bbd0" stroke="none"/>
  <polygon points="65,27 71,15 73,30" fill="#f8bbd0" stroke="none"/>
  <circle cx="60" cy="52" r="24" fill="#8d939b"/>
  <ellipse cx="84" cy="62" rx="19" ry="11" fill="#d5d9de"/>
  <g class="vermelho-lobo" fill="#e53935" stroke="none"><circle cx="60" cy="52" r="23"/><ellipse cx="84" cy="62" rx="18" ry="10"/></g>
  <ellipse cx="101" cy="57" rx="5.5" ry="4.5" fill="#222"/>
  <ellipse class="bochecha-lobo" cx="74" cy="66" rx="9" ry="8" fill="#ff8a80" stroke="none"/>
  <path class="boca" d="M82 70 Q90 74 98 67" fill="none"/>
  <circle class="boca-o" cx="100" cy="68" r="4.5" fill="#5d1a1a"/>
  <ellipse cx="60" cy="45" rx="6.5" ry="7.5" fill="white"/>
  <ellipse cx="75" cy="43" rx="5.5" ry="6.5" fill="white"/>
  <g class="pupilas" fill="#222" stroke="none"><circle cx="62" cy="46" r="3.2"/><circle cx="77" cy="44" r="2.8"/></g>
  <g class="olhos-tontos" fill="none" stroke="#1565c0" stroke-width="1.6">
    <path d="M60 45a1.5 1.5 0 1 1 1.5 1.5a3 3 0 1 1 -3 -3a4.5 4.5 0 1 1 4.5 4.5"/>
    <path d="M75 43a1.3 1.3 0 1 1 1.3 1.3a2.6 2.6 0 1 1 -2.6 -2.6a3.9 3.9 0 1 1 3.9 3.9"/>
  </g>
  <path d="M53 35 L65 39 M71 35 L80 37" fill="none"/>
</g>
</svg>`;

// As casinhas, desenhadas em SVG (todas 200 x 190, com a janela no mesmo lugar:
// x 40 a 96, y 100 a 140, onde os porquinhos aparecem)
const CASAS = [
  // Palha: amarelinha, com fios de palha no telhado e na parede
  `<svg viewBox="0 0 200 190">
    <rect x="30" y="85" width="140" height="100" fill="#f3d878" stroke="#b8862b" stroke-width="3"/>
    <path d="M110 90v92M158 90v92M34 150h6M100 150h6" stroke="#d9b24f" stroke-width="3"/>
    <polygon points="100,8 194,88 6,88" fill="#e6b84c" stroke="#b8862b" stroke-width="3" stroke-linejoin="round"/>
    <path d="M100 14L30 84M100 14L60 84M100 14L100 84M100 14L140 84M100 14L170 84" stroke="#c99a35" stroke-width="3"/>
    <rect x="40" y="100" width="56" height="40" fill="#fff3c4" stroke="#8d6e3a" stroke-width="4"/>
    <path d="M118 185v-38a15 15 0 0 1 30 0v38z" fill="#8d6e3a" stroke="#6b4f22" stroke-width="3"/>
  </svg>`,
  // Madeira: tábuas marrons deitadas
  `<svg viewBox="0 0 200 190">
    <rect x="30" y="85" width="140" height="100" fill="#b07842" stroke="#6d4320" stroke-width="3"/>
    <path d="M30 101h140M30 117h140M30 133h140M30 149h140M30 165h140" stroke="#8a5a2e" stroke-width="3"/>
    <polygon points="100,10 192,88 8,88" fill="#7b4a26" stroke="#4e2e14" stroke-width="3" stroke-linejoin="round"/>
    <rect x="40" y="100" width="56" height="40" fill="#fff3c4" stroke="#4e2e14" stroke-width="4"/>
    <rect x="116" y="128" width="34" height="57" fill="#5d3a1a" stroke="#3e2410" stroke-width="3"/>
    <circle cx="143" cy="158" r="3" fill="#ffd54f"/>
  </svg>`,
  // Tijolo: tijolinhos vermelhos e uma chaminé (o lobo entra por ela no fim)
  `<svg viewBox="0 0 200 190">
    <defs>
      <pattern id="tijolos" width="32" height="16" patternUnits="userSpaceOnUse">
        <rect width="32" height="16" fill="#c6553b"/>
        <path d="M0 0.5H32M0 8H32M16 0V8M0 8V16M32 8V16" stroke="#f3d6c6" stroke-width="2"/>
      </pattern>
    </defs>
    <rect class="chamine" x="136" y="18" width="26" height="56" fill="url(#tijolos)" stroke="#7f2d1c" stroke-width="3"/>
    <rect x="130" y="12" width="38" height="10" fill="#8d3a28" stroke="#5e1f12" stroke-width="3"/>
    <rect x="30" y="85" width="140" height="100" fill="url(#tijolos)" stroke="#7f2d1c" stroke-width="3"/>
    <polygon points="100,10 192,88 8,88" fill="#5d4037" stroke="#3e2723" stroke-width="3" stroke-linejoin="round"/>
    <rect x="40" y="100" width="56" height="40" fill="#fff3c4" stroke="#3e2723" stroke-width="4"/>
    <rect x="116" y="126" width="36" height="59" fill="#4e342e" stroke="#2e1d18" stroke-width="3"/>
    <circle cx="145" cy="158" r="3" fill="#ffd54f"/>
  </svg>`,
];

// Efeitos de som feitos na hora pelo navegador (Web Audio): vento, blonk e música.
// Não são sons de bicho (esses só com gravação de verdade, ver sons.js).
function criarSons() {
  let ctx = null;

  // O navegador só deixa tocar som depois de um toque dela
  function acordar() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
    } catch {
      ctx = null;
    }
  }

  function ruido(duracao) {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duracao), ctx.sampleRate);
    const dados = buffer.getChannelData(0);
    for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    const fonte = ctx.createBufferSource();
    fonte.buffer = buffer;
    return fonte;
  }

  // Envelope: sobe rápido e desce até sumir
  function volume(ganho, t, pico, duracao) {
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.exponentialRampToValueAtTime(pico, t + 0.03);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
  }

  function tom(tipo, de, para, inicio, duracao, pico) {
    const t = ctx.currentTime + inicio;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(de, t);
    if (para !== de) osc.frequency.exponentialRampToValueAtTime(para, t + duracao);
    volume(ganho, t, pico, duracao);
    osc.connect(ganho).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duracao + 0.05);
  }

  return {
    acordar,

    // Bochecha enchendo: um "pfff" que fica mais agudo a cada toque
    inflar(quanto) {
      if (!ctx) return;
      tom("sine", 180 + quanto * 260, 260 + quanto * 380, 0, 0.18, 0.25);
    },

    // Vento do sopro: chiado que passa de grave para agudo e volta
    vento(forca) {
      if (!ctx) return;
      const t = ctx.currentTime;
      const duracao = 0.5 + forca * 0.9;
      const fonte = ruido(duracao);
      const filtro = ctx.createBiquadFilter();
      filtro.type = "bandpass";
      filtro.Q.value = 1.2;
      filtro.frequency.setValueAtTime(300, t);
      filtro.frequency.exponentialRampToValueAtTime(1400, t + duracao * 0.4);
      filtro.frequency.exponentialRampToValueAtTime(250, t + duracao);
      const ganho = ctx.createGain();
      volume(ganho, t, 0.25 + forca * 0.5, duracao);
      fonte.connect(filtro).connect(ganho).connect(ctx.destination);
      fonte.start(t);
    },

    // Blonk! A casa de tijolo nem mexe: batida seca e um "boing" engraçado
    blonk() {
      if (!ctx) return;
      tom("sine", 170, 55, 0, 0.35, 0.9);
      tom("triangle", 420, 160, 0.08, 0.5, 0.35);
      tom("triangle", 300, 120, 0.25, 0.45, 0.25);
    },

    // Musiquinha alegre da vitória
    musica() {
      if (!ctx) return;
      const D = 0.17;
      const melodia = [
        [523, 1], [659, 1], [784, 1], [1047, 2], [784, 1], [1047, 3],
        [880, 1], [784, 1], [659, 1], [698, 1], [784, 2], [659, 1], [523, 3],
        [587, 1], [659, 1], [698, 1], [784, 2], [880, 1], [988, 1], [1047, 4],
      ];
      let tempo = 0.05;
      for (const [nota, vezes] of melodia) {
        tom("triangle", nota, nota, tempo, D * vezes, 0.3);
        tom("sine", nota / 2, nota / 2, tempo, D * vezes, 0.12);
        tempo += D * vezes;
      }
    },

    fechar() {
      try {
        if (ctx) ctx.close();
      } catch {}
      ctx = null;
    },
  };
}

// Toda a brincadeira roda direto no DOM (animações com CSS, timers e voz).
// Devolve uma função de limpeza que para tudo e deixa a tela como no começo.
function iniciarPorquinhos(raiz, aoVencer) {
  const timers = new Set();

  function depois(fn, ms) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  }

  const voz = criarVoz(depois);
  const sons = criarSons();
  const lobo = raiz.querySelector(".lobo");
  const corpo = raiz.querySelector(".corpo-lobo");
  const folego = raiz.querySelector(".folego");
  const contador = raiz.querySelector(".numero-sopro");
  const casa = raiz.querySelector(".casa");
  const fantasma = raiz.querySelector(".fantasma");
  const desenho = raiz.querySelector(".desenho-casa");
  const janela = raiz.querySelector(".janela");
  const porcos = raiz.querySelector(".porcos");
  const escada = raiz.querySelector(".escada");

  let fase = 0; // 0 palha, 1 madeira, 2 tijolo
  let obra = 0; // peças já colocadas na casa
  let sopros = 0;
  // construindo: as peças aceitam toques; soprando: o lobo aceita toques;
  // escada: espera ela tocar na escada; ocupado: alguma animação acontecendo
  let estado = "ocupado";
  let peDoLobo = null; // onde o pé do lobo fica parado, antes de ele subir na escada
  let fumegando = false;

  function trocarClasse(el, classe) {
    el.classList.remove(classe);
    void el.offsetWidth; // recomeça a animação
    el.classList.add(classe);
  }

  // Posição de um elemento dentro da cena
  function caixa(el) {
    const r = el.getBoundingClientRect();
    const base = raiz.getBoundingClientRect();
    return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
  }

  // Pedacinhos voando (palha, tábuas, confete, fumaça)
  function soltarPedaco(conteudo, classe, x, y, props, duracao = 4000) {
    const el = document.createElement("div");
    el.className = `pedaco ${classe}`;
    if (conteudo) el.textContent = conteudo;
    el.style.left = x + "px";
    el.style.top = y + "px";
    for (const [nome, valor] of Object.entries(props)) el.style.setProperty(nome, valor);
    raiz.appendChild(el);
    depois(() => el.remove(), duracao);
    return el;
  }

  // ---------- Começo: "Era uma vez três porquinhos" ----------
  function comecar() {
    colocarCasa(0);
    // Os porquinhos chegam correndo pela esquerda, e o lobo vem atrás
    trocarClasse(porcos, "da-esquerda");
    loboVemDaEsquerda();
    voz.falar("Era uma vez três porquinhos! Eles estão fugindo do lobo!", () => depois(comecarObra, 300));
  }

  // O lobo entra correndo pela esquerda, logo atrás dos porquinhos, e fica esperando
  function loboVemDaEsquerda() {
    lobo.className = "lobo sem-transicao andando";
    lobo.style.transform = "translateX(-60vw)";
    void lobo.offsetWidth;
    lobo.classList.remove("sem-transicao");
    depois(() => (lobo.style.transform = ""), 300);
    depois(() => {
      lobo.classList.remove("andando");
      lobo.classList.add("esperando");
      porcos.classList.remove("da-esquerda");
    }, 1800);
  }

  // Põe a casa da fase no lugar, ainda sem nenhuma peça (só o contorno clarinho)
  function colocarCasa(n) {
    fase = n;
    obra = 0;
    sopros = 0;
    fantasma.innerHTML = CASAS[n].replace('id="tijolos"', 'id="tijolos-fantasma"').replaceAll("url(#tijolos)", "url(#tijolos-fantasma)");
    desenho.innerHTML = CASAS[n];
    desenho.className = "desenho-casa";
    desenho.style.setProperty("--obra", 0);
    casa.className = `casa casa-${FASES[n].nome}`;
    janela.className = "janela";
    janela.innerHTML = "<span>🐷</span><span>🐷</span><span>🐷</span>";
    porcos.className = "porcos";
    folego.innerHTML = "";
    contador.textContent = "";
  }

  // ---------- Construir a casa: ela toca nas peças ----------
  function comecarObra() {
    const total = PECAS[fase];
    posicoesDasPecas(total).forEach(([x, y], i) => {
      const el = document.createElement("div");
      el.className = "peca";
      el.textContent = FASES[fase].peca;
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.animationDelay = `${i * 0.08}s, ${(i % 3) * 0.2}s`;
      el.addEventListener("pointerdown", (evento) => pegarPeca(evento, el));
      raiz.appendChild(el);
    });
    estado = "construindo";
    voz.falar(FASES[fase].pedir);
  }

  // As peças ficam espalhadas no meio da tela, longe do lobo e da casa
  function posicoesDasPecas(n) {
    const W = raiz.clientWidth;
    const H = raiz.clientHeight;
    const emPe = H > W;
    const [x0, x1, y0, y1] = emPe ? [0.1, 0.9, 0.12, 0.44] : [0.28, 0.6, 0.14, 0.64];
    const colunas = n <= 3 ? n : Math.ceil(n / 2);
    const linhas = n <= 3 ? 1 : 2;
    const cw = ((x1 - x0) * W) / colunas;
    const ch = ((y1 - y0) * H) / linhas;
    const lista = [];
    for (let i = 0; i < n; i++) {
      const c = i % colunas;
      const l = Math.floor(i / colunas);
      // Na linha de baixo com menos peças, elas ficam centralizadas
      const naLinha = l === linhas - 1 ? n - colunas * (linhas - 1) : colunas;
      const sobra = ((colunas - naLinha) * cw) / 2;
      lista.push([
        x0 * W + sobra + (c + 0.5) * cw + (Math.random() - 0.5) * cw * 0.25,
        y0 * H + (l + 0.5) * ch + (Math.random() - 0.5) * ch * 0.25,
      ]);
    }
    return lista;
  }

  function pegarPeca(evento, el) {
    evento.preventDefault();
    sons.acordar();
    if (estado !== "construindo" || el.classList.contains("voando")) return;
    obra++;
    const total = PECAS[fase];

    // A peça voa até a parte da casa que está sendo construída
    const p = caixa(el);
    const c = caixa(desenho);
    const alvoX = c.x + c.w * (0.25 + Math.random() * 0.5);
    const alvoY = c.y + c.h * (1 - (obra - 0.5) / total);
    el.classList.add("voando");
    el.style.transform = `translate(${alvoX - (p.x + p.w / 2)}px, ${alvoY - (p.y + p.h / 2)}px) scale(0.4)`;
    el.style.opacity = "0";
    depois(() => el.remove(), 600);
    depois(() => {
      desenho.style.setProperty("--obra", obra / total);
      sons.inflar(obra / total);
    }, 450);

    voz.falar(`${NUMEROS[obra]}!`);
    if (obra === total) {
      estado = "ocupado";
      depois(casaPronta, 500); // logo que a última peça encaixa, o lobo já pode soprar
    }
  }

  // Casa pronta: os porquinhos entram e aparecem na janela, e ela já pode tocar no lobo
  function casaPronta() {
    casa.classList.add("pronta");
    porcos.classList.add("entrando");
    depois(() => {
      // Se ela já derrubou a casa (toca rápido!), os porquinhos não aparecem na janela
      if (!desenho.classList.contains("voando") && !desenho.classList.contains("desabando")) {
        janela.classList.add("com-porcos");
      }
    }, 600);
    sopros = 0;
    folego.innerHTML = Array.from({ length: SOPROS[fase] }, () => `<span class="gomo">💨</span>`).join("");
    contador.textContent = "";
    corpo.style.setProperty("--inflar", 0);
    lobo.className = "lobo";
    estado = "soprando";
    raiz.classList.add("pode-soprar");
    voz.falar(`A casa de ${FASES[fase].nome} ficou pronta! Toca no lobo para ele soprar!`);
  }

  // ---------- O lobo sopra ----------
  // Linhas de vento saindo da boca do lobo até a casa
  function soprarVento(linhas, forca) {
    const l = caixa(corpo);
    const c = caixa(desenho);
    const x0 = l.x + l.w * 0.86;
    const meio = l.y + l.h * 0.42;
    const x1 = c.x + c.w * (forca > 0.8 ? 0.95 : 0.4);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "vento");
    for (let i = 0; i < linhas; i++) {
      const y = meio + (i - (linhas - 1) / 2) * c.h * 0.12 * (0.6 + forca);
      const onda = (Math.random() - 0.5) * l.h * 0.3;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M${x0} ${meio} Q${(x0 + x1) / 2} ${y + onda} ${x1} ${y + c.h * 0.2}`);
      path.setAttribute("pathLength", "100");
      path.style.animationDelay = i * 0.07 + "s";
      svg.appendChild(path);
    }
    raiz.appendChild(svg);
    depois(() => svg.remove(), 1500);
    sons.vento(forca);
  }

  // Toque no lobo: enche a bochecha; no último toque, sopra com força
  function tocarNoLobo(evento) {
    evento.preventDefault();
    if (estado !== "soprando") return;
    sopros++;
    const meta = SOPROS[fase];
    corpo.style.setProperty("--inflar", sopros / meta);
    trocarClasse(corpo, "enchendo");
    contador.textContent = sopros;
    trocarClasse(contador, "pulou");
    const gomo = folego.children[sopros - 1];
    if (gomo) gomo.classList.add("cheio");
    sons.inflar(sopros / meta);

    if (sopros < meta) {
      // Ela toca sem parar: cada toque fala o número por cima do anterior
      voz.falar(`${NUMEROS[sopros]}!`);
      if (fase > 0) soprarVento(2, 0.2);
      if (fase === 1) tremerMadeira();
      return;
    }

    estado = "ocupado";
    raiz.classList.remove("pode-soprar");
    voz.falar(`${NUMEROS[sopros]}! Lá vai!`);
    depois(soprarForte, 500);
  }

  function soprarForte() {
    trocarClasse(lobo, "soprando");
    corpo.style.setProperty("--inflar", 0);
    soprarVento(7, 1);
    if (fase === 0) depois(derrubarPalha, 450);
    if (fase === 1) depois(derrubarMadeira, 450);
    if (fase === 2) depois(naoCaiu, 600);
  }

  // Palha: a casinha se desfaz e os fios voam pela tela
  function derrubarPalha() {
    const c = caixa(desenho);
    janela.classList.remove("com-porcos");
    desenho.classList.add("voando");
    for (let i = 0; i < 40; i++) {
      soltarPedaco("🌾", "palha", c.x + Math.random() * c.w, c.y + c.h * (0.1 + Math.random() * 0.85), {
        "--x": 150 + Math.random() * 700 + "px",
        "--y": -250 + Math.random() * 300 + "px",
        "--giro": Math.random() * 1080 - 540 + "deg",
        "--tempo": 1.2 + Math.random() * 1.2 + "s",
        "font-size": c.w * (0.08 + Math.random() * 0.08) + "px",
      });
    }
    depois(
      () => porquinhosFogem("A casa de palha voou! Corre, porquinhos!", 1),
      500
    );
  }

  // Madeira: a cada toque a casa estremece e caem umas tábuas
  function tremerMadeira() {
    trocarClasse(desenho, "tremendo");
    const c = caixa(desenho);
    for (let i = 0; i < 2; i++) soltarTabua(c, false);
  }

  function soltarTabua(c, voando) {
    soltarPedaco("", "tabua", c.x + c.w * (0.2 + Math.random() * 0.6), c.y + c.h * (0.5 + Math.random() * 0.4), {
      "--x": voando ? 150 + Math.random() * 600 + "px" : (Math.random() - 0.5) * 80 + "px",
      "--y": voando ? -300 + Math.random() * 350 + "px" : c.h * 0.4 + "px",
      "--giro": (voando ? Math.random() * 1080 - 540 : Math.random() * 120 - 60) + "deg",
      "--tempo": (voando ? 1.3 + Math.random() : 0.9) + "s",
      width: c.w * 0.32 + "px",
      height: c.w * 0.055 + "px",
    });
  }

  function derrubarMadeira() {
    const c = caixa(desenho);
    janela.classList.remove("com-porcos");
    desenho.classList.add("desabando");
    for (let i = 0; i < 22; i++) soltarTabua(c, true);
    depois(
      () => porquinhosFogem("A casa de madeira caiu! Corre, porquinhos!", 2),
      600
    );
  }

  // Os porquinhos saem pela porta correndo para a direita e o lobo corre atrás deles.
  // Quando somem, a próxima casa já chega e eles voltam pela esquerda, com o lobo atrás
  function porquinhosFogem(fala, proxima) {
    porcos.classList.remove("entrando");
    porcos.classList.add("fugindo");
    depois(() => {
      lobo.className = "lobo andando";
      lobo.style.transform = "translateX(115vw)";
    }, 250);
    let falou = false;
    let chegou = false;
    const seguir = () => {
      if (falou && chegou) comecarObra();
    };
    voz.falar(fala, () => {
      falou = true;
      seguir();
    });
    depois(() => {
      colocarCasa(proxima);
      trocarClasse(casa, "chegando");
      trocarClasse(porcos, "da-esquerda");
      loboVemDaEsquerda();
    }, 1500);
    depois(() => {
      chegou = true;
      seguir();
    }, 2300);
  }

  // ---------- Tijolo: o lobo não consegue ----------
  function naoCaiu() {
    sons.blonk();
    depois(() => lobo.classList.add("cansado"), 300);
    voz.falar("Blonk! A casa de tijolo nem mexeu! O lobo ficou cansadinho.", () =>
      depois(mostrarEscada, 300)
    );
  }

  // Lá dentro os porquinhos acendem o fogo: a chaminé solta fumaça sem parar
  function fumegar() {
    if (!fumegando) return;
    const ch = caixa(desenho.querySelector(".chamine"));
    soltarPedaco("", "fumaca", ch.x + ch.w / 2, ch.y, {
      "--x": 20 + Math.random() * 40 + "px",
      "--y": -ch.h * 2.5 + "px",
      "--tempo": "2.4s",
      width: ch.w * 1.1 + "px",
      height: ch.w * 1.1 + "px",
    }, 2600);
    depois(fumegar, 300);
  }

  function mostrarEscada() {
    escada.classList.add("aparece");
    fumegando = true;
    fumegar();
    estado = "escada";
    voz.falar("Olha uma escada! Toca na escada!");
  }

  // Ela tocou na escada: o lobo anda até ela, sobe degrau por degrau, anda no telhado
  // até a chaminé, dá um pulinho em cima dela e cai lá dentro
  function tocarNaEscada(evento) {
    evento.preventDefault();
    if (estado !== "escada") return;
    estado = "ocupado";
    escada.classList.remove("aparece");
    escada.classList.add("usada");
    lobo.classList.remove("cansado", "soprando", "esperando");
    lobo.classList.add("andando", "sem-transicao");

    // Conta pelo pé do lobo (meio de baixo), que é de onde ele cresce e encolhe
    const l = caixa(lobo);
    const pe = (peDoLobo = { x: l.x + l.w / 2, y: l.y + l.h });
    const e = caixa(escada);
    const c = caixa(desenho);
    const ch = caixa(desenho.querySelector(".chamine"));
    const ponto = (x, y, tamanho) => `translate(${x - pe.x}px, ${y - pe.y}px) scale(${tamanho})`;
    // Telhado ao lado da chaminé (o telhado sobe do canto até o meio da casa)
    const telhadoX = c.x + c.w * 0.6;
    const telhadoY = c.y + c.h * 0.17;

    const subida = lobo.animate(
      [
        { transform: ponto(pe.x, pe.y, 1), opacity: 1 },
        { transform: ponto(e.x + e.w * 0.35, e.y + e.h, 0.6), offset: 0.28 }, // pé da escada
        { transform: ponto(e.x + e.w * 0.65, e.y + e.h * 0.15, 0.5), offset: 0.58 }, // topo da escada
        { transform: ponto(telhadoX, telhadoY, 0.45), offset: 0.78 }, // no telhado
        { transform: ponto(ch.x + ch.w / 2, ch.y - ch.h * 0.5, 0.42), offset: 0.88 }, // pulinho
        { transform: ponto(ch.x + ch.w / 2, ch.y, 0.4), opacity: 1, offset: 0.93 }, // em cima da chaminé
        { transform: ponto(ch.x + ch.w / 2, ch.y + ch.h * 0.9, 0.3), opacity: 0 }, // caiu lá dentro!
      ],
      { duration: 4000, easing: "linear", fill: "forwards" }
    );
    voz.falar("O lobo subiu na escada!");
    depois(() => voz.falar("E caiu na chaminé!"), 3400);
    subida.onfinish = () => depois(sairVoando, 300);
  }

  // A chaminé está quente! O lobo sai voando rapidinho, dá voltas pelo céu
  // soltando fumaça e some lá longe
  function sairVoando() {
    const ch = caixa(desenho.querySelector(".chamine"));
    const pe = peDoLobo;
    lobo.getAnimations().forEach((a) => a.cancel());
    lobo.classList.remove("andando");
    lobo.classList.add("voando");
    const W = raiz.clientWidth;
    const H = raiz.clientHeight;
    const ponto = (x, y, giro, tamanho) =>
      `translate(${x - pe.x}px, ${y - pe.y}px) rotate(${giro}deg) scale(${tamanho})`;
    const DURACAO = 5000;
    const voo = lobo.animate(
      [
        { transform: ponto(ch.x + ch.w / 2, ch.y, 0, 0.5) },
        { transform: ponto(ch.x + ch.w / 2, H * 0.12, -360, 0.55), offset: 0.1 }, // dispara para cima
        { transform: ponto(W * 0.15, H * 0.35, -720, 0.5), offset: 0.28 },
        { transform: ponto(W * 0.7, H * 0.08, -1080, 0.5), offset: 0.46 },
        { transform: ponto(W * 0.35, H * 0.4, -1440, 0.45), offset: 0.64 },
        { transform: ponto(W * 0.85, H * 0.18, -1800, 0.4), offset: 0.82 },
        { transform: ponto(W + 250, -250, -2160, 0.2) },
      ],
      { duration: DURACAO, easing: "ease-in-out", fill: "forwards" }
    );
    voo.onfinish = () => lobo.classList.add("sumiu");
    voz.falar("Ahhhhhhh! Tá quente! Ahhhhhhh!");
    sons.vento(1);

    // Rastro de fumaça atrás dele
    const inicio = performance.now();
    const rastro = () => {
      if (performance.now() - inicio > DURACAO) return;
      const l = caixa(corpo);
      soltarPedaco("", "fumaca rastro", l.x + l.w / 2, l.y + l.h * 0.7, {
        "--x": "0px",
        "--y": "-20px",
        "--tempo": "1.2s",
        width: Math.max(l.w * 0.6, 14) + "px",
        height: Math.max(l.w * 0.6, 14) + "px",
      }, 1300);
      depois(rastro, 50);
    };
    rastro();
    depois(felizesParaSempre, DURACAO + 100);
  }

  // Os porquinhos saem de casa pulando de alegria
  function felizesParaSempre() {
    lobo.classList.add("sumiu");
    janela.classList.remove("com-porcos");
    porcos.classList.remove("entrando");
    porcos.classList.add("felizes");
    estado = "felizes";
    escada.classList.remove("usada");
    voz.falar("Os porquinhos conseguiram! Aee! E eles viveram felizes para sempre!", () => depois(vitoria, 200));
    chuvaDeConfete();
    sons.musica();
    porcos.querySelectorAll(".porco").forEach((porco, i) => depois(() => passear(porco), 1200 + i * 400));
    depois(() => soltarBorboleta(0.25), 1500);
    depois(() => soltarBorboleta(0.7), 2300);
  }

  // Leva um elemento até (x, y) da cena (pelo meio dele), virando para o lado em que anda.
  // Os emojis olham para a esquerda, então espelha quando vai para a direita.
  // Usa "translate" e "scale" (não "transform") para não brigar com o pulo e o giro.
  function levar(el, base, x, y, segundos, jeito) {
    const atual = el._posicao || { x: 0, y: 0 };
    const novo = { x: x - base.x, y: y - base.y };
    if (Math.abs(novo.x - atual.x) > 4) el.style.scale = novo.x > atual.x ? "-1 1" : "1 1";
    el.style.transition = `translate ${segundos}s ${jeito}`;
    el.style.translate = `${novo.x}px ${novo.y}px`;
    el._posicao = novo;
  }

  // Meio do elemento antes de ele começar a andar (guardado na primeira vez,
  // porque no meio do caminho ou de um pulo a caixa dele está em outro lugar)
  function meioOriginal(el) {
    if (!el._base) {
      const c = caixa(el);
      el._base = { x: c.x + c.w / 2, y: c.y + c.h / 2, w: c.w };
    }
    return el._base;
  }

  // No fim, os porquinhos passeiam pelo chão, de um lado para o outro da tela
  function passear(porco) {
    const W = raiz.clientWidth;
    const H = raiz.clientHeight;
    const base = meioOriginal(porco);
    const largura = base.w;
    const x = largura / 2 + Math.random() * (W - largura);
    const y = base.y + (Math.random() - 0.6) * H * 0.06;
    const distancia = Math.abs(x - (base.x + (porco._posicao?.x || 0)));
    const segundos = Math.max(0.6, distancia / (W * 0.3));
    levar(porco, base, x, y, segundos, "linear");
    depois(() => passear(porco), segundos * 1000 + 300 + Math.random() * 1200);
  }

  // Duas borboletas voam pelo céu; quando ela toca, a borboleta dá uma cambalhota
  function soltarBorboleta(de) {
    const el = document.createElement("div");
    el.className = "borboleta";
    el.innerHTML = "<span>🦋</span>";
    el.style.left = raiz.clientWidth * de + "px";
    el.style.top = raiz.clientHeight * 0.2 + "px";
    el.addEventListener("pointerdown", (evento) => tocarNaBorboleta(evento, el));
    raiz.appendChild(el);
    const base = meioOriginal(el);
    const voar = () => {
      const W = raiz.clientWidth;
      const H = raiz.clientHeight;
      const segundos = 1.4 + Math.random() * 1.4;
      levar(el, base, W * (0.08 + Math.random() * 0.84), H * (0.08 + Math.random() * 0.45), segundos, "ease-in-out");
      el._proximo = performance.now() + segundos * 1000;
      depois(() => {
        if (performance.now() >= el._proximo - 20) voar();
      }, segundos * 1000);
    };
    el._voar = voar;
    voar();
  }

  function tocarNaBorboleta(evento, el) {
    evento.preventDefault();
    trocarClasse(el.firstChild, "girou");
    sons.inflar(0.6);
    voz.falar("Borboleta!");
    // Foge rapidinho para outro lugar
    const W = raiz.clientWidth;
    const H = raiz.clientHeight;
    levar(el, meioOriginal(el), W * (0.08 + Math.random() * 0.84), H * (0.08 + Math.random() * 0.45), 0.7, "ease-out");
    el._proximo = performance.now() + 700;
    depois(() => {
      if (performance.now() >= el._proximo - 20) el._voar();
    }, 700);
  }

  function vitoria() {
    estado = "fim";
    chuvaDeConfete();
    aoVencer();
  }

  function chuvaDeConfete() {
    const cores = ["#e53935", "#fdd835", "#43a047", "#1e88e5", "#8e24aa", "#fb8c00", "#ec407a"];
    const largura = raiz.clientWidth;
    for (let i = 0; i < 90; i++) {
      const el = soltarPedaco("", "confete", Math.random() * largura, -30, {
        "--x": (Math.random() - 0.5) * 200 + "px",
        "--y": raiz.clientHeight + 60 + "px",
        "--giro": Math.random() * 1440 - 720 + "deg",
        "--tempo": 2.2 + Math.random() * 2 + "s",
        "animation-delay": Math.random() * 0.8 + "s",
        background: cores[i % cores.length],
      });
      if (i % 3 === 0) el.style.borderRadius = "50%";
    }
  }

  // No fim, cada porquinho que ela toca dá um pulão e a voz comemora
  function tocarNoPorco(evento) {
    const porco = evento.target.closest(".porco");
    if (!porco || (estado !== "felizes" && estado !== "fim")) return;
    evento.preventDefault();
    trocarClasse(porco, "pulou");
    sons.inflar(1);
    voz.falar("Aee!");
  }

  const acordar = () => sons.acordar();
  raiz.addEventListener("pointerdown", acordar);
  lobo.addEventListener("pointerdown", tocarNoLobo);
  escada.addEventListener("pointerdown", tocarNaEscada);
  porcos.addEventListener("pointerdown", tocarNoPorco);
  document.body.classList.add("luvinha"); // o mouse vira a luvinha, igual nos outros jogos

  comecar();

  // Limpeza: para voz, sons e timers e devolve o DOM ao estado inicial
  return () => {
    fumegando = false;
    voz.parar();
    sons.fechar();
    timers.forEach(clearTimeout);
    raiz.removeEventListener("pointerdown", acordar);
    lobo.removeEventListener("pointerdown", tocarNoLobo);
    escada.removeEventListener("pointerdown", tocarNaEscada);
    porcos.removeEventListener("pointerdown", tocarNoPorco);
    porcos.querySelectorAll(".porco").forEach((p) => {
      p.className = "porco";
      p.removeAttribute("style");
      p._posicao = null;
      p._base = null;
    });
    document.body.classList.remove("luvinha");
    raiz.querySelectorAll(".pedaco, .vento, .peca, .borboleta").forEach((el) => el.remove());
    raiz.className = "porquinhos";
    lobo.className = "lobo";
    lobo.style.transform = "";
    corpo.className = "corpo-lobo";
    corpo.style.removeProperty("--inflar");
    casa.className = "casa";
    fantasma.innerHTML = "";
    desenho.className = "desenho-casa";
    desenho.innerHTML = "";
    janela.className = "janela";
    janela.innerHTML = "";
    porcos.className = "porcos";
    escada.className = "escada";
    folego.innerHTML = "";
    contador.textContent = "";
    contador.className = "numero-sopro";
  };
}
