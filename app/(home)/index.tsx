import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ContactShadows,
  Environment,
  Float,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { Suspense, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  LogBox,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as THREE from "three";
import * as RNIap from "react-native-iap"; // Added Apple IAP
import * as Notifications from "expo-notifications"; // Novo: Importação das notificações

import Text from "@/components/text";

const { width, height } = Dimensions.get("window");
const STORAGE_KEY = "@my_tamagotchi_data_v5";
const responsiveScaleFactor = Math.min(width / 390, 1.2);

const MAX_STAMINA = 5;
const STAMINA_RECHARGE_TIME = 30 * 60 * 1000; // 30 Minutos por 1 Ação

const ANIMAL_EVOLUTION_ORDER = [
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

const itemSKUs = Platform.select({
  ios: ["com.tamagotchi.pacotebasico_500", "com.tamagotchi.bauestrelas_1500"],
  android: [],
});

const PET_MODELS = {
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

// 1. Configuração do comportamento da notificação quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const LoadingHologram = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.rotation.x += delta;
    }
  });
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.5, 1]} />
      <meshPhysicalMaterial
        color="#007AFF"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

const PremiumPet3D = ({ type, rotationY, rotationX, scaleMultiplier }) => {
  const url = PET_MODELS[type] || PET_MODELS.Demon || PET_MODELS.default;

  const { scene, animations } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  const { actions, names } = useAnimations(animations, groupRef);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (names.length === 0) return;

    // 1. Pega a animação atual
    const actionName = names[index];
    const action = actions[actionName];

    // 2. Toca a animação com um Crossfade suave
    action?.reset().fadeIn(0.5).play();

    // 3. Define um intervalo para trocar para a próxima animação
    // Aqui trocamos a cada 5 segundos (5000ms)
    const timeout = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % names.length);
    }, 5000);

    // 4. Cleanup: faz o fadeOut da animação atual antes de trocar ou desmontar
    return () => {
      action?.fadeOut(0.5);
      clearTimeout(timeout);
    };
  }, [index, actions, names]);

  let positionY = -0.2;

  const config = {
    [PET_MODELS.Duck]: { scale: 2.5, positionY: -0.2 },
    [PET_MODELS.Flamingo]: { scale: 0.05, positionY: -0.2 },
    [PET_MODELS.Stork]: { scale: 0.05, positionY: -0.2 },
    [PET_MODELS.Horse]: { scale: 0.03, positionY: -0.8 },
    [PET_MODELS.Parrot]: { scale: 0.09, positionY: -0.8 },
    [PET_MODELS.Wolf]: { scale: 1.5, positionY: -0.9 },
    [PET_MODELS.Fox]: { scale: 0.05, positionY: -0.9 },
    [PET_MODELS.Cat]: { scale: 15, positionY: -0.9 },
    [PET_MODELS.Tiger]: { scale: 3.5, positionY: -0.9 },
    [PET_MODELS.Pinguin]: { scale: 3.5, positionY: -0.9 },
    [PET_MODELS.Spider]: { scale: 1.2, positionY: -0.9 },
    [PET_MODELS.Demon]: { scale: 1.5, positionY: -0.9 },
    [PET_MODELS.BlackWolf]: { scale: 4.5, positionY: -0.9 },
    [PET_MODELS.TRex]: { scale: 0.3, positionY: -0.9 },
    [PET_MODELS.Dragon]: { scale: 0.7, positionY: -0.9 },
  };

  const currentConfig = config[url] || { scale: 0.05, positionY: -0.2 };

  const finalScale = currentConfig.scale * responsiveScaleFactor;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotationY.current,
        0.1,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        rotationX.current,
        0.1,
      );

      const currentScale = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, scaleMultiplier.current, 0.1),
      );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <group ref={groupRef}>
        <primitive
          object={scene}
          scale={finalScale}
          position={[0, positionY, 0]}
        />
      </group>
    </Float>
  );
};

useGLTF.preload(PET_MODELS.default);

