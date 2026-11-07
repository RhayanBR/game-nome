import { useEffect, useRef } from "react";
import { iniciarBrincadeira } from "./brincadeira";
import { Crianca, Mamae, Papai } from "./rostos";

const NOMES = [
  {
    nome: "Rhayan",
    foto: <Papai />,
    falar: "Raian, o Papai!",
    festa: "❤️ 💥 ❤️ 💥 🎉 ⭐",
    quantidade: 40,
    cor: "#1e88e5",
  },
  {
    nome: "Fatima",
    foto: <Mamae />,
    falar: "Fátima, a Mamãe! Mamãe te ama!",
    festa: "❤️ 💖 💕 💗 💓 💞 💘",
    quantidade: 90,
    cor: "#e91e63",
  },
  {
    nome: "Julia",
    foto: <Crianca />,
    falar: "Júlia, a Julinha!",
    festa: "❤️ 💜 ⭐ 🌟 🎉 ✨",
    quantidade: 50,
    cor: "#8e24aa",
  },
];

export default function Familia() {
  const listaRef = useRef(null);

  useEffect(() => iniciarBrincadeira(listaRef.current), []);

  return (
    <ul ref={listaRef}>
      {NOMES.map((n) => (
        <li
          key={n.nome}
          data-falar={n.falar}
          data-festa={n.festa}
          data-quantidade={n.quantidade}
          style={{ "--cor": n.cor }}
        >
          <span className="foto">{n.foto}</span>
          {[...n.nome.toUpperCase()].map((letra, i) => (
            <span key={i} className="letra">
              {letra}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}
