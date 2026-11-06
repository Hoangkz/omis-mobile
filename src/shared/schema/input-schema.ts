import { getValidationMessage } from "@/src/lib/i18n-helpers";
import { z } from "zod";

type ValidationRule =
    | 'required'
    | `min:${number}`
    | `max:${number}`;

/**
 * Create a string schema with custom validation rules
 * @param rules - Array of validation rules (e.g., ['required', 'min:3', 'max:50'])
 * @returns Zod string schema
 */
export const string = (rules: ValidationRule[] = []) => {
    return z.string().superRefine((val, ctx) => {
        for (const rule of rules) {
            if (rule === 'required') {
                if (!val || val.trim().length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: getValidationMessage('validation.required'),
                    });
                    return;
                }
            } else if (rule.startsWith('min:')) {
                const minLength = parseInt(rule.split(':')[1], 10);
                if (val.length < minLength) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: getValidationMessage('validation.minLength', { min: minLength }),
                    });
                    return;
                }
            } else if (rule.startsWith('max:')) {
                const maxLength = parseInt(rule.split(':')[1], 10);
                if (val.length > maxLength) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: getValidationMessage('validation.maxLength', { max: maxLength }),
                    });
                    return;
                }
            }
        }
    });
};

/**
 * Create a number schema with custom validation rules
 * @param rules - Array of validation rules (e.g., ['required', 'min:1', 'max:100'])
 * @returns Zod number schema
 */
export const number = (rules: ValidationRule[] = []) => {
    return z.coerce.number<number>().superRefine((val, ctx) => {
        for (const rule of rules) {
            if (rule === 'required') {
                if (val === undefined || val === null || isNaN(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: getValidationMessage('validation.required'),
                    });
                    return;
                }
            } else if (rule.startsWith('min:')) {
                const minValue = parseFloat(rule.split(':')[1]);
                if (val < minValue) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: getValidationMessage('validation.minValue', { min: minValue }),
                    });
                    return;
                }
            } else if (rule.startsWith('max:')) {
                const maxValue = parseFloat(rule.split(':')[1]);
                if (val > maxValue) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: getValidationMessage('validation.maxValue', { max: maxValue }),
                    });
                    return;
                }
            }
        }
    });
};

export const enumSchema = <T extends string>(rules: ValidationRule[] = [], values: readonly [T, ...T[]]) => {
    return z.enum(values).superRefine((val, ctx) => {
        for (const rule of rules) {
            if (rule === 'required') {
                if (!val || val.trim().length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: getValidationMessage('validation.required'),
                    });
                    return;
                }
            }
        }
    });
};

export const inputSchema = {
    string,
    number,
};
