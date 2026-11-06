import Toast from "react-native-toast-message";
import { t, TranslationKey } from "../locales/i18n";

// Helper to format style for Toast
const config = (message: string) =>
  ({
    text2: message,
    text2NumberOfLines: 0,
    text1Style: { fontWeight: "bold" as const, fontSize: 16 },
    text2Style: { fontSize: 14 },
  }) as const;

// Core function to handle logic and avoid code repetition (DRY)
const showToast = ({
  isTranslate,
  message,
  type,
  onPress,
  title,
}: {
  type: "success" | "error" | "info" | "notification";
  title?: string;
  message: string;
  isTranslate: boolean;
  onPress?: () => void;
}) => {
  // Cast message to TranslationKey only when isTranslate is true to prevent i18n.t errors
  const text2 = isTranslate ? t(message as TranslationKey) : message;

  Toast.show({
    type: type === "notification" ? "info" : type,
    text1: title || t(`toast.${type}` as TranslationKey),
    ...config(text2),
    onPress,
  });
};

// Define Interface for toast functions to support Overloading
interface ToastFunction {
  (message: TranslationKey, isTranslate?: true): void;
  (message: string, isTranslate: false): void;
}

interface NotificationFunction {
  ({
    title,
    message,
    onPress,
  }: {
    title: string;
    message: string;
    onPress?: () => void;
  }): void;
}

export const toast = {
  success: ((message, isTranslate = true) => {
    showToast({ type: "success", message, isTranslate });
  }) as ToastFunction,

  error: ((message, isTranslate = true) => {
    showToast({ type: "error", message, isTranslate });
  }) as ToastFunction,

  info: ((message, isTranslate = true) => {
    showToast({ type: "info", message, isTranslate });
  }) as ToastFunction,

  notification: (({ title, message, onPress }) => {
    showToast({
      type: "notification",
      title,
      message,
      onPress,
      isTranslate: false,
    });
  }) as NotificationFunction,
};
