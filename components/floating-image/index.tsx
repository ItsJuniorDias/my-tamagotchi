import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

export function FloatingImages() {
  return (
    <View style={styles.imagesContainer}>
      <Image
        style={[styles.baseCard, styles.elephantCard]}
        source={{
          uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772153439/ike059obkqzh8igpzgki.png",
        }}
      />
      <Image
        style={[styles.baseCard, styles.pandaCard]}
        source={{
          uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772153516/dvi8db111k5jyuz5fi3y.png",
        }}
      />
      <Image
        style={[styles.baseCard, styles.geckoCard]}
        source={{
          uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772153655/hdwxdczisd5dsz5okxaz.png",
        }}
      />

      {/* Contêiner separado para a sombra não ser cortada pelo BlurView */}
      <View style={styles.glassShadowWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassBlur}>
          <Image
            style={[styles.baseCard, styles.catCard]}
            source={{
              uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772185857/z1y9ksanzl2lk9jwrhjj.png",
            }}
          />
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... mantive os containers padrões do seu código se você os usar externamente
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
  },
  centerContainer: {
    paddingTop: 0,
  },
  innerKeyboardContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  imagesContainer: {
    height: "45%",
    width: "100%",
    marginTop: 20,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  // Estilo base para todas as cartas (bordas e preenchimento)
  baseCard: {
    borderRadius: 40,
    resizeMode: "cover",
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.95)",
  },

  // Posicionamento específico para as cartas soltas
  elephantCard: {
    position: "absolute",
    top: 10,
    left: width / 2 - 60,
    width: 120,
    height: 170,
    backgroundColor: "#E4A5B8",
    transform: [{ rotate: "-5deg" }, { scale: 0.9 }],
    opacity: 0.9,
  },
  pandaCard: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 120,
    height: 170,
    backgroundColor: "#EAD18D",
    transform: [{ rotate: "-15deg" }],
  },
  geckoCard: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 120,
    height: 170,
    backgroundColor: "#87BFA3",
    transform: [{ rotate: "12deg" }],
  },

  // Wrapper responsável APENAS pela posição, rotação e sombra do Blur
  glassShadowWrapper: {
    position: "absolute",
    top: 130,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 10,
    transform: [{ rotate: "-2deg" }], // Rotação movida para cá
  },

  // O BlurView em si, que precisa ter overflow hidden para respeitar o arredondamento
  glassBlur: {
    borderRadius: 40,
    overflow: "hidden",
  },

  // A carta do gato agora é 'relative' por padrão e apenas define seu tamanho
  catCard: {
    width: 190,
    height: 270,
    backgroundColor: "#77A5D6",
    // Removido o 'position: absolute' e o 'transform' daqui
  },
});
