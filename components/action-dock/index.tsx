import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "@/components/text";

export default function ActionDock({ onAction }) {
  return (
    <View style={styles.dockWrapper}>
      <BlurView intensity={60} tint="light" style={styles.actionDock}>
        <TouchableOpacity
          style={styles.dockButton}
          onPress={() => onAction("feed")}
        >
          <View
            style={[
              styles.dockIconCircle,
              { backgroundColor: "rgba(255, 59, 48, 0.15)" },
            ]}
          >
            <MaterialCommunityIcons
              name="food-apple"
              size={24}
              color="#FF3B30"
            />
          </View>
          <Text style={styles.dockLabel}>10 ⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dockButton}
          onPress={() => onAction("clean")}
        >
          <View
            style={[
              styles.dockIconCircle,
              { backgroundColor: "rgba(0, 122, 255, 0.15)" },
            ]}
          >
            <MaterialCommunityIcons name="shower" size={24} color="#007AFF" />
          </View>
          <Text style={styles.dockLabel}>2 ⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dockButton}
          onPress={() => onAction("play")}
        >
          <View
            style={[
              styles.dockIconCircle,
              {
                backgroundColor: "rgba(255, 149, 0, 0.15)",
                width: 58,
                height: 58,
                borderRadius: 29,
                marginBottom: 0,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="controller-classic"
              size={28}
              color="#FF9500"
            />
          </View>
          <Text style={[styles.dockLabel, { marginTop: 4 }]}>5 ⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dockButton}
          onPress={() => onAction("sleep")}
        >
          <View
            style={[
              styles.dockIconCircle,
              { backgroundColor: "rgba(88, 86, 214, 0.15)" },
            ]}
          >
            <MaterialCommunityIcons name="bed" size={24} color="#5856D6" />
          </View>
          <Text style={styles.dockLabel}>Free</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    marginBottom: 40,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  actionDock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  dockButton: { alignItems: "center", justifyContent: "center" },
  dockIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  dockLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(60, 60, 67, 0.8)",
  },
});
