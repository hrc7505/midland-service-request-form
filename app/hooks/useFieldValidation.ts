import { useState, useCallback } from "react";

/**
 * Custom hook that manages touched states and generates validation properties
 * to be spread onto Fluent UI form fields and inputs.
 *
 * @template T The form data interface to track keys against.
 */
export default function useFieldValidation<T>() {
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const handleBlur = useCallback((fieldName: keyof T) => {
        setTouched((prev) => ({ ...prev, [fieldName]: true }));
    }, []);

    /**
     * @param fieldName - The key from your state (e.g., "firstName")
     * @param isValid - A boolean determining if the current value is valid
     * @param errorMessage - The message to display if invalid
     */
    const registerField = useCallback((fieldName: keyof T, isValid: boolean, errorMessage: string) => {
        const showError = touched[fieldName] && !isValid;

        return {
            // Spread these onto the Fluent UI <Field>
            fieldProps: {
                validationState: (showError ? "error" : "none") as "error" | "none",
                validationMessage: showError ? errorMessage : undefined,
            },
            // Spread these onto the <Input>, <Textarea>, or <Dropdown>
            inputProps: {
                onBlur: () => handleBlur(fieldName),
            },
        };
    }, [touched, handleBlur]);

    return { registerField };
}