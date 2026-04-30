import { useCallback, useRef } from "react";
import { Field, useCommonStyles } from "@chiizu/checkout-core";

import useGoogleAutocomplete from "@card/hooks/useGoogleAutocomplete";
import type IStateAutocompleteProps from "@card/components/stateAutocomplete/interfaces/IStateAutocompleteProps";
import type { AddressSource } from "@card/components/googleAddressSearch/types/addressSource";
import extractState from "@card/components/stateAutocomplete/extractState";

/**
 * Restrict autocomplete results to state-level regions only.
 * Defined outside component to maintain stable reference.
 */
const STATE_RESTRICTIONS = ["administrative_area_level_1"];

/* -------------------------------------------------------------------------- */
/*                           STATE AUTOCOMPLETE                               */
/* -------------------------------------------------------------------------- */

/**
 * StateAutocomplete component
 *
 * Integrates Google Places Autocomplete to select a state/region.
 *
 * Features:
 * - Restricts results to administrative areas (states)
 * - Emits structured state data (name + ISO code)
 * - Supports controlled input behavior
 * - Compatible with Chiizu Field system
 *
 * @param props Component props
 */
const StateAutocomplete = ({
    countryISO2LetterCode,
    value,
    name,
    label,
    hasError,
    required,
    autoGridColumn,
    onPlaceChange,
    onChange,
    onBlur,
}: IStateAutocompleteProps) => {
    const { relative } = useCommonStyles();
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * Handles selection from Google autocomplete.
     */
    const onPlaceSelect = useCallback((place: google.maps.places.Place, source: AddressSource) => {
        const state = extractState(place);

        if (!state.name && !state.iso_2_letter_code) return;

        onPlaceChange?.(
            state.name,
            state.iso_2_letter_code,
            { source }
        );
    }, [onPlaceChange]);

    /* -------------------- HOOK -------------------- */

    useGoogleAutocomplete({
        containerRef,
        countryISO2LetterCode,
        includedPrimaryTypes: STATE_RESTRICTIONS,
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
            required={required}
            label={label}
            name={name}
            hasError={hasError}
            className={`${relative} chiizu-google-wrapper low`}
        >
            <div ref={containerRef} />
        </Field>
    );
};

export default StateAutocomplete;
