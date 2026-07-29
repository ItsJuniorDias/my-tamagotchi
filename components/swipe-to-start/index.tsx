/**
 * TapToStart (exported as SwipeToStart for import compatibility)
 *
 * REPLACES the previous slide-to-begin gesture.
 *
 * Why the change:
 *   - Gesture-based onboarding blocks VoiceOver users entirely (see the
 *     1-star review from "blind gamer, 2008" on 2026-06-20). A screen
 *     reader cannot perform a swipe-and-release gesture reliably.
 *   - Sighted users also treat any friction on tap #1 as a reason to
 *     bounce. F2P onboarding funnels lose 20-40% on interactions more
 *     complex than a single tap.
 *
 * This component keeps the same visual language (pill track, glow,
 * arrow icon) but reacts to a single tap. VoiceOver reads it as
 * "Begin, button". A subtle idle pulse still draws the eye.
 */
import React, { useEffect } from "react";
import { StyleSheet, Dimensions, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Text from "@/components/text";
import { Colors, Shadows } from "@/constants/theme";

const { width } = Dimensions.get("window");
const TRACK_WIDTH = width * 0.85;
const KNOB_SIZE = 56;

export function SwipeToStart({ onStart }: { onStart?: () => void }) {
  const c = Colors;

  const pulse = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.4,
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }));

  const animatedKnob = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.06 }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart?.();
  };

  return (
    <View style={styles.outer}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (pressed.value = withTiming(1, { duration: 80 }))}
        onPressOut={() => (pressed.value = withTiming(0, { duration: 120 }))}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Begin"
        accessibilityHint="Starts your Tamagotchi journey"
        style={({ pressed: isPressed }) => [
          styles.pressable,
          isPressed && styles.pressed,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.glow,
            { backgroundColor: c.primary },
            Shadows.glow(c.primary),
            animatedGlow,
          ]}
          pointerEvents="none"
        />

        <BlurView
          intensity={70}
          tint="light"
          style={[
            styles.track,
            { borderColor: c.glassBorder, backgroundColor: c.surfaceGlass },
          ]}
        >
          <View style={styles.trackInner}>
            <Text variant="button" color={c.text}>
              Begin
            </Text>

            <Animated.View
              style={[
                styles.knob,
                { backgroundColor: c.primary },
                animatedKnob,
              ]}
            >
              <Feather name="arrow-right" size={22} color={c.onPrimary} />
            </Animated.View>
          </View>
        </BlurView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: "100%", alignItems: "center", marginTop: 40 },
  pressable: {
    width: TRACK_WIDTH,
    height: KNOB_SIZE + 12,
    borderRadius: (KNOB_SIZE + 12) / 2,
  },
  pressed: { opacity: 0.95 },
  glow: {
    borderRadius: (KNOB_SIZE + 12) / 2,
  },
  track: {
    flex: 1,
    borderRadius: (KNOB_SIZE + 12) / 2,
    overflow: "hidden",
    borderWidth: 1,
  },
  trackInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    position: "relative",
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 6,
  },
});