const StatusPill = ({ label, value, color, icon }) => {
  const animatedFillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${value}%`, { duration: 600 }),
  }));

  return (
    <BlurView intensity={60} tint="light" style={styles.pillContainer}>
      <View style={styles.pillHeader}>
        <MaterialCommunityIcons name={icon} size={16} color={color} />
        <Text style={styles.pillValue}>{Math.round(value)}%</Text>
      </View>
      <View style={styles.pillTrack}>
        <Animated.View
          style={[
            styles.pillFill,
            { backgroundColor: color },
            animatedFillStyle,
          ]}
        />
      </View>
      <Text style={styles.pillLabel}>{label}</Text>
    </BlurView>
  );
};

export default function HomeScreen() {
  const [hunger, setHunger] = useState(60);
  const [happiness, setHappiness] = useState(40);
  const [energy, setEnergy] = useState(90);
  const [coins, setCoins] = useState(250);
  const [xp, setXp] = useState(0);
  const [stamina, setStamina] = useState(MAX_STAMINA);
  const [isStoreVisible, setIsStoreVisible] = useState(false);
  const [products, setProducts] = useState([]);

  const [tamagotchi, setTamagotchi] = useState({
    type: ANIMAL_EVOLUTION_ORDER[0],
    name: "Bubbles",
    level: 1,
  });

  const rotationY = useRef(0);
  const rotationX = useRef(0);
  const startRotationY = useRef(0);
  const startRotationX = useRef(0);

  // 2. Pedir permissão para Notificações ao iniciar
  useEffect(() => {
    async function requestPermissions() {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permission denied!");
        return;
      }
    }
    requestPermissions();
  }, []);

  // 3. Sistema de Agendamento Dinâmico de Notificação
  useEffect(() => {
    const scheduleStaminaNotification = async () => {
      // Limpar notificações antigas para evitar spam se o usuário entrar e sair do app rápido
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (stamina < MAX_STAMINA) {
        // Calcula o tempo exato em segundos até atingir o MAX_STAMINA
        const missingStamina = MAX_STAMINA - stamina;
        const timeToFullSeconds =
          (missingStamina * STAMINA_RECHARGE_TIME) / 1000;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Energy full! ⚡",
            body: `${tamagotchi?.name || "Your pet"} has rested and has ${MAX_STAMINA} actions available. Come play!`,
            sound: true,
          },
          trigger: {
            type: "timeInterval",
            channelId: "stamina-recharge",
            seconds: timeToFullSeconds,
            repeats: false,
          },
        });
      }
    };

    scheduleStaminaNotification();
  }, [stamina, tamagotchi?.name]);

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initIAP = async () => {
      try {
        await RNIap.initConnection();

        if (Platform.OS === "ios") {
          const items = await RNIap.getProducts({ skus: itemSKUs });
          setProducts(items);
        }
      } catch (err) {
        console.warn("Error connecting to the store:", err.message);
      }
    };

    initIAP();

    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        console.log("Purchase updated:", purchase);

        const receipt = purchase.transactionReceipt;

        if (receipt) {
          try {
            if (purchase.productId === "com.seujogo.pacotebasico_500") {
              setCoins((prev) => prev + 500);
            } else if (purchase.productId === "com.seujogo.bauestrelas_1500") {
              setCoins((prev) => prev + 1500);
            }

            await RNIap.finishTransaction({ purchase, isConsumable: true });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success!", "Stars have been added to your account.");
            setIsStoreVisible(false);
          } catch (error) {
            console.error("Error finishing purchase:", error);
          }
        }
      },
    );

    purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.log("Purchase error", error);
      if (error.code !== "E_USER_CANCELLED") {
        Alert.alert("Error", "Purchase failed. Please try again.");
      }
    });

    return () => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
      RNIap.endConnection();
    };
  }, []);

  useEffect(() => {
    const getAsyncStorage = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.tamagotchi) setTamagotchi(parsedData.tamagotchi);
          if (parsedData.hunger !== undefined) setHunger(parsedData.hunger);
          if (parsedData.happiness !== undefined)
            setHappiness(parsedData.happiness);
          if (parsedData.energy !== undefined) setEnergy(parsedData.energy);
          if (parsedData.xp !== undefined) setXp(parsedData.xp);
          if (parsedData.coins !== undefined) setCoins(parsedData.coins);

          if (parsedData.stamina !== undefined) {
            if (parsedData.lastSavedTime) {
              const now = Date.now();
              const timePassed = now - parsedData.lastSavedTime;
              const staminaToRecover = Math.floor(
                timePassed / STAMINA_RECHARGE_TIME,
              );
              const newStamina = Math.min(
                MAX_STAMINA,
                parsedData.stamina + staminaToRecover,
              );
              setStamina(newStamina);
            } else {
              setStamina(parsedData.stamina);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data", error);
      }
    };
    getAsyncStorage();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToSave = {
          tamagotchi,
          hunger,
          happiness,
          energy,
          xp,
          coins,
          stamina,
          lastSavedTime: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error saving data", error);
      }
    };
    saveData();
  }, [tamagotchi, hunger, happiness, energy, xp, coins, stamina]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStamina((prev) => {
        if (prev < MAX_STAMINA) return prev + 1;
        return prev;
      });
    }, STAMINA_RECHARGE_TIME);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (xp >= 100) {
      if (tamagotchi.level >= 7) {
        setXp(100);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const nextLevel = tamagotchi.level + 1;
      const nextAnimal = ANIMAL_EVOLUTION_ORDER[nextLevel - 1];

      setTamagotchi((prev) => ({
        ...prev,
        level: nextLevel,
        type: nextAnimal,
      }));
      setXp((prev) => prev - 100);
      setCoins((prev) => prev + 100);

      Alert.alert(
        "🎉 Evolution!",
        `Your pet evolved to level ${nextLevel} and transformed into a ${nextAnimal}!`,
      );
      rotationY.current = 0;
      rotationX.current = 0;
    }
  }, [xp]);

  const handleAction = (type) => {
    const actionConfig = {
      feed: { staminaCost: 1, coinCost: 10, hungerGained: 15, xpGained: 5 },
      play: {
        staminaCost: 1,
        coinCost: 5,
        happinessGained: 15,
        energyLost: 10,
        xpGained: 8,
      },
      sleep: { staminaCost: 1, coinCost: 0, energyGained: 25, xpGained: 4 },
    };

    const action = actionConfig[type];

    if (stamina < action.staminaCost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsStoreVisible(true);
      return;
    }

    if (coins < action.coinCost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Out of Stars ⭐",
        "You need to buy more stars in the store!",
      );
      setIsStoreVisible(true);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStamina((prev) => prev - action.staminaCost);
    setCoins((prev) => prev - action.coinCost);

    if (type === "feed") {
      setHunger((prev) => Math.min(100, prev + action.hungerGained));
      setXp((prev) => prev + action.xpGained);
    }
    if (type === "play") {
      setHappiness((prev) => Math.min(100, prev + action.happinessGained));
      setEnergy((prev) => Math.max(0, prev - action.energyLost));
      setXp((prev) => prev + action.xpGained);
    }
    if (type === "sleep") {
      setEnergy((prev) => Math.min(100, prev + action.energyGained));
      setXp((prev) => prev + action.xpGained);
    }
  };

  const handlePurchase = async (sku) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await RNIap.requestPurchase({ sku });
    } catch (err) {
      console.warn("Error requesting purchase:", err.message);
      Alert.alert(
        "Warning",
        "Could not start the purchase right now. Check your connection or store configuration.",
      );
    }
  };

  const buyStamina = () => {
    const STAMINA_COST = 100;

    if (stamina >= MAX_STAMINA) {
      Alert.alert("Full Energy", "Your energy is already at maximum!");
      return;
    }
    if (coins < STAMINA_COST) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Insufficient Balance", "You need more stars to buy energy.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCoins((prev) => prev - STAMINA_COST);
    setStamina(MAX_STAMINA);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRotationY.current = rotationY.current;
        startRotationX.current = rotationX.current;
      },
      onPanResponderMove: (_, gestureState) => {
        rotationY.current = startRotationY.current + gestureState.dx * 0.01;
        const newRotX = startRotationX.current + gestureState.dy * 0.01;
        rotationX.current = Math.max(-0.5, Math.min(0.5, newRotX));
      },
    }),
  ).current;

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning,"
      : hour < 18
        ? "Good afternoon,"
        : "Good evening,";

  const animatedXpStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(100, Math.max(0, xp))}%`, { duration: 800 }),
  }));

  return (
    <View style={styles.container}>
      <RNStatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#E8E8ED", "#F2F2F7"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.petName}>{tamagotchi?.name} 🐾</Text>

          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lv.{tamagotchi.level}</Text>
            </View>
            <View style={styles.xpTrack}>
              <Animated.View
                style={[
                  styles.xpFill,
                  animatedXpStyle,
                  { backgroundColor: "#32ADE6" },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.staminaContainer}
            onPress={() => setIsStoreVisible(true)}
          >
            <Text style={styles.staminaLabel}>ACTIONS:</Text>
            {[...Array(MAX_STAMINA)].map((_, i) => (
              <MaterialCommunityIcons
                key={i}
                name="lightning-bolt"
                size={16}
                color={i < stamina ? "#FF9500" : "rgba(0,0,0,0.1)"}
              />
            ))}
            {stamina === 0 && (
              <View style={styles.buyStaminaBadge}>
                <Text style={styles.buyStaminaText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => setIsStoreVisible(true)}
        >
          <BlurView intensity={80} tint="light" style={styles.coinBadge}>
            <MaterialCommunityIcons
              name="star-four-points"
              size={14}
              color="#FF9500"
            />
            <Text style={styles.coinText}>{coins}</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusText}>+</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </View>

      <View style={styles.statusGrid}>
        <StatusPill
          label="Hunger"
          value={hunger}
          color="#FF3B30"
          icon="food-apple"
        />
        <StatusPill
          label="Mood"
          value={happiness}
          color="#FF9500"
          icon="emoticon-happy"
        />
        <StatusPill
          label="Energy"
          value={energy}
          color="#34C759"
          icon="lightning-bolt"
        />
      </View>

      <View style={styles.petArea} {...panResponder.panHandlers}>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          onCreated={(state) => {
            const _gl = state.gl.getContext();
            const pixelStorei = _gl.pixelStorei.bind(_gl);

            _gl.pixelStorei = function (...args) {
              const [parameter] = args;
              switch (parameter) {
                case _gl.UNPACK_FLIP_Y_WEBGL:
                  return pixelStorei(...args);
              }
            };
          }}
        >
          <ambientLight intensity={1} />

          <directionalLight position={[5, 10, 5]} intensity={2} />

          <Environment preset="city" />

          <Suspense fallback={<LoadingHologram />}>
            <PremiumPet3D
              type={tamagotchi?.type}
              rotationY={rotationY}
              rotationX={rotationX}
              scaleMultiplier={useRef(1)}
            />
          </Suspense>

          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.2}
            scale={8}
            blur={2}
            far={4}
            color="#000"
          />
        </Canvas>
      </View>

      <View style={styles.dockWrapper}>
        <BlurView intensity={80} tint="light" style={styles.actionDock}>
          <TouchableOpacity
            style={styles.dockButton}
            onPress={() => handleAction("feed")}
          >
            <View
              style={[
                styles.dockIconCircle,
                { backgroundColor: "rgba(255, 59, 48, 0.15)" },
              ]}
            >
              <MaterialCommunityIcons
                name="food-apple"
                size={24}
                color="#FF3B30"
              />
            </View>
            <Text style={styles.dockLabel}>10 ⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockButton}
            onPress={() => handleAction("play")}
          >
            <View
              style={[
                styles.dockIconCircle,
                {
                  backgroundColor: "rgba(255, 149, 0, 0.15)",
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="controller-classic"
                size={32}
                color="#FF9500"
              />
            </View>
            <Text style={[styles.dockLabel, { marginTop: 4 }]}>5 ⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockButton}
            onPress={() => handleAction("sleep")}
          >
            <View
              style={[
                styles.dockIconCircle,
                { backgroundColor: "rgba(0, 122, 255, 0.15)" },
              ]}
            >
              <MaterialCommunityIcons name="bed" size={24} color="#007AFF" />
            </View>
            <Text style={styles.dockLabel}>Free</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* STORE MODAL */}
      <Modal visible={isStoreVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="light" style={styles.storeContainer}>
            <View style={styles.storeHeader}>
              <Text style={styles.storeTitle} weight="bold">
                Pet Store
              </Text>
              <TouchableOpacity
                onPress={() => setIsStoreVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#1C1C1E" />
              </TouchableOpacity>
            </View>

            <View style={styles.storeItems}>
              <TouchableOpacity style={styles.storeItem} onPress={buyStamina}>
                <View
                  style={[
                    styles.storeItemIcon,
                    { backgroundColor: "rgba(255, 149, 0, 0.15)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={28}
                    color="#FF9500"
                  />
                </View>
                <View style={styles.storeItemInfo}>
                  <Text style={styles.storeItemTitle}>Recharge Energy</Text>
                  <Text style={styles.storeItemDesc}>
                    Refills your 5 actions
                  </Text>
                </View>
                <View style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>100 ⭐</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.storeItem}
                onPress={() => handlePurchase("com.seujogo.pacotebasico_500")}
              >
                <View
                  style={[
                    styles.storeItemIcon,
                    { backgroundColor: "rgba(52, 199, 89, 0.15)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="star-four-points"
                    size={28}
                    color="#34C759"
                  />
                </View>
                <View style={styles.storeItemInfo}>
                  <Text style={styles.storeItemTitle}>Basic Package</Text>
                  <Text style={styles.storeItemDesc}>+500 Stars</Text>
                </View>
                <View
                  style={[styles.buyButton, { backgroundColor: "#007AFF" }]}
                >
                  <Text style={[styles.buyButtonText, { color: "#FFF" }]}>
                    {products.find(
                      (p) => p.productId === "com.seujogo.pacotebasico_500",
                    )?.localizedPrice || "$4.99"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.storeItem}
                onPress={() => handlePurchase("com.seujogo.bauestrelas_1500")}
              >
                <View
                  style={[
                    styles.storeItemIcon,
                    { backgroundColor: "rgba(175, 82, 222, 0.15)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="treasure-chest"
                    size={28}
                    color="#AF52DE"
                  />
                </View>
                <View style={styles.storeItemInfo}>
                  <Text style={styles.storeItemTitle}>Star Chest</Text>
                  <Text style={styles.storeItemDesc}>+1500 Stars</Text>
                </View>
                <View
                  style={[styles.buyButton, { backgroundColor: "#007AFF" }]}
                >
                  <Text style={[styles.buyButtonText, { color: "#FFF" }]}>
                    {products.find(
                      (p) => p.productId === "com.seujogo.bauestrelas_1500",
                    )?.localizedPrice || "$9.99"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7", paddingHorizontal: 24 },
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "flex-end", gap: 12 },
  greetingText: {
    color: "rgba(60, 60, 67, 0.6)",
    fontSize: 14,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  petName: {
    color: "#000",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  levelBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  xpTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 3,
    maxWidth: 120,
    overflow: "hidden",
  },
  xpFill: { height: "100%", borderRadius: 3 },
  staminaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 2,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  staminaLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(60, 60, 67, 0.6)",
    marginRight: 4,
    letterSpacing: 1,
  },
  buyStaminaBadge: {
    backgroundColor: "#FF3B30",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  buyStaminaText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    gap: 6,
  },
  coinText: { color: "#1C1C1E", fontWeight: "700", fontSize: 14 },
  plusBadge: {
    backgroundColor: "#007AFF",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { color: "#FFF", fontSize: 12, fontWeight: "900", lineHeight: 14 },
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  pillContainer: {
    width: (width - 64) / 3,
    padding: 14,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  pillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pillTrack: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  pillFill: { height: "100%", borderRadius: 2 },
  pillLabel: {
    color: "rgba(60, 60, 67, 0.6)",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
  pillValue: { color: "#1C1C1E", fontWeight: "700", fontSize: 14 },
  petArea: { flex: 1, marginTop: 10 },
  dockWrapper: {
    marginBottom: 40,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  actionDock: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  dockButton: { alignItems: "center", justifyContent: "center" },
  dockIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  dockLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(60, 60, 67, 0.8)",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  storeContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 50,
    overflow: "hidden",
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  storeTitle: { fontSize: 24, fontWeight: "700", color: "#1C1C1E" },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  storeItems: { gap: 16 },
  storeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  storeItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  storeItemInfo: { flex: 1 },
  storeItemTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  storeItemDesc: {
    fontSize: 14,
    color: "rgba(60, 60, 67, 0.6)",
    fontWeight: "500",
  },
  buyButton: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buyButtonText: { fontSize: 16, fontWeight: "700", color: "#1C1C1E" },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 8,
  },
});
