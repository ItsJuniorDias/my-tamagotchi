import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Text from "@/components/text";
import { Colors, Gradients, Radius, Shadows, Spacing } from "@/constants/theme";

const PET_EMOJI: Record<string, string> = {
  Duck: "🐤", Flamingo: "🦩", Parrot: "🦜", Stork: "🐦", Fox: "🦊",
  Pinguin: "🐧", Wolf: "🐺", Horse: "🐴", Ghost: "👻", Cat: "🐱",
  Bat: "🦇", Tiger: "🐯", BlackWolf: "🐺", Demon: "😈", Spider: "🕷️",
  TRex: "🦖", DragonRed: "🐲", Kurama: "🦊", Dragon: "🐉",
};

export function PetProfile({ tamagotchi, petName, setPetName, onStartJourney, onReroll }: any) {
  const c = Colors;
  const emoji = PET_EMOJI[tamagotchi?.type] ?? "✨";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapper}
    >
      <View style={styles.content}>
        <BlurView
          intensity={70}
          tint="light"
          style={[styles.card, { borderColor: c.glassBorder, backgroundColor: c.surfaceGlass }]}
        >
          <View style={styles.headerText}>
            <Text variant="overline" color={c.primary}>NEW COMPANION</Text>
            <Text variant="title" color={c.text} style={{ marginTop: Spacing.xs, marginBottom: Spacing.base }}>
              Welcome home
            </Text>
            <TextInput
              style={[styles.nameInput, { backgroundColor: c.surfaceSunken, color: c.text }]}
              value={petName}
              onChangeText={setPetName}
              placeholder="Name your pet…"
              placeholderTextColor={c.textMuted}
              maxLength={14}
              returnKeyType="done"
              clearButtonMode="while-editing"
              textAlign="center"
            />
          </View>

          {tamagotchi && (
            <View style={styles.result}>
              <View style={Shadows.glow(c.primary)}>
                <LinearGradient
                  colors={Gradients.aurora}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.orb, { borderColor: c.glassBorder }]}
                >
                  <Text variant="hero" style={styles.orbEmoji}>{emoji}</Text>
                </LinearGradient>
              </View>

              <Text variant="heading" color={c.text} style={{ marginTop: Spacing.base }}>
                {tamagotchi?.type}
              </Text>

              <View style={styles.traits}>
                {tamagotchi?.traits?.map((trait: string, i: number) => (
                  <View key={i} style={[styles.traitPill, { backgroundColor: c.primarySoft }]}>
                    <Text variant="caption" color={c.primary} weight="semibold">{trait}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.stats}>
                <View style={[styles.statBox, { backgroundColor: c.backgroundElevated }, Shadows.soft]}>
                  <Feather name="zap" size={14} color={c.stat.energy} />
                  <Text variant="label" color={c.text}>{tamagotchi?.energy ?? 100}% energy</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: c.backgroundElevated }, Shadows.soft]}>
                  <Feather name="star" size={14} color={c.accentStar} />
                  <Text variant="label" color={c.text}>Lvl {tamagotchi?.level ?? 1}</Text>
                </View>
              </View>
            </View>
          )}
        </BlurView>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onStartJourney}
            style={[styles.primaryButton, { backgroundColor: c.primary }, Shadows.glow(c.primary)]}
          >
            <Text variant="button" color={c.onPrimary}>Start journey</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={onReroll} style={styles.rerollButton}>
            <Feather name="refresh-cw" size={14} color={c.textMuted} />
            <Text variant="label" color={c.textMuted} weight="medium">Hatch a different pet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, width: "100%" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl },
  card: {
    width: "100%",
    borderRadius: Radius["2xl"],
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
    borderWidth: 1,
  },
  headerText: { width: "100%", marginBottom: Spacing.lg, alignItems: "center" },
  nameInput: {
    width: "100%",
    height: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 17,
  },
  result: { alignItems: "center", width: "100%" },
  orb: {
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  orbEmoji: { fontSize: 72, lineHeight: 82 },
  traits: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: Spacing.base, gap: Spacing.sm },
  traitPill: { borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: 7 },
  stats: { flexDirection: "row", marginTop: Spacing.lg, gap: Spacing.md },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actions: { width: "100%", alignItems: "center" },
  primaryButton: {
    width: "100%",
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.lg,
  },
  rerollButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: Spacing.lg, paddingVertical: Spacing.sm },
});
