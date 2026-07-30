# ⚖️ Rollback parcial — Economia MyTamagotchi (30/07/2026)

## Por que reverter

O v6 shipado (com starter 40 + sleep pago + stats iniciais 25/20/35/30) fez
**zero conversões em ~4 dias na loja**. O diagnóstico numérico do porquê:

| Parâmetro | Valor v6 | Efeito |
| --- | --- | --- |
| Starter coins | 40 | ~5-6 ações antes de zerar |
| Stamina | 5 slots, 30 min/slot | 5 ações e trava por 30 min |
| Custo médio ação | 5.5 stars | Starter queima em ~5 ações |
| Stat decay | -1/min | Um dia sem abrir = tudo no zero |
| Sleep cost | 3 stars | Única regen natural também custa |

O jogador novo batia no paywall em **~5 min de sessão**, antes de ter tempo
de estabelecer vínculo com o pet. Sem vínculo emocional não tem compra. E
pior: com stats iniciais em 25/20/35/30, a primeira impressão era "pet em
crise, preciso pagar pra salvar" — em vez de "pet bonitinho, quero cuidar".

Isso é o padrão que gera 1-star review em Kids-adjacent. MyT já tem um
1-star por acessibilidade; um segundo por "app pede dinheiro na cara" seria
o fim do browse (49% dos installs vêm de lá, e browse é 100% rating-driven).

## O que mudou

### 1. `constants/gameConfig.tsx` — 3 constantes

| Variável | v5 (original) | v6 (shipado) | v6.1 (agora) |
| --- | --- | --- | --- |
| `STARTER_COINS` | 250 | 40 | **60** |
| `INITIAL_STATS.hunger` | 60 | 25 | **55** |
| `INITIAL_STATS.happiness` | 40 | 20 | **50** |
| `INITIAL_STATS.energy` | 90 | 35 | **70** |
| `INITIAL_STATS.hygiene` | 100 | 30 | **80** |
| `ACTION_COSTS.sleep` | 0 (Free) | 3 | **0** |

Racional de cada número:

- **Starter 60**: dá ~9-10 ações antes de zerar. Player tem tempo de subir
  os stats do pet uma vez e ver o loop feed → happy → sleep → play antes
  do primeiro trigger de loja. **Não voltamos pros 250 do v5** — aquele
  saldo também não convertia (loja virava decoração).
- **Stats médios (55/50/70/80)**: nenhum abaixo de 50 na entrada. Ainda
  cria alguma urgência (hunger em 55 vai cair rápido com decay), mas
  primeira impressão é "pet feliz" em vez de "pet em crise".
- **Sleep grátis de novo**: é a única regen natural que sustenta o loop
  não-pagante. Gatear sleep é pay-to-not-suffer, não pay-to-skip. Feed
  (8) / clean (5) / play (6) continuam pagos — margem pra loja está lá.

### 2. `components/action-dock/index.tsx` — UI do sleep

- Sleep agora mostra **"Free"** em vez de "3 ⭐" (antes ficaria "0 ⭐"
  literal, esquisito).
- `accessibilityLabel` do sleep: `"Sleep, free"` em vez de
  `"Sleep, costs 0 stars"`.
- `accessibilityHint`: `"Uses 1 energy slot"` (sem menção a stars).
- Outras 3 ações não mudaram.

## O que NÃO mudei

- **`STAMINA_REFILL_COST` (40)** — no starter novo de 60 stars, continua
  sendo uma decisão real: pagar 40 pra continuar OU esperar 30 min. Se o
  refill fosse mais barato, ninguém pagaria por packs.
- **Custos de feed/clean/play (8/5/6)** — margem OK. Player que quer
  brincar muito ainda sente pressão.
- **`STAT_DECAY_INTERVAL` (-1/min)** — brutal em teoria, mas o offline
  decay é acumulativo baseado em `lastSavedTime`, então quem abre uma vez
  por dia perde stats independente do rate. Se virar problema, ajusta.
  Não mexi porque não tá no escopo do "afrouxar early game".
