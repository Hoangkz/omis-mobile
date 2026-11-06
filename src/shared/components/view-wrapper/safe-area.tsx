import { cn } from "@/src/lib/utils";
import React from "react";
import { View } from "react-native";
import { type Edge } from "react-native-safe-area-context";
import { useColorScheme } from "../../hooks/utils/use-color-schema";
import { useCustomInsets } from "../../hooks/utils/use-custom-insets";
import { useBackgroundColorStore } from "../../store/use-background-color-store";

type Props = {
  children: React.ReactNode;
  className?: string;
  edges?: Edge[];
};

export default function SafeArea({
  children,
  className,
  edges = ["top", "bottom"],
}: Props) {
  /* Get safe area insets */
  const insets = useCustomInsets();
  const paddingTop = edges.includes("top") ? insets.top : 0;
  const paddingBottom = edges.includes("bottom") ? insets.bottom : 0;
  const paddingLeft = edges.includes("left") ? insets.left : 0;
  const paddingRight = edges.includes("right") ? insets.right : 0;

  /* Get background color from store */
  const backgroundColor = useBackgroundColorStore(
    (state) => state.backgroundColor,
  );
  const { themeColor } = useColorScheme();

  return (
    <View
      className={cn("flex-1", className)}
      style={{
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        backgroundColor: themeColor[backgroundColor],
      }}
    >
      {children}
    </View>
  );
}
