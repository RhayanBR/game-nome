import { useEffect, useRef, useState } from "react";
import { criarVoz } from "./voz";

// "Monstrinho comilão": uma árvore com 5 maçãs e um monstrinho com fome no chão.
// Ela toca numa maçã, a maçã cai quicando, o monstrinho vai pulando até ela e come
// (crunch!), e a voz conta quantas ele já comeu. Quando acabam as maçãs, ele fica
// com cara de "ué?", olha para a árvore, abre um bocão gigante e come a árvore inteira
// (nhaaac!). Fica de barriga cheia, arrota e vem confete. Aí ela pode plantar de novo.
export default function Monstrinho() {
  const raizRef = useRef(null);
  const [rodada, setRodada] = useState(0);
  const [venceu, setVenceu] = useState(false);

  // Na primeira vez a árvore já está lá; nas outras ela brota do chão
  useEffect(() => iniciarMonstrinho(raizRef.current, () => setVenceu(true), rodada > 0), [rodada]);

  function plantarDeNovo() {
    setVenceu(false);
    setRodada((r) => r + 1);
  }

  return (
    <div className="monstrinho" ref={raizRef}>
      <div className="chao" />
      <div className="arvore" dangerouslySetInnerHTML={{ __html: ARVORE }} />
      <div className="monstro">
        <div className="pulo">
          <div className="corpo-monstro" dangerouslySetInnerHTML={{ __html: MONSTRO }} />
        </div>
        <div className="duvida">?</div>
      </div>
      {venceu && (
        <button className="escolha de-novo-monstrinho" style={{ "--cor": "#00897b" }} onClick={plantarDeNovo}>
          <span className="figura">🌳</span>
          Plantar de novo
        </button>
      )}
    </div>
  );
}

const CONTAGEM = ["", "Uma maçã!", "Duas maçãs!", "Três maçãs!", "Quatro maçãs!", "Cinco maçãs!"];

// Onde ficam as 5 maçãs na copa (em % da árvore, pelo meio da maçã)
const LUGARES = [
  [28, 40],
  [50, 20],
  [73, 37],
  [39, 61],
  [64, 60],
];

// A árvore: tronco marrom e uma copa bem colorida, com florzinhas
const ARVORE = `<svg viewBox="0 0 200 220">
<g stroke="#4e342e" stroke-width="3" stroke-linejoin="round">
  <path d="M86 216 C88 190 90 160 88 128 L112 128 C110 160 112 190 116 216 C124 218 132 219 138 220 L62 220 C68 219 78 218 86 216 Z" fill="#8d5a34"/>
  <path d="M94 150 C96 170 95 190 97 210 M106 140 C104 160 106 180 105 200" fill="none" stroke="#6d4320" stroke-width="2"/>
  <path d="M100 140 C90 128 80 124 70 120 M101 136 C112 126 122 122 132 118" fill="none" stroke="#8d5a34" stroke-width="7" stroke-linecap="round"/>
</g>
<g stroke="#2e7d32" stroke-width="3">
  <circle cx="58" cy="98" r="40" fill="#43a047"/>
  <circle cx="142" cy="98" r="40" fill="#43a047"/>
  <circle cx="100" cy="112" r="40" fill="#388e3c"/>
  <circle cx="68" cy="56" r="38" fill="#66bb6a"/>
  <circle cx="132" cy="56" r="38" fill="#66bb6a"/>
  <circle cx="100" cy="44" r="40" fill="#81c784"/>
  <circle cx="100" cy="82" r="42" fill="#5cb860" stroke="none"/>
</g>
<g fill="#a5d6a7" stroke="none" opacity="0.7">
  <ellipse cx="80" cy="30" rx="14" ry="7"/>
  <ellipse cx="128" cy="36" rx="10" ry="5"/>
  <ellipse cx="40" cy="80" rx="9" ry="5"/>
</g>
<g stroke="none">
  <g fill="#f8bbd0"><circle cx="45" cy="60" r="4"/><circle cx="150" cy="78" r="4"/><circle cx="96" cy="100" r="4"/><circle cx="120" cy="20" r="4"/></g>
  <g fill="#fff59d"><circle cx="45" cy="60" r="1.6"/><circle cx="150" cy="78" r="1.6"/><circle cx="96" cy="100" r="1.6"/><circle cx="120" cy="20" r="1.6"/></g>
  <g fill="#fff"><circle cx="160" cy="112" r="3.5"/><circle cx="30" cy="112" r="3.5"/><circle cx="80" cy="12" r="3.5"/></g>
  <g fill="#ffb300"><circle cx="160" cy="112" r="1.4"/><circle cx="30" cy="112" r="1.4"/><circle cx="80" cy="12" r="1.4"/></g>
</g>
</svg>`;

