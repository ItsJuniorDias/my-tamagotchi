# Conversion Machine — Refactor Notes

## O que mudou no código

### 1. Economia rebalanceada (`constants/gameConfig.tsx`)
Adicionadas todas as constantes de economia num único lugar. Antes tudo estava hardcoded espalhado.

| Variável | Antes | Agora | Por quê |
|---|---|---|---|
| `STARTER_COINS` | 250 (hardcoded) | **40** | Antes dava 25+ ações sem pagar. Agora ~6 ações. |
| `INITIAL_STATS.hunger` | 60 | **25** | Cria necessidade imediata de agir |
| `INITIAL_STATS.happiness` | 40 | **20** | Idem |
| `INITIAL_STATS.energy` | 90 | **35** | Idem |
| `INITIAL_STATS.hygiene` | 100 | **30** | Idem |
| `ACTION_COSTS.feed` | 10 | **8** | Barrier menor pra primeira ação |
| `ACTION_COSTS.clean` | 2 | **5** | Aumenta valor da compra |
| `ACTION_COSTS.play` | 5 | **6** | Ligeiramente mais alto |
| `ACTION_COSTS.sleep` | **0 (Free)** | **3** | Toda ação passa a ter custo |
| `STAMINA_REFILL_COST` | 100 | **40** | Agora é impulso viável, não punição |

Bonus de evolução caiu de 100 stars pra 25 stars — evolução ainda recompensa, mas não zera a pressão de compra.

### 2. Onboarding acessível (`components/swipe-to-start/index.tsx`)
- Trocado o slide-gesture por um **botão de tap** com o mesmo visual.
- Suporte completo a VoiceOver: `accessibilityRole="button"`, label "Begin".
- Idle pulse ainda chama atenção.
- Resposta direta para a review 1-star do usuário cego (20/06/2026).

### 3. Loja reformulada (`components/store-modal/index.tsx`)
- 5 tiers em vez de 2, ordenados do mais barato pro mais caro
- Banner "WELCOME OFFER — ONE TIME" no Starter pack só aparece uma vez por install
- Badges "BEST VALUE" no Chest e "MEGA BONUS" no Mega Vault
- Value-per-dollar exibido nos packs de $4.99+ ("100⭐/$", "150⭐/$")
- Footer de "Secure purchase via App Store" (trust signal)
- ScrollView pra suportar mais tiers no futuro
- Header trocado de "Pet store" pra "Get more stars" — action-oriented

### 4. Action dock (`components/action-dock/index.tsx`)
- Não existe mais label "Free" — sleep mostra "3 ⭐"
- Custos lidos das constantes, não hardcoded na UI
- Botões desabilitados visualmente quando não dá pra pagar
- Acessibilidade completa

### 5. Home screen (`app/(home)/index.tsx`)
- Nova migration v5 → v6 pro AsyncStorage (users existentes não perdem progresso)
- Notification de "low stat" agendada quando qualquer stat cai abaixo de 25
- Purchase handler agora lê dos `STAR_PACKS` (single source of truth)
- First-time offer marcado como visto no primeiro open da store, não só após compra
- Corrigido bug de tipo em `Notifications.scheduleNotificationAsync` (usava string literal, agora usa o enum `SchedulableTriggerInputTypes.TIME_INTERVAL`)

### 6. Acessibilidade em todos os componentes tocados
- Header, PetProfile, ActionDock, StoreModal, SwipeToStart — todos com `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`
- Ícones decorativos marcados `importantForAccessibility="no"` pra não poluir o VoiceOver

---

## O que VOCÊ precisa fazer agora (App Store Connect + RevenueCat)

Sem essas 3 etapas o código dos novos tiers não vai renderizar — vai cair no fallback price mas o RevenueCat vai devolver "package not found" na hora da compra.

### Etapa 1 — Criar 3 novos IAPs no App Store Connect
Vai em App Store Connect → MyTamagotchi → Monetization → In-App Purchases → **+ Create**:

| Product ID | Type | Price Tier | Reference Name |
|---|---|---|---|
| `com.tamagotchi.stars_micro_50` | Consumable | Tier 1 ($0.99 / R$1.90) | Stars — Impulse (50) |
| `com.tamagotchi.stars_starter_200` | Consumable | Tier 2 ($1.99 / R$4.90) | Stars — Starter (200) |
| `com.tamagotchi.stars_mega_5000` | Consumable | Tier 20 ($19.99 / R$99.90) | Stars — Mega Vault (5000) |

Localiza pelo menos em inglês e português (title + description) — Apple rejeita sem isso.

### Etapa 2 — Adicionar no RevenueCat
Em RevenueCat → project "MyTamagotchi" (ou o project que tem esse app):
1. Products → **+ New** — cria os 3 products acima, colando o Store Identifier igual
2. Offerings → current offering → **+ Add package** — adiciona os 3 como packages
   - Identifier interno pode ser `micro`, `starter`, `mega`
   - O que importa é que o `product.identifier` (na resposta do SDK) case com o `id` em `STAR_PACKS`

### Etapa 3 — Testar em sandbox
1. Faz um build novo com `bunx expo run:ios --device`
2. Loga com Sandbox Tester Account em Settings → App Store
3. Abre a store no app — os 5 tiers devem aparecer com preços reais
4. Testa cada compra em sandbox — cada uma deve creditar o número exato de stars

Se algum tier aparecer com preço fallback (ex: "$0.99") em vez do preço real da store, é que o RevenueCat não achou aquele package — provavelmente falta o passo 2.

---

## O que NÃO foi feito (deixado pra depois)

- **Retention loop / daily bonus** — vale adicionar depois, mas não é prioridade 1 pra conversão
- **Streak counter** — mesma coisa
- **Push notification server-side** — a app agenda local só, sem backend
- **Pet-3d acessibilidade** — o 3D é decorativo puro, VoiceOver ignora sem problema
- **Analytics events** — não vi mixpanel/amplitude/PostHog integrado. Se você tá cego pra funnel, considera colar PostHog free tier: eventos de `starter_offer_shown`, `starter_offer_dismissed`, `pack_view`, `pack_tapped`, `purchase_completed`
- **Modo dark do design system** — `Colors.light`/`Colors.dark` são usados em `collapsible.tsx` e `use-theme-color.ts` mas o design system já é light-only. Erros TS pré-existentes, não bloqueiam build.

---

## Resposta pra review do usuário cego

Quando você fizer o submit desta versão, responde a review dele (via ASC → Ratings and Reviews → Respond). Sugestão de resposta em inglês:

> Thank you so much for taking the time to write this — you're right on every point, and this feedback is exactly what pushed us to rewrite the onboarding.
>
> The new version replaces the slide-to-begin with a proper labeled "Begin" button, adds VoiceOver labels and hints to every action, and adds notifications when your pet needs attention. It's not perfect yet — but it's a real step, and we're committed to keep improving it.
>
> If you're up for another try after the update ships, we'd love to hear how it feels.
>
> — Alexandre

Isso costuma reverter reviews 1-star em 4/5-star, especialmente com usuários que escreveram tanto texto construtivo.
