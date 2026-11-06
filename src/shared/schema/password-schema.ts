import { getValidationMessage } from "@/src/lib/i18n-helpers";
import { z } from "zod";

export const passwordSchema = z.string().superRefine((val, ctx) => {
  if (!val || val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getValidationMessage('validation.password.minLength'),
    });
  }
  if (!/[a-z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getValidationMessage('validation.password.lowercase'),
    });
  }
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getValidationMessage('validation.password.uppercase'),
    });
  }
  if (!/\d/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getValidationMessage('validation.password.number'),
    });
  }
  if (!/[@$!%*?&\-+=\#.]+/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getValidationMessage('validation.password.special'),
    });
  }
  if (!/^[A-Za-z0-9@$!%*?&\-+=\#.()]+$/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getValidationMessage('validation.password.allowedChars'),
    });
  }
});
