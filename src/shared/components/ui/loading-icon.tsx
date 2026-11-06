import { useColorScheme } from '@/src/shared/hooks/utils/use-color-schema';
import { Loader2 } from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface LoadingIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function LoadingIcon({ size = 40, color, className }: LoadingIconProps) {
  const { themeColor } = useColorScheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const iconColor = color || themeColor.primary;

  return (
    <Animated.View style={animatedStyle}>
      <Loader2 size={size} color={iconColor} className={className} />
    </Animated.View>
  );
}
