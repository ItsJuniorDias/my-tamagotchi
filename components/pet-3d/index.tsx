import React, { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { PET_MODELS, responsiveScaleFactor } from "../../constants/gameConfig";

// --- EFEITO 1: BANHO (Bolhas subindo) ---
const BathBubbles = ({ count = 25 }) => {
  const groupRef = useRef(null);
  const bubblesData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 4,
      y: Math.random() * -2 - 1.5,
      z: (Math.random() - 0.5) * 4,
      scale: Math.random() * 0.2 + 0.05,
      speed: Math.random() * 2 + 1,
      wobble: Math.random() * 3,
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((bubble, i) => {
      const data = bubblesData[i];
      bubble.position.y += data.speed * delta;
      bubble.position.x +=
        Math.sin(state.clock.elapsedTime * data.wobble + i) * 0.01;
      if (bubble.position.y > 4) {
        bubble.position.y = -2;
        bubble.position.x = (Math.random() - 0.5) * 4;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {bubblesData.map((data, i) => (
        <mesh key={i} position={[data.x, data.y, data.z]} scale={data.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#A8E6CF"
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

// --- EFEITO 2: COMER (Ração caindo) ---
const EatParticles = ({ count = 15 }) => {
  const groupRef = useRef(null);
  const foodData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 2,
      y: Math.random() * 4 + 2, // Começam no alto
      z: (Math.random() - 0.5) * 2,
      scale: Math.random() * 0.1 + 0.05,
      speed: Math.random() * 3 + 2,
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((food, i) => {
      const data = foodData[i];
      food.position.y -= data.speed * delta; // Caem
      food.rotation.x += delta * 2;
      food.rotation.y += delta * 2;
      // Reseta a posição quando chega no chão
      if (food.position.y < -1) {
        food.position.y = Math.random() * 2 + 3;
        food.position.x = (Math.random() - 0.5) * 2;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {foodData.map((data, i) => (
        <mesh key={i} position={[data.x, data.y, data.z]} scale={data.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#D2691E" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// --- EFEITO 3: BRINCAR (Confetes coloridos pulando) ---
const PlayParticles = ({ count = 30 }) => {
  const groupRef = useRef(null);
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"];
  const playData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 5,
      scale: Math.random() * 0.1 + 0.05,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((particle, i) => {
      const data = playData[i];
      particle.rotation.x += delta * 5;
      particle.rotation.y += delta * 5;
      particle.position.x += data.speedX * delta;
      particle.position.y += data.speedY * delta;

      // Mantém os confetes próximos ao pet
      if (particle.position.distanceTo(new THREE.Vector3(0, 0, 0)) > 3) {
        particle.position.set(0, 0, 0);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {playData.map((data, i) => (
        <mesh key={i} position={[data.x, data.y, data.z]} scale={data.scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color={data.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

// --- EFEITO 4: DORMIR (Bolhas de sonho lentas) ---
const SleepParticles = ({ count = 8 }) => {
  const groupRef = useRef(null);
  const sleepData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 3,
      y: Math.random() * 2,
      z: (Math.random() - 0.5) * 3,
      scale: Math.random() * 0.2 + 0.1,
      speed: Math.random() * 0.5 + 0.2, // Muito lento
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((bubble, i) => {
      const data = sleepData[i];
      bubble.position.y += data.speed * delta;
      bubble.position.x += Math.sin(state.clock.elapsedTime + i) * 0.005;

      // Efeito de "pulsar" respirando
      const currentScale =
        data.scale + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
      bubble.scale.set(currentScale, currentScale, currentScale);

      if (bubble.position.y > 4) {
        bubble.position.y = -1;
        bubble.position.x = (Math.random() - 0.5) * 3;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {sleepData.map((data, i) => (
        <mesh key={i} position={[data.x, data.y, data.z]} scale={data.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#1E5BB7" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};

const LoadingHologram = () => {
  const meshRef = useRef(null);
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
  const { scene, animations } = useGLTF(url);
  const groupRef = useRef(null);
  const { actions, names } = useAnimations(animations, groupRef);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (names.length === 0) return;
    const actionName = names[index];
    const action = actions[actionName];
    action?.reset().fadeIn(0.5).play();

    const timeout = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % names.length);
    }, 5000);

    return () => {
      action?.fadeOut(0.5);
      clearTimeout(timeout);
    };
  }, [index, actions, names]);

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
          position={[0, currentConfig.positionY, 0]}
        />
      </group>
    </Float>
  );
};

useGLTF.preload(PET_MODELS.default);

export default function Pet3DViewer({
  type,
  rotationY,
  rotationX,
  panHandlers,
  isBathing = false,
  isEating = false,
  isPlaying = false,
  isSleeping = false,
}) {
  const scaleMultiplier = useRef(1);

  return (
    <View style={styles.petArea} {...panHandlers}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        onCreated={(state) => {
          const _gl = state.gl.getContext();
          const pixelStorei = _gl.pixelStorei.bind(_gl);
          _gl.pixelStorei = function (...args) {
            const [parameter] = args;
            if (parameter === _gl.UNPACK_FLIP_Y_WEBGL)
              return pixelStorei(...args);
          };
        }}
      >
        {/* Controle dinâmico de luz: Apaga as luzes se estiver dormindo */}
        <ambientLight intensity={isSleeping ? 0.2 : 1} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={isSleeping ? 0.3 : 2}
        />

        {/* Desativa o Environment da cidade se estiver dormindo para ficar mais escuro */}
        {!isSleeping && <Environment preset="city" />}

        <Suspense fallback={<LoadingHologram />}>
          <PremiumPet3D
            type={type}
            rotationY={rotationY}
            rotationX={rotationX}
            scaleMultiplier={scaleMultiplier}
          />

          {/* Renderização Condicional das Animações */}
          {isBathing && <BathBubbles />}
          {isEating && <EatParticles />}
          {isPlaying && <PlayParticles />}
          {isSleeping && <SleepParticles />}
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
  );
}

const styles = StyleSheet.create({
  petArea: { flex: 1, marginTop: 10 },
});
