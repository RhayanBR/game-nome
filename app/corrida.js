import { useEffect, useRef, useState } from "react";
import { BICHOS } from "./bichos";
import { criarVoz } from "./voz";

// "Corrida dos animais": 5 bichos entram na pista um de cada vez, ela escolhe
// quem acha que corre mais, a voz conta 3, 2, 1, Já! e eles correm até a
// chegada. No fim aparece o pódio dos 3 primeiros, com o troféu para o 1º.
export default function Corrida() {
  const raizRef = useRef(null);
  const [rodada, setRodada] = useState(0);
  const [resultado, setResultado] = useState(null);

  // Cada rodada é uma corrida nova, com outros bichos
  useEffect(() => iniciarCorrida(raizRef.current, setResultado), [rodada]);

  function correrDeNovo() {
    setResultado(null);
    setRodada((r) => r + 1);
  }

  return (
    <div className="corrida" ref={raizRef}>
      <div className="mensagem" />
      <div className="pista">
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="raia" key={i} />
        ))}
        <div className="linha largada" />
        <div className="linha chegada" />
      </div>
      <div className="contagem" />
      {resultado && <Podio {...resultado} aoCorrerDeNovo={correrDeNovo} />}
    </div>
  );
}

// Pódio: 2º à esquerda, 1º no meio (mais alto, com troféu), 3º à direita
function Podio({ podio, aoCorrerDeNovo }) {
  return (
    <div className="podio-fundo">
      <div className="podio-titulo">PARABÉNS, {podio[0].palavra}!</div>
      <div className="podio">
        {[1, 0, 2].map((i) => (
          <div className={`coluna lugar-${i + 1}`} key={i}>
            {i === 0 && <div className="trofeu">🏆</div>}
            <div className="no-podio">{podio[i].emoji}</div>
            <div className="degrau">
              {i + 1}º
              <span className="velocidade">⚡{podio[i].velocidade.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="escolha correr-de-novo" style={{ "--cor": "#ff7043" }} onClick={aoCorrerDeNovo}>
        <span className="figura">🔄</span>
        Correr de novo
      </button>
    </div>
  );
}

// Velocidade de cada bicho de 1.0 a 9.99, seguindo mais ou menos a vida real
// (o caracol é o mais lento, o cavalo o mais rápido), e o jeito que ele corre.
const CORREDORES = {
  CARACOL: { velocidade: 1.0, jeito: "arrasta" },
  FORMIGA: { velocidade: 1.5, jeito: "formiguinha" },
  TARTARUGA: { velocidade: 1.8, jeito: "arrasta" },
  PATO: { velocidade: 3.5, jeito: "bamboleio" },
  GALINHA: { velocidade: 4.0, jeito: "bamboleio" },
  PORCO: { velocidade: 4.6, jeito: "bamboleio" },
  DINOSSAURO: { velocidade: 5.2, jeito: "pesado" },
  CABRITO: { velocidade: 5.8, jeito: "pulo" },
  VACA: { velocidade: 6.0, jeito: "pesado" },
  ELEFANTE: { velocidade: 6.4, jeito: "pesado" },
  OVELHA: { velocidade: 6.8, jeito: "trote" },
  CACHORRO: { velocidade: 7.6, jeito: "trote" },
  GATO: { velocidade: 8.0, jeito: "trote" },
  COELHO: { velocidade: 8.4, jeito: "pulo" },
  GIRAFA: { velocidade: 8.7, jeito: "galope" },
  CAMELO: { velocidade: 9.0, jeito: "galope" },
  ZEBRA: { velocidade: 9.4, jeito: "galope" },
  CAVALO: { velocidade: 9.99, jeito: "galope" },
};

// Tempo de cada passo (segundos) em cada jeito de correr
const RITMO = {
  arrasta: 0.7,
  formiguinha: 0.07,
  bamboleio: 0.18,
  pesado: 0.32,
  pulo: 0.3,
  trote: 0.16,
  galope: 0.22,
};

const TEMPO = 40; // com velocidade 1 leva 40 s para chegar; com 9.99, uns 4 s
const DIFERENCA = 1; // velocidades bem diferentes, para dar para ver quem é mais rápido
const ORDINAIS = ["primeiro", "segundo", "terceiro", "quarto", "quinto"];

const maiuscula = (texto) => texto[0].toUpperCase() + texto.slice(1);

// 5 bichos diferentes, com velocidades longe umas das outras
function escolherCorredores() {
  const todos = BICHOS.filter((b) => CORREDORES[b.palavra]).map((b) => ({ ...b, ...CORREDORES[b.palavra] }));
  for (let tentativa = 0; tentativa < 200; tentativa++) {
    const embaralhados = [...todos].sort(() => Math.random() - 0.5);
    const escolhidos = [];
    for (const b of embaralhados) {
      if (escolhidos.every((e) => Math.abs(e.velocidade - b.velocidade) >= DIFERENCA)) escolhidos.push(b);
      if (escolhidos.length === 5) return escolhidos;
    }
  }
  return todos.slice(0, 5);
}

function iniciarCorrida(raiz, mostrarResultado) {
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
  const mensagem = raiz.querySelector(".mensagem");
  const pista = raiz.querySelector(".pista");
  const raias = [...raiz.querySelectorAll(".raia")];
  const largada = raiz.querySelector(".largada");
  const chegada = raiz.querySelector(".chegada");
  const contagem = raiz.querySelector(".contagem");

  const tipos = escolherCorredores();
  // Todos correm a mesma distância sem parar, então quem é mais veloz chega antes
  const ordem = [...tipos].sort((a, b) => b.velocidade - a.velocidade);
  let fase = "entrando"; // entrando → escolhendo → contando → correndo → fim
  let escolhido = null;
  let chegaram = 0;
  const corredores = [];

  // Medidas da pista: tamanho dos bichos e onde ficam a largada e a chegada
  function medidas() {
    const W = pista.clientWidth;
    const raia = pista.clientHeight / 5;
    const tamanho = Math.min(raia * 0.62, W / 7);
    return {
      W,
      raia,
      tamanho,
      inicio: tamanho * 1.3 + 16,
      fim: W - tamanho * 1.4 - 10,
    };
  }

  function trocarTexto(el, texto, classe) {
    el.textContent = texto;
    el.classList.remove(classe);
    void el.offsetWidth; // recomeça a animação
    el.classList.add(classe);
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

  function criarCorredor(tipo, raia) {
    const el = document.createElement("div");
    el.className = "corredor correndo";
    el.innerHTML =
      `<span class="placa">⚡${tipo.velocidade.toFixed(2)}</span><span class="medalha"></span>` +
      `<div class="corpo"><span class="passo jeito-${tipo.jeito}">${tipo.emoji}</span></div>`;
    el.style.setProperty("--ritmo", RITMO[tipo.jeito] + "s");
    pista.appendChild(el);

    const m = medidas();
    // p: quanto da pista já correu (0 = largada, 1 = chegada)
    // recuo: quanto ainda falta andar para chegar na largada quando está entrando
    const c = { el, tipo, raia, p: 0, recuo: m.inicio + m.tamanho * 2 + 20, tamanho: 0, poeira: 0 };
    const tocar = (evento) => escolher(c, evento);
    el.addEventListener("pointerdown", tocar);
    raias[raia].onpointerdown = tocar; // a raia inteira também serve para escolher
    corredores.push(c);
    posicionar(c, m);
    return c;
  }

  function posicionar(c, m) {
    if (c.tamanho !== m.tamanho) {
      c.tamanho = m.tamanho;
      c.el.style.fontSize = m.tamanho + "px";
      c.w = c.el.offsetWidth;
      c.h = c.el.offsetHeight;
    }
    const frente = m.inicio + c.p * (m.fim - m.inicio) - c.recuo; // focinho do bicho
    c.x = frente - c.w;
    c.y = c.raia * m.raia + (m.raia - c.h) / 2;
    c.el.style.transform = `translate(${c.x}px, ${c.y}px)`;
  }

  // Começo: os bichos entram na pista um de cada vez
  function entrar(i) {
    if (i >= tipos.length) {
      comecarEscolha();
      return;
    }
    const c = criarCorredor(tipos[i], i);
    voz.somEFala(c.tipo, `Chegou ${c.tipo.nome}!`, () => depois(() => entrar(i + 1), 300));
  }

  function comecarEscolha() {
    fase = "escolhendo";
    pista.classList.add("escolhendo");
    trocarTexto(mensagem, "Quem corre mais?", "chamando");
    voz.falar("Quem corre mais? Escolhe um!");
  }

  function escolher(c, evento) {
    evento.preventDefault();
    if (fase !== "escolhendo" || c.recuo > 0) return;
    fase = "contando";
    escolhido = c;
    pista.classList.remove("escolhendo");
    raias[c.raia].classList.add("escolhida");
    c.el.classList.add("escolhido");
    trocarTexto(mensagem, `⭐ ${c.tipo.palavra}`, "aparecer");
    voz.somEFala(c.tipo, `Você escolheu ${c.tipo.nome}! Vamos ver se ${c.tipo.pronome} corre mais!`, contar);
  }

  // 3, 2, 1, Já!
  function contar() {
    const numeros = ["3", "2", "1", "JÁ!"];
    const falas = ["Três!", "Dois!", "Um!", "Já!"];
    numeros.forEach((numero, i) =>
      depois(() => {
        trocarTexto(contagem, numero, "pulou");
        voz.falar(falas[i]);
        if (i === numeros.length - 1) largar();
      }, i * 1100)
    );
    depois(() => (contagem.textContent = ""), numeros.length * 1100);
  }

  function largar() {
    fase = "correndo";
    pista.classList.add("correndo");
    mensagem.textContent = "🏁";
    corredores.forEach((c) => c.el.classList.add("correndo"));
  }

  function cruzouAChegada(c) {
    c.chegou = true;
    chegaram++;
    const lugar = chegaram;
    const medalha = c.el.querySelector(".medalha");
    medalha.textContent = ["🥇", "🥈", "🥉"][lugar - 1] || `${lugar}º`;
    if (lugar === 1) {
      const caixa = c.el.getBoundingClientRect();
      explosao(caixa.left + caixa.width / 2, caixa.top + caixa.height / 2, ["⭐", "✨", "🌟"], 20, 120);
      voz.falar(`${maiuscula(c.tipo.nome)} chegou primeiro!`);
    }
    if (lugar === 3) depois(fimDaCorrida, 1500);
  }

  // Pódio: troféu para o primeiro e a voz dá os parabéns
  function fimDaCorrida() {
    fase = "fim";
    const primeiro = ordem[0];
    const lugarEscolhido = ordem.indexOf(escolhido.tipo) + 1;
    mostrarResultado({ podio: ordem.slice(0, 3) });
    explosao(innerWidth / 2, innerHeight / 2, ["⭐", "✨", "🌟", "🎉", "🎊", "🏆"], 50, 350);

    let frase = `Parabéns! ${maiuscula(primeiro.nome)} é o primeiro!`;
    if (lugarEscolhido === 1) frase += " Você acertou!";
    else
      frase += ` Você escolheu ${escolhido.tipo.nome}. ${maiuscula(escolhido.tipo.pronome)} chegou em ${
        ORDINAIS[lugarEscolhido - 1]
      } lugar.`;
    voz.somEFala(primeiro, frase);
  }

  // Nuvenzinha de poeira atrás dos bichos rápidos
  function soltarPoeira(c) {
    const el = document.createElement("span");
    el.className = "poeira";
    el.textContent = "💨";
    el.style.fontSize = c.tamanho * 0.4 + "px";
    el.style.left = c.x - c.tamanho * 0.2 + "px";
    el.style.top = c.y + c.h * 0.55 + "px";
    pista.appendChild(el);
    depois(() => el.remove(), 700);
  }

  let ultimo = performance.now();

  function mover(agora) {
    const s = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    const m = medidas();
    largada.style.left = m.inicio + "px";
    chegada.style.left = m.fim + "px";
    const comprimento = m.fim - m.inicio;

    for (const c of corredores) {
      // Entrando: anda até a linha de largada
      if (c.recuo > 0) {
        c.recuo = Math.max(0, c.recuo - 380 * s);
        if (c.recuo === 0 && fase !== "correndo") c.el.classList.remove("correndo");
      }

      // Correndo: cada um na sua velocidade, até um pouco depois da chegada
      if ((fase === "correndo" || fase === "fim") && !c.parou) {
        c.p += (c.tipo.velocidade / TEMPO) * s;
        if (!c.chegou && c.p >= 1) cruzouAChegada(c);
        const pMax = 1 + (m.W - 8 - m.fim) / comprimento;
        if (c.p >= pMax) {
          c.p = pMax;
          c.parou = true;
          c.el.classList.remove("correndo");
        }
        if (c.tipo.velocidade >= 6 && !c.parou) {
          c.poeira -= s;
          if (c.poeira <= 0) {
            c.poeira = 0.12 + (10 - c.tipo.velocidade) * 0.04;
            soltarPoeira(c);
          }
        }
      }
      posicionar(c, m);
    }

    quadro = requestAnimationFrame(mover);
  }

  trocarTexto(mensagem, "Corrida dos animais", "aparecer");
  voz.falar("Vamos ver a corrida dos animais!", () => depois(() => entrar(0), 300));
  quadro = requestAnimationFrame(mover);

  // Limpeza: para voz, animação e timers e deixa a pista vazia
  return () => {
    voz.parar();
    cancelAnimationFrame(quadro);
    timers.forEach(clearTimeout);
    corredores.forEach((c) => c.el.remove());
    pista.querySelectorAll(".poeira").forEach((el) => el.remove());
    document.querySelectorAll(".festa").forEach((el) => el.remove());
    raias.forEach((r) => {
      r.className = "raia";
      r.onpointerdown = null;
    });
    pista.className = "pista";
    mensagem.textContent = "";
    mensagem.className = "mensagem";
    contagem.textContent = "";
  };
}
