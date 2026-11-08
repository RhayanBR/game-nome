import { useEffect, useRef, useState } from "react";
import { iniciarBrincadeira } from "./brincadeira";

const PALAVRAS = [
  { palavra: "BICICLETA", efeito: "andar", desenho: "🚲", comArtigo: "a bicicleta", falar: "Bicicleta!", cor: "#1e88e5", festa: "🚲 ⭐ 🎉 ✨" },
  { palavra: "SKATE", efeito: "andar", desenho: "🛹", comArtigo: "o esqueite", falar: "Esqueite!", cor: "#f4511e", festa: "🛹 ⭐ 🎉 ✨" },
  { palavra: "PATINETE", efeito: "andar", desenho: "🛴", comArtigo: "o patinete", falar: "Patinete!", cor: "#00897b", festa: "🛴 ⭐ 🎉 ✨" },
  { palavra: "CARRO", efeito: "andar", desenho: "🚗", comArtigo: "o carro", falar: "Carro! Vrum vrum!", cor: "#e53935", festa: "🚗 💨 ⭐ 🎉" },
  { palavra: "BOLA", efeito: "quicar", desenho: "⚽", comArtigo: "a bola", falar: "Bola!", cor: "#43a047", festa: "⚽ ⭐ 🎉 ✨" },
  { palavra: "CASA", efeito: "pulsar", desenho: "🏠", comArtigo: "a casa", falar: "Casa!", cor: "#6d4c41", festa: "🏠 ❤️ ⭐ 🎉" },
  { palavra: "BOLO", efeito: "balancar", desenho: "🎂", comArtigo: "o bolo", falar: "Bolo! Hummm!", cor: "#d81b60", festa: "🎂 🍰 🎉 ✨" },
  { palavra: "SOL", efeito: "girar", desenho: "☀️", comArtigo: "o sol", falar: "Sol!", cor: "#fb8c00", festa: "☀️ ⭐ 🌟 ✨" },
  { palavra: "LUA", efeito: "balancar", desenho: "🌙", comArtigo: "a lua", falar: "Lua!", cor: "#3949ab", festa: "🌙 ⭐ 🌟 ✨" },
  { palavra: "FLOR", efeito: "pulsar", desenho: "🌸", comArtigo: "a flor", falar: "Flor!", cor: "#8e24aa", festa: "🌸 🌼 🌷 🦋" },
];

// As palavras vêm em ordem embaralhada, sem repetir até passar por todas
function embaralhar(evitarPrimeiro) {
  const ordem = PALAVRAS.map((_, i) => i);
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  if (ordem[0] === evitarPrimeiro) [ordem[0], ordem[1]] = [ordem[1], ordem[0]];
  return ordem;
}

let ordem = null;
let posicao = 0;

function palavraDaVez() {
  if (!ordem) ordem = embaralhar();
  return ordem[posicao];
}

function avancar() {
  const anterior = palavraDaVez();
  posicao++;
  if (posicao >= ordem.length) {
    ordem = embaralhar(anterior);
    posicao = 0;
  }
  return ordem[posicao];
}

export default function Palavras() {
  const [indice, setIndice] = useState(palavraDaVez);
  const listaRef = useRef(null);
  const p = PALAVRAS[indice];

  useEffect(
    () =>
      iniciarBrincadeira(listaRef.current, {
        aoTerminar: () => setIndice(avancar()),
        falarNoComeco: `Olha ${p.comArtigo}! Toca na letra ${p.palavra[0]}!`,
      }),
    [p]
  );

  return (
    <div key={indice} className="jogo-palavras" style={{ "--cor": p.cor }}>
      <div className={`desenho efeito-${p.efeito}`}>{p.desenho}</div>
      <ul ref={listaRef}>
        <li data-falar={p.falar} data-festa={p.festa} data-quantidade={50} style={{ "--cor": p.cor }}>
          {[...p.palavra].map((letra, i) => (
            <span key={i} className="letra">
              {letra}
            </span>
          ))}
        </li>
      </ul>
    </div>
  );
}
