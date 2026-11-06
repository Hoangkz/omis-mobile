import { cn } from "@/src/lib/utils";
import { BlurView } from "expo-blur";
import { View } from "react-native";

type Props = {
    children?: React.ReactNode;
    className?: string;
    contentClassName?: string;
    intensity?: number;
}

export default function LightBlur({ children, className, contentClassName, intensity = 20 }: Props) {
    return (
        <View className={cn('absolute left-1/2 -translate-x-1/2 border-[0.5px] border-white/20 rounded-[32px] overflow-hidden bg-white/50', className)}>
            <BlurView
                intensity={intensity}
                tint="dark"
                className={cn("flex-row gap-2 items-center py-2 px-3", contentClassName)}
            >
                {children}
            </BlurView>
        </View>
    )
}