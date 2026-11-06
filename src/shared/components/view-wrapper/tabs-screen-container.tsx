import { useCustomInsets } from "@/src/shared/hooks/utils/use-custom-insets";
import { RefreshControl, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { cn } from "../../../lib/utils";
import { useGlobalStore } from "../../store/use-global-store";
import Container from "./container";

interface TabsScreenContainerProps {
  children?: React.ReactNode;
  className?: string;
  contentContainerClassName?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentNeedScrollView?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  hidePaddingBottom?: boolean;
  scrollWrapClassName?: string;
  footerStyle?: StyleProp<ViewStyle>;
}

export default function TabsScreenContainer({
  children,
  className,
  contentContainerClassName,
  header,
  footer,
  contentNeedScrollView = false,
  onRefresh,
  refreshing,
  hidePaddingBottom = false,
  scrollWrapClassName,
  footerStyle
}: TabsScreenContainerProps) {
  const showTabBar = useGlobalStore((state) => state.showTabBar);
  const heightSafeWithTabBar = useGlobalStore(
    (state) => state.heightSafeWithTabBar,
  );
  const insets = useCustomInsets();

  return (
    <View className={cn("flex-1 relative bg-light-primary-background", className)}>
      {header}

      {contentNeedScrollView ? (
        <ScrollView
          className={cn("flex-1", scrollWrapClassName)}
          contentContainerClassName="flex-grow"
          {...(onRefresh
            ? {
              refreshControl: (
                <RefreshControl
                  refreshing={Boolean(refreshing)}
                  onRefresh={onRefresh}
                />
              ),
            }
            : {})}
        >
          <Container
            className={cn("flex-1", contentContainerClassName)}
            style={{
              paddingBottom: hidePaddingBottom
                ? 0
                : showTabBar
                  ? heightSafeWithTabBar
                  : insets.bottom,
            }}
          >
            {children}
          </Container>
        </ScrollView>
      ) : (
        <Container className={cn("flex-1", contentContainerClassName)}>
          {children}
        </Container>
      )}

      {footer && (
        <View
          className="bg-transparent"
          style={[
            { marginBottom: showTabBar ? heightSafeWithTabBar : 0 },
            footerStyle
          ]}
        >
          {footer}
        </View>
      )}
    </View>
  );
}
