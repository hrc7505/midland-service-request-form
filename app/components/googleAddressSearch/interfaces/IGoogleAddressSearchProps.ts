import { InputProps } from "@fluentui/react-components";

import { AddressSource } from "@/app/components/googleAddressSearch/types/addressSource";
import IAddressModel from "@/app/models/IAddressModel";

/**
 * Props for GoogleAddressSearch component
 */
export default interface IGoogleAddressSearchProps extends Pick<InputProps, "name" | "value" | "onChange" | "onBlur"> {
    hasError?: boolean;

    /**
     * ISO 2-letter country code (e.g., "US", "IN")
     * Used to restrict Google autocomplete and geocoding results.
     */
    countryISO2LetterCode?: string;

    /**
     * Callback fired when a valid address is resolved.
     *
     * @param address - Parsed address object (excluding country)
     * @param isCompleteAddress - Indicates if required fields are present
     * @param meta - Additional metadata about how address was resolved
     */
    onPlaceChange?: (
        address: Omit<IAddressModel, "country">,
        isCompleteAddress: boolean,
        meta?: {
            source: AddressSource;
        }
    ) => void;
}
