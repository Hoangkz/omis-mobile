import { MAX_AVATAR_UPLOAD_SIZE_MB } from "@/src/lib/constant";
import { toast } from "@/src/lib/toast";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

type Props = {
  initialImage?: string | null;
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  maxFileSizeMB?: number;
  needBase64?: boolean;
  onChange?: ({
    imageUri,
    imageBase64,
  }: {
    imageUri: string;
    imageBase64: string;
  }) => void;
};

export function useImagePicker(props?: Props) {
  const [image, setImage] = useState<string | null>(
    props?.initialImage || null,
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  /* Init default config */
  const aspect = props?.aspect || [1, 1];
  const quality = props?.quality || 0.8;
  const allowsEditing = props?.allowsEditing ?? true;
  const maxFileSizeMB = props?.maxFileSizeMB || MAX_AVATAR_UPLOAD_SIZE_MB;
  const maxFileSizeMBBytes = maxFileSizeMB * 1024 * 1024;
  const needBase64 = props?.needBase64 || true;

  const pickImage = async () => {
    try {
      // No need to request library access permission on newer Expo versions (it asks automatically when opened)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // Only select images
        allowsEditing,
        aspect,
        quality,
        base64: true, // Get base64 data
      });

      if (!result.canceled) {
        const base64Data = result.assets[0].base64;

        // Ensure base64 data exists
        if (!base64Data) {
          toast.error("Failed to process image. Please try again.", false);
          return;
        }

        // Check file size (base64 string length * 0.75 gives approximate byte size)
        const fileSizeInBytes = (base64Data.length * 3) / 4;

        if (fileSizeInBytes > maxFileSizeMBBytes) {
          const fileSizeMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
          toast.error(
            `Image is too large (${fileSizeMB}MB). Maximum size is ${maxFileSizeMB}MB.`,
            false,
          );
          return;
        }

        // result.assets[0].uri is the local image path
        setImage(result.assets[0].uri);

        // Base64
        let base64Image = "";
        if (needBase64) {
          const mimeType = result.assets[0].mimeType || "image/jpeg";
          base64Image = `data:${mimeType};base64,${base64Data}`;
          setImageBase64(base64Image);
        }

        // Call onChange callback if provided
        if (props?.onChange) {
          props.onChange({
            imageUri: result.assets[0].uri,
            imageBase64: base64Image,
          });
        }
      }
    } catch (error) {
      console.error("Failed to pick image from library:", error);
      toast.error(
        "Failed to pick image. Please check your permissions and try again.",
        false,
      );
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageBase64(null);
  };

  return {
    image,
    imageBase64,
    pickImage,
    clearImage,
  };
}
