import { AddressFormFieldKeys } from "@/app/components/addressForm/types/addressFormFieldKeys";

/**
 * Configuration for a single address form field.
 * Extends base text field props with a strongly typed field name.
 */
export default interface IAddressFormField
    extends Pick<ITextFieldProps, "label" | "autoGridColumn" | "required" | "hidden" | "placeholder"> {
    /**
     * Unique key identifying the address field (e.g., "line1", "city", "country").
     * Used for state management and validation logic.
     */
    name: AddressFormFieldKeys;
}
