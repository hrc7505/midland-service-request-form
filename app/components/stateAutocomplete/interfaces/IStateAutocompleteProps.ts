import type { ITextFieldProps } from "@chiizu/checkout-core";

import type { AddressSource } from "@card/components/googleAddressSearch/types/addressSource";

/**
 * State autocomplete props
 */
export default interface IStateAutocompleteProps extends ITextFieldProps {
    /**
     * ISO 2-letter country code (e.g., "US", "IN")
     * Used to restrict Google results.
     */
    countryISO2LetterCode?: string;

    /**
     * Callback fired when a state is selected or resolved.
     *
     * @param stateName - Full state name (e.g., "California")
     * @param stateIso - ISO/state code (e.g., "CA")
     * @param meta - Optional metadata about source
     */
    onPlaceChange?: (
        stateName: string,
        stateIso: string,
        meta?: {
            source: AddressSource;
        }
    ) => void;
}
