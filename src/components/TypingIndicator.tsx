import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

interface TypingIndicatorProps {
  size?: number;
  color?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  size = 8,
  color = "#007AFF",
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      createAnimation(dot1Anim, 0),
      createAnimation(dot2Anim, 150),
      createAnimation(dot3Anim, 300),
    ];

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAnimatedStyle = (animValue: Animated.Value) => {
    return {
      opacity: animValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.4, 1, 0.4],
      }),
      transform: [
        {
          translateY: animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, -8, 0],
          }) as any,
        },
        {
          scale: animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.2, 1],
          }) as any,
        },
      ],
    };
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={
          [
            styles.dot,
            {
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: size / 2,
            },
            getAnimatedStyle(dot1Anim),
          ] as any
        }
      />
      <Animated.View
        style={
          [
            styles.dot,
            {
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: size / 2,
            },
            getAnimatedStyle(dot2Anim),
          ] as any
        }
      />
      <Animated.View
        style={
          [
            styles.dot,
            {
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: size / 2,
            },
            getAnimatedStyle(dot3Anim),
          ] as any
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    marginHorizontal: 4,
  },
});

export default TypingIndicator;
