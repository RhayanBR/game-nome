# AGENTS.md

## O que é este projeto

Apesar do nome do repositório (`clone-tabnews-ai`) e do README (clone do tabnews.com.br para o curso.dev), este é um **app de brincadeiras educativas para uma criança pequena** (a Julia), em português do Brasil. A criança toca na tela, a voz do navegador fala, e os jogos ensinam letras, palavras e nomes de bichos.

- Público: criança que ainda não lê. Tudo precisa funcionar só com toque + voz, sem texto para ler.
- Uso principal: celular/tablet (em pé e deitado). Toques grandes, nada de rolagem.
- Família: Rhayan (Papai), Fatima (Mamãe), Julia (a criança).

## Stack e comandos

- Next.js (App Router) + React, JavaScript puro (sem TypeScript, sem testes, sem lint configurado).
- `npm run dev` / `npm run build` / `npm start`.
- Sem backend: tudo roda no navegador. Voz via `speechSynthesis` (Web Speech API); persistência mínima via `localStorage`.

## Onde ficam as coisas

- Cada jogo fica num arquivo em `app/`; o menu inicial fica em `app/inicio.js`.
- Jogos de soletrar (Família, Palavras) compartilham o motor `app/brincadeira.js` (`iniciarBrincadeira(lista, opcoes)`): um jogo novo desse tipo deve reutilizá-lo, não copiar.
- Voz: usar sempre `app/voz.js` (`vozBrasileira`, `criarVoz(depois)`), não chamar `speechSynthesis` direto.
- Bichos: lista única em `app/bichos.js` (`BICHOS`, `sortearBicho`).
- Sons: `app/sons.js` toca `public/sons/<palavra>.mp3` se existir; senão segue em silêncio. Ver `public/sons/LEIA-ME.txt`.
- Todo o CSS está em `app/globals.css`, separado por seções comentadas por jogo.
- `index.html` na raiz é uma **versão antiga e independente**, anterior ao Next. Não é usada pelo app; não editar achando que é o jogo.

## Convenções importantes

- **Tudo em português**: nomes de variáveis, funções, comentários, commits e textos. Manter esse estilo (ex.: `depois`, `falar`, `explosao`, `medidas`, `mover`).
- Comentários explicam o *porquê* em linguagem simples, do ponto de vista da criança ("ela", "quando ela demora…").
- **Padrão dos jogos**: o componente React só monta a estrutura e chama, num `useEffect`, uma função `iniciarX(elementoRaiz, ...)` que manipula o DOM diretamente (animação com `requestAnimationFrame`, timers, voz). Essa função **devolve uma função de limpeza** que cancela timers/quadros/voz e devolve o DOM ao estado inicial. Timers sempre via um helper `depois(fn, ms)` que registra o id num `Set` para cancelar depois.
- Voz: sempre `lang="pt-BR"`, `rate 0.85` (nos jogos de soletrar, `1.05`: ela já conhece as letras), `pitch 1.2`, com timeout de segurança (`2000 + texto.length * 150` ms) caso o aparelho não tenha voz. Usar um contador (`falaAtual`) para ignorar o "terminou" de falas canceladas.
- Cliques ficam bloqueados enquanto a voz fala (a criança toca sem parar; sem isso as falas se atropelam). Exceção: nos jogos de soletrar, os bichos podem ser pegos a qualquer hora, mesmo chegando e com a voz falando.
- Nos jogos de soletrar, cada letra nova começa com 1 bicho (sorteado). Se ela toca em todos antes de pegarem a letra (protegeu a letra), vem o dobro do mesmo bicho atrás da **mesma** letra (1, 2, 4, 8, e fica em 8) até algum conseguir pegar. Aí eles ficam andando até ela tocar em todos, a letra volta e passa para a próxima letra.
- Os emojis dos bichos olham para a esquerda; o CSS espelha quando o bicho anda para a direita.
- Cada bicho em `BICHOS` tem `palavra`, `nome` (com artigo), `pronome`, `so` (apelido falado), `no` ("no gato"/"na vaca"), `muitos` (plural sem artigo, "gatos") e `tamanho`, usados para montar frases faladas com gênero correto. Ao adicionar um bicho, preencher tudo e, se ele também participar da corrida, adicioná-lo em `CORREDORES` (`app/corrida.js`).
- `sortearBicho(excluir)` usa peso `(rodadas esperando + 1)³`, nunca repete o último, e guarda o estado em `localStorage` (chave `espera-dos-bichos`). Todo acesso a `localStorage` vai dentro de try/catch.
- Sons de bicho são **só gravação real em .mp3 ou nada**: sons imitados pela voz sintetizada foram removidos de propósito e não devem voltar. Efeitos que não são de bicho (vento, "blonk", musiquinha) podem ser gerados com Web Audio, como em `app/porquinhos.js`.
- O mouse vira uma luvinha (classe `luvinha` no `body`, colocada e tirada pelo jogo) nos jogos de soletrar, na corrida e nos porquinhos; a mão abre em cima do que dá para tocar e fecha ao clicar. Ao criar algo tocável nesses jogos, incluir o seletor nas regras da luvinha em `globals.css`.
- Layout precisa caber em celular em pé e deitado, sem rolagem (há media queries específicas, ex.: menu em 2×2 e palavras compridas como BICICLETA). Testar as duas orientações ao mexer em layout.
