import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Text from "@/components/text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { MAX_STAMINA } from "../../constants/gameConfig";

export default function Header({ tamagotchi, xp, stamina, coins, onOpenStore }: any) {
  const c = Colors;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD EVENING";

  const animatedXpStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(100, Math.max(0, xp))}%`, { duration: 800 }),
  }));

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Text variant="overline" color={c.textMuted}>{greeting}</Text>
        <Text variant="display" color={c.text} style={styles.petName}>
          {tamagotchi?.name} 🐾
        </Text>

        <View style={styles.levelRow}>
          <View style={[styles.levelBadge, { backgroundColor: c.primary }]}>
            <Text variant="data" color={c.onPrimary} style={styles.levelText}>
              Lv.{tamagotchi?.level}
            </Text>
          </View>
          <View style={[styles.xpTrack, { backgroundColor: c.surfaceSunken }]}>
            <Animated.View style={[styles.xpFill, animatedXpStyle, { backgroundColor: c.primary }]} />
          </View>
        </View>

        <Pressable
          style={[styles.staminaRow, { backgroundColor: c.surfaceSunken }]}
          onPress={onOpenStore}
          accessibilityRole="button"
          accessibilityLabel={`${stamina} of ${MAX_STAMINA} actions remaining. Tap to open the store`}
        >
          <Text variant="overline" color={c.textMuted} style={styles.staminaLabel}>ACTIONS</Text>
          {[...Array(MAX_STAMINA)].map((_, i) => (
            <MaterialCommunityIcons
              key={i}
              name="lightning-bolt"
              size={16}
              color={i < stamina ? c.accentStar : c.border}
              importantForAccessibility="no"
            />
          ))}
          {stamina === 0 && (
            <View style={[styles.miniBadge, { backgroundColor: c.danger }]}>
              <Text variant="caption" color={c.onPrimary} weight="bold">+</Text>
            </View>
          )}
        </Pressable>
      </View>

      <Pressable
        style={styles.right}
        onPress={onOpenStore}
        accessibilityRole="button"
        accessibilityLabel={`${coins} stars. Tap to open the store`}
      >
        <BlurView
          intensity={80}
          tint="light"
          style={[styles.coinBadge, { borderColor: c.glassBorder }]}
        >
          <MaterialCommunityIcons
            name="star-four-points"
            size={14}
            color={c.accentStar}
            importantForAccessibility="no"
          />
          <Text variant="data" color={c.text} style={styles.coinText}>{coins}</Text>
          <View style={[styles.miniBadge, { backgroundColor: c.primary }]}>
            <Text variant="caption" color={c.onPrimary} weight="bold">+</Text>
          </View>
        </BlurView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 60, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  left: { flex: 1 },
  right: { alignItems: "flex-end" },
  petName: { marginTop: 2 },
  levelRow: { flexDirection: "row", alignItems: "center", marginTop: Spacing.sm, gap: Spacing.sm },
  levelBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.sm },
  levelText: { fontSize: 13 },
  xpTrack: { flex: 1, height: 6, borderRadius: 3, maxWidth: 120, overflow: "hidden" },
  xpFill: { height: "100%", borderRadius: 3 },
  staminaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.md,
    alignSelf: "flex-start",
  },
  staminaLabel: { marginRight: Spacing.xs },
  miniBadge: { minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, alignItems: "center", justifyContent: "center", marginLeft: Spacing.xs },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    gap: 6,
  },
  coinText: { fontSize: 14 },
});
