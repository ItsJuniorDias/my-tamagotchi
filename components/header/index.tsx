import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Text from "@/components/text";
import { MAX_STAMINA } from "../../constants/gameConfig";

export default function Header({
  tamagotchi,
  xp,
  stamina,
  coins,
  onOpenStore,
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning,"
      : hour < 18
        ? "Good afternoon,"
        : "Good evening,";

  const animatedXpStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(100, Math.max(0, xp))}%`, { duration: 800 }),
  }));

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.petName}>{tamagotchi?.name} 🐾</Text>

        <View style={styles.levelContainer}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.{tamagotchi.level}</Text>
          </View>
          <View style={styles.xpTrack}>
            <Animated.View
              style={[
                styles.xpFill,
                animatedXpStyle,
                { backgroundColor: "#32ADE6" },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.staminaContainer} onPress={onOpenStore}>
          <Text style={styles.staminaLabel}>ACTIONS:</Text>
          {[...Array(MAX_STAMINA)].map((_, i) => (
            <MaterialCommunityIcons
              key={i}
              name="lightning-bolt"
              size={16}
              color={i < stamina ? "#FF9500" : "rgba(0,0,0,0.1)"}
            />
          ))}
          {stamina === 0 && (
            <View style={styles.buyStaminaBadge}>
              <Text style={styles.buyStaminaText}>+</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.headerRight} onPress={onOpenStore}>
        <BlurView intensity={80} tint="light" style={styles.coinBadge}>
          <MaterialCommunityIcons
            name="star-four-points"
            size={14}
            color="#FF9500"
          />
          <Text style={styles.coinText}>{coins}</Text>
          <View style={styles.plusBadge}>
            <Text style={styles.plusText}>+</Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "flex-end", gap: 12 },
  greetingText: {
    color: "rgba(60, 60, 67, 0.6)",
    fontSize: 14,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  petName: {
    color: "#000",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  levelBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  xpTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 3,
    maxWidth: 120,
    overflow: "hidden",
  },
  xpFill: { height: "100%", borderRadius: 3 },
  staminaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 2,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  staminaLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(60, 60, 67, 0.6)",
    marginRight: 4,
    marginLeft: 8,
    letterSpacing: 1,
  },
  buyStaminaBadge: {
    backgroundColor: "#FF3B30",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  buyStaminaText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    gap: 6,
  },
  coinText: { color: "#1C1C1E", fontWeight: "700", fontSize: 14 },
  plusBadge: {
    backgroundColor: "#007AFF",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { color: "#FFF", fontSize: 12, fontWeight: "900", lineHeight: 14 },
});
