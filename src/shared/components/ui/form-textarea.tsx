import { cn } from '@/src/lib/utils';
import { Label } from '@/src/shared/components/ui/label';
import { Text } from '@/src/shared/components/ui/text';
import { Textarea } from '@/src/shared/components/ui/textarea';
import * as React from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { View, type TextInput, type TextInputProps } from 'react-native';

interface FormTextareaProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'maxLength'> {
    control: Control<TFieldValues>;
    name: TName;
    label: string;
    error?: string;
    showCharacterCount?: boolean;
    maxLength?: number;
}

function FormTextareaInner<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
    { control, name, label, error, className, showCharacterCount = false, maxLength, ...textareaProps }: FormTextareaProps<TFieldValues, TName>,
    ref: React.Ref<React.ComponentRef<typeof TextInput>>
) {
    return (
        <View className="gap-1">
            <Label htmlFor={name} className='font-medium mb-1'>{label}</Label>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => {
                    const currentValue = String(value || '');
                    const characterCount = currentValue.length;

                    return (
                        <View className="relative">
                            <Textarea
                                ref={ref}
                                id={name}
                                value={currentValue}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                className={cn('bg-background font-medium dark:border-white/30', showCharacterCount && 'pb-8', className)}
                                maxLength={maxLength}
                                {...textareaProps}
                            />
                            {showCharacterCount && (
                                <View className="absolute bottom-2 right-3">
                                    <View className='flex-row'>
                                        <Text className="text-xs font-medium text-light-primary">{characterCount}</Text>
                                        <Text className="text-xs font-medium text-gray-300">{maxLength ? `/${maxLength}` : ''}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                }}
            />
            {error && (
                <Text className="text-xs text-destructive">{error}</Text>
            )}
        </View>
    );
}

export const FormTextarea = React.forwardRef(FormTextareaInner) as <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
    props: FormTextareaProps<TFieldValues, TName> & { ref?: React.Ref<React.ComponentRef<typeof TextInput>> }
) => React.ReactElement;
