import { Label } from '@/src/shared/components/ui/label';
import { Switch } from '@/src/shared/components/ui/switch';
import { Text } from '@/src/shared/components/ui/text';
import * as React from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { View } from 'react-native';

interface FormSwitchProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
    control: Control<TFieldValues>;
    name: TName;
    label: string;
    text?: string;
    error?: string;
    disabled?: boolean;
}

export function FormSwitch<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    label,
    text,
    error,
    disabled,
}: FormSwitchProps<TFieldValues, TName>) {
    return (
        <View className="gap-1">
            <Label htmlFor={name} className='font-medium mb-1'>{label}</Label>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                    <View className="flex-row items-center justify-between">
                        {text && (
                            <Text className="text-base text-foreground flex-1 mr-3">
                                {text}
                            </Text>
                        )}
                        <Switch
                            checked={Boolean(value)}
                            onCheckedChange={onChange}
                            disabled={disabled}
                        />
                    </View>
                )}
            />
            {error && (
                <Text className="text-xs text-destructive">{error}</Text>
            )}
        </View>
    );
}
