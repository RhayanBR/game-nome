# CLAUDE.md

## O que é este projeto

Apesar do nome do repositório (`clone-tabnews-ai`) e do README (clone do tabnews.com.br para o curso.dev), **o que existe hoje é um app de brincadeiras educativas para uma criança pequena** (a Julia), em português do Brasil. A criança toca na tela, a voz do navegador fala, e os jogos ensinam letras, palavras e nomes de bichos.

- Público: criança que ainda não lê. Tudo precisa funcionar só com toque + voz, sem texto para ler.
- Uso principal: celular/tablet (em pé e deitado). Toques grandes, nada de rolagem.
- Família: Rhayan (Papai), Fatima (Mamãe), Julia (a criança).

## Stack e comandos

- Next.js 16 (App Router) + React 19, JavaScript puro (sem TypeScript, sem testes, sem lint configurado).
- `npm run dev` / `npm run build` / `npm start`.
- Sem backend: tudo roda no navegador. Voz via `speechSynthesis` (Web Speech API); persistência mínima via `localStorage`.

## Estrutura

| Arquivo | Papel |
|---|---|
| `app/layout.js`, `app/page.js` | Casca do Next; título "Nomes", `lang="pt-BR"`. |
| `app/inicio.js` | Menu inicial com 4 botões (Família, Palavras, Encontre os animais, Corrida dos animais) e botão 🏠 para voltar. |
| `app/familia.js` | Jogo **Família**: os 3 nomes (RHAYAN, FATIMA, JULIA) com desenho de cada um (`rostos.js`). |
| `app/palavras.js` | Jogo **Palavras**: 10 palavras com emoji (BICICLETA, SKATE, CARRO…), em ordem embaralhada sem repetir até passar por todas. |
| `app/brincadeira.js` | Motor compartilhado por Família e Palavras (`iniciarBrincadeira(lista, opcoes)`). |
| `app/animais.js` | Jogo **Encontre os animais** (`iniciarCaca`). |
| `app/corrida.js` | Jogo **Corrida dos animais** (`iniciarCorrida`). |
| `app/bichos.js` | Lista dos 18 bichos (`BICHOS`) e sorteio ponderado (`sortearBicho`). |
| `app/voz.js` | Escolha da melhor voz pt-BR (`vozBrasileira`) e helper `criarVoz(depois)` com `falar`, `somEFala`, `parar`. |
| `app/sons.js` | Toca `public/sons/<palavra>.mp3` se existir (máx. 3 s); senão segue em silêncio. |
| `app/rostos.js` | Desenhos SVG/JSX de Papai, Mamãe e Criança. |
| `app/globals.css` | Todo o CSS, separado por seções comentadas por jogo. |
| `public/sons/LEIA-ME.txt` | Instruções para colocar gravações reais dos bichos (nenhum .mp3 está no repo ainda). |
| `index.html` | **Versão antiga e independente** (HTML + JS inline) do jogo de nomes, anterior ao Next. Não é usada pelo app. |

## Como os jogos funcionam

### Família e Palavras (`brincadeira.js`)
- A criança toca nas letras em ordem; a próxima letra pisca e uma mãozinha 👆 pula em cima dela. Só a palavra da vez responde (as próximas ficam clarinhas). A voz soletra usando `nomeDaLetra` (A→"a", B→"be", H→"aga"…).
- Um **bichinho** vem, pega as letras e foge pela tela; a criança precisa tocar no bicho para as letras voltarem. A voz conta o que acontece e lembra de pegar o bicho se ela demora.
- Família: quando os 3 nomes ficam completos → festa (corações, fogos, nomes passeando e batendo nas bordas; tocar num nome faz ele voltar ao lugar).
- Palavras: palavra completa → fogos, o desenho pula e vem a próxima (`opcoes.aoTerminar`). `opcoes.falarNoComeco` fala "Olha a bicicleta! Toca na letra be!".
- Cliques ficam bloqueados enquanto a voz fala.

### Encontre os animais (`animais.js`)
- Bichos entram (por cima/lados) e passeiam pelo pasto; a palavra de um deles aparece no meio e a voz pede para pegá-lo.
- Acertou → festa, o bicho vai pequenininho para o cercadinho do celeiro e o contador sobe. Errou → o bicho balança e a voz diz quem ele é. Demorou → o bicho certo brilha.
- Cada bicho entra uma vez só; bicho pego não volta. Quando todos foram pegos, fim de jogo com botão "Jogar de novo" (troca `rodada` e reinicia do zero).
- Começa com 5 bichos chegando um de cada vez. Bichos do cercadinho só fazem o som deles ao toque.

### Corrida dos animais (`corrida.js`)
- 5 bichos com velocidades distantes entre si (diferença ≥ 1) entram na pista; a criança escolhe quem acha que corre mais; a voz conta "3, 2, 1, Já!".
- `CORREDORES` dá velocidade (caracol 1.0 … cavalo 9.99, inspirado na vida real) e jeito de correr (arrasta, formiguinha, bamboleio, pesado, pulo, trote, galope), cada um com animação CSS e ritmo próprios. `TEMPO = 40` s com velocidade 1.
- No fim: pódio (2º, 1º com troféu, 3º) e botão para correr de novo.

## Convenções importantes

- **Tudo em português**: nomes de variáveis, funções, comentários, commits e textos. Manter esse estilo (ex.: `depois`, `falar`, `explosao`, `medidas`, `mover`).
- Comentários explicam o *porquê* em linguagem simples, do ponto de vista da criança ("ela", "quando ela demora…").
- **Padrão dos jogos**: o componente React só monta a estrutura e chama, num `useEffect`, uma função `iniciarX(elementoRaiz, ...)` que manipula o DOM diretamente (animação com `requestAnimationFrame`, timers, voz). Essa função **devolve uma função de limpeza** que cancela timers/quadros/voz e devolve o DOM ao estado inicial. Timers sempre via um helper `depois(fn, ms)` que registra o id num `Set` para cancelar depois.
- Voz: sempre `lang="pt-BR"`, `rate 0.85`, `pitch 1.2`, com timeout de segurança (`2000 + texto.length * 150` ms) caso o aparelho não tenha voz. Usar um contador (`falaAtual`) para ignorar o "terminou" de falas canceladas.
- Os emojis dos bichos olham para a esquerda; o CSS espelha quando o bicho anda para a direita.
- Cada bicho em `BICHOS` tem `palavra`, `nome` (com artigo), `pronome`, `so` (apelido falado), `no` ("no gato"/"na vaca") e `tamanho` — usados para montar frases faladas com gênero correto. Ao adicionar um bicho, preencher tudo e, se for correr, adicionar em `CORREDORES`.
- `sortearBicho(excluir)` usa peso `(rodadas esperando + 1)³`, nunca repete o último, e guarda o estado em `localStorage` (chave `espera-dos-bichos`), sempre com try/catch.
- Sons falados dos bichos foram removidos de propósito (commit "Tira os sons falados dos bichos"): só gravação real em .mp3 ou nada.
- Layout precisa caber em celular em pé e deitado (há media queries específicas para o menu em 2×2 e para palavras compridas como BICICLETA).

## Histórico resumido

1. Jogo de letras com os nomes da família (começou em `index.html`, depois migrado para Next).
2. Tela inicial com escolha entre Família e Palavras; 18 bichos com sorteio ponderado; desenhos da família.
3. Encontre os animais, depois celeiro/cercadinho, sons via mp3, fim de jogo e correção de bicho sumindo ao entrar.
4. Corrida dos animais.
