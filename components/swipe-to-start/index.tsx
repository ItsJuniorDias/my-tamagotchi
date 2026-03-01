import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
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

const { width } = Dimensions.get("window");
const SWIPE_CONTAINER_WIDTH = width * 0.85;
const KNOB_SIZE = 56;
const SWIPE_RANGE = SWIPE_CONTAINER_WIDTH - KNOB_SIZE - 12;

export function SwipeToStart({ onStart }) {
  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);
  const arrowPulse = useSharedValue(0); // Shared value para o pulso da seta

  // Efeito para criar a animação de vai-e-volta na seta
  useEffect(() => {
    arrowPulse.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 600 }), // Move 5px para a direita em 600ms
        withTiming(0, { duration: 600 }), // Volta à posição original em 600ms
      ),
      -1, // -1 faz a animação repetir infinitamente
      true, // reverse: vai e volta suavemente
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

        translateX.value = withSpring(SWIPE_RANGE, {
          damping: 15,
          stiffness: 150,
        });

        if (onStart) {
          runOnJS(onStart)();
        }
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - translateX.value / (SWIPE_RANGE / 2)),
    transform: [{ translateX: translateX.value * 0.1 }],
  }));

  // Aplica o pulso na seta apenas quando o botão não está sendo arrastado
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value === 0 ? arrowPulse.value : 0,
      },
    ],
  }));

  return (
    <View style={styles.swipeOuterContainer}>
      <BlurView intensity={70} tint="light" style={styles.swipeTrack}>
        <Animated.View style={[styles.textOverlay, animatedTextStyle]}>
          <Text style={styles.swipeText}>slide to begin</Text>
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.swipeKnob, animatedButtonStyle]}>
            <Animated.View style={animatedArrowStyle}>
              <Feather name="arrow-right" size={24} color="#1C1C1E" />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeOuterContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  swipeTrack: {
    width: SWIPE_CONTAINER_WIDTH,
    height: KNOB_SIZE + 12,
    borderRadius: (KNOB_SIZE + 12) / 2,
    justifyContent: "center",
    paddingHorizontal: 6,
    overflow: "hidden",
  },
  swipeKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 6,
    zIndex: 2,
  },
  textOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  swipeText: {
    color: "#1C1C1E",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: -0.5,
  },
});
