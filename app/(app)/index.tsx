import { Feather } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text, // Usando o Text nativo ou mantenha o seu @/components/text se tiver fontes customizadas
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
const SWIPE_RANGE = width * 0.65;
const STORAGE_KEY = "@my_tamagotchi_data";

// Lembre-se de colocar isso em um arquivo .env depois!
const genAI = new GoogleGenerativeAI("AIzaSyCc9cKtFkHeOyPPo7MFGlxxgHxdZ6O6c-A");

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

      const animals = ["Flamingo", "Parrot", "Horse", "Stork", "Duck"];

      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

      // PROMPT ALTERADO PARA O ESTILO APPLE (Memoji/Animoji)
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
      if (translateX.value > SWIPE_RANGE * 0.7) {
        translateX.value = withSpring(SWIPE_RANGE);
        runOnJS(handleStart)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: 1 - translateX.value / (SWIPE_RANGE / 1.5),
  }));

  if (showHome) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        {isGenerating ? (
          <>
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.title}>Generating...</Text>
            <Text style={styles.subtitle}>Creating your new friend</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Welcome Home</Text>
            {tamagotchi?.url && (
              <Image
                source={{ uri: tamagotchi.url }}
                style={styles.resultImage}
              />
            )}
            <Text style={styles.subtitle}>
              Your {tamagotchi?.type} is happy to see you.
            </Text>

            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => router.push("/(home)")}
            >
              <Text style={styles.appleButtonText}>Start Game</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
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
          <Image
            style={[styles.card, styles.catCard]}
            source={{
              uri: "https://res.cloudinary.com/dqvujibkn/image/upload/v1772185857/z1y9ksanzl2lk9jwrhjj.png",
            }}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Tamagotchi</Text>
          <Text style={styles.subtitle}>
            Your new friend is already{"\n"}waiting for you.
          </Text>
        </View>

        <View style={styles.swipeContainer}>
          <Animated.View style={[styles.textOverlay, animatedTextStyle]}>
            <Text style={styles.swipeText}>slide to start</Text>
          </Animated.View>

          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.swipeButton, animatedButtonStyle]}>
              <Feather name="arrow-right" size={24} color="#007AFF" />
            </Animated.View>
          </GestureDetector>
        </View>

        {/* <Button title="Generate tamagotchi" onPress={generateTamagotchiIcon} /> */}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Cinza super claro clássico do iOS
    alignItems: "center",
    paddingTop: 80,
  },
  imagesContainer: {
    height: "50%",
    width: "100%",
    marginTop: 20,
    position: "relative",
  },
  card: {
    position: "absolute",
    borderRadius: 32, // Cantos bem arredondados (squircle)
    resizeMode: "cover",
    borderWidth: 4,
    borderColor: "#FFFFFF", // Borda branca estilo Apple
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1, // Sombra suave e difusa
    shadowRadius: 16,
    elevation: 8,
  },
  elephantCard: {
    top: 20,
    left: width / 2 - 55,
    width: 110,
    height: 160,
    backgroundColor: "#E4A5B8",
  },
  pandaCard: {
    top: 60,
    left: 20,
    width: 110,
    height: 160,
    backgroundColor: "#EAD18D",
  },
  geckoCard: {
    top: 60,
    right: 20,
    width: 110,
    height: 160,
    backgroundColor: "#87BFA3",
  },
  catCard: {
    top: 140,
    left: width / 2 - 80,
    width: 160,
    height: 240,
    backgroundColor: "#77A5D6",
    transform: [{ rotate: "-8deg" }], // Rotação mais suave
  },
  textContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  title: {
    fontSize: 34,
    fontWeight: "700", // iOS bold padrão
    color: "#1C1C1E", // Quase preto
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17, // Tamanho de corpo padrão da Apple
    color: "#8E8E93", // Cinza clássico de subtítulo da Apple
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  swipeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    width: "85%",
    height: 64,
    borderRadius: 32,
    marginTop: 50,
    paddingHorizontal: 8,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  swipeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F2F7", // Botão sutil
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textOverlay: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  swipeText: {
    color: "#C7C7CC",
    fontSize: 17,
    fontWeight: "400",
  },
  resultImage: {
    width: 250,
    height: 250,
    borderRadius: 40,
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  appleButton: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  appleButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
});
