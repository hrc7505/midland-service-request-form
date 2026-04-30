import { useCallback, useRef } from "react";
import { Field, useCommonStyles } from "@chiizu/checkout-core";

import useGoogleAutocomplete from "@card/hooks/useGoogleAutocomplete";
import type IGoogleAddressSearchProps from "@card/components/googleAddressSearch/interfaces/IGoogleAddressSearchProps";
import type { AddressSource } from "@card/components/googleAddressSearch/types/addressSource";
import parseNewPlace from "@card/components/googleAddressSearch/parseNewPlace";

/* -------------------------------------------------------------------------- */
/*                           GOOGLE ADDRESS SEARCH                            */
/* -------------------------------------------------------------------------- */

/**
 * GoogleAddressSearch component
 *
 * Integrates:
 * - Google Places Autocomplete Web Component
 * - Address parsing
 * - Controlled form integration
 *
 * Features:
 * - Supports browser autofill + Google dropdown
 * - Emits structured address model
 * - Works with Chiizu Field system
 *
 * @param props Component props
 */
const GoogleAddressSearch = ({
    countryISO2LetterCode,
    onPlaceChange,
    autoGridColumn,
    label,
    hasError,
    name,
    value,
    onChange,
    onBlur,
}: IGoogleAddressSearchProps) => {
    const { relative } = useCommonStyles();
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * Handles place selection from Google or autofill.
     */
    const onPlaceSelect = useCallback((place: google.maps.places.Place, source: AddressSource) => {
        const { address, isCompleteAddress } = parseNewPlace(place);

        onPlaceChange?.(address, isCompleteAddress, { source });
    }, [onPlaceChange]);

    /* -------------------- HOOK -------------------- */

    useGoogleAutocomplete({
        containerRef,
        countryISO2LetterCode,
        name,
        value,
        onChange,
        onBlur,
        onPlaceSelect,
        hasError,
    });

    /* -------------------- RENDER -------------------- */

    return (
        <Field
            autoGridColumn={autoGridColumn}
            label={label}
            name={name}
            hasError={hasError}
            className={`${relative} chiizu-google-wrapper high`}
        >
            <div ref={containerRef} />
        </Field>
    );
};

export default GoogleAddressSearch;
