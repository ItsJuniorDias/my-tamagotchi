import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import Text from "@/components/text";
import { Colors, Radius, Spacing } from "@/constants/theme";

export function IncubatingView() {
  const c = Colors;

  return (
    <View style={styles.wrapper}>
      <BlurView
        intensity={90}
        tint="light"
        style={[styles.card, { borderColor: c.glassBorder, backgroundColor: c.surfaceGlass }]}
      >
        <View style={[styles.glow, { backgroundColor: c.primary }]} />
        <ActivityIndicator size="large" color={c.primary} />
        <Text variant="title" color={c.text} style={{ marginTop: Spacing.base }}>
          Incubating
        </Text>
        <Text variant="body" color={c.textSecondary} style={styles.subtitle}>
          Your companion is taking shape…
        </Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    width: "85%",
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  glow: {
    position: "absolute",
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
    zIndex: -1,
  },
  subtitle: { marginTop: Spacing.sm, textAlign: "center" },
});
