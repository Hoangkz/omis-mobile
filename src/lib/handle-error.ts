import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError, ValidationErrorResponse } from "../shared/types/error";
import { toast } from "./toast";

type Props<T extends FieldValues> = {
    error: ApiError;
    setError?: UseFormSetError<T>;
    fallbackMessage?: string;
}

export const handleError = <T extends FieldValues>({
    error,
    setError,
    fallbackMessage = 'An error occurred'
}: Props<T>) => {
    const errorData = error.response?.data;

    // Check if this is a ValidationErrorResponse (POST/PUT with errors array)
    if (errorData && setError && 'errors' in errorData && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const validationResponse = errorData as ValidationErrorResponse;

        // Set error for each field in the form
        validationResponse.errors.forEach((validationError) => {
            const fieldName = validationError.property as Path<T>;
            // Get all constraint messages and join with period
            const errorMessage = validationError.constraints
                ? Object.values(validationError.constraints).join('. ')
                : 'Invalid value';

            setError(fieldName, { message: errorMessage });
        });
    } else {
        // If no errors array, toast the message (GET API error)
        const message = errorData?.message || fallbackMessage;
        toast.error(message, false);
    }
}