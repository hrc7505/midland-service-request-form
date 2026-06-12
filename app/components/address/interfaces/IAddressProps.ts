import { InputOnChangeData } from "@fluentui/react-components";
import { ChangeEvent } from "react";

import IFormState from "@/app/interfaces/IFormState";

export interface IValidationField {
    fieldProps: {
        validationMessage?: string;
        validationState?: "error" | "warning" | "success" | "none";
        [key: string]: unknown;
    };
    inputProps: {
        "aria-invalid"?: boolean;
        [key: string]: unknown;
    };
}

export default interface AddressProps {
    data: IFormState;
    handleInputChange: (ev: ChangeEvent<HTMLInputElement>, d: InputOnChangeData) => void;
    onUpdate: (field: keyof IFormState, value: string) => void;
    validations: {
        address1: IValidationField;
        city: IValidationField;
        province: IValidationField;
        postalCode: IValidationField;
    };
}