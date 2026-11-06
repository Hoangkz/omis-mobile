import { cn } from "@/src/lib/utils";
import { CalendarPlaceholderIcon } from "@/src/shared/components/common/icons";
import { Button } from "@/src/shared/components/ui/button";
import { Label } from "@/src/shared/components/ui/label";
import { Text } from "@/src/shared/components/ui/text";
import { useTranslation } from "@/src/shared/hooks/utils/use-translation";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Modal, Platform, TouchableOpacity, View } from "react-native";

interface FormDateTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  error?: string;
  mode?: "date" | "time" | "datetime";
  placeholder?: string;
  iconColor?: string;
  required?: boolean;
  pastDate?: boolean;
}

export function FormDateTimePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  error,
  mode = "datetime",
  placeholder = "",
  iconColor,
  required,
  pastDate = false,
}: FormDateTimePickerProps<TFieldValues, TName>) {
  const { t } = useTranslation();
  const [show, setShow] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(new Date());
  const [pickerMode, setPickerMode] = React.useState<"date" | "time">(
    mode === "time" ? "time" : "date",
  );

  const formatValue = (value: Date | null | undefined): string => {
    if (!value) return "";

    const formatDate = (date: Date): string => {
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    };

    const formatTime = (date: Date): string => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    if (mode === "date") {
      return formatDate(value);
    } else if (mode === "time") {
      return formatTime(value);
    } else {
      return `${formatDate(value)}  ${formatTime(value)}`;
    }
  };

  const handleOpen = (currentValue: Date | null | undefined) => {
    setTempDate(
      currentValue instanceof Date ? new Date(currentValue) : new Date(),
    );
    setPickerMode(mode === "time" ? "time" : "date");
    setShow(true);
  };

  const handleConfirm = (onChange: (value: Date) => void) => {
    // If datetime mode and currently showing date picker, switch to time picker
    if (mode === "datetime" && pickerMode === "date") {
      setPickerMode("time");
      return;
    }

    onChange(tempDate);
    setShow(false);
    setPickerMode(mode === "time" ? "time" : "date");
  };

  const handleCancel = () => {
    setShow(false);
    setPickerMode(mode === "time" ? "time" : "date");
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
    onChange?: (value: Date) => void,
  ) => {
    if (Platform.OS === "android") {
      // Android: Native picker handles confirm/cancel
      if (event.type === "set" && selectedDate) {
        setTempDate(selectedDate);

        // If datetime mode and currently showing date picker, switch to time picker
        if (mode === "datetime" && pickerMode === "date") {
          setPickerMode("time");
          // Show time picker immediately
          return;
        }

        // Otherwise, update the value and close
        if (onChange) {
          onChange(selectedDate);
        }
        setShow(false);
        setPickerMode(mode === "time" ? "time" : "date");
      } else if (event.type === "dismissed") {
        // User cancelled
        setShow(false);
        setPickerMode(mode === "time" ? "time" : "date");
      }
    } else {
      // iOS: Just update temp value
      if (event.type === "set" && selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  return (
    <View className="gap-1">
      <Label htmlFor={name} className="font-medium mb-1">
        {label}
        {required ? <Text className="text-light-primary">*</Text> : ""}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <>
            <TouchableOpacity
              onPress={() => handleOpen(value as Date)}
              className={cn(
                "flex-row items-center justify-between rounded-lg border border-input bg-background px-3 h-14",
                error && "border-destructive",
              )}
            >
              <Text
                className={cn(
                  "text-base font-medium",
                  !value && "text-muted-foreground",
                )}
              >
                {value ? formatValue(value as Date) : placeholder}
              </Text>
              <CalendarPlaceholderIcon
                size={20}
                {...(iconColor ? { color: iconColor } : {})}
              />
            </TouchableOpacity>

            {/* Android: Native picker without Modal */}
            {Platform.OS === "android" && show && (
              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                display="default"
                onChange={(event, date) =>
                  handleDateChange(event, date, onChange)
                }
                minimumDate={!pastDate ? new Date() : undefined}
              />
            )}

            {/* iOS: Modal with custom UI */}
            {Platform.OS === "ios" && (
              <Modal
                visible={show}
                transparent={true}
                animationType="none"
                onRequestClose={handleCancel}
              >
                <TouchableOpacity
                  className="flex-1 justify-end bg-black/50"
                  activeOpacity={1}
                  onPress={handleCancel}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <View className="bg-background rounded-t-3xl p-6 pb-8">
                      {/* Picker */}
                      <View className="mb-6">
                        <DateTimePicker
                          value={tempDate}
                          mode={pickerMode}
                          display="spinner"
                          onChange={(event, date) =>
                            handleDateChange(event, date, onChange)
                          }
                          minimumDate={!pastDate ? new Date() : undefined}
                        />
                      </View>

                      {/* Buttons */}
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <Button variant="outline" onPress={handleCancel}>
                            <Text>{t("common.cancel")}</Text>
                          </Button>
                        </View>
                        <View className="flex-1">
                          <Button onPress={() => handleConfirm(onChange)}>
                            <Text>
                              {mode === "datetime" && pickerMode === "date"
                                ? t("common.next")
                                : t("common.confirm")}
                            </Text>
                          </Button>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Modal>
            )}
          </>
        )}
      />
      {error && <Text className="text-xs text-destructive">{error}</Text>}
    </View>
  );
}
