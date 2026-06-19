import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import Text from "@/components/text";
import { Colors, Motion, Shadows } from "@/constants/theme";

const { width } = Dimensions.get("window");
const TRACK_WIDTH = width * 0.85;
const KNOB_SIZE = 56;
const SWIPE_RANGE = TRACK_WIDTH - KNOB_SIZE - 12;

export function SwipeToStart({ onStart }: any) {
  const c = Colors;

  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);
  const arrowPulse = useSharedValue(0);

  useEffect(() => {
    arrowPulse.value = withRepeat(
      withSequence(withTiming(5, { duration: 600 }), withTiming(0, { duration: 600 })),
      -1,
      true,
    );
  }, []);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isCompleted.value) return;
      translateX.value = Math.max(0, Math.min(event.translationX, SWIPE_RANGE));
    })
    .onEnd(() => {
      if (isCompleted.value) return;
      if (translateX.value > SWIPE_RANGE * 0.75) {
        isCompleted.value = true;
        translateX.value = withSpring(SWIPE_RANGE, Motion.spring);
        if (onStart) runOnJS(onStart)();
      } else {
        translateX.value = withSpring(0, Motion.spring);
      }
    });

  const animatedKnobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - translateX.value / (SWIPE_RANGE / 2)),
    transform: [{ translateX: translateX.value * 0.1 }],
  }));
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value === 0 ? arrowPulse.value : 0 }],
  }));

  return (
    <View style={styles.outer}>
      <BlurView
        intensity={70}
        tint="light"
        style={[styles.track, { borderColor: c.glassBorder, backgroundColor: c.surfaceGlass }]}
      >
        <Animated.View style={[styles.textOverlay, animatedTextStyle]}>
          <Text variant="label" color={c.textSecondary} weight="bold">slide to begin</Text>
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.knob, { backgroundColor: c.primary }, Shadows.glow(c.primary), animatedKnobStyle]}>
            <Animated.View style={animatedArrowStyle}>
              <Feather name="arrow-right" size={24} color={c.onPrimary} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: "100%", alignItems: "center", marginTop: 40 },
  track: {
    width: TRACK_WIDTH,
    height: KNOB_SIZE + 12,
    borderRadius: (KNOB_SIZE + 12) / 2,
    justifyContent: "center",
    paddingHorizontal: 6,
    overflow: "hidden",
    borderWidth: 1,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 6,
    zIndex: 2,
  },
  textOverlay: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 1 },
});
