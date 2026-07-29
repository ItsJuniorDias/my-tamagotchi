import React, { useEffect, useMemo } from "react";
import { Modal, View, Pressable, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "@/components/text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { STAR_PACKS, StarPack } from "@/constants/gameConfig";

type Package = {
  identifier: string;
  product: { identifier: string; priceString: string };
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onBuyStamina: () => void;
  onPurchase: (productId: string) => void;
  products: Package[];
  showFirstTimeOffer?: boolean;
  onFirstOfferSeen?: () => void;
  staminaRefillCost: number;
};

/**
 * Store modal.
 *
 * Layout:
 *   1. Refill Energy (utility purchase, uses in-game currency)
 *   2. FIRST-TIME OFFER banner — only shown once per install
 *   3. Star packs, ordered ascending by price to make the tiny-price
 *      entry point unmissable
 *   4. Value-per-star callout on the two headline packs
 *
 * Accessibility: every actionable row is a Pressable with role="button",
 * a semantic label (e.g. "Buy 500 stars for 4 dollars 99 cents"), and a
 * hint describing the outcome. Icons are decorative (importantForAccessibility=no).
 */
export default function StoreModal({
  visible,
  onClose,
  onBuyStamina,
  onPurchase,
  products,
  showFirstTimeOffer = false,
  onFirstOfferSeen,
  staminaRefillCost,
}: Props) {
  const c = Colors;

  // Mark the first-time offer as "seen" the moment the modal opens with it
  // showing. We don't wait for purchase — one look is enough to burn the flag,
  // so we don't badge every visit forever.
  useEffect(() => {
    if (visible && showFirstTimeOffer) {
      onFirstOfferSeen?.();
    }
  }, [visible, showFirstTimeOffer, onFirstOfferSeen]);

  const getPrice = (id: string, fallback: string) =>
    products.find((p) => p.product?.identifier === id)?.product?.priceString ||
    fallback;

  // Order: MICRO → STARTER → BASIC → CHEST → MEGA
  const orderedPacks: StarPack[] = useMemo(
    () => [
      // STAR_PACKS.MICRO,
      // STAR_PACKS.STARTER,
      STAR_PACKS.BASIC,
      STAR_PACKS.CHEST,
      // STAR_PACKS.MEGA,
    ],
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      accessibilityViewIsModal
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
        <BlurView
          intensity={90}
          tint="light"
          style={[styles.container, { backgroundColor: c.surfaceGlass }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text variant="overline" color={c.textMuted}>
                STAR STORE
              </Text>
              <Text variant="title" color={c.text}>
                Get more stars
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.close, { backgroundColor: c.surfaceSunken }]}
              accessibilityRole="button"
              accessibilityLabel="Close store"
            >
              <Feather name="x" size={22} color={c.text} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 520 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.md }}
          >
            {/* Refill Energy */}
            <Pressable
              style={({ pressed }) => [
                styles.utilityRow,
                {
                  backgroundColor: c.backgroundElevated,
                  borderColor: c.border,
                },
                pressed && styles.pressed,
              ]}
              onPress={onBuyStamina}
              accessibilityRole="button"
              accessibilityLabel={`Refill your energy for ${staminaRefillCost} stars`}
              accessibilityHint="Instantly refills all 5 action slots"
            >
              <View
                style={[
                  styles.itemIcon,
                  { backgroundColor: c.accentStar + "26" },
                ]}
              >
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={26}
                  color={c.accentStar}
                  importantForAccessibility="no"
                />
              </View>
              <View style={styles.itemInfo}>
                <Text variant="heading" color={c.text} style={styles.itemTitle}>
                  Refill energy
                </Text>
                <Text variant="caption" color={c.textSecondary} weight="medium">
                  Instantly restore 5 actions
                </Text>
              </View>
              <View
                style={[styles.buyButton, { backgroundColor: c.surfaceSunken }]}
              >
                <Text variant="data" color={c.text} style={styles.buyText}>
                  {staminaRefillCost} ⭐
                </Text>
              </View>
            </Pressable>

            {/* First-time offer banner */}
            {showFirstTimeOffer && (
              <View
                style={[
                  styles.offerBanner,
                  {
                    backgroundColor: c.primarySoft,
                    borderColor: c.primary,
                  },
                ]}
                accessible
                accessibilityLabel="One-time welcome offer available below"
              >
                <MaterialCommunityIcons
                  name="gift-outline"
                  size={20}
                  color={c.primary}
                  importantForAccessibility="no"
                />
                <View style={{ flex: 1 }}>
                  <Text
                    variant="label"
                    color={c.primary}
                    weight="bold"
                    style={{ marginBottom: 2 }}
                  >
                    WELCOME OFFER — ONE TIME
                  </Text>
                  <Text variant="caption" color={c.text} weight="medium">
                    Grab the Starter pack for the price of the Impulse pack.
                  </Text>
                </View>
              </View>
            )}

            {/* Divider */}
            <View style={styles.sectionLabel}>
              <Text variant="overline" color={c.textMuted}>
                STAR PACKS
              </Text>
            </View>

            {/* Packs */}
            {orderedPacks.map((pack) => {
              const priceString = getPrice(pack.id, pack.fallbackPrice);
              const isFirstOffer =
                showFirstTimeOffer && pack.id === STAR_PACKS.STARTER.id;
              const highlight = isFirstOffer
                ? "FIRST-TIME"
                : (pack as any).highlight;

              return (
                <PackRow
                  key={pack.id}
                  pack={pack}
                  priceString={priceString}
                  highlight={highlight}
                  isFirstOffer={isFirstOffer}
                  colors={c}
                  onPress={() => onPurchase(pack.id)}
                />
              );
            })}

            {/* Trust footer */}
            <View style={styles.trustRow}>
              <Feather name="shield" size={12} color={c.textMuted} />
              <Text variant="caption" color={c.textMuted}>
                Secure purchase via App Store
              </Text>
            </View>
          </ScrollView>
        </BlurView>
      </View>
    </Modal>
  );
}

