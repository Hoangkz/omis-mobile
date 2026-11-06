import { cn } from "@/src/lib/utils";
import React from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import { Checkbox } from "./check-box";
import { Label } from "./label";
import { Text } from "./text";

interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  text?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  textClassName?: string;
  error?: string;
  required?: boolean;
}

export function FormCheckBox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  text,
  disabled = false,
  className,
  labelClassName,
  textClassName,
  error,
  required,
}: FormCheckboxProps<TFieldValues, TName>) {
  return (
    <View className={cn("gap-1", className)}>
      {label && (
        <Label
          htmlFor={name}
          className={cn("font-medium mb-1", labelClassName)}
        >
          {label}
          {required ? <Text className="text-light-primary">*</Text> : ""}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <TouchableOpacity
            onPress={() => !disabled && onChange(!value)}
            disabled={disabled}
            className="flex-row items-center gap-[10px]"
          >
            <Checkbox
              checked={value}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            {text && (
              <Text
                className={cn(
                  "text-base text-foreground flex-1 font-medium",
                  textClassName,
                )}
              >
                {text}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
}
