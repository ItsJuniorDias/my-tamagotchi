import React, { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  useAnimations,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { PET_MODELS, responsiveScaleFactor } from "../../constants/gameConfig";

// --- EFEITO 2: COMER (Ração caindo) ---
const EatParticles = ({ count = 15 }) => {
  const groupRef = useRef(null);
  const foodData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 2,
      y: Math.random() * 4 + 2,
      z: (Math.random() - 0.5) * 2,
      scale: Math.random() * 0.1 + 0.05,
      speed: Math.random() * 3 + 2,
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((food, i) => {
      const data = foodData[i];
      if (!data) return;

      food.position.y -= data.speed * delta;
      food.rotation.x += delta * 2;
      food.rotation.y += delta * 2;

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
      if (!data) return;

      particle.rotation.x += delta * 5;
      particle.rotation.y += delta * 5;
      particle.position.x += data.speedX * delta;
      particle.position.y += data.speedY * delta;

      if (particle.position.length() > 3) {
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

// --- HOLOGRAMA DE CARREGAMENTO ---
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

// --- PET 3D PRINCIPAL ---
const PremiumPet3D = ({ type, rotationY, rotationX, scaleMultiplier }) => {
  const url = PET_MODELS[type] || PET_MODELS.default;
  const { scene, animations } = useGLTF(url);
  const groupRef = useRef(null);
  const { actions, names } = useAnimations(animations, groupRef);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!names || names.length === 0) return;
    const actionName = names[index];
    const action = actions[actionName];

    if (action) {
      action.reset().fadeIn(0.5).play();
    }

    const timeout = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % names.length);
    }, 5000);

    return () => {
      if (action) action.fadeOut(0.5);
      clearTimeout(timeout);
    };
  }, [index, actions, names]);

  const config = {
    Duck: { scale: 2.5, positionY: -0.2 },
    Flamingo: { scale: 0.05, positionY: -0.2 },
    Stork: { scale: 0.05, positionY: -0.2 },
    Horse: { scale: 0.03, positionY: -0.8 },
    Parrot: { scale: 0.09, positionY: -0.8 },
    Wolf: { scale: 1.5, positionY: -0.9 },
    Fox: { scale: 0.05, positionY: -0.9 },
    Cat: { scale: 15, positionY: -0.9 },
    Bat: { scale: 1.2, positionY: -0.9 },
    Ghost: { scale: 1.7, positionY: -0.9 },
    Tiger: { scale: 3.5, positionY: -0.9 },
    Pinguin: { scale: 3.5, positionY: -0.9 },
    Spider: { scale: 1.2, positionY: -0.9 },
    Demon: { scale: 1.5, positionY: -0.9 },
    BlackWolf: { scale: 4.5, positionY: -0.9 },
    TRex: { scale: 0.3, positionY: -0.9 },
    DragonRed: { scale: 0.03, positionY: -0.9 },
    Kurama: { scale: 2.5, positionY: -0.9 },
    Dragon: { scale: 0.7, positionY: -0.9 },
  };

  const currentConfig = config[type] || { scale: 0.05, positionY: -0.2 };
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

// --- NOVA SOMBRA REDONDA E SUAVE (FEITA COM CÓDIGO/SHADER) ---
const FakeRoundShadow = ({ opacity = 0.4, scale = 4, positionY = -1.79 }) => {
  // Criamos um material customizado que desenha um gradiente radial preto transparente
  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uColor: { value: new THREE.Color("#000000") },
        uOpacity: { value: opacity },
      },
      vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uColor;
      uniform float uOpacity;
      void main() {
        // Calcula a distância do centro (0.5, 0.5)
        float dist = distance(vUv, vec2(0.5));
        
        // Cria um degradê suave (esfumaçado) das bordas para o centro
        // Borda (0.5) fica transparente, centro (0.1) fica opaco
        float alpha = smoothstep(0.5, 0.1, dist) * uOpacity;
        
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
      transparent: true,
      depthWrite: false,
      blending: THREE.MultiplyBlending, // Faz a sombra escurecer o chão de forma natural
    }),
    [opacity],
  );

  return (
    <mesh
      position={[0, positionY, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[scale, scale, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial args={[shaderArgs]} />
    </mesh>
  );
};

// --- COMPONENTE PRINCIPAL EXPORTADO ---
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

  // Ajuste o tamanho da sombra dependendo do tipo de pet, se necessário
  const shadowConfig = {
    Horse: { positionY: -1.79, scale: 5 },
    Cat: { positionY: -1.79, scale: 3.5 },
  };
  const currentShadow = shadowConfig[type] || { positionY: -1.79, scale: 4 };

  return (
    <View style={styles.petArea} {...panHandlers}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        onCreated={(state) => {
          const _gl = state.gl.getContext();
          const pixelStorei = _gl.pixelStorei.bind(_gl);
          _gl.pixelStorei = function (...args) {
            const [parameter] = args;
            if (parameter === _gl.UNPACK_FLIP_Y_WEBGL) return;
            return pixelStorei(...args);
          };
        }}
      >
        <ambientLight intensity={isSleeping ? 0.2 : 1} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={isSleeping ? 0.3 : 2}
        />

        <Suspense fallback={<LoadingHologram />}>
          <PremiumPet3D
            type={type}
            rotationY={rotationY}
            rotationX={rotationX}
            scaleMultiplier={scaleMultiplier}
          />

          {/* Sombra agora fica dentro do Suspense porque carrega uma textura */}
          <FakeRoundShadow
            opacity={isSleeping ? 0.15 : 0.4}
            scale={currentShadow.scale}
            positionY={currentShadow.positionY}
          />

          {isEating && <EatParticles />}
          {isPlaying && <PlayParticles />}
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  petArea: { flex: 1, marginTop: 10 },
});
