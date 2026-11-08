import { useEffect, useRef, useState } from "react";
import { criarVoz } from "./voz";

// "Os três porquinhos": ela toca no lobo para ele soprar as casas.
// Fase 1 (palha): 2 toques e a casa voa. Fase 2 (madeira): 5 toques, a casa treme
// a cada toque e no 5º desaba. Fase 3 (tijolo): 5 toques e nada acontece: blonk!
// O lobo fica cansado, aparece uma escada, ela toca nela, o lobo sobe no telhado,
// entra pela chaminé e os porquinhos dão bolo para ele. Todo mundo vira amigo.
export default function Porquinhos() {
  const raizRef = useRef(null);
  const [rodada, setRodada] = useState(0);
  const [venceu, setVenceu] = useState(false);

  // Cada rodada recomeça da casa de palha
  useEffect(() => iniciarPorquinhos(raizRef.current, () => setVenceu(true)), [rodada]);

  function jogarDeNovo() {
    setVenceu(false);
    setRodada((r) => r + 1);
  }

  return (
    <div className="porquinhos" ref={raizRef}>
      <div className="chao" />
      <div className="casa">
        <div className="desenho-casa" />
        <div className="escada">🪜</div>
        <div className="porcos" />
      </div>
      <div className="lobo">
        <div className="folego" />
        <div className="numero-sopro" />
        <div className="cara">
          🐺
          <span className="bochecha esquerda" />
          <span className="bochecha direita" />
          <span className="espiral esquerda">🌀</span>
          <span className="espiral direita">🌀</span>
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

const SOPROS = [2, 5, 5]; // quantos toques no lobo em cada casa
const NUMEROS = ["", "Um", "Dois", "Três", "Quatro", "Cinco"];
const NOMES_DAS_FASES = ["palha", "madeira", "tijolo"];

// As casinhas, desenhadas em SVG (todas no mesmo tamanho: 200 x 190)
const CASAS = [
  // Palha: amarelinha, com fios de palha no telhado e na parede
  `<svg viewBox="0 0 200 190">
    <rect x="30" y="85" width="140" height="100" fill="#f3d878" stroke="#b8862b" stroke-width="3"/>
    <path d="M42 90v92M56 90v92M70 90v92M130 90v92M144 90v92M158 90v92" stroke="#d9b24f" stroke-width="3"/>
    <polygon points="100,8 194,88 6,88" fill="#e6b84c" stroke="#b8862b" stroke-width="3" stroke-linejoin="round"/>
    <path d="M100 14L30 84M100 14L60 84M100 14L100 84M100 14L140 84M100 14L170 84" stroke="#c99a35" stroke-width="3"/>
    <path d="M84 185v-36a16 16 0 0 1 32 0v36z" fill="#8d6e3a" stroke="#6b4f22" stroke-width="3"/>
  </svg>`,
  // Madeira: tábuas marrons deitadas, janela com cruz
  `<svg viewBox="0 0 200 190">
    <rect x="30" y="85" width="140" height="100" fill="#b07842" stroke="#6d4320" stroke-width="3"/>
    <path d="M30 101h140M30 117h140M30 133h140M30 149h140M30 165h140" stroke="#8a5a2e" stroke-width="3"/>
    <polygon points="100,10 192,88 8,88" fill="#7b4a26" stroke="#4e2e14" stroke-width="3" stroke-linejoin="round"/>
    <rect x="44" y="108" width="30" height="30" fill="#bfe6ff" stroke="#4e2e14" stroke-width="3"/>
    <path d="M59 108v30M44 123h30" stroke="#4e2e14" stroke-width="3"/>
    <rect x="96" y="132" width="32" height="53" fill="#5d3a1a" stroke="#3e2410" stroke-width="3"/>
    <circle cx="122" cy="160" r="3" fill="#ffd54f"/>
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
    <rect x="44" y="106" width="32" height="32" fill="#bfe6ff" stroke="#3e2723" stroke-width="3"/>
    <path d="M60 106v32M44 122h32" stroke="#3e2723" stroke-width="3"/>
    <rect x="98" y="128" width="34" height="57" fill="#4e342e" stroke="#2e1d18" stroke-width="3"/>
    <circle cx="125" cy="158" r="3" fill="#ffd54f"/>
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
  const cara = raiz.querySelector(".cara");
  const folego = raiz.querySelector(".folego");
  const contador = raiz.querySelector(".numero-sopro");
  const casa = raiz.querySelector(".casa");
  const desenho = raiz.querySelector(".desenho-casa");
  const porcos = raiz.querySelector(".porcos");
  const escada = raiz.querySelector(".escada");

  let fase = 0; // 0 palha, 1 madeira, 2 tijolo
  let sopros = 0;
  // soprando: o lobo aceita toques; escada: espera ela tocar na escada; ocupado: animação
  let estado = "ocupado";
  let peDoLobo = null; // onde o pé do lobo fica parado, antes de ele subir na escada

  function trocarClasse(el, classe) {
    el.classList.remove(classe);
    void el.offsetWidth; // recomeça a animação
    el.classList.add(classe);
  }

  // Posição de um elemento dentro da cena (a cena é o "chão" de tudo)
  function caixa(el) {
    const r = el.getBoundingClientRect();
    const base = raiz.getBoundingClientRect();
    return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
  }

  // Pedacinhos voando com o vento (palha, tábuas, confete)
  function soltarPedaco(conteudo, classe, x, y, props) {
    const el = document.createElement("div");
    el.className = `pedaco ${classe}`;
    if (conteudo) el.textContent = conteudo;
    el.style.left = x + "px";
    el.style.top = y + "px";
    for (const [nome, valor] of Object.entries(props)) el.style.setProperty(nome, valor);
    raiz.appendChild(el);
    depois(() => el.remove(), 4000);
    return el;
  }

  // Linhas de vento saindo da boca do lobo até a casa
  function soprarVento(linhas, forca) {
    const l = caixa(cara);
    const c = caixa(desenho);
    const x0 = l.x + l.w * 0.75;
    const x1 = c.x + c.w * (forca > 0.8 ? 0.95 : 0.4);
    const meio = l.y + l.h * 0.6;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "vento");
    for (let i = 0; i < linhas; i++) {
      const y = meio + (i - (linhas - 1) / 2) * l.h * 0.22 * (0.6 + forca);
      const onda = (Math.random() - 0.5) * l.h * 0.5;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M${x0} ${meio} Q${(x0 + x1) / 2} ${y + onda} ${x1} ${y}`);
      path.setAttribute("pathLength", "100");
      path.style.animationDelay = i * 0.07 + "s";
      svg.appendChild(path);
    }
    raiz.appendChild(svg);
    depois(() => svg.remove(), 1500);
    sons.vento(forca);
  }

  function montarFase(n) {
    fase = n;
    sopros = 0;
    desenho.innerHTML = CASAS[n];
    desenho.className = "desenho-casa";
    casa.className = `casa casa-${NOMES_DAS_FASES[n]}`;
    trocarClasse(casa, "chegando");
    // Um porquinho a mais em cada casa: os que fugiram se juntam ao irmão
    porcos.innerHTML = Array.from({ length: n + 1 }, () => `<span class="porco"><span>🐖</span></span>`).join("");
    folego.innerHTML =
      n === 0 ? "" : Array.from({ length: SOPROS[n] }, () => `<span class="gomo">💨</span>`).join("");
    contador.textContent = "";
    lobo.className = "lobo";
    lobo.style.transform = "";
    cara.style.setProperty("--inflar", 0);

    const falas = [
      "O lobo quer derrubar a casa de palha! Toca no lobo para ele soprar!",
      "Agora a casa de madeira! Toca no lobo cinco vezes!",
      "E agora a casa de tijolo! Toca no lobo para soprar!",
    ];
    estado = "soprando";
    raiz.classList.add("pode-soprar");
    voz.falar(falas[n]);
  }

  // Toque no lobo: enche a bochecha; no último toque, sopra com força
  function tocarNoLobo(evento) {
    evento.preventDefault();
    if (estado !== "soprando") return;
    sopros++;
    const meta = SOPROS[fase];
    cara.style.setProperty("--inflar", sopros / meta);
    trocarClasse(cara, "enchendo");
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
    cara.style.setProperty("--inflar", 0);
    soprarVento(7, 1);
    if (fase === 0) depois(derrubarPalha, 450);
    if (fase === 1) depois(derrubarMadeira, 450);
    if (fase === 2) depois(naoCaiu, 600);
  }

  // Palha: a casinha se desfaz e os fios voam pela tela
  function derrubarPalha() {
    const c = caixa(desenho);
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
      () => porquinhosFogem("Socorro! A casa de palha voou! O porquinho fugiu para a casa de madeira!", 1),
      700
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
    desenho.classList.add("desabando");
    for (let i = 0; i < 22; i++) soltarTabua(c, true);
    depois(
      () => porquinhosFogem("Socorro! A casa de madeira caiu! Os porquinhos fugiram para a casa de tijolo!", 2),
      800
    );
  }

  // Os porquinhos saem correndo para a direita e vem a próxima casa
  function porquinhosFogem(fala, proxima) {
    [...porcos.children].forEach((p, i) => {
      p.style.animationDelay = i * 0.15 + "s";
      p.classList.add("fugindo");
    });
    let falou = false;
    let correu = false;
    const seguir = () => falou && correu && montarFase(proxima);
    voz.falar(fala, () => {
      falou = true;
      seguir();
    });
    depois(() => {
      correu = true;
      seguir();
    }, 1800);
  }

  // Tijolo: sopra com tudo e a casa nem treme. Blonk! O lobo senta cansado.
  function naoCaiu() {
    sons.blonk();
    depois(() => lobo.classList.add("cansado"), 300);
    voz.falar("Blonk! A casa de tijolo nem mexeu! O lobo ficou cansadinho.", () =>
      depois(mostrarEscada, 300)
    );
  }

  function mostrarEscada() {
    escada.classList.add("aparece");
    estado = "escada";
    voz.falar("Olha uma escada! Toca na escada!");
  }

  // Ela tocou na escada: o lobo sobe no telhado e entra pela chaminé
  function tocarNaEscada(evento) {
    evento.preventDefault();
    if (estado !== "escada") return;
    estado = "ocupado";
    escada.classList.remove("aparece");
    escada.classList.add("usada");
    lobo.classList.remove("cansado", "soprando");
    lobo.classList.add("andando");

    // Conta pelo pé do lobo (meio de baixo), que é de onde ele cresce e encolhe
    const l = caixa(lobo);
    const pe = (peDoLobo = { x: l.x + l.w / 2, y: l.y + l.h });
    const e = caixa(escada);
    const ch = caixa(desenho.querySelector(".chamine"));

    // 1: anda até a escada
    lobo.style.transform = `translate(${e.x + e.w / 2 - pe.x}px, ${e.y + e.h - pe.y}px) scale(0.75)`;
    voz.falar("O lobo subiu no telhado!");

    // 2: sobe até o lado da chaminé
    depois(() => {
      lobo.style.transform = `translate(${ch.x + ch.w / 2 - pe.x}px, ${ch.y - pe.y}px) scale(0.45)`;
    }, 1100);

    // 3: entra pela chaminé
    depois(() => {
      lobo.classList.add("entrando");
      lobo.style.transform = `translate(${ch.x + ch.w / 2 - pe.x}px, ${ch.y + ch.h * 0.7 - pe.y}px) scale(0.1)`;
      voz.falar("E entrou pela chaminé!", () => depois(viraramAmigos, 400));
    }, 2400);
  }

  // Dentro de casa os porquinhos dão bolo para o lobo, e todo mundo vira amigo
  function viraramAmigos() {
    const c = caixa(desenho);
    const pe = peDoLobo;
    // Pula direto para a porta (sem andar até lá) e aparece devagarinho
    lobo.style.transition = "none";
    lobo.style.transform = `translate(${c.x + c.w * 0.3 - pe.x}px, ${c.y + c.h - pe.y}px) scale(0.6)`;
    void lobo.offsetWidth; // aplica a posição nova antes de ligar a transição de novo
    lobo.style.transition = "";
    lobo.classList.remove("andando", "entrando");
    lobo.classList.add("amigo");
    escada.classList.remove("usada"); // a escada some: agora ele entra pela porta

    const bolo = document.createElement("span");
    bolo.className = "bolo";
    bolo.textContent = "🍰";
    porcos.prepend(bolo);

    voz.falar("Os porquinhos deram bolo para o lobo! Agora todo mundo é amigo!", () => depois(vitoria, 300));
  }

  function vitoria() {
    estado = "fim";
    sons.musica();
    chuvaDeConfete();
    depois(chuvaDeConfete, 1500);
    aoVencer();
    voz.falar("Parabéns! Você ajudou o lobo!");
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

  const acordar = () => sons.acordar();
  raiz.addEventListener("pointerdown", acordar);
  lobo.addEventListener("pointerdown", tocarNoLobo);
  escada.addEventListener("pointerdown", tocarNaEscada);
  document.body.classList.add("luvinha"); // o mouse vira a luvinha, igual nos outros jogos

  montarFase(0);

  // Limpeza: para voz, sons e timers e devolve o DOM ao estado inicial
  return () => {
    voz.parar();
    sons.fechar();
    timers.forEach(clearTimeout);
    raiz.removeEventListener("pointerdown", acordar);
    lobo.removeEventListener("pointerdown", tocarNoLobo);
    escada.removeEventListener("pointerdown", tocarNaEscada);
    document.body.classList.remove("luvinha");
    raiz.querySelectorAll(".pedaco, .vento").forEach((el) => el.remove());
    raiz.className = "porquinhos";
    lobo.className = "lobo";
    lobo.style.transform = "";
    lobo.style.transition = "";
    cara.className = "cara";
    cara.style.removeProperty("--inflar");
    casa.className = "casa";
    desenho.className = "desenho-casa";
    desenho.innerHTML = "";
    porcos.innerHTML = "";
    escada.className = "escada";
    folego.innerHTML = "";
    contador.textContent = "";
    contador.className = "numero-sopro";
  };
}
