import { useCustomInsets } from '@/src/shared/hooks/utils/use-custom-insets';
import React from 'react';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

const baseStyle = {
    height: 'auto',
    minHeight: 60,
    paddingVertical: 10,
} as const;

const text2Style = {
    fontSize: 14,
    flexWrap: 'wrap',
} as const;

const toastConfig: ToastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: '#69C779', ...baseStyle }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text2Style={text2Style}
            text2NumberOfLines={0}
        />
    ),

    error: (props) => (
        <ErrorToast
            {...props}
            style={{ borderLeftColor: '#FE6301', ...baseStyle }}
            text2Style={text2Style}
            text2NumberOfLines={0}
        />
    ),

    info: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: '#3ABFF8', ...baseStyle }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text2Style={text2Style}
            text2NumberOfLines={2}
            onPress={() => {
                props?.hide?.();
                props?.onPress?.();
            }}
        />
    ),
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const insets = useCustomInsets();

    return (
        <>
            {children}
            <Toast topOffset={insets.top} config={toastConfig} />
        </>
    )
}