import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "@/components/text";
import { Colors, Radius, Shadows, Spacing } from "@/constants/theme";

export default function ActionDock({ onAction }: any) {
  const c = Colors;

  // Each action is tinted with the stat it changes.
  const actions = [
    { key: "feed", icon: "food-apple", color: c.stat.hunger, label: "10 ⭐" },
    { key: "clean", icon: "shower", color: c.stat.hygiene, label: "2 ⭐" },
    { key: "play", icon: "controller-classic", color: c.primary, label: "5 ⭐", hero: true },
    { key: "sleep", icon: "weather-night", color: c.stat.energy, label: "Free" },
  ] as const;

  return (
    <View style={[styles.wrapper, { borderColor: c.glassBorder }, Shadows.card]}>
      <BlurView
        intensity={60}
        tint="light"
        style={[styles.dock, { backgroundColor: c.surfaceGlass }]}
      >
        {actions.map((a) => (
          <TouchableOpacity key={a.key} style={styles.button} activeOpacity={0.7} onPress={() => onAction(a.key)}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: a.color + "26" },
                a.hero && styles.iconCircleHero,
              ]}
            >
              <MaterialCommunityIcons name={a.icon as any} size={a.hero ? 28 : 24} color={a.color} />
            </View>
            <Text variant="label" color={c.textSecondary} weight="bold" style={[styles.label, a.hero && { marginTop: 4 }]}>
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 40, borderRadius: Radius["3xl"], overflow: "hidden", borderWidth: 1 },
  dock: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingVertical: Spacing.base, paddingHorizontal: Spacing.lg },
  button: { alignItems: "center", justifyContent: "center" },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 6 },
  iconCircleHero: { width: 58, height: 58, borderRadius: 29, marginBottom: 0 },
  label: { fontSize: 13 },
});
