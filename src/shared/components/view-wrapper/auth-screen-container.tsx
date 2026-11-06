import { ScrollView, View } from "react-native";
import { cn } from "../../../lib/utils";
import Container from "./container";

interface AuthScreenContainerProps {
  children?: React.ReactNode;
  className?: string;
  contentContainerClassName?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentNeedScrollView?: boolean;
}

export default function AuthScreenContainer({
  children,
  className,
  contentContainerClassName,
  header,
  footer,
  contentNeedScrollView = true,
}: AuthScreenContainerProps) {
  return (
    <View className={cn("flex-1", className)}>
      {header}

      {contentNeedScrollView ? (
        <ScrollView className="flex-1" contentContainerClassName="flex-grow">
          <Container className={cn("flex-1", contentContainerClassName)}>
            {children}
          </Container>
        </ScrollView>
      ) : (
        <Container className={cn("flex-1", contentContainerClassName)}>
          {children}
        </Container>
      )}

      {footer && <View className="bg-transparent mt-3">{footer}</View>}
    </View>
  );
}
