import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFullname = (firstName?: string, lastName?: string) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  return firstName || lastName || "";
};
