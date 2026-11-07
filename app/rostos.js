// Desenhos da família (no lugar dos emojis, para escolher pele, cabelo e óculos)

const OLHOS = (
  <>
    <circle cx="42" cy="46" r="2.8" fill="#222" />
    <circle cx="58" cy="46" r="2.8" fill="#222" />
  </>
);

function Sorriso({ cor = "#7a3b1a" }) {
  return <path d="M42 56 Q50 63 58 56" stroke={cor} strokeWidth="2.8" fill="none" strokeLinecap="round" />;
}

function Corpo({ pele, roupa }) {
  return (
    <>
      <path d="M12 100 C14 82 30 76 50 76 C70 76 86 82 88 100 Z" fill={roupa} />
      <rect x="43" y="62" width="14" height="16" fill={pele} />
    </>
  );
}

// Papai: pele morena, cabelo escuro bagunçado de surfista e barba por fazer
export function Papai() {
  const pele = "#c68a5a";
  const cabelo = "#24160d";
  return (
    <svg viewBox="0 0 100 100" aria-label="Papai">
      {/* cabelo de trás, cobrindo as orelhas e a nuca */}
      <path d="M25 52 C20 24 35 9 50 9 C65 9 80 24 75 52 C76 58 73 62 70 64 L30 64 C27 62 24 58 25 52 Z" fill={cabelo} />
      {/* ombros largos e pescoço grosso */}
      <path d="M6 100 C8 80 28 74 50 74 C72 74 92 80 94 100 Z" fill="#1e88e5" />
      <path d="M40 74 L50 84 L60 74 Z" fill={pele} />
      <rect x="40" y="60" width="20" height="16" fill={pele} />
      {/* rosto com queixo quadrado */}
      <path d="M30 40 C30 22 70 22 70 40 L70 53 C70 65 61 71 50 71 C39 71 30 65 30 53 Z" fill={pele} />
      {/* barba por fazer */}
      <path d="M30 51 C31 64 40 71 50 71 C60 71 69 64 70 51 C66 57 62 54 58 58 C54 55 46 55 42 58 C38 54 34 57 30 51 Z" fill={cabelo} opacity="0.35" />
      {/* franja bagunçada caindo na testa */}
      <path d="M28 46 L29 30 C32 17 44 12 53 13 C66 14 75 22 72 46 L68 33 L64 37 L60 29 L54 35 L48 28 L42 35 L37 29 L33 37 Z" fill={cabelo} />
      {/* sobrancelhas grossas */}
      <path d="M36 42 L46 41 M54 41 L64 42" stroke={cabelo} strokeWidth="4" strokeLinecap="round" />
      {OLHOS}
      <path d="M43 57 Q50 62 57 57" stroke="#6b2f12" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Mamãe: cabelo comprido e óculos
export function Mamae() {
  const pele = "#f0c39b";
  const cabelo = "#5b3416";
  return (
    <svg viewBox="0 0 100 100" aria-label="Mamãe">
      <path d="M26 46 C20 16 40 8 50 8 C62 8 82 16 74 46 L78 86 L60 86 L60 52 L40 52 L40 86 L22 86 Z" fill={cabelo} />
      <Corpo pele={pele} roupa="#e91e63" />
      <ellipse cx="50" cy="45" rx="20" ry="23" fill={pele} />
      <path d="M29 42 C28 22 40 14 50 14 C62 14 73 22 71 42 C64 34 58 26 50 25 C45 30 37 36 29 42 Z" fill={cabelo} />
      {OLHOS}
      {/* óculos */}
      <g stroke="#222" strokeWidth="2.5" fill="rgba(255,255,255,0.35)">
        <circle cx="41" cy="46" r="7.5" />
        <circle cx="59" cy="46" r="7.5" />
      </g>
      <path d="M48.5 45 Q50 43 51.5 45 M33.5 45 L30 43 M66.5 45 L70 43" stroke="#222" strokeWidth="2.5" fill="none" />
      <Sorriso cor="#c2185b" />
    </svg>
  );
}

// Julia: criança com chuquinhas e laço
export function Crianca() {
  const pele = "#f6cfaa";
  const cabelo = "#6b3e1f";
  return (
    <svg viewBox="0 0 100 100" aria-label="Julia">
      <circle cx="24" cy="40" r="10" fill={cabelo} />
      <circle cx="76" cy="40" r="10" fill={cabelo} />
      <Corpo pele={pele} roupa="#8e24aa" />
      <ellipse cx="50" cy="47" rx="21" ry="22" fill={pele} />
      <path d="M28 44 C26 24 38 16 50 16 C62 16 74 24 72 44 C66 34 56 30 50 32 C44 30 34 34 28 44 Z" fill={cabelo} />
      <path d="M50 18 L40 12 L40 24 Z M50 18 L60 12 L60 24 Z" fill="#e040fb" />
      <circle cx="50" cy="18" r="3" fill="#ab47bc" />
      {OLHOS}
      <circle cx="36" cy="54" r="4" fill="#ff8a80" opacity="0.5" />
      <circle cx="64" cy="54" r="4" fill="#ff8a80" opacity="0.5" />
      <Sorriso cor="#c2185b" />
    </svg>
  );
}
