import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Text from "@/components/text";
import { Colors, Radius, Spacing } from "@/constants/theme";

const { width } = Dimensions.get("window");

export default function StatusPill({ label, value, color, icon }: any) {
  const c = Colors;

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.max(0, Math.min(100, value))}%`, { duration: 600 }),
  }));

  return (
    <BlurView
      intensity={60}
      tint="light"
      style={[styles.pill, { borderColor: c.glassBorder, backgroundColor: c.surfaceGlass }]}
    >
      <View style={styles.head}>
        <View style={[styles.iconChip, { backgroundColor: color + "26" }]}>
          <MaterialCommunityIcons name={icon} size={15} color={color} />
        </View>
        <Text variant="data" color={c.text} style={styles.value}>{Math.round(value)}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: c.surfaceSunken }]}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, animatedFillStyle]} />
      </View>
      <Text variant="caption" color={c.textSecondary} weight="semibold" style={styles.label}>
        {label}
      </Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: (width - 60) / 2,
    padding: Spacing.base,
    borderRadius: Radius.xl,
    overflow: "hidden",
    borderWidth: 1,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  iconChip: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  value: { fontSize: 14 },
  track: { height: 5, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  label: { marginTop: Spacing.sm },
});
