import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Text from "@/components/text";

const { width } = Dimensions.get("window");

export default function StatusPill({ label, value, color, icon }) {
  const animatedFillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${value}%`, { duration: 600 }),
  }));

  return (
    <BlurView intensity={60} tint="light" style={styles.pillContainer}>
      <View style={styles.pillHeader}>
        <MaterialCommunityIcons name={icon} size={16} color={color} />
        <Text style={styles.pillValue}>{Math.round(value)}%</Text>
      </View>
      <View style={styles.pillTrack}>
        <Animated.View
          style={[
            styles.pillFill,
            { backgroundColor: color },
            animatedFillStyle,
          ]}
        />
      </View>
      <Text style={styles.pillLabel}>{label}</Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    width: (width - 60) / 2,
    padding: 14,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  pillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pillTrack: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  pillFill: { height: "100%", borderRadius: 2 },
  pillLabel: {
    color: "rgba(60, 60, 67, 0.6)",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
  pillValue: { color: "#1C1C1E", fontWeight: "700", fontSize: 14 },
});
