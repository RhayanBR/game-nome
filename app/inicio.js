"use client";

import { useState } from "react";
import Familia from "./familia";
import Palavras from "./palavras";
import Animais from "./animais";
import Corrida from "./corrida";
import Porquinhos from "./porquinhos";
import Monstrinho from "./monstrinho";

export default function Inicio() {
  const [jogo, setJogo] = useState(null);

  if (!jogo) {
    return (
      <div className="menu">
        <button className="escolha" style={{ "--cor": "#e91e63" }} onClick={() => setJogo("familia")}>
          <span className="figura">👨‍👩‍👧</span>
          Família
        </button>
        <button className="escolha" style={{ "--cor": "#1e88e5" }} onClick={() => setJogo("palavras")}>
          <span className="figura">🚲</span>
          Palavras
        </button>
        <button className="escolha" style={{ "--cor": "#43a047" }} onClick={() => setJogo("animais")}>
          <span className="figura">🐾</span>
          Encontre os animais
        </button>
        <button className="escolha" style={{ "--cor": "#ff7043" }} onClick={() => setJogo("corrida")}>
          <span className="figura">🏁</span>
          Corrida dos animais
        </button>
        <button className="escolha" style={{ "--cor": "#8e24aa" }} onClick={() => setJogo("porquinhos")}>
          <span className="figura">🐷</span>
          Três porquinhos
        </button>
        <button className="escolha" style={{ "--cor": "#00897b" }} onClick={() => setJogo("monstrinho")}>
          <span className="figura">🍎</span>
          Monstrinho
        </button>
      </div>
    );
  }

  return (
    <>
      <button className="voltar" onClick={() => setJogo(null)} aria-label="Voltar ao início">
        🏠
      </button>
      {jogo === "familia" && <Familia />}
      {jogo === "palavras" && <Palavras />}
      {jogo === "animais" && <Animais />}
      {jogo === "corrida" && <Corrida />}
      {jogo === "porquinhos" && <Porquinhos />}
      {jogo === "monstrinho" && <Monstrinho />}
    </>
  );
}
