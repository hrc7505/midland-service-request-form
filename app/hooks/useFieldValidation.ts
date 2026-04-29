import { useState } from "react";

export default function useFieldValidation<T>() {
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    /**
     * @param fieldName - The key from your state (e.g., 'firstName')
     * @param isValid - A boolean determining if the current value is valid
     * @param errorMessage - The message to display if invalid
     */
    const registerField = (fieldName: keyof T, isValid: boolean, errorMessage: string) => {
        const showError = touched[fieldName] && !isValid;

        return {
            // Spread these onto the Fluent UI <Field>
            fieldProps: {
                validationState: (showError ? "error" : "none") as "error" | "none",
                validationMessage: showError ? errorMessage : undefined,
            },
            // Spread these onto the <Input>, <Textarea>, or <Dropdown>
            inputProps: {
                onBlur: () => setTouched((prev) => ({ ...prev, [fieldName]: true })),
            },
        };
    };

    return { registerField };
}