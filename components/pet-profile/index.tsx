import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
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
    <View style={styles.welcomeWrapper}>
      <BlurView intensity={85} tint="light" style={styles.glassProfileCard}>
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
                <Feather name="zap" size={16} color="#FF9500" />
                <Text style={styles.statText}>{tamagotchi.energy}% Energy</Text>
              </View>
              <View style={styles.statBox}>
                <Feather name="star" size={16} color="#007AFF" />
                <Text style={styles.statText}>Lvl {tamagotchi.level}</Text>
              </View>
            </View>
          </View>
        )}
      </BlurView>

      <TouchableOpacity
        style={styles.appleButton}
        activeOpacity={0.8}
        onPress={onStartJourney}
      >
        <Text style={styles.appleButtonText}>Start Journey</Text>
        <Feather
          name="chevron-right"
          size={18}
          color="#FFFFFF"
          style={{ marginTop: 2 }}
        />
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
  );
}

// Mova os estilos correspondentes para cá.
const styles = StyleSheet.create({
  welcomeWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  glassProfileCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  headerTextContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  nameInput: {
    width: "80%",
    height: 40,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333333",
  },
  resultImageContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  iosShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  resultImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  traitsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 15,
  },
  traitPill: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  traitText: {
    fontSize: 12,
    color: "#333333",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
  },
  statText: {
    fontSize: 14,
    color: "#333333",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  appleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  rerollButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  rerollButtonText: {
    color: "#8E8E93",
    fontSize: 14,
    marginLeft: 6,
  },
});
