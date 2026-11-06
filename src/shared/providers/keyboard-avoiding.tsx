import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useGlobalStore } from '../store/use-global-store';

type Props = {
    children: React.ReactNode;
    keyboardVerticalOffset?: number | 'tabBar';
    additionalOffset?: number;
    style?: StyleProp<ViewStyle>;
}

export default function KeyboardAvoiding({ children, keyboardVerticalOffset = 70, additionalOffset = 0, style }: Props) {
    const heightSafeWithTabBar = useGlobalStore(state => state.heightSafeWithTabBar);
    const offset = keyboardVerticalOffset === 'tabBar'
        ? heightSafeWithTabBar - 70
        : keyboardVerticalOffset;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[{ flex: 1 }, style]}
            keyboardVerticalOffset={offset + additionalOffset}
        >
            {children}
        </KeyboardAvoidingView>
    )
}