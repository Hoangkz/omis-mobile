import React, { useCallback, useMemo } from "react";
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from "react-native";
import { UserIcon } from "../common/icons";
import { Text } from "./text";

type Props = {
  style?: StyleProp<ViewStyle>;
  fullName?: string;
};

// Memoized initials text component with dynamic font size
const AvatarInitials = React.memo(({
  initials,
  size,
}: {
  initials: string;
  size: number;
}) => {
  // Calculate font size based on container size (approximately 40% of container)
  const fontSize = Math.max(size * 0.4, 10);

  return (
    <Text
      className="text-white font-bold"
      style={{ fontSize, lineHeight: fontSize * 1.2 }}
    >
      {initials}
    </Text>
  );
});

AvatarInitials.displayName = "AvatarInitials";

// Memoized fallback icon component
const AvatarFallbackIcon = React.memo(({
  size,
  color,
}: {
  size: number;
  color: string;
}) => (
  <UserIcon
    size={28}
    style={{ maxWidth: size * 0.6, maxHeight: size * 0.6 }}
    color={color}
  />
));

AvatarFallbackIcon.displayName = "AvatarFallbackIcon";

export default function NoAvatar({ style, fullName }: Props) {
  const [containerSize, setContainerSize] = React.useState(0);

  /* Calculate container size on layout */
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const size = Math.min(width, height);
    setContainerSize(size);
  }, []);

  /* Get initials from full name (first letters of first 2 words) */
  const initials = useMemo(() => {
    if (!fullName) return "";
    return fullName
      .split(" ")
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .slice(0, 2)
      .join("");
  }, [fullName]);

  return (
    <View
      className="bg-light-primary w-full h-full rounded-full items-center justify-center"
      style={style}
      onLayout={onLayout}
    >
      {initials ? (
        <AvatarInitials initials={initials} size={containerSize} />
      ) : (
        <AvatarFallbackIcon size={containerSize} color='white' />
      )}
    </View>
  );
}
