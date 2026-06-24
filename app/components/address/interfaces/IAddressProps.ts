import { ChangeEvent } from "react";
import { InputOnChangeData } from "@fluentui/react-components";

import IFormState from "@/app/interfaces/IFormState";
import IFieldValidation from "@/app/components/address/interfaces/IFieldValidation";

/**
 * Properties for the Fluent UI Address component, providing data binding,
 * change handlers, and validation states for the address fields.
 */
export default interface IAddressProps {
    data: IFormState;
    handleInputChange: (ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void;
    onUpdate: <K extends keyof IFormState>(key: K, value: IFormState[K]) => void;
    validations: {
        address1: IFieldValidation;
        city: IFieldValidation;
        province: IFieldValidation;
        postalCode: IFieldValidation;
    };
}