import { cn } from '@/src/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from './text';

interface OtpCodeInputProps {
    value: string;
    onChangeText: (text: string) => void;
    length?: number;
    disabled?: boolean;
    className?: string;
    autoFocus?: boolean;
}

export default function OtpCodeInput({
    value,
    onChangeText,
    length = 6,
    disabled = false,
    className,
    autoFocus = true,
}: OtpCodeInputProps) {
    const hiddenInputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Auto focus on mount
    useEffect(() => {
        if (autoFocus && !disabled) {
            const timer = setTimeout(() => {
                hiddenInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [autoFocus, disabled]);

    /**
     * Handle text change - filter to numeric only and limit length
     */
    const handleChangeText = useCallback(
        (text: string) => {
            const numericText = text.replace(/[^0-9]/g, '').slice(0, length);
            onChangeText(numericText);
        },
        [length, onChangeText]
    );

    /**
     * Focus the hidden input when pressing anywhere on the component
     */
    const handlePress = useCallback(() => {
        if (!disabled) {
            hiddenInputRef.current?.focus();
        }
    }, [disabled]);

    /**
     * Handle focus event
     */
    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    /**
     * Handle blur event
     */
    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    // Split value into individual digits
    const digits = value.split('');
    const currentIndex = digits.length < length ? digits.length : length - 1;

    return (
        <Pressable onPress={handlePress} disabled={disabled}>
            <View className={cn('flex-row justify-center gap-2', className)}>
                {/* Display boxes - not editable, just for show */}
                {Array.from({ length }).map((_, index) => {
                    const digit = digits[index] || '';
                    const hasValue = !!digit;
                    const isActive = isFocused && index === currentIndex;

                    return (
                        <View
                            key={`otp-digit-${index}`}
                            className={cn(
                                'border-2 rounded-[16px] items-center justify-center bg-background flex-1 h-14',
                                isActive && 'border-primary',
                                hasValue && !isActive && 'border-primary/50',
                                !hasValue && !isActive && 'border-transparent'
                            )}
                        >
                            <Text className="text-center text-2xl font-semibold text-foreground">
                                {digit}
                            </Text>
                        </View>
                    );
                })}

                {/* Single hidden input that receives all input */}
                <TextInput
                    ref={hiddenInputRef}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    keyboardType="number-pad"
                    maxLength={length}
                    editable={!disabled}
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    autoCorrect={false}
                    spellCheck={false}
                    autoCapitalize="none"
                    caretHidden
                    style={{
                        position: 'absolute',
                        width: 1,
                        height: 1,
                        opacity: 0,
                    }}
                />
            </View>
        </Pressable>
    );
}