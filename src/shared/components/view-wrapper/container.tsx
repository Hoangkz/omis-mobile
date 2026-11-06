import { cn } from '@/src/lib/utils';
import { View, ViewStyle } from 'react-native';

interface Props {
    children: React.ReactNode;
    className?: string;
    style?: ViewStyle;
}

export default function Container({ children, className, style }: Props) {
    return (
        <View className={cn("px-4 flex-1", className)} style={style}>{children}</View>
    );
}
