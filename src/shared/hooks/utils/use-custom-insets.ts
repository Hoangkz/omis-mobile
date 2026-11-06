import { Platform } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

const isAndroid = Platform.OS === 'android';

export const useCustomInsets: () => EdgeInsets = () => {
    const insets = useSafeAreaInsets();
    return {
        ...insets,
        top: insets.top,
        bottom: isAndroid ? insets.bottom + 10 : insets.bottom,
    }
}