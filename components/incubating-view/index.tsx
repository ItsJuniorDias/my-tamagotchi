import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export function IncubatingView() {
  return (
    <View style={styles.generatingWrapper}>
      <BlurView intensity={90} tint="light" style={styles.glassCard}>
        <View style={styles.siriGlow} />
        <ActivityIndicator size="large" color="#1C1C1E" />
        <Text style={styles.titleLoading}>Incubating</Text>
        <Text style={styles.subtitleLoading}>
          Apple Intelligence is crafting your companion's unique traits...
        </Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  generatingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glassCard: {
    width: "85%",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    position: "relative",
  },
  siriGlow: {
    position: "absolute",
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007AFF",
    opacity: 0.3,
    zIndex: -1,
  },
  titleLoading: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  subtitleLoading: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "rgba(60, 60, 67, 0.6)",
  },
});
