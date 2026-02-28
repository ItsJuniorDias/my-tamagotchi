import { Feather } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur"; // Novo: Para efeito de vidro
import { LinearGradient } from "expo-linear-gradient"; // Novo: Para fundo premium
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import "react-native-url-polyfill/auto";

const { width } = Dimensions.get("window");
// Ajuste fino da área de swipe para caber perfeitamente no novo design
const SWIPE_CONTAINER_WIDTH = width * 0.85;
const KNOB_SIZE = 56;
const SWIPE_RANGE = SWIPE_CONTAINER_WIDTH - KNOB_SIZE - 12; // 12 é o padding
const STORAGE_KEY = "@my_tamagotchi_data";

const genAI = new GoogleGenerativeAI("AIzaSyBs_yliDm_I_gF7-dpRogtEDPgYHOyIjGI");

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tamagotchi, setTamagotchi] = useState(null);
  const [showHome, setShowHome] = useState(false);

  const router = useRouter();
  const translateX = useSharedValue(0);

  useEffect(() => {
    loadSavedTamagotchi();
  }, []);

  const loadSavedTamagotchi = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData !== null) {
        setTamagotchi(JSON.parse(savedData));
        setShowHome(true);
      }
    } catch (e) {
      console.error("Failed to load tamagotchi", e);
    }
  };

  const saveTamagotchi = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save tamagotchi", e);
    }
  };

  const generateTamagotchiIcon = async () => {
    setIsGenerating(true);
    try {
      const geminiImage = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
      });

      const animals = [
        "Flamingo",
        "Parrot",
        "Horse",
        "Stork",
        "Duck",
        "Wolf",
        "Fox",
        "Stag",
      ];

      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

      const appleStylePrompt = `A cute 3D face of a ${randomAnimal}, in the exact style of Apple iOS Memoji and Animoji. Clean minimalist white background, soft studio lighting, high resolution, glossy finish, adorable, highly detailed 3D render.`;

      const storyImageResult = await geminiImage.generateContent({
        contents: [{ role: "user", parts: [{ text: appleStylePrompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      });

      const storyImagePart =
        storyImageResult?.response?.candidates[0]?.content.parts.find(
          (p) => p.inlineData,
        );

      if (storyImagePart) {
        const permanentUrl = await uploadGeminiToCloudinary(
          storyImagePart?.inlineData?.data,
        );
        const newPet = { url: permanentUrl, type: randomAnimal };
        setTamagotchi(newPet);
        await saveTamagotchi(newPet);
      }
    } catch (error) {
      console.error("Error generating:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadGeminiToCloudinary = async (base64String) => {
    const CLOUD_NAME = "dqvujibkn";
    const UPLOAD_PRESET = "ai-generated-images";
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", `data:image/png;base64,${base64String}`);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(url, { method: "POST", body: formData });
      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary Error:", err);
    }
  };

  const handleStart = () => {
    setShowHome(true);
    generateTamagotchiIcon();
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 0 && event.translationX < SWIPE_RANGE) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_RANGE * 0.75) {
        translateX.value = withSpring(SWIPE_RANGE, {
          damping: 15,
          stiffness: 150,
        });
        runOnJS(handleStart)();
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: 1 - translateX.value / (SWIPE_RANGE / 2),
    transform: [{ translateX: translateX.value * 0.1 }], // Leve parallax no texto
  }));

  // Renderização condicional para as telas "Home/Gerando"
  if (showHome) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <LinearGradient
          colors={["#E8E8ED", "#F2F2F7", "#FFFFFF"]}
          style={StyleSheet.absoluteFill}
        />
        {isGenerating ? (
          <View style={styles.generatingWrapper}>
            <BlurView intensity={80} tint="light" style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.titleLoading}>Incubating...</Text>
              <Text style={styles.subtitle}>
                Using Apple Intelligence to create your new friend
              </Text>
            </BlurView>
          </View>
        ) : (
          <View style={styles.welcomeWrapper}>
            <Text style={styles.title}>Welcome Home</Text>
            <Text style={styles.subtitleHome}>
              Say hello to your new {tamagotchi?.type}.
            </Text>

            {tamagotchi?.url && (
              <View style={styles.resultImageContainer}>
                <Image
                  source={{ uri: tamagotchi.url }}
                  style={styles.resultImage}
                />
                <View style={styles.imageGlow} />
              </View>
            )}

            <TouchableOpacity
              style={styles.appleButton}
              activeOpacity={0.8}
              onPress={() => router.push("/(home)")}
            >
              <LinearGradient
                colors={["#007AFF", "#0056B3"]}
                style={styles.appleButtonGradient}
              >
                <Text style={styles.appleButtonText}>Start Journey</Text>
                <Feather name="chevron-right" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#E2E2EA", "#F2F2F7", "#F9F9FB"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.imagesContainer}>
          <Image
            style={[styles.card, styles.elephantCard]}
            source={{
              uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772153439/ike059obkqzh8igpzgki.png",
            }}
          />
          <Image
            style={[styles.card, styles.pandaCard]}
            source={{
              uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772153516/dvi8db111k5jyuz5fi3y.png",
            }}
          />
          <Image
            style={[styles.card, styles.geckoCard]}
            source={{
              uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772153655/hdwxdczisd5dsz5okxaz.png",
            }}
          />
          <BlurView intensity={20} tint="light" style={styles.glassWrapper}>
            <Image
              style={[styles.card, styles.catCard]}
              source={{
                uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772185857/z1y9ksanzl2lk9jwrhjj.png",
              }}
            />
          </BlurView>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleMain}>Tamagotchi</Text>
          <Text style={styles.subtitleMain}>
            Your next-generation virtual{"\n"}companion is waiting.
          </Text>
        </View>

        {/* Swipe Track com BlurView para efeito Dynamic Island/iOS */}
        <View style={styles.swipeOuterContainer}>
          <BlurView intensity={60} tint="light" style={styles.swipeTrack}>
            <Animated.View style={[styles.textOverlay, animatedTextStyle]}>
              <Text style={styles.swipeText}>slide to begin</Text>
            </Animated.View>

            <GestureDetector gesture={gesture}>
              <Animated.View style={[styles.swipeKnob, animatedButtonStyle]}>
                <Feather name="arrow-right" size={24} color="#1D1D1F" />
              </Animated.View>
            </GestureDetector>
          </BlurView>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
  },
  centerContainer: {
    justifyContent: "center",
    paddingTop: 0,
  },
  imagesContainer: {
    height: "45%",
    width: "100%",
    marginTop: 30,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    borderRadius: 36,
    resizeMode: "cover",
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.9)",
  },
  glassWrapper: {
    position: "absolute",
    top: 130,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  elephantCard: {
    top: 10,
    left: width / 2 - 60,
    width: 120,
    height: 170,
    backgroundColor: "#E4A5B8",
    transform: [{ rotate: "-5deg" }, { scale: 0.9 }],
    opacity: 0.9,
  },
  pandaCard: {
    top: 50,
    left: 20,
    width: 120,
    height: 170,
    backgroundColor: "#EAD18D",
    transform: [{ rotate: "-15deg" }],
  },
  geckoCard: {
    top: 60,
    right: 20,
    width: 120,
    height: 170,
    backgroundColor: "#87BFA3",
    transform: [{ rotate: "12deg" }],
  },
  catCard: {
    width: 180,
    height: 260,
    backgroundColor: "#77A5D6",
    transform: [{ rotate: "-2deg" }],
  },
  textContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 30,
  },
  titleMain: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1D1D1F",
    letterSpacing: -1.2,
    marginBottom: 12,
  },
  subtitleMain: {
    fontSize: 18,
    fontWeight: "500",
    color: "#86868B",
    textAlign: "center",
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  swipeOuterContainer: {
    marginTop: 60,
    width: SWIPE_CONTAINER_WIDTH,
    height: KNOB_SIZE + 12,
    borderRadius: (KNOB_SIZE + 12) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  swipeTrack: {
    flex: 1,
    borderRadius: (KNOB_SIZE + 12) / 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
  },
  swipeKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  textOverlay: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  swipeText: {
    color: "#86868B",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginLeft: 20, // Compensa o knob visualmente
  },
  generatingWrapper: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingCard: {
    padding: 40,
    borderRadius: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
  },
  titleLoading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D1D1F",
    marginTop: 24,
    marginBottom: 8,
  },
  welcomeWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#1D1D1F",
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitleHome: {
    fontSize: 18,
    color: "#86868B",
    fontWeight: "500",
    marginBottom: 40,
  },
  resultImageContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  resultImage: {
    width: 280,
    height: 280,
    borderRadius: 140, // Redondo puro estilo contato do iOS
    backgroundColor: "#FFFFFF",
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.8)",
    zIndex: 2,
  },
  imageGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#007AFF",
    opacity: 0.15,
    filter: "blur(40px)", // Se suportado, senão o shadow faz o trabalho
    zIndex: 1,
  },
  appleButton: {
    width: "80%",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  appleButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 100,
    gap: 8,
  },
  appleButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.2,
  },
});
