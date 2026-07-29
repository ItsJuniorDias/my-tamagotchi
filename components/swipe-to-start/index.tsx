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
 * Visual: solid primary pill, tap anywhere. A subtle idle pulse
 * still draws the eye. VoiceOver reads it as "Begin, button".
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
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Text from "@/components/text";
import { Colors, Shadows } from "@/constants/theme";

const { width } = Dimensions.get("window");
const TRACK_WIDTH = width * 0.85;
const HEIGHT = 64;

export function SwipeToStart({ onStart }: { onStart?: () => void }) {
  const c = Colors;

  const pulse = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  // Glow that gently pulses behind the button.
  const animatedGlow = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.35,
    transform: [{ scale: 1.02 + pulse.value * 0.04 }],
  }));

  // Slight press-down feedback on the button itself.
  const animatedButton = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
  }));

  // Arrow drifts slightly on the idle pulse — invites forward motion.
  const animatedArrow = useAnimatedStyle(() => ({
    transform: [{ translateX: pulse.value * 4 }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart?.();
  };

  return (
    <View style={styles.outer}>
      {/* Soft pulsing glow behind the button */}
      <Animated.View
        style={[
          styles.glow,
          { backgroundColor: c.primary },
          Shadows.glow(c.primary),
          animatedGlow,
        ]}
        pointerEvents="none"
      />

      <Animated.View style={[styles.buttonWrap, animatedButton]}>
        <Pressable
          onPress={handlePress}
          onPressIn={() => (pressed.value = withTiming(1, { duration: 80 }))}
          onPressOut={() => (pressed.value = withTiming(0, { duration: 140 }))}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Begin"
          accessibilityHint="Starts your Tamagotchi journey"
          style={[styles.button, { backgroundColor: c.primary }]}
        >
          <Text variant="button" color={c.onPrimary} style={styles.label}>
            Begin
          </Text>
          <Animated.View style={animatedArrow}>
            <Feather
              name="arrow-right"
              size={22}
              color={c.onPrimary}
              importantForAccessibility="no"
            />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: TRACK_WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    top: 0,
  },
  buttonWrap: {
    width: TRACK_WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
  },
  button: {
    flex: 1,
    borderRadius: HEIGHT / 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  label: {
    fontSize: 17,
  },
});
