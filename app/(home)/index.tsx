import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ContactShadows, Environment, Float, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  StatusBar as RNStatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as THREE from "three";

import Text from "@/components/text"; // Mantendo seu import customizado

const { width, height } = Dimensions.get("window");
const STORAGE_KEY = "@my_tamagotchi_data";
const responsiveScaleFactor = Math.min(width / 390, 1.2);

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
  default:
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
};

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
  const url = PET_MODELS[type] || PET_MODELS.default;
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  let baseScale = 0.05;
  let positionY = -0.2;

  if (url === PET_MODELS.Stork || url === PET_MODELS.Flamingo) {
    baseScale = 0.05;
    positionY = -0.2;
  }
  if (url === PET_MODELS.Duck) {
    baseScale = 2.5;
    positionY = -0.2;
  }
  if (url === PET_MODELS.Horse) {
    baseScale = 0.03;
    positionY = -0.8;
  }
  if (url === PET_MODELS.Parrot) {
    baseScale = 0.09;
    positionY = -0.8;
  }

  const finalScale = baseScale * responsiveScaleFactor;

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
      const targetScale = scaleMultiplier.current;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      groupRef.current.scale.setScalar(nextScale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <group ref={groupRef}>
        <primitive
          object={clonedScene}
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
        <Text style={styles.pillValue}>{value}%</Text>
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
  const [coins, setCoins] = useState(1250); // Novo estado de moedas
  const [xp, setXp] = useState(75); // Novo estado de XP (0 a 100)

  const [tamagotchi, setTamagotchi] = useState({
    type: "Duck",
    name: "Bubbles",
    level: 5,
  });

  const rotationY = useRef(0);
  const rotationX = useRef(0);
  const startRotationY = useRef(0);
  const startRotationX = useRef(0);

  useEffect(() => {
    getAsyncStorage();
  }, []);

  const getAsyncStorage = async () => {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedData) setTamagotchi(JSON.parse(storedData));
  };

  const handleAction = (type) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (type === "feed") {
      setHunger((prev) => Math.min(100, prev + 25));
      setXp((prev) => Math.min(100, prev + 5));
    }
    if (type === "play") {
      setHappiness((prev) => Math.min(100, prev + 25));
      setEnergy((prev) => Math.max(0, prev - 10));
      setXp((prev) => Math.min(100, prev + 10));
    }
    if (type === "sleep") {
      setEnergy((prev) => Math.min(100, prev + 40));
    }
  };

  const handleCyclePet = () => {
    const animalKeys = Object.keys(PET_MODELS).filter((k) => k !== "default");
    const currentIndex = animalKeys.indexOf(tamagotchi.type);
    const nextIndex = (currentIndex + 1) % animalKeys.length;
    setTamagotchi((prev) => ({ ...prev, type: animalKeys[nextIndex] }));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rotationY.current = 0;
    rotationX.current = 0;
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

  // Saudação dinâmica baseada na hora
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning,"
      : hour < 18
        ? "Good afternoon,"
        : "Good evening,";

  // Animação para a barra de XP
  const animatedXpStyle = useAnimatedStyle(() => ({
    width: withTiming(`${xp}%`, { duration: 800 }),
  }));

  return (
    <View style={styles.container}>
      <RNStatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#E8E8ED", "#F2F2F7"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header Atualizado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.petName}>{tamagotchi?.name} 🐾</Text>

          {/* Nova Barra de XP/Nível */}
          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lv.{tamagotchi.level}</Text>
            </View>
            <View style={styles.xpTrack}>
              <Animated.View style={[styles.xpFill, animatedXpStyle]} />
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Novo Badge de Moedas */}
          <BlurView intensity={80} tint="light" style={styles.coinBadge}>
            <MaterialCommunityIcons
              name="star-four-points"
              size={14}
              color="#FF9500"
            />
            <Text style={styles.coinText}>{coins}</Text>
          </BlurView>

          <TouchableOpacity
            style={styles.profileCircle}
            onPress={handleCyclePet}
          >
            <Feather name="refresh-cw" size={18} color="#1C1C1E" />
          </TouchableOpacity>
        </View>
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
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 10, 5]} intensity={2} />
          <Environment preset="city" />
          <Suspense fallback={<LoadingHologram />}>
            <PremiumPet3D
              key={tamagotchi.type}
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

      {/* Dock Refinado com Texto e Fundo de Ícones */}
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
            <Text style={styles.dockLabel}>Feed</Text>
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
            <Text style={[styles.dockLabel, { marginTop: 4 }]}>Play</Text>
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
            <Text style={styles.dockLabel}>Sleep</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 12,
  },
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
  levelBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  xpTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 3,
    maxWidth: 120,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
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
    gap: 4,
  },
  coinText: {
    color: "#1C1C1E",
    fontWeight: "700",
    fontSize: 14,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
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
  pillFill: {
    height: "100%",
    borderRadius: 2,
  },
  pillLabel: {
    color: "rgba(60, 60, 67, 0.6)",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
  pillValue: {
    color: "#1C1C1E",
    fontWeight: "700",
    fontSize: 14,
  },
  petArea: {
    flex: 1,
    marginTop: 10,
  },
  dockWrapper: {
    marginBottom: 40,
    borderRadius: 36, // Bordas mais arredondadas estilo Dynamic Island
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
    alignItems: "flex-end", // Alinha pela base para acomodar o botão central maior
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  dockButton: {
    alignItems: "center",
    justifyContent: "center",
  },
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
    fontWeight: "600",
    color: "rgba(60, 60, 67, 0.8)",
  },
});
