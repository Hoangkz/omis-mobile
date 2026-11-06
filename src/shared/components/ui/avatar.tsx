import { cn } from '@/src/lib/utils';
import { Image, ImageStyle } from 'expo-image';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import NoAvatar from './no-avatar';

type Props = {
    fullName?: string;
    url?: string | null;
    size?: number;
    wrapperClassName?: string;
    style?: StyleProp<ViewStyle>;
}

export default function Avatar({ fullName, url, size, wrapperClassName, style }: Props) {
    const imageStlye = style as StyleProp<ImageStyle>;

    return (
        <View
            style={{ width: size || '100%', height: size || '100%' }}
            className={cn('flex-none', wrapperClassName)}
        >
            {url ? (
                <Image
                    source={{ uri: url }}
                    style={
                        [
                            { width: size || '100%', height: size || '100%', borderRadius: 9999 },
                            imageStlye
                        ]
                    }
                    contentFit='cover'
                />
            ) : (
                <NoAvatar style={style} fullName={fullName} />
            )}
        </View >
    )
}