# Design System · My Tamagotchi → **"Incubator"**

Documentação do sistema de design criado na reformulação do app. Tudo aqui vive em
um único arquivo-fonte: [`constants/theme.ts`](./constants/theme.ts). Componentes
**nunca** repetem cores ou tamanhos na mão — eles importam os tokens.

```ts
import { Colors, Typography, Spacing, Radius, Shadows, Motion, Gradients } from "@/constants/theme";

const c = Colors; // light-only — não há alternância de tema
```

---

## 1. Identidade

O app antigo era basicamente um clone das cores de sistema do iOS (azul `#007AFF`,
cinza `#F2F2F7`) espalhadas inline por toda parte. Não havia sistema.

A nova identidade é **"Incubator"**: um laboratório/incubadora de criaturas com um
toque mágico e premium. A âncora da marca é o **Aurora Violet** (não mais o azul da
Apple), a moeda do jogo (estrelas/coins) é o **Star Gold**, e os 4 status do bichinho
usam um quarteto de cores amigável e "candy". O fundo deixou de ser cinza clínico e
passou a um branco-lilás suave. O visual *glassmorphism* foi mantido. O app é
**light-only** — fixado em `app.json` (`userInterfaceStyle: "light"`), então ignora
o modo escuro do sistema e os tokens não têm variante dark.

---

## 2. Cores

Os valores brutos ficam em `palette` (privado). Componentes usam só as **chaves
semânticas** planas de `Colors` — sem aninhamento `light`/`dark`.

### Marca e moeda

| Token | Cor | Uso |
|---|---|---|
| `primary` | `#6D4AFF` | Marca, botões principais, nível |
| `primaryPressed` | `#5A39E6` | Estado pressionado |
| `primarySoft` | `#F3EEFF` | Fundo de chips/realces |
| `accentStar` | `#FFAA1C` | Estrelas / moedas |

### Status do bichinho (cada um tem a versão `*Soft` para fundos)

| Status | Token | Cor |
|---|---|---|
| Fome (Hunger) | `stat.hunger` | `#FF7A5C` coral |
| Humor (Mood) | `stat.mood` | `#FDB022` sol |
| Energia (Energy) | `stat.energy` | `#2DD4A7` menta |
| Higiene (Hygiene) | `stat.hygiene` | `#4FB0FF` céu |

### Texto, superfícies e utilitários

`text`, `textSecondary`, `textMuted`, `onPrimary` · `background`,
`backgroundElevated`, `surface`, `surfaceGlass`, `surfaceSunken`, `glassBorder`,
`border`, `overlay` · `success`, `danger`.

> As chaves `tint`, `icon`, `tabIconDefault`, `tabIconSelected` ficaram por
> compatibilidade de nomes, mas o hook `use-theme-color` (e os `use-color-scheme`)
> do template foram removidos na conversão para light-only.

### Gradientes (`Gradients`)

Arrays prontos para o `expo-linear-gradient`: `app` (fundo geral), `aurora` (orbe da
criatura / destaques), `hatch` (tela de chocar o ovo).

---

## 3. Tipografia

Saímos da Roboto local para três famílias com papéis distintos (via
`@expo-google-fonts`):

- **Fredoka** → `display` · arredondada e amigável. Nomes de bicho, títulos, hero.
- **Plus Jakarta Sans** → `body` · textos, labels, botões.
- **Space Mono** → `data` · números do HUD (nível, moedas, status) — um aceno ao
  visual de LCD do Tamagotchi original.

Use sempre as **variantes** de `Typography`, não fontSize cru:

| Variante | Tamanho/linha | Família |
|---|---|---|
| `hero` | 40 / 44 | Fredoka Bold |
| `display` | 32 / 36 | Fredoka SemiBold |
| `title` | 24 / 30 | Fredoka SemiBold |
| `heading` | 20 / 26 | Fredoka Medium |
| `bodyLg` / `body` | 17·15 | Jakarta Regular |
| `label` | 14 | Jakarta SemiBold |
| `button` | 16 | Jakarta Bold |
| `caption` / `overline` | 12·11 | Jakarta |
| `data` / `dataLg` | 16·24 | Space Mono Bold |