// Uma maçã vermelha brilhante, com cabinho e folhinha
const MACA = `<svg viewBox="0 0 60 64">
<path d="M30 16 C32 8 34 4 38 2" stroke="#5d4037" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M33 12 C40 2 52 4 54 10 C46 14 38 15 33 12 Z" fill="#7cb342" stroke="#33691e" stroke-width="2"/>
<path d="M30 18 C20 10 4 14 4 34 C4 52 18 62 26 60 C28 59 32 59 34 60 C42 62 56 52 56 34 C56 14 40 10 30 18 Z" fill="#e53935" stroke="#8e1b17" stroke-width="3"/>
<ellipse cx="17" cy="30" rx="5" ry="8" fill="white" opacity="0.6" transform="rotate(20 17 30)"/>
</svg>`;

// O monstrinho, de frente. Partes com classe para a animação:
// orelhas e flor na cabeça, olhos (pupilas olham para os lados com --olhar-x/--olhar-y),
// pálpebras que piscam, olhos felizes (^^), sorriso, bocona aberta, baba e braços.
const MONSTRO = `<svg viewBox="0 0 140 130">
<g stroke="#2f6b1a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="46" cy="122" rx="16" ry="7" fill="#5aa832"/>
  <ellipse cx="94" cy="122" rx="16" ry="7" fill="#5aa832"/>
  <path d="M70 34 C69 26 70 20 72 14" fill="none" stroke="#2f6b1a"/>
  <path d="M71 22 C78 14 88 16 90 20 C84 26 76 26 71 22 Z" fill="#7cb342"/>
  <g class="flor-monstro" stroke="none">
    <circle cx="72" cy="7" r="5" fill="#f48fb1"/><circle cx="66" cy="12" r="5" fill="#f48fb1"/><circle cx="78" cy="12" r="5" fill="#f48fb1"/>
    <circle cx="72" cy="11" r="3.5" fill="#ffeb3b"/>
  </g>
  <circle cx="27" cy="50" r="10" fill="#8bdc5a"/>
  <circle cx="113" cy="50" r="10" fill="#8bdc5a"/>
  <circle cx="27" cy="50" r="4.5" fill="#f8bbd0" stroke="none"/>
  <circle cx="113" cy="50" r="4.5" fill="#f8bbd0" stroke="none"/>
  <g class="barriga-monstro">
    <ellipse cx="70" cy="80" rx="50" ry="45" fill="#8bdc5a"/>
    <ellipse cx="70" cy="96" rx="31" ry="24" fill="#c8f2a2" stroke="none"/>
    <g fill="#6cc443" stroke="none"><circle cx="32" cy="70" r="4"/><circle cx="38" cy="58" r="2.6"/><circle cx="108" cy="70" r="4"/><circle cx="102" cy="58" r="2.6"/></g>
  </g>
  <path class="braco braco-esq" d="M24 82 C14 88 12 98 16 104" fill="none" stroke="#2f6b1a" stroke-width="13"/>
  <path class="braco braco-esq" d="M24 82 C14 88 12 98 16 104" fill="none" stroke="#8bdc5a" stroke-width="8"/>
  <path class="braco braco-dir" d="M116 82 C126 88 128 98 124 104" fill="none" stroke="#2f6b1a" stroke-width="13"/>
  <path class="braco braco-dir" d="M116 82 C126 88 128 98 124 104" fill="none" stroke="#8bdc5a" stroke-width="8"/>
  <ellipse cx="36" cy="86" rx="8" ry="5" fill="#ff8a80" stroke="none" opacity="0.7"/>
  <ellipse cx="104" cy="86" rx="8" ry="5" fill="#ff8a80" stroke="none" opacity="0.7"/>
  <g class="olhos-monstro">
    <ellipse cx="52" cy="60" rx="15" ry="17" fill="white"/>
    <ellipse cx="88" cy="60" rx="15" ry="17" fill="white"/>
    <g class="pupilas-monstro" stroke="none">
      <circle cx="52" cy="61" r="7.5" fill="#222"/><circle cx="88" cy="61" r="7.5" fill="#222"/>
      <circle cx="55" cy="58" r="2.6" fill="white"/><circle cx="91" cy="58" r="2.6" fill="white"/>
    </g>
    <ellipse class="palpebra" cx="52" cy="60" rx="15.5" ry="17.5" fill="#7ccf4c"/>
    <ellipse class="palpebra" cx="88" cy="60" rx="15.5" ry="17.5" fill="#7ccf4c"/>
  </g>
  <g class="olhos-felizes" fill="none" stroke-width="4">
    <path d="M40 64 Q52 50 64 64"/><path d="M76 64 Q88 50 100 64"/>
  </g>
  <g class="sorriso">
    <path d="M56 90 Q70 101 84 90" fill="none" stroke-width="3.5"/>
    <path d="M64 95 L65 100 L69 96" fill="white" stroke-width="1.5"/>
  </g>
  <g class="bocona">
    <ellipse cx="70" cy="96" rx="18" ry="14" fill="#6d1b2b"/>
    <ellipse cx="70" cy="104" rx="10" ry="5" fill="#f06292" stroke="none"/>
    <path d="M60 83 L62 89 L65 83 M75 83 L78 89 L80 83" fill="white" stroke-width="1.5"/>
  </g>
  <path class="baba" d="M80 95 C80 100 77 104 80 106 C83 104 80 100 80 95 Z" fill="#b3e5fc" stroke="#4fc3f7" stroke-width="1.5"/>
</g>
</svg>`;

