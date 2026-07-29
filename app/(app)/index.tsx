import { FloatingImages } from "@/components/floating-image";
import { IncubatingView } from "@/components/incubating-view";
import { PetProfile } from "@/components/pet-profile";
import { SwipeToStart } from "@/components/swipe-to-start";
import Text from "@/components/text";
import { Colors, Gradients, Spacing } from "@/constants/theme";
import { ANIMAL_EVOLUTION_ORDER, STORAGE_KEY } from "@/constants/gameConfig";
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
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TRAIT_POOL = ["Playful", "Curious", "Loyal", "Brave", "Sleepy", "Smart", "Gentle", "Bold"];

function rollTraits(count = 3) {
  return [...TRAIT_POOL].sort(() => 0.5 - Math.random()).slice(0, count);
}

function petTypeForLevel(level: number) {
  const i = Math.min(Math.max(level - 1, 0), ANIMAL_EVOLUTION_ORDER.length - 1);
  return ANIMAL_EVOLUTION_ORDER[i];
}

export default function App() {
  const c = Colors;

  const [isHatching, setIsHatching] = useState(false);
  const [tamagotchi, setTamagotchi] = useState<any>(null);
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
        const currentPet = parsedData.tamagotchi ?? parsedData;
        setTamagotchi(currentPet);
        setPetName(currentPet.name || "Bubbles");
        setShowHome(true); // skip intro when a pet already exists
      }
    } catch (e) {
      console.error("Failed to load tamagotchi", e);
    }
  };

  const saveTamagotchi = async (pet: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tamagotchi: pet }));
    } catch (e) {
      console.error("Failed to save tamagotchi", e);
    }
  };

  // Create / re-roll a pet locally — no external image generation.
  const hatchPet = async () => {
    setIsHatching(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const level = tamagotchi?.level || 1;
    const newPet = {
      ...tamagotchi,
      type: petTypeForLevel(level),
      level,
      name: petName || tamagotchi?.name || "Bubbles",
      traits: rollTraits(),
      energy: Math.floor(Math.random() * 41) + 60, // 60–100
    };

    // Short, satisfying "incubation" beat before revealing the pet.
    setTimeout(async () => {
      setTamagotchi(newPet);
      await saveTamagotchi(newPet);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsHatching(false);
    }, 1100);
  };

  const handleStart = () => {
    setShowHome(true);
    if (!tamagotchi) hatchPet();
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartJourney = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tamagotchi) {
      const finalName = petName.trim() === "" ? "Bubbles" : petName.trim();
      const updatedPet = { ...tamagotchi, name: finalName };
      try {
        const savedString = await AsyncStorage.getItem(STORAGE_KEY);
        const fullData = savedString ? JSON.parse(savedString) : {};
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...fullData, tamagotchi: updatedPet }),
        );
        setTamagotchi(updatedPet);
      } catch (e) {
        console.error("Failed to save name", e);
      }
    }
    router.push("/(home)");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {showHome ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.container, styles.center]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <LinearGradient colors={Gradients.hatch} style={StyleSheet.absoluteFill} />
              {isHatching ? (
                <IncubatingView />
              ) : (
                <PetProfile
                  tamagotchi={tamagotchi}
                  petName={petName}
                  setPetName={setPetName}
                  onStartJourney={handleStartJourney}
                  onReroll={hatchPet}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      ) : (
        <View style={[styles.container, { backgroundColor: c.background }]}>
          <LinearGradient colors={Gradients.app} style={StyleSheet.absoluteFill} />
          <FloatingImages />
          <View
            style={styles.textContainer}
            accessible
            accessibilityRole="header"
            accessibilityLabel="My Tamagotchi. Virtual creature lab. Hatch, raise and evolve your own pocket companion."
          >
            <Text variant="overline" color={c.primary} style={styles.eyebrow}>
              VIRTUAL CREATURE LAB
            </Text>
            <Text variant="hero" color={c.text} style={styles.titleMain}>
              Tamagotchi
            </Text>
            <Text variant="bodyLg" color={c.textSecondary} style={styles.subtitleMain}>
              Hatch, raise and evolve your own{"\n"}pocket companion.
            </Text>
          </View>
          <SwipeToStart onStart={handleStart} />
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  inner: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center" },
  textContainer: { top: 40, alignItems: "center", paddingHorizontal: Spacing.lg, marginBottom: 60 },
  eyebrow: { marginBottom: Spacing.sm },
  titleMain: { marginBottom: Spacing.md, textAlign: "center" },
  subtitleMain: { textAlign: "center" },
});