- **Coin packs (5 tiers)** — a tierização em si é boa. O problema não era
  o preço nem o número de opções, era a economia não dar tempo pra vínculo
  emocional.
- **First-time offer flag** — continua no `@my_tamagotchi_first_offer_v6`.
  Quem já dispensou não vê de novo. Se quiser resetar, bump pra v7 (mas aí
  quem comprou também vai ver o banner, o que pode irritar).
- **Evolution bonus (+25 stars)** — magrinho mas OK. Evolução é XP driven,
  não coin-driven.

## Impacto em quem já jogava

**Nenhum stat/coin é confiscado.** A hidratação em `app/(home)/index.tsx`
lê os valores salvos e reidrata — quem tinha 5 stars continua com 5 stars,
quem tinha stats altos continua com stats altos. As mudanças em
`INITIAL_STATS` e `STARTER_COINS` só afetam player NOVO (primeira vez que
abre o app, sem save).

A mudança em `ACTION_COSTS.sleep` afeta **todo mundo daqui pra frente** —
sleep vira grátis pra players antigos e novos. Isso é o efeito desejado.

`STORAGE_KEY` continua `@my_tamagotchi_data_v6`. Não subi pra v7 porque:
- Não estou confiscando nada.
- Não estou introduzindo campo novo no schema.
- Subir a key reseta o first-time offer, o que pode irritar quem já viu.

## O que observar depois do ship

Se o ativo do MyT hoje é o rating (o argumento numérico do CHANGES.md), o
que muda no rating não vai aparecer em 3 dias. Precisa de **umas 2-3
semanas** e uns 40-50 installs novos pra ter sinal. Métricas a olhar:

- **Rating na App Store** — se as próximas 3-5 reviews forem 4-5 stars,
  o rollback funcionou pra retenção. Se vier 1-2 star por "não converto"
  isso é economia MUITO frouxa.
- **Conversion rate ASC** — install → 1ª sessão → 2ª sessão. Se a taxa
  de "volta pra segunda sessão" melhorar, o vínculo tá funcionando.
- **IAP no RevenueCat** — se continuar zero por 3 semanas, o problema
  não é economia. É volume ou é o produto em si.

## Reverter o rollback

Se o cenário mudar e quiser voltar pra tese de aperto, é trivial. Todas
as constantes moram em `constants/gameConfig.tsx`:

```
STARTER_COINS         → 40
INITIAL_STATS         → { hunger: 25, happiness: 20, energy: 35, hygiene: 30 }
ACTION_COSTS.sleep    → 3
```

E no `action-dock/index.tsx`, remove o branch de `a.cost === 0` — mas na
prática só vira código morto se sleep voltar pra pago, então pode ficar.

## Coisas que achei e sinalizo (não mexi)

1. **Ainda não tem funil de compra logado.** Já sinalizei no refactor do
   Pedagogy hoje — vale mais aqui, porque MyT já shippou uma economia
   apertada sem forma de medir onde ela quebra. Sem eventos
   (`store_opened`, `pack_tapped`, `purchase_started`, `purchase_completed`)
   você vai continuar chutando. PostHog free tier resolve em 20 min.

2. **`STAT_DECAY_INTERVAL` de 60s é muito rápido pra estilo de vida real.**
   -60/hora → 24h sem abrir = pet zerado. Isso força uso diário mas
   também gera notification burnout: se player não abre 2 dias, quando
   voltar o pet tá em crise e ele sente culpa. Culpa vira "delete app".
   Considera testar `-1 a cada 2-3 min`, ou com decay que trava em 20
   (nunca zera). Não mexi porque não tava no escopo.

3. **Evolution cap no lvl 7 (12 de 19 animais inalcançáveis).** Ainda tá
   lá. É oportunidade de monetização "unlock the wolf pack" ou "unlock the
   dragon" — desejo em vez de necessidade. Fora do escopo desta mudança
   mas vale planejar pro próximo ciclo.

4. **A migration v5 → v6 permanece.** Quem tinha save v5 e ainda não
   abriu depois do ship do v6 vai migrar direitinho. Quem já migrou não é
   afetado por esta mudança.
