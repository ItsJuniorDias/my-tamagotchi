import React from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "@/components/text";

export default function StoreModal({
  visible,
  onClose,
  onBuyStamina,
  onPurchase,
  products,
}) {
  const getPrice = (id, fallback) =>
    products.find((p) => p.productId === id)?.localizedPrice || fallback;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <BlurView intensity={90} tint="light" style={styles.storeContainer}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeTitle} weight="bold">
              Pet Store
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#1C1C1E" />
            </TouchableOpacity>
          </View>

          <View style={styles.storeItems}>
            <TouchableOpacity style={styles.storeItem} onPress={onBuyStamina}>
              <View
                style={[
                  styles.storeItemIcon,
                  { backgroundColor: "rgba(255, 149, 0, 0.15)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={28}
                  color="#FF9500"
                />
              </View>
              <View style={styles.storeItemInfo}>
                <Text style={styles.storeItemTitle}>Recharge Energy</Text>
                <Text style={styles.storeItemDesc}>Refills your 5 actions</Text>
              </View>
              <View style={styles.buyButton}>
                <Text style={styles.buyButtonText}>100 ⭐</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.storeItem}
              onPress={() => onPurchase("com.seujogo.pacotebasico_500")}
            >
              <View
                style={[
                  styles.storeItemIcon,
                  { backgroundColor: "rgba(52, 199, 89, 0.15)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={28}
                  color="#34C759"
                />
              </View>
              <View style={styles.storeItemInfo}>
                <Text style={styles.storeItemTitle}>Basic Package</Text>
                <Text style={styles.storeItemDesc}>+500 Stars</Text>
              </View>
              <View style={[styles.buyButton, { backgroundColor: "#007AFF" }]}>
                <Text style={[styles.buyButtonText, { color: "#FFF" }]}>
                  {getPrice("com.seujogo.pacotebasico_500", "$4.99")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.storeItem}
              onPress={() => onPurchase("com.seujogo.bauestrelas_1500")}
            >
              <View
                style={[
                  styles.storeItemIcon,
                  { backgroundColor: "rgba(175, 82, 222, 0.15)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="treasure-chest"
                  size={28}
                  color="#AF52DE"
                />
              </View>
              <View style={styles.storeItemInfo}>
                <Text style={styles.storeItemTitle}>Star Chest</Text>
                <Text style={styles.storeItemDesc}>+1500 Stars</Text>
              </View>
              <View style={[styles.buyButton, { backgroundColor: "#007AFF" }]}>
                <Text style={[styles.buyButtonText, { color: "#FFF" }]}>
                  {getPrice("com.seujogo.bauestrelas_1500", "$9.99")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  storeContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 50,
    overflow: "hidden",
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  storeTitle: { fontSize: 24, fontWeight: "700", color: "#1C1C1E" },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  storeItems: { gap: 16 },
  storeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  storeItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  storeItemInfo: { flex: 1 },
  storeItemTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  storeItemDesc: {
    fontSize: 14,
    color: "rgba(60, 60, 67, 0.6)",
    fontWeight: "500",
  },
  buyButton: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buyButtonText: { fontSize: 16, fontWeight: "700", color: "#1C1C1E" },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 8,
  },
});
