import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";

export function PetProfile({
  tamagotchi,
  petName,
  setPetName,
  onStartJourney,
  onReroll,
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.welcomeWrapper}
    >
      <View style={styles.contentContainer}>
        <BlurView intensity={70} tint="light" style={styles.glassProfileCard}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Welcome Home</Text>
            <TextInput
              style={styles.nameInput}
              value={petName}
              onChangeText={setPetName}
              placeholder="Name your pet..."
              placeholderTextColor="#8E8E93"
              maxLength={14}
              returnKeyType="done"
              clearButtonMode="while-editing"
              textAlign="center"
            />
          </View>

          {tamagotchi?.url && (
            <View style={styles.resultImageContainer}>
              <View style={styles.iosShadow}>
                <Image
                  source={{ uri: tamagotchi.url }}
                  style={styles.resultImage}
                />
              </View>

              <View style={styles.traitsContainer}>
                {tamagotchi.traits?.map((trait, index) => (
                  <View key={index} style={styles.traitPill}>
                    <Text style={styles.traitText}>{trait}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Feather name="zap" size={14} color="#FF9500" />
                  <Text style={styles.statText}>
                    {tamagotchi.energy}% Energy
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Feather name="star" size={14} color="#007AFF" />
                  <Text style={styles.statText}>Lvl {tamagotchi.level}</Text>
                </View>
              </View>
            </View>
          )}
        </BlurView>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.appleButton}
            activeOpacity={0.7}
            onPress={onStartJourney}
          >
            <Text style={styles.appleButtonText}>Start Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rerollButton}
            activeOpacity={0.6}
            onPress={onReroll}
          >
            <Feather name="refresh-cw" size={14} color="#8E8E93" />
            <Text style={styles.rerollButtonText}>Hatch a different pet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  welcomeWrapper: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  glassProfileCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)", // Borda sutil típica de glassmorphism no iOS
  },
  headerTextContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1C1E", // Preto mais suave do sistema iOS
    letterSpacing: 0.36,
    marginBottom: 16,
  },
  nameInput: {
    width: "100%",
    height: 48,
    backgroundColor: "rgba(118, 118, 128, 0.12)", // Cinza padrão de inputs da Apple
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  resultImageContainer: {
    alignItems: "center",
    width: "100%",
  },
  iosShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, // Sombra mais difusa
    shadowRadius: 16,
    elevation: 8, // Para Android
  },
  resultImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  traitsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  traitPill: {
    backgroundColor: "rgba(118, 118, 128, 0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  traitText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3A3A3C",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 6,
  },
  actionContainer: {
    width: "100%",
    alignItems: "center",
  },
  appleButton: {
    width: "100%",
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 14, // Curva contínua estilo squircle do iOS
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  appleButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600", // Padrão de peso para botões primários
    letterSpacing: -0.4,
  },
  rerollButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rerollButtonText: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
  },
});
