"use client";

import { useState } from "react";
import Familia from "./familia";
import Palavras from "./palavras";
import Animais from "./animais";
import Corrida from "./corrida";

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
    </>
  );
}