function PackRow({
  pack,
  priceString,
  highlight,
  isFirstOffer,
  colors,
  onPress,
}: {
  pack: StarPack;
  priceString: string;
  highlight?: string;
  isFirstOffer?: boolean;
  colors: typeof Colors;
  onPress: () => void;
}) {
  const c = colors;

  // Value-per-dollar hint — computed lazily.
  const valuePerDollar = useMemo(() => {
    // Try to parse "$4.99" style; fall back to null if we can't.
    const num = parseFloat(priceString.replace(/[^0-9.]/g, ""));
    if (!num || Number.isNaN(num)) return null;
    const ratio = Math.round(pack.coins / num);
    return ratio;
  }, [pack.coins, priceString]);

  const badgeColor = isFirstOffer
    ? c.danger
    : highlight === "MEGA BONUS"
      ? c.accentStar
      : c.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.packRow,
        {
          backgroundColor: c.backgroundElevated,
          borderColor: isFirstOffer ? c.danger : c.border,
          borderWidth: isFirstOffer ? 2 : 1,
        },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pack.label}, ${pack.coins} stars for ${priceString}${highlight ? `, ${highlight.toLowerCase()}` : ""}`}
      accessibilityHint="Opens the App Store purchase sheet"
    >
      {highlight && (
        <View style={[styles.highlightBadge, { backgroundColor: badgeColor }]}>
          <Text variant="caption" color={c.onPrimary} weight="bold">
            {highlight}
          </Text>
        </View>
      )}

      <View style={[styles.itemIcon, { backgroundColor: c.primary + "1A" }]}>
        <MaterialCommunityIcons
          name={
            pack.coins >= 5000
              ? "treasure-chest"
              : pack.coins >= 1500
                ? "treasure-chest"
                : pack.coins >= 200
                  ? "star-four-points-circle"
                  : "star-four-points"
          }
          size={28}
          color={c.primary}
          importantForAccessibility="no"
        />
      </View>

      <View style={styles.itemInfo}>
        <Text variant="heading" color={c.text} style={styles.itemTitle}>
          {pack.label}
        </Text>
        <Text variant="caption" color={c.textSecondary} weight="medium">
          {pack.subtitle}
          {valuePerDollar !== null && pack.coins >= 500
            ? `  •  ${valuePerDollar}⭐/$`
            : ""}
        </Text>
      </View>

      <View style={[styles.buyButton, { backgroundColor: c.primary }]}>
        <Text variant="data" color={c.onPrimary} style={styles.buyText}>
          {priceString}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  container: {
    borderTopLeftRadius: Radius["3xl"],
    borderTopRightRadius: Radius["3xl"],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 40,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  utilityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    borderRadius: Radius["2xl"],
    borderWidth: 1,
    marginBottom: Spacing.md,
  },

  offerBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },

  sectionLabel: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },

  packRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    borderRadius: Radius["2xl"],
    marginBottom: Spacing.sm,
    position: "relative",
  },

  highlightBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },

  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.base,
  },
  itemInfo: { flex: 1 },
  itemTitle: { marginBottom: 2 },
  buyButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    minWidth: 72,
    alignItems: "center",
  },
  buyText: { fontSize: 14 },
  pressed: { opacity: 0.85 },

  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.md,
  },
});
