import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
  icon?: React.ReactNode;
};

export default function IconWithAnimationScale({ icon }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {icon ? (
        icon
      ) : (
        <Svg width={140} height={140} viewBox="0 0 140 140" fill="none">
          <Circle opacity={0.1} cx="70" cy="70" r="70" fill="#FF8080" />
          <Circle cx="70" cy="70" r="46" fill="#FF8080" />
          <Path
            d="M56 70L66 80L86 60"
            stroke="white"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </Animated.View>
  );
}
