import { FloatingImages } from "@/components/floating-image";
import { IncubatingView } from "@/components/incubating-view";
import { PetProfile } from "@/components/pet-profile";
import { SwipeToStart } from "@/components/swipe-to-start";
import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-url-polyfill/auto";

const STORAGE_KEY = "@my_tamagotchi_data_v5";

// Instância do Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GOOGLE_API_KEY);

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

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tamagotchi, setTamagotchi] = useState(null);
  const [showHome, setShowHome] = useState(false);
  const [petName, setPetName] = useState("");

  const router = useRouter();

  useEffect(() => {
    loadSavedTamagotchi();
  }, []);

  const loadSavedTamagotchi = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData !== null) {
        const parsedData = JSON.parse(savedData);

        const currentPet = parsedData.tamagotchi
          ? parsedData.tamagotchi
          : parsedData;

        setTamagotchi(currentPet);
        setPetName(currentPet.name || "Bubbles");

        // Se já existe um pet, pula a tela de introdução
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

  const handleStartJourney = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (tamagotchi) {
      const finalName = petName.trim() === "" ? "Bubbles" : petName.trim();
      const updatedPet = { ...tamagotchi, name: finalName };

      try {
        const savedString = await AsyncStorage.getItem(STORAGE_KEY);
        let fullData = savedString ? JSON.parse(savedString) : {};

        fullData = { ...fullData, tamagotchi: updatedPet };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));

        setTamagotchi(updatedPet);
      } catch (e) {
        console.error("Failed to save name", e);
      }
    }

    router.push("/(home)");
  };

  const generateTamagotchiIcon = async () => {
    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const geminiImage = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
      });

      const currentLevel = tamagotchi?.level || 1;
      const animalIndex = Math.min(
        currentLevel - 1,
        ANIMAL_EVOLUTION_ORDER.length - 1,
      );
      const targetAnimal = ANIMAL_EVOLUTION_ORDER[animalIndex];

      const appleStylePrompt = `A cute 3D face of a ${targetAnimal}, in the exact style of Apple iOS Memoji and Animoji. Clean minimalist white background, soft studio lighting, high resolution, glossy finish, adorable, highly detailed 3D render.`;

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

        const possibleTraits = [
          "Playful",
          "Curious",
          "Loyal",
          "Brave",
          "Sleepy",
          "Smart",
        ];
        const traits = possibleTraits
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        const newPet = {
          ...tamagotchi,
          url: permanentUrl,
          type: targetAnimal,
          level: currentLevel,
          name: petName || tamagotchi?.name || "Bubbles",
          traits: traits,
          energy: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
        };

        setTamagotchi(newPet);
        await saveTamagotchi({ tamagotchi: newPet });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error generating:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    if (!tamagotchi) {
      setShowHome(true);
      generateTamagotchiIcon();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowHome(true);
    }
  };

  // Envolvemos todo o retorno com o GestureHandlerRootView
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {showHome ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.container, styles.centerContainer]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerKeyboardContainer}>
              <LinearGradient
                colors={["#EAEAF2", "#F2F2F7", "#D1D1D6"]}
                style={StyleSheet.absoluteFill}
              />
              {isGenerating ? (
                <IncubatingView />
              ) : (
                <PetProfile
                  tamagotchi={tamagotchi}
                  petName={petName}
                  setPetName={setPetName}
                  onStartJourney={handleStartJourney}
                  onReroll={generateTamagotchiIcon}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.container}>
          <LinearGradient
            colors={["#F2F2F7", "#FFFFFF", "#F2F2F7"]}
            style={StyleSheet.absoluteFill}
          />
          <FloatingImages />
          <View style={styles.textContainer}>
            <Text style={styles.titleMain}>Tamagotchi</Text>
            <Text style={styles.subtitleMain}>
              Your next-generation virtual{"\n"}companion is waiting.
            </Text>
          </View>
          <SwipeToStart onStart={handleStart} />
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  innerKeyboardContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    top: 40,
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  titleMain: {
    fontSize: 36,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 12,
  },
  subtitleMain: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
  },
});
