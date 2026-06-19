import React from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "@/components/text";
import { Colors, Radius, Spacing } from "@/constants/theme";

export default function StoreModal({
  visible,
  onClose,
  onBuyStamina,
  onPurchase,
  products,
}: {
  visible: boolean;
  onClose: () => void;
  onBuyStamina: () => void;
  onPurchase: (productId: string) => void;
  products: {
    identifier: string;
    product: { identifier: string; priceString: string };
  }[];
}) {
  const c = Colors;

  // products = RevenueCat Packages; o preço real vem de product.priceString.
  const getPrice = (id: string, fallback: string) =>
    products.find((p) => p.product?.identifier === id)?.product?.priceString ||
    fallback;

  const Row = ({ icon, tint, title, desc, onPress, price, primary }: any) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: c.backgroundElevated, borderColor: c.border }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.itemIcon, { backgroundColor: tint + "26" }]}>
        <MaterialCommunityIcons name={icon} size={26} color={tint} />
      </View>
      <View style={styles.itemInfo}>
        <Text variant="heading" color={c.text} style={styles.itemTitle}>{title}</Text>
        <Text variant="caption" color={c.textSecondary} weight="medium">{desc}</Text>
      </View>
      <View style={[styles.buyButton, { backgroundColor: primary ? c.primary : c.surfaceSunken }]}>
        <Text variant="data" color={primary ? c.onPrimary : c.text} style={styles.buyText}>{price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
        <BlurView
          intensity={90}
          tint="light"
          style={[styles.container, { backgroundColor: c.surfaceGlass }]}
        >
          <View style={styles.header}>
            <Text variant="title" color={c.text}>Pet store</Text>
            <TouchableOpacity onPress={onClose} style={[styles.close, { backgroundColor: c.surfaceSunken }]}>
              <Feather name="x" size={22} color={c.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.items}>
            <Row
              icon="lightning-bolt"
              tint={c.accentStar}
              title="Recharge energy"
              desc="Refills your 5 actions"
              price="100 ⭐"
              onPress={onBuyStamina}
            />
            <Row
              icon="star-four-points"
              tint={c.stat.energy}
              title="Basic pack"
              desc="+500 stars"
              primary
              price={getPrice("com.tamagotchi.pacotebasico_500", "$4.99")}
              onPress={() => onPurchase("com.tamagotchi.pacotebasico_500")}
            />
            <Row
              icon="treasure-chest"
              tint={c.primary}
              title="Star chest"
              desc="+1500 stars"
              primary
              price={getPrice("com.tamagotchi.bauestrelas_1500", "$9.99")}
              onPress={() => onPurchase("com.tamagotchi.bauestrelas_1500")}
            />
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  container: { borderTopLeftRadius: Radius["3xl"], borderTopRightRadius: Radius["3xl"], padding: Spacing.xl, paddingBottom: 50, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.xl },
  close: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  items: { gap: Spacing.md },
  item: { flexDirection: "row", alignItems: "center", padding: Spacing.base, borderRadius: Radius["2xl"], borderWidth: 1 },
  itemIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: Spacing.base },
  itemInfo: { flex: 1 },
  itemTitle: { marginBottom: 2 },
  buyButton: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  buyText: { fontSize: 14 },
});
