import { getValidationMessage } from "@/src/lib/i18n-helpers";
import { z } from "zod";

export const phoneSchema = z.string()
    .transform(val => val?.replace(/\s/g, '') || '') // Remove spaces
    .superRefine((val, ctx) => {
        // Allow empty string (optional field)
        if (!val || val === '') {
            return;
        }

        // Validate phone format: optional + prefix, then 5-20 digits
        const phoneRegex = /^\+?\d{5,20}$/;

        if (!phoneRegex.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: getValidationMessage('validation.phoneNumber'),
            });
        }
    });