import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "@/components/text";
import { Colors, Radius, Shadows, Spacing } from "@/constants/theme";
import { ACTION_COSTS } from "@/constants/gameConfig";

type ActionKey = "feed" | "clean" | "play" | "sleep";

const ACTION_META: {
  key: ActionKey;
  icon: string;
  color: string;
  labelName: string;
  hero?: boolean;
}[] = [
  { key: "feed", icon: "food-apple", labelName: "Feed", color: "" },
  { key: "clean", icon: "shower", labelName: "Clean", color: "" },
  {
    key: "play",
    icon: "controller-classic",
    labelName: "Play",
    color: "",
    hero: true,
  },
  { key: "sleep", icon: "weather-night", labelName: "Sleep", color: "" },
];

export default function ActionDock({
  onAction,
  coins,
}: {
  onAction: (type: ActionKey) => void;
  coins?: number;
}) {
  const c = Colors;

  const actions = ACTION_META.map((a) => ({
    ...a,
    color: {
      feed: c.stat.hunger,
      clean: c.stat.hygiene,
      play: c.primary,
      sleep: c.stat.energy,
    }[a.key],
    cost: ACTION_COSTS[a.key],
  }));

  return (
    <View style={[styles.wrapper, { borderColor: c.glassBorder }, Shadows.card]}>
      <BlurView
        intensity={60}
        tint="light"
        style={[styles.dock, { backgroundColor: c.surfaceGlass }]}
      >
        {actions.map((a) => {
          const affordable = coins === undefined || coins >= a.cost;
          return (
            <Pressable
              key={a.key}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
              onPress={() => onAction(a.key)}
              accessibilityRole="button"
              accessibilityLabel={`${a.labelName}, costs ${a.cost} stars`}
              accessibilityHint={
                affordable
                  ? `Uses 1 energy slot and ${a.cost} stars`
                  : "You need more stars — opens the store"
              }
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: a.color + "26" },
                  a.hero && styles.iconCircleHero,
                  !affordable && styles.iconCircleDim,
                ]}
              >
                <MaterialCommunityIcons
                  name={a.icon as any}
                  size={a.hero ? 28 : 24}
                  color={a.color}
                  importantForAccessibility="no"
                />
              </View>
              <Text
                variant="label"
                color={affordable ? c.textSecondary : c.danger}
                weight="bold"
                style={[styles.label, a.hero && { marginTop: 4 }]}
              >
                {a.cost} ⭐
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 40,
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    borderWidth: 1,
  },
  dock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
  },
  button: { alignItems: "center", justifyContent: "center" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  iconCircleHero: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginBottom: 0,
  },
  iconCircleDim: { opacity: 0.4 },
  label: { fontSize: 13 },
  pressed: { opacity: 0.75 },
});
