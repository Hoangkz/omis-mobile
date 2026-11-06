import { cn } from "@/src/lib/utils";
import { EyeIcon, EyeOffIcon } from "@/src/shared/components/common/icons";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Text } from "@/src/shared/components/ui/text";
import { useTranslation } from "@/src/shared/hooks/utils/use-translation";
import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  TouchableOpacity,
  View,
  type TextInput,
  type TextInputProps,
} from "react-native";

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<TextInputProps, "value" | "onChangeText" | "onBlur"> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  error?: string;
  type?: "password";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  required?: boolean;
}

function FormInputInner<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  {
    control,
    name,
    label,
    error,
    className,
    type,
    startIcon,
    endIcon,
    style,
    required,
    ...inputProps
  }: FormInputProps<TFieldValues, TName>,
  ref: React.Ref<React.ComponentRef<typeof TextInput>>,
) {
  const { t } = useTranslation();

  // State to toggle password visibility
  const [showPassword, setShowPassword] = React.useState(false);
  const isPasswordField = type === "password";

  // State to measure icon width for padding adjustment
  const [startIconWidth, setStartIconWidth] = React.useState(0);
  const [endIconWidth, setEndIconWidth] = React.useState(0);

  return (
    <View className="gap-1">
      {label && (
        <Label htmlFor={name} className="font-medium mb-1">
          {label}
          {required ? <Text className="text-light-primary">*</Text> : ""}
        </Label>
      )}

      <View className="relative">
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={ref}
              id={name}
              value={String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              className={cn(
                "overflow-hidden bg-background h-14 py-3 font-medium dark:border-white/30",
                className,
              )}
              style={[
                style,
                {
                  ...(startIconWidth
                    ? {
                      paddingLeft: startIconWidth + 24, // 24px for spacing
                    }
                    : {}),
                  ...(endIconWidth
                    ? {
                      paddingRight: endIconWidth + 16, // 16px for spacing
                    }
                    : {}),
                },
              ]}
              {...inputProps}
              secureTextEntry={
                isPasswordField ? !showPassword : inputProps.secureTextEntry
              }
            />
          )}
        />

        {startIcon && (
          <View
            className="absolute left-4 top-1/2 -translate-y-1/2"
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              setStartIconWidth(width);
            }}
          >
            {startIcon}
          </View>
        )}

        {endIcon ? (
          <View
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              setEndIconWidth(width);
            }}
          >
            {endIcon}
          </View>
        ) : isPasswordField ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            accessibilityRole="button"
            accessibilityLabel={
              showPassword
                ? t("accessibility.hidePassword")
                : t("accessibility.showPassword")
            }
            accessibilityHint={t("accessibility.passwordVisibilityHint")}
          >
            {!showPassword ? (
              <EyeOffIcon size={20} color="#8897AE" />
            ) : (
              <EyeIcon size={20} color="#8897AE" />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {error && <Text className="text-xs text-destructive">{error}</Text>}
    </View>
  );
}

export const FormInput = React.forwardRef(FormInputInner) as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FormInputProps<TFieldValues, TName> & { ref?: React.Ref<React.ComponentRef<typeof TextInput>> },
) => React.ReactElement;
