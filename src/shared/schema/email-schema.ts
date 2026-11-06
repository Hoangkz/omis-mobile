import { getValidationMessage } from "@/src/lib/i18n-helpers";
import { z } from "zod";

export const emailSchema = z.string().superRefine((val, ctx) => {
  if (!val || !z.string().email().safeParse(val).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getValidationMessage('validation.email'),
    });
  }
});