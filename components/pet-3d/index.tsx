import React, { Suspense, useEffect, useRef, useState } from "react";
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
        <ambientLight intensity={1} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <Environment preset="city" />
        <Suspense fallback={<LoadingHologram />}>
          <PremiumPet3D
            type={type}
            rotationY={rotationY}
            rotationX={rotationX}
            scaleMultiplier={scaleMultiplier}
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
  );
}

const styles = StyleSheet.create({
  petArea: { flex: 1, marginTop: 10 },
});
