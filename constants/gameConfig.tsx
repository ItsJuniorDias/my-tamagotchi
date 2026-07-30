import { Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────
//  STORAGE
// ─────────────────────────────────────────────────────────────

// Bumped v5 → v6 because we're rebalancing the starter economy.
// v5 users keep their existing coins/stats (see migration in (home)/index.tsx),
// but we key the "seen first-time offer" flag to v6 so returning users get one
// fresh chance at the starter pack.
export const STORAGE_KEY = "@my_tamagotchi_data_v6";
export const LEGACY_STORAGE_KEY = "@my_tamagotchi_data_v5";
export const FIRST_TIME_OFFER_KEY = "@my_tamagotchi_first_offer_v6";
export const ONBOARDED_KEY = "@my_tamagotchi_onboarded_v6";

export const responsiveScaleFactor = Math.min(width / 390, 1.2);

// ─────────────────────────────────────────────────────────────
//  STAMINA (energy-to-act system, separate from pet's energy stat)
// ─────────────────────────────────────────────────────────────
export const MAX_STAMINA = 5;
export const STAMINA_RECHARGE_TIME = 30 * 60 * 1000; // 30 min per slot

// ─────────────────────────────────────────────────────────────
//  ECONOMY — starter + action costs
//
//  Rollback parcial em 30/07/2026: shipado v6 tinha starter 40 + stats
//  25/20/35/30 + sleep pago (3 stars). Zero conversões em ~4 dias porque
//  o player travava em ~5 min (starter + stamina zeravam antes de dar
//  tempo de estabelecer vínculo com o pet). Direção "priorizar retenção":
//  reverte sleep pra grátis, sobe stats iniciais, starter em 60.
//  Não voltamos pros 250 stars do v5 (isso também não convertia). O
//  compromisso: player tem alguns minutos de folga pra se conectar antes
//  de bater na loja.
// ─────────────────────────────────────────────────────────────
export const STARTER_COINS = 60;

// Stats iniciais em zona média (não altos como v5 pra ter algum senso de
// urgência, mas nem no vermelho como v6). Nenhum stat abaixo de 50 na
// entrada — evita a sensação de "pet em crise no primeiro segundo".
// v5 era 60/40/90/100, v6 shipado 25/20/35/30, agora:
export const INITIAL_STATS = {
  hunger: 55,
  happiness: 50,
  energy: 70,
  hygiene: 80,
};

// Sleep volta a ser GRÁTIS — é a única "regen natural" que sustenta o loop
// não-pagante. Gatear sleep vira pay-to-not-suffer em vez de pay-to-skip,
// que é o único F2P que funciona em Kids-adjacent. Os outros custos ficam
// como estão (feed 8 / clean 5 / play 6) — margem pra loja continua.
export const ACTION_COSTS = {
  feed: 8,
  clean: 5,
  play: 6,
  sleep: 0,
};

// Instant stamina refill em stars. Continua em 40 — no starter novo de 60,
// vira uma decisão real: pagar 40 pra continuar OU esperar 30 min.
export const STAMINA_REFILL_COST = 40;

// Threshold for the "low stat" nudge notification.
export const LOW_STAT_THRESHOLD = 25;

// ─────────────────────────────────────────────────────────────
//  IN-APP PURCHASES — RevenueCat product identifiers
//  These MUST match the Product IDs configured in App Store Connect
//  AND the Package/Product identifiers in the RevenueCat dashboard.
//
//  TODO for @alexandre-junior:
//    1. Create the three NEW products in App Store Connect:
//         - com.tamagotchi.stars_micro_50      (Consumable, $0.99  / R$1.90)
//         - com.tamagotchi.stars_starter_200   (Consumable, $1.99  / R$4.90)
//         - com.tamagotchi.stars_mega_5000     (Consumable, $19.99 / R$99.90)
//    2. Add them to the Products section of your RevenueCat project.
//    3. Add each as a Package in the "current" Offering. The identifiers
//       below MUST match the store Product IDs (RevenueCat's "product.identifier").
// ─────────────────────────────────────────────────────────────
export const STAR_PACKS = {
  MICRO: {
    id: "com.tamagotchi.stars_micro_50",
    coins: 50,
    fallbackPrice: "$0.99",
    label: "Impulse pack",
    subtitle: "+50 stars",
  },
  STARTER: {
    id: "com.tamagotchi.stars_starter_200",
    coins: 200,
    fallbackPrice: "$1.99",
    label: "Starter pack",
    subtitle: "+200 stars",
    // 100 stars per dollar. Basic pack is also 100/$, so this is fair —
    // it's the price point, not the ratio, that closes first-time buyers.
  },
  BASIC: {
    id: "com.tamagotchi.pacotebasico_500",
    coins: 500,
    fallbackPrice: "$4.99",
    label: "Basic pack",
    subtitle: "+500 stars",
    // 100 stars per dollar.
  },
  CHEST: {
    id: "com.tamagotchi.bauestrelas_1500",
    coins: 1500,
    fallbackPrice: "$9.99",
    label: "Star chest",
    subtitle: "+1,500 stars",
    // 150 stars per dollar — 50% bonus.
    highlight: "BEST VALUE",
  },
  MEGA: {
    id: "com.tamagotchi.stars_mega_5000",
    coins: 5000,
    fallbackPrice: "$19.99",
    label: "Mega vault",
    subtitle: "+5,000 stars",
    // 250 stars per dollar — 150% bonus.
    highlight: "MEGA BONUS",
  },
} as const;

export type StarPackKey = keyof typeof STAR_PACKS;
export type StarPack = (typeof STAR_PACKS)[StarPackKey];

// Legacy — kept for reference. Prefer STAR_PACKS in new code.
export const itemSKUs = Platform.select({
  ios: Object.values(STAR_PACKS).map((p) => p.id),
});

// ─────────────────────────────────────────────────────────────
//  PET MODELS
// ─────────────────────────────────────────────────────────────
export const ANIMAL_EVOLUTION_ORDER = [
  "Duck",
  "Flamingo",
  "Parrot",
  "Stork",
  "Fox",
  "Pinguin",
  "Wolf",
  "Horse",
  "Ghost",
  "Cat",
  "Bat",
  "Tiger",
  "BlackWolf",
  "Demon",
  "Spider",
  "TRex",
  "DragonRed",
  "Kurama",
  "Dragon",
];

export const PET_MODELS = {
  Flamingo:
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Flamingo.glb",
  Parrot:
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Parrot.glb",
  Horse:
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Horse.glb",
  Stork:
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Stork.glb",

  Ghost:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772372605/Ghost_er1olz.glb",
  Duck: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
  Wolf: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772233497/Wolf_d6xafb.glb",
  Fox: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772234042/Fox_4_ve7htm.glb",
  Cat: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772222873/Kitty_001_jq4gis.glb",
  Bat: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772372579/Bat_lyueku.glb",

  Tiger:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772221921/Tiger_001_fzvav5.glb",
  Pinguin:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772239430/Pinguin_001_ze5aeg.glb",
  BlackWolf:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772288819/WolfBlack_n1btxc.glb",
  Demon:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772288795/Demon_lckgjx.glb",
  Spider:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772288806/Spider_c5xdx7.glb",
  TRex: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772288815/T-Rex_j3w0kk.glb",

  DragonRed:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772372558/Dragon_me1lrz.glb",

  Kurama:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772373178/Kurama_mlw0dw.glb",

  Dragon:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772283735/Dragon_Rigged_xfawyw.glb",
  default:
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
};