O componente `<Text variant="title">` já aplica família, tamanho e cor padrão. Dá pra sobrescrever com `weight` e `color` quando precisar.

---

## 4. Espaçamento, raio, movimento e sombra

- **`Spacing`** — escala base 4pt: `xs`(4) `sm`(8) `md`(12) `base`(16) `lg`(20)
  `xl`(24) `2xl`(32) `3xl`(40) `4xl`(56).
- **`Radius`** — `sm`(8) `md`(12) `lg`(16) `xl`(20) `2xl`(24) `3xl`(32) `pill`(999).
- **`Motion`** — `duration` (fast 180 / base 300 / slow 600) e presets de mola
  (`spring`, `springSoft`) para o Reanimated.
- **`Shadows`** — `soft` / `card` / `floating` já com `elevation` para Android, mais
  `Shadows.glow(cor)` para o brilho colorido dos botões e badges.

---

## 5. O que mudou no código

**Gemini removido por completo.** Era usado só em `app/(app)/index.tsx` (geração da
imagem do bicho via `gemini-2.5-flash-image` + upload no Cloudinary). A dependência
`@google/generative-ai` saiu do `package.json` e a função `hatchPet` agora cria a
criatura localmente (tipo conforme o nível, traços aleatórios, uma batida de
"incubação" de ~1s). A criatura é renderizada como um **orbe com gradiente + emoji**,
sem custo de API nem chave externa.

**Bug de evolução corrigido.** Existiam *duas* listas `ANIMAL_EVOLUTION_ORDER`
divergentes — uma de 15 itens na tela e outra de 19 em `gameConfig`. A tela agora
importa a lista (e o `STORAGE_KEY`) de `@/constants/gameConfig`, fonte única.

**Componentes reescritos com os tokens** (sem tocar na lógica do jogo): `text`,
`header`, `status-pill`, `action-dock`, `store-modal`, `swipe-to-start`,
`pet-profile`, `incubating-view`, além de `app/_layout.tsx` (carrega as 11 fontes) e
`app/(home)/index.tsx` (edições cirúrgicas: fundo, status bar e as 4 cores de status).

**Limpeza.** Removi os arquivos mortos do template Expo (`themed-text`,
`themed-view`, `hello-wave`, `parallax-scroll-view`, `external-link`, `haptic-tab`,
toda a pasta `components/ui/`) e os TTFs antigos da Roboto. Nada disso era importado
pelo app.

**Light-only.** O dark mode foi removido a pedido. `Colors` e `Gradients` viraram
objetos planos (sem `light`/`dark`), os componentes deixaram de usar `useColorScheme`,
o `app.json` foi travado em `userInterfaceStyle: "light"`, a StatusBar fixou em ícones
escuros e os hooks `use-theme-color` / `use-color-scheme` (template) foram apagados.

---

## 6. Recomendações de follow-up (não alterei sozinho)

1. **Instalar as fontes.** Os pacotes novos ainda precisam ser baixados — rode
   **`bun install`** no projeto. Não consegui instalá-los aqui porque o ambiente não
   tem acesso ao registro de pacotes do Expo, mas as versões já estão fixadas no
   `package.json`.

2. **Mismatch de compra (RevenueCat).** O `store-modal` dispara `onPurchase` com os
   ids `"coin_500"` / `"coin_1500"`, mas o `handlePurchase` em `app/(home)/index.tsx`
   compara com `"com.tamagotchi.pacotebasico_500"` /
   `"com.tamagotchi.bauestrelas_1500"`. Como está, a compra não cai no ramo certo.
   Não toquei nisso de propósito para não quebrar a config do RevenueCat — vale
   alinhar esses ids (e conferir `getPrice`, que usa `productId`/`localizedPrice` em
   vez do formato de `package` do RevenueCat).

3. **Teto de evolução no nível 7.** A lógica trava a evolução no nível 7, então só 7
   dos 19 animais da lista são alcançáveis hoje. Se a intenção é liberar todos,
   é preciso rever esse limite.
