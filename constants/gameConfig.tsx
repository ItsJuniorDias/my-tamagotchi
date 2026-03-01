import { Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

export const STORAGE_KEY = "@my_tamagotchi_data_v5";
export const responsiveScaleFactor = Math.min(width / 390, 1.2);
export const MAX_STAMINA = 5;
export const STAMINA_RECHARGE_TIME = 30 * 60 * 1000;

export const ANIMAL_EVOLUTION_ORDER = [
  "Duck",
  "Flamingo",
  "Parrot",
  "Stork",
  "Fox",
  "Pinguin",
  "Wolf",
  "Horse",
  "Cat",
  "Tiger",
  "BlackWolf",
  "Demon",
  "Spider",
  "TRex",
  "Dragon",
];

export const itemSKUs = Platform.select({
  ios: ["com.tamagotchi.pacotebasico_500", "com.tamagotchi.bauestrelas_1500"],
  android: [],
});

export const PET_MODELS = {
  Flamingo:
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Flamingo.glb",
  Parrot:
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Parrot.glb",
  Horse:
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Horse.glb",
  Stork:
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Stork.glb",
  Duck: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
  Wolf: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772233497/Wolf_d6xafb.glb",
  Fox: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772234042/Fox_4_ve7htm.glb",
  Cat: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772222873/Kitty_001_jq4gis.glb",
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
  Dragon:
    "https://res.cloudinary.com/dqvujibkn/image/upload/v1772283735/Dragon_Rigged_xfawyw.glb",
  default:
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
};