// Efeitos de som feitos na hora pelo navegador (Web Audio): pop, quique, crunch,
// nhac, arroto e musiquinha. Não são sons de bicho (esses só com gravação, ver sons.js).
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

  // Envelope: sobe rápido e desce até sumir
  function volume(ganho, t, pico, duracao) {
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.exponentialRampToValueAtTime(pico, t + 0.015);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
  }

  function tom(tipo, de, para, inicio, duracao, pico, filtro) {
    const t = ctx.currentTime + inicio;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(de, t);
    if (para !== de) osc.frequency.exponentialRampToValueAtTime(para, t + duracao);
    volume(ganho, t, pico, duracao);
    if (filtro) osc.connect(filtro).connect(ganho);
    else osc.connect(ganho);
    ganho.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duracao + 0.05);
    return osc;
  }

  // Chiado curtinho, passando por um filtro (é o "crec" da mordida)
  function chiado(inicio, duracao, pico, tipoFiltro, frequencia) {
    const t = ctx.currentTime + inicio;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duracao), ctx.sampleRate);
    const dados = buffer.getChannelData(0);
    for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    const fonte = ctx.createBufferSource();
    fonte.buffer = buffer;
    const filtro = ctx.createBiquadFilter();
    filtro.type = tipoFiltro;
    filtro.frequency.setValueAtTime(frequencia, t);
    const ganho = ctx.createGain();
    volume(ganho, t, pico, duracao);
    fonte.connect(filtro).connect(ganho).connect(ctx.destination);
    fonte.start(t);
    return filtro;
  }

  return {
    acordar,

    // A maçã se solta do galho
    pop() {
      if (!ctx) return;
      tom("sine", 380, 1300, 0, 0.09, 0.5);
    },

    // A maçã batendo no chão (o segundo quique é mais fraquinho)
    quique(forca) {
      if (!ctx) return;
      tom("sine", 160, 55, 0, 0.16, 0.6 * forca);
    },

    // Crunch! Quatro estalinhos crocantes seguidos
    crunch() {
      if (!ctx) return;
      [0, 0.09, 0.19, 0.3].forEach((t, i) => {
        chiado(t, 0.06, 0.7 - i * 0.1, "highpass", 1800 + Math.random() * 1200);
        tom("square", 220 - i * 20, 90, t, 0.05, 0.12);
      });
    },

    // Nhaaac! Um bocão enorme se fechando na árvore
    nhac() {
      if (!ctx) return;
      const filtro = chiado(0, 0.55, 0.8, "lowpass", 3000);
      filtro.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.55);
      tom("sawtooth", 320, 60, 0, 0.5, 0.3);
      tom("sine", 120, 40, 0.45, 0.3, 0.9);
    },

    // Arroto engraçado: um "brrroop" grave que treme
    arroto() {
      if (!ctx) return;
      const t = ctx.currentTime;
      const filtro = ctx.createBiquadFilter();
      filtro.type = "lowpass";
      filtro.frequency.setValueAtTime(500, t);
      const osc = tom("sawtooth", 105, 62, 0, 0.75, 0.55, filtro);
      const tremido = ctx.createOscillator();
      const quanto = ctx.createGain();
      tremido.frequency.value = 28;
      quanto.gain.value = 12;
      tremido.connect(quanto).connect(osc.frequency);
      tremido.start(t);
      tremido.stop(t + 0.8);
    },

    // A árvore nova subindo do chão: "fiiiuuup"
    brotar() {
      if (!ctx) return;
      tom("sine", 200, 900, 0, 1, 0.3);
      tom("triangle", 300, 1350, 0.1, 0.9, 0.12);
    },

    // Musiquinha alegre da barriga cheia
    musica() {
      if (!ctx) return;
      const D = 0.16;
      const melodia = [
        [784, 1], [659, 1], [784, 1], [1047, 2], [988, 1], [880, 1], [784, 2],
        [659, 1], [698, 1], [784, 1], [880, 1], [988, 1], [1047, 4],
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
function iniciarMonstrinho(raiz, aoVencer, brotar) {
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
  const arvore = raiz.querySelector(".arvore");
  const chao = raiz.querySelector(".chao");
  const monstro = raiz.querySelector(".monstro");
  const pulo = raiz.querySelector(".pulo");
  const corpo = raiz.querySelector(".corpo-monstro");
  const duvida = raiz.querySelector(".duvida");

  // esperando: ela pode tocar nas maçãs (e no monstrinho); ocupado: alguma animação acontecendo
  let estado = "ocupado";
  let comidas = 0;
  let dica = 0; // contador para cancelar a dica quando ela toca antes
  let andar = 0; // contador para ignorar chegadas de caminhadas antigas

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

  function soltarPedaco(conteudo, classe, x, y, props, duracao = 3000) {
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

  // Para onde o monstrinho olha: "cima" (as maçãs), "frente" (para ela), "arvore" (o tronco)
  function olhar(para) {
    monstro.classList.remove("olha-cima", "olha-frente", "olha-arvore");
    monstro.classList.add(`olha-${para}`);
  }

  // Leva o monstrinho, pulando, até que o meio dele fique em x. Chama chegou() lá.
  // Devolve quanto tempo vai demorar.
  function irPulando(x, chegou) {
    const minha = ++andar;
    const atual = monstro._x || 0;
    const base = monstro._base;
    const destino = x - base;
    const segundos = Math.max(0.5, Math.abs(destino - atual) / (raiz.clientWidth * 0.55));
    monstro._x = destino;
    pulo.classList.add("pulando");
    monstro.style.transition = `translate ${segundos}s linear`;
    monstro.style.translate = `${destino}px 0`;
    depois(() => {
      if (minha !== andar) return;
      pulo.classList.remove("pulando");
      if (chegou) chegou();
    }, segundos * 1000);
    return segundos * 1000;
  }

  function voltarParaCasa(chegou) {
    irPulando(monstro._base, chegou);
  }

  // ---------- Começo ----------
  function comecar() {
    const m = caixa(monstro);
    monstro._base = m.x + m.w / 2;
    monstro._x = 0;
    olhar("cima");
    pendurarMacas();
    raiz.classList.add("com-fome");

    if (brotar) {
      // A árvore nova sobe do chão e as maçãs aparecem uma por uma
      trocarClasse(arvore, "brotando");
      sons.brotar();
      depois(() => voz.falar("Olha! Uma árvore nova! Toca numa maçã!", esperar), 900);
    } else {
      voz.falar("Olha o monstrinho! Ele está com fome! Toca numa maçã!", esperar);
    }
  }

  function pendurarMacas() {
    LUGARES.forEach(([x, y], i) => {
      const el = document.createElement("div");
      el.className = "maca";
      el.innerHTML = MACA;
      el.style.left = x + "%";
      el.style.top = y + "%";
      el.style.setProperty("--i", i);
      el.addEventListener("pointerdown", (evento) => tocarNaMaca(evento, el));
      arvore.appendChild(el);
    });
  }

  function esperar() {
    estado = "esperando";
    raiz.classList.add("esperando");
    olhar("cima");
    agendarDica();
  }

  // Se ela demora, uma maçã balança mais forte chamando
  function agendarDica() {
    const minha = ++dica;
    depois(() => {
      if (minha !== dica || estado !== "esperando") return;
      const macas = arvore.querySelectorAll(".maca");
      if (macas.length) trocarClasse(macas[Math.floor(Math.random() * macas.length)], "chamando");
    }, 6000);
  }

  // ---------- Ela toca numa maçã ----------
  function tocarNaMaca(evento, el) {
    evento.preventDefault();
    evento.stopPropagation();
    sons.acordar();
    if (estado !== "esperando" || voz.falando) return;
    estado = "ocupado";
    raiz.classList.remove("esperando");
    dica++;
    sons.pop();
    olhar("frente");
    monstro.classList.add("animado");

    // A maçã sai da árvore e passa a cair pela cena
    const m = caixa(el);
    el.classList.remove("chamando");
    el.classList.add("caindo");
    el.style.left = m.x + "px";
    el.style.top = m.y + "px";
    el.style.width = m.w + "px";
    raiz.appendChild(el);

    // Cai até a grama, um pouquinho para o lado do monstrinho, e quica duas vezes
    const chaoY = caixa(chao).y;
    const dx = -m.w * (0.3 + Math.random() * 0.5);
    const dy = chaoY - (m.y + m.h * 0.85);
    const quica = m.h * 0.9;
    const DURACAO = 1100;
    el.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", easing: "cubic-bezier(0.5, 0, 1, 1)" },
        { transform: `translate(${dx * 0.6}px, ${dy}px) rotate(-40deg)`, offset: 0.5, easing: "ease-out" },
        { transform: `translate(${dx * 0.8}px, ${dy - quica}px) rotate(-80deg)`, offset: 0.68, easing: "ease-in" },
        { transform: `translate(${dx * 0.95}px, ${dy}px) rotate(-110deg)`, offset: 0.84, easing: "ease-out" },
        { transform: `translate(${dx}px, ${dy - quica * 0.3}px) rotate(-120deg)`, offset: 0.92, easing: "ease-in" },
        { transform: `translate(${dx}px, ${dy}px) rotate(-125deg)` },
      ],
      { duration: DURACAO, fill: "forwards" }
    );
    depois(() => sons.quique(1), DURACAO * 0.5);
    depois(() => sons.quique(0.5), DURACAO * 0.84);

    // O monstrinho vai pulando até onde a maçã cai (a maçã fica do lado direito dele)
    const largura = caixa(monstro).w;
    const chegada = irPulando(m.x + m.w / 2 + dx - largura * 0.45, null);
    depois(() => comerMaca(el), Math.max(DURACAO + 100, chegada));
  }

  // Abre a boca, a maçã voa para dentro, crunch, e ele mastiga feliz
  function comerMaca(el) {
    pulo.classList.remove("pulando");
    monstro.classList.remove("animado");
    raiz.classList.remove("com-fome");
    corpo.classList.add("comendo");

    depois(() => {
      const a = caixa(el);
      const c = caixa(corpo);
      el.getAnimations().forEach((animacao) => animacao.cancel());
      el.style.left = a.x + "px";
      el.style.top = a.y + "px";
      const bocaX = c.x + c.w * 0.5;
      const bocaY = c.y + c.h * (96 / 130);
      el.animate(
        [
          { transform: "translate(0, 0) rotate(-125deg) scale(1)" },
          { transform: `translate(${bocaX - (a.x + a.w / 2)}px, ${bocaY - (a.y + a.h / 2)}px) rotate(-200deg) scale(0.3)` },
        ],
        { duration: 260, easing: "ease-in", fill: "forwards" }
      );
    }, 220);

    depois(() => {
      el.remove();
      comidas++;
      sons.crunch();
      migalhas();
      corpo.classList.remove("comendo");
      corpo.classList.add("mastigando");
      let falou = false;
      let mastigou = false;
      const seguir = () => {
        if (falou && mastigou) satisfeito();
      };
      voz.falar(`${CONTAGEM[comidas]} Hum, que delícia!`, () => {
        falou = true;
        seguir();
      });
      depois(() => {
        mastigou = true;
        seguir();
      }, 1300);
    }, 500);
  }

  // Pedacinhos de maçã voando da boca
  function migalhas() {
    const c = caixa(corpo);
    const x = c.x + c.w * 0.5;
    const y = c.y + c.h * (96 / 130);
    for (let i = 0; i < 9; i++) {
      soltarPedaco("", "migalha", x, y, {
        "--x": (Math.random() - 0.5) * c.w * 1.2 + "px",
        "--y": -c.h * (0.1 + Math.random() * 0.4) + "px",
        "--giro": Math.random() * 720 - 360 + "deg",
        "--tempo": 0.6 + Math.random() * 0.4 + "s",
        width: c.w * 0.07 + "px",
        height: c.w * 0.05 + "px",
        background: i % 3 === 0 ? "#e53935" : "#fff3c4",
      }, 1100);
    }
  }

  function satisfeito() {
    corpo.classList.remove("mastigando");
    corpo.classList.add("feliz");
    depois(() => {
      corpo.classList.remove("feliz");
      if (comidas < LUGARES.length) {
        raiz.classList.add("com-fome");
        voltarParaCasa(esperar);
      } else {
        voltarParaCasa(acabaram);
      }
    }, 700);
  }

  // ---------- Acabaram as maçãs: ué? ----------
  function acabaram() {
    olhar("cima");
    depois(() => {
      olhar("frente");
      duvida.classList.add("aparece");
      voz.falar("Ué? Acabaram as maçãs!", () => depois(olharArvore, 300));
    }, 900);
  }

  function olharArvore() {
    duvida.classList.remove("aparece");
    olhar("arvore");
    depois(() => {
      corpo.classList.add("arregalado");
      raiz.classList.add("com-fome");
      voz.falar("Hum... A árvore parece gostosa!", () => depois(abocanhar, 200));
    }, 600);
  }

  // Abre um bocão gigante, vai pulando até a árvore, cresce e engole tudo de uma vez
  function abocanhar() {
    raiz.classList.remove("com-fome");
    corpo.classList.remove("arregalado");
    corpo.classList.add("bocao");
    const a = caixa(arvore);
    irPulando(a.x + a.w * 0.42, () => {
      corpo.classList.add("gigante");
      depois(engolirArvore, 380);
    });
  }

  function engolirArvore() {
    const a = caixa(arvore);
    const c = caixa(corpo);
    const bocaX = c.x + c.w * 0.5;
    const bocaY = c.y + c.h * (96 / 130);
    arvore.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${bocaX - (a.x + a.w / 2)}px, ${bocaY - (a.y + a.h / 2)}px) scale(0.05)`, opacity: 0.6 },
      ],
      { duration: 450, easing: "ease-in", fill: "forwards" }
    );
    sons.nhac();
    voz.falar("Nhaaac!");

    // Nuvem de fumaça de desenho animado onde estava a árvore
    for (let i = 0; i < 16; i++) {
      depois(() => {
        soltarPedaco("", "nuvem", a.x + a.w * (0.15 + Math.random() * 0.7), a.y + a.h * (0.15 + Math.random() * 0.8), {
          "--x": (Math.random() - 0.5) * a.w * 0.4 + "px",
          "--y": -a.h * (0.1 + Math.random() * 0.2) + "px",
          "--tempo": 1 + Math.random() * 0.6 + "s",
          width: a.w * (0.2 + Math.random() * 0.15) + "px",
          height: a.w * (0.2 + Math.random() * 0.15) + "px",
        }, 1800);
      }, 250 + Math.random() * 300);
    }

    depois(() => {
      arvore.classList.add("comida");
      corpo.classList.remove("bocao", "gigante");
      corpo.classList.add("mastigando", "cheio");
    }, 600);
    depois(barrigaCheia, 1700);
  }

  // ---------- Barriga cheia ----------
  function barrigaCheia() {
    corpo.classList.remove("mastigando");
    corpo.classList.add("feliz", "esfregando");
    olhar("frente");
    sons.arroto();
    depois(() => {
      voz.falar("Ele comeu a árvore inteira! Que barrigão!", () => depois(vitoria, 200));
      chuvaDeConfete();
      sons.musica();
    }, 900);
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
      }, 5200);
      if (i % 3 === 0) el.style.borderRadius = "50%";
    }
  }

  // Tocar no monstrinho: ele dá um pulinho e pede maçã (no fim, comemora)
  function tocarNoMonstro(evento) {
    evento.preventDefault();
    sons.acordar();
    if (estado === "fim") {
      trocarClasse(pulo, "pulinho");
      sons.arroto();
      return;
    }
    if (estado !== "esperando" || voz.falando) return;
    trocarClasse(pulo, "pulinho");
    voz.falar("Eu quero maçã!");
  }

  const acordar = () => sons.acordar();
  raiz.addEventListener("pointerdown", acordar);
  monstro.addEventListener("pointerdown", tocarNoMonstro);
  document.body.classList.add("luvinha"); // o mouse vira a luvinha, igual nos outros jogos

  comecar();

  // Limpeza: para voz, sons e timers e devolve o DOM ao estado inicial
  return () => {
    voz.parar();
    sons.fechar();
    timers.forEach(clearTimeout);
    raiz.removeEventListener("pointerdown", acordar);
    monstro.removeEventListener("pointerdown", tocarNoMonstro);
    document.body.classList.remove("luvinha");
    raiz.querySelectorAll(".pedaco, .maca").forEach((el) => el.remove());
    raiz.className = "monstrinho";
    arvore.getAnimations().forEach((a) => a.cancel());
    arvore.className = "arvore";
    monstro.className = "monstro";
    monstro.removeAttribute("style");
    monstro._x = 0;
    pulo.className = "pulo";
    corpo.className = "corpo-monstro";
    duvida.className = "duvida";
  };
}
