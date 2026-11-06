import { MAX_HEIGHT_DROPDOWN_SELECT } from "@/src/lib/constant";
import { hideKeyboard } from "@/src/lib/keyboard";
import { Label } from "@/src/shared/components/ui/label";
import {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/shared/components/ui/select";
import { Text } from "@/src/shared/components/ui/text";
import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { View, type LayoutChangeEvent } from "react-native";

export type SelectOption = {
  value: string;
  label: string;
};

interface FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  options,
  placeholder = "Select an option",
  error,
  disabled = false,
  required,
}: FormSelectProps<TFieldValues, TName>) {
  const [triggerWidth, setTriggerWidth] = React.useState(0);

  const onSelectTriggerLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      setTriggerWidth(width);
    },
    [],
  );

  const handleSelectPress = React.useCallback(() => {
    hideKeyboard();
  }, []);

  return (
    <View className="gap-1">
      {label && (
        <Label nativeID={name} className="font-medium mb-1">
          {label}
          {required ? <Text className="text-light-primary">*</Text> : ""}
        </Label>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Select
            value={options.find((option) => option.value === value)}
            onValueChange={(option) => onChange(option?.value)}
            disabled={disabled}
          >
            <SelectTrigger
              className="w-full h-14 bg-background dark:border-white/30"
              onLayout={onSelectTriggerLayout}
              onPress={handleSelectPress}
            >
              <SelectValue
                className="text-foreground font-medium"
                placeholder={placeholder}
              />
            </SelectTrigger>
            <SelectContent
              style={{ minWidth: triggerWidth }}
              className="p-0 shadow-lg shadow-black/10 border border-foreground/10"
            >
              <SelectGroup className="overflow-hidden rounded-[16px]">
                <NativeSelectScrollView
                  style={{ maxHeight: MAX_HEIGHT_DROPDOWN_SELECT }}
                  nestedScrollEnabled
                >
                  {options.map((option) => {
                    const isSelected = value === option.value;

                    return (
                      <SelectItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        className={isSelected ? "bg-primary/10" : ""}
                      />
                    );
                  })}
                </NativeSelectScrollView>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />

      {error && <Text className="text-xs text-destructive">{error}</Text>}
    </View>
  );
}
