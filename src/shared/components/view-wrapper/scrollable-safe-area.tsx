import { cn } from '@/src/lib/utils';
import { useCustomInsets } from '@/src/shared/hooks/utils/use-custom-insets';
import { Platform, ScrollView, View } from 'react-native';

const os = Platform.OS;
const needMorePaddingBottom = os === 'android';

type Props = {
    children: React.ReactNode;
    className?: string;
    contentContainerClassName?: string;
}

export function ScrollableSafeArea({ children, className, contentContainerClassName }: Props) {
    const insets = useCustomInsets();

    return (
        <ScrollView
            className={cn("flex-1", className)}
            contentContainerStyle={{
                paddingTop: insets.top,
                paddingBottom: insets.bottom + (needMorePaddingBottom ? 20 : 0),
                flexGrow: 1,
            }}
        >
            <View className={cn("flex-1", contentContainerClassName)}>
                {children}
            </View>
        </ScrollView>
    );
}