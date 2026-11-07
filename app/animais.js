import { useEffect, useRef } from "react";
import { sortearBicho } from "./bichos";
import { criarVoz } from "./voz";

// "Encontre os animais": os bichos andam num pasto cercado, a palavra de um
// deles aparece no meio e a voz pede para pegar esse bicho.
export default function Animais() {
  const pastoRef = useRef(null);

  useEffect(() => iniciarCaca(pastoRef.current), []);

  return (
    <div className="pasto" ref={pastoRef}>
      {/* Cerca com uma porteira no meio de cada lado */}
      <div className="cerca h cima a" />
      <div className="cerca h cima b" />
      <div className="cerca h baixo a" />
      <div className="cerca h baixo b" />
      <div className="cerca v esquerda a" />
      <div className="cerca v esquerda b" />
      <div className="cerca v direita a" />
      <div className="cerca v direita b" />
      <div className="palavra-alvo" />
    </div>
  );
}

const QUANTOS = 5; // sempre pelo menos 5 bichos andando
const CERCA = 26; // grossura da cerca, em pixels (igual ao CSS)
const PORTAS = ["cima", "baixo", "esquerda", "direita"];

function iniciarCaca(pasto) {
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
  let animais = [];
  let alvo = null; // o bicho que ela precisa pegar agora
  let comemorando = false;
  let tempoDica = 0;

  function tamanhoDaTela() {
    return { W: pasto.clientWidth, H: pasto.clientHeight };
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
    const { W, H } = tamanhoDaTela();
    const base = Math.min(W, H) / 9;
    return Math.max(44, base * (0.8 + (tipo.tamanho - 3) * 0.08));
  }

  // Onde o bicho fica logo do lado de fora da porteira, e para onde é "para dentro"
  function foraDaPorta(porta, a) {
    const { W, H } = tamanhoDaTela();
    if (porta === "cima") return { x: W / 2 - a.w / 2, y: -a.h, dx: 0, dy: 1 };
    if (porta === "baixo") return { x: W / 2 - a.w / 2, y: H, dx: 0, dy: -1 };
    if (porta === "esquerda") return { x: -a.w, y: H / 2 - a.h / 2, dx: 1, dy: 0 };
    return { x: W, y: H / 2 - a.h / 2, dx: -1, dy: 0 };
  }

  // A porteira mais perto do bicho (para ele ir embora por ela)
  function portaMaisPerto(a) {
    const { W, H } = tamanhoDaTela();
    const cx = a.x + a.w / 2;
    const cy = a.y + a.h / 2;
    return [
      { porta: "cima", x: W / 2 - a.w / 2, y: CERCA, d: cy },
      { porta: "baixo", x: W / 2 - a.w / 2, y: H - CERCA - a.h, d: H - cy },
      { porta: "esquerda", x: CERCA, y: H / 2 - a.h / 2, d: cx },
      { porta: "direita", x: W - CERCA - a.w, y: H / 2 - a.h / 2, d: W - cx },
    ].sort((p, q) => p.d - q.d)[0];
  }

  function novaDirecao(a) {
    const angulo = Math.random() * Math.PI * 2;
    a.vx = Math.cos(angulo) * a.velocidade;
    a.vy = Math.sin(angulo) * a.velocidade;
    a.tempoParaVirar = 2 + Math.random() * 3;
  }

  function posicionar(a) {
    if (a.vx > 0) a.el.classList.add("direita");
    else if (a.vx < 0) a.el.classList.remove("direita");
    a.el.style.transform = `translate(${a.x}px, ${a.y}px)`;
  }

  // Um bicho novo entra por uma das 4 porteiras
  function entrarAnimal(porta = PORTAS[Math.floor(Math.random() * PORTAS.length)]) {
    const tipo = sortearBicho(animais.map((a) => a.tipo.emoji));
    const el = document.createElement("div");
    el.className = "animal";
    el.dataset.palavra = tipo.palavra;
    el.style.fontSize = tamanhoDoBicho(tipo) + "px";
    el.innerHTML = `<div class="corpo"><span class="sacode"><span class="passo">${tipo.emoji}</span></span></div>`;
    pasto.appendChild(el);

    const caixa = el.getBoundingClientRect();
    const a = {
      el, tipo,
      w: caixa.width,
      h: caixa.height,
      estado: "entrando",
      velocidade: 60 + Math.random() * 40,
      tempoParaVirar: 0,
    };
    const p = foraDaPorta(porta, a);
    a.x = p.x;
    a.y = p.y;
    a.vx = p.dx * 130;
    a.vy = p.dy * 130;
    el.addEventListener("pointerdown", (evento) => tocar(a, evento));
    animais.push(a);
    posicionar(a);
  }

  // Escolhe um dos bichos que estão no pasto e mostra a palavra dele
  function novoAlvo(primeiro) {
    const candidatos = animais.filter((a) => a.estado !== "saindo");
    if (!candidatos.length) return;
    alvo = candidatos[Math.floor(Math.random() * candidatos.length)];
    tempoDica = 0;
    cartao.textContent = alvo.tipo.palavra;
    cartao.classList.remove("aparecer", "acertou");
    void cartao.offsetWidth; // recomeça a animação
    cartao.classList.add("aparecer");
    voz.falar(primeiro ? `Vamos brincar! Pega ${alvo.tipo.nome}!` : `Agora pega ${alvo.tipo.nome}!`);
  }

  function tocar(a, evento) {
    evento.preventDefault();
    evento.stopPropagation();
    if (comemorando || !alvo || a.estado === "saindo") return;

    if (a !== alvo) {
      // Bicho errado: ele balança e a voz diz quem é
      a.el.classList.remove("errou");
      void a.el.offsetWidth;
      a.el.classList.add("errou");
      voz.falar(`Esse é ${a.tipo.nome}! Pega ${alvo.tipo.nome}!`);
      return;
    }

    // Acertou! Festa, o bicho sai feliz pela porteira e entra outro
    comemorando = true;
    alvo = null;
    const caixa = a.el.getBoundingClientRect();
    explosao(caixa.left + caixa.width / 2, caixa.top + caixa.height / 2, ["⭐", "✨", "🌟", "🎉"], 30);
    a.el.classList.remove("dica", "errou");
    a.el.classList.add("feliz");
    cartao.classList.add("acertou");

    const p = portaMaisPerto(a);
    a.estado = "saindo";
    a.fase = "indo-para-porta";
    a.saida = p.porta;
    a.destino = { x: p.x, y: p.y };

    entrarAnimal();
    voz.falar(`Aee! Você pegou ${a.tipo.nome}!`, () => {
      comemorando = false;
      novoAlvo(false);
    });
  }

  let ultimo = performance.now();

  function mover(agora) {
    const s = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    const { W, H } = tamanhoDaTela();

    for (const a of [...animais]) {
      if (a.estado === "entrando") {
        a.x += a.vx * s;
        a.y += a.vy * s;
        // Anda um pouco para dentro da cerca antes de começar a passear
        const dentro = 40;
        if (
          a.x >= CERCA + dentro && a.y >= CERCA + dentro &&
          a.x + a.w <= W - CERCA - dentro && a.y + a.h <= H - CERCA - dentro
        ) {
          a.estado = "andando";
          novaDirecao(a);
        }
      } else if (a.estado === "andando") {
        a.tempoParaVirar -= s;
        if (a.tempoParaVirar <= 0) novaDirecao(a);
        a.x += a.vx * s;
        a.y += a.vy * s;
        // Bate na cerca e volta
        const maxX = W - CERCA - a.w;
        const maxY = H - CERCA - a.h;
        if (a.x < CERCA) { a.x = CERCA; a.vx = Math.abs(a.vx); }
        if (a.x > maxX) { a.x = maxX; a.vx = -Math.abs(a.vx); }
        if (a.y < CERCA) { a.y = CERCA; a.vy = Math.abs(a.vy); }
        if (a.y > maxY) { a.y = maxY; a.vy = -Math.abs(a.vy); }
      } else if (a.estado === "saindo") {
        const rapido = 260;
        if (a.fase === "indo-para-porta") {
          const dx = a.destino.x - a.x;
          const dy = a.destino.y - a.y;
          const d = Math.hypot(dx, dy);
          if (d <= rapido * s) {
            // Chegou na porteira: sai reto para fora
            a.x = a.destino.x;
            a.y = a.destino.y;
            a.fase = "saindo-pela-porta";
            const p = foraDaPorta(a.saida, a);
            a.vx = -p.dx * rapido;
            a.vy = -p.dy * rapido;
          } else {
            a.vx = (dx / d) * rapido;
            a.vy = (dy / d) * rapido;
            a.x += a.vx * s;
            a.y += a.vy * s;
          }
        } else {
          a.x += a.vx * s;
          a.y += a.vy * s;
          if (a.x < -a.w - 20 || a.x > W + 20 || a.y < -a.h - 20 || a.y > H + 20) {
            a.el.remove();
            animais = animais.filter((b) => b !== a);
            continue;
          }
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

  // Começo: os 5 primeiros bichos entram um de cada vez, por porteiras diferentes
  const portasDoComeco = [...PORTAS].sort(() => Math.random() - 0.5);
  portasDoComeco.push(PORTAS[Math.floor(Math.random() * PORTAS.length)]);
  for (let i = 0; i < QUANTOS; i++) {
    depois(() => entrarAnimal(portasDoComeco[i]), i * 700);
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
  };
}
