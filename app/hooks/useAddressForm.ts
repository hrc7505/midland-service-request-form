import { useCallback, useState, type ChangeEvent, type FocusEvent } from "react";
import iso3166 from "iso-3166-2";
import IAddressModel from "@/app/models/IAddressModel";
import { AddressSource } from "@/app/components/googleAddressSearch/types/addressSource";
import { autoFields, manualFields } from "@/app/components/addressForm/addressFormFields";
import { AddressFormFieldKeys } from "@/app/components/addressForm/types/addressFormFieldKeys";


/* -------------------------------------------------------------------------- */
/*                             INITIAL STATE                                  */
/* -------------------------------------------------------------------------- */

/**
 * Creates initial address form state.
 *
 * @param defaultCountry Optional default country name
 */
const createInitialState = (defaultCountry?: string) => {
    return {
        line1: { value: "", hasError: false },
        street_number: { value: "", hasError: false },
        street_name: { value: "", hasError: false },
        unit_number: { value: "", hasError: false },
        city: { value: "", hasError: false },
        state: { value: "", hasError: false },
        state_iso_code: { value: "", hasError: false },
        zip_code: { value: "", hasError: false },
    };
};

const countryISO = "ca";

/* -------------------------------------------------------------------------- */
/*                              HOOK                                          */
/* -------------------------------------------------------------------------- */

/**
 * useAddressForm
 *
 * Manages full address form state, validation, and Google autofill integration.
 *
 * Features:
 * - Auto vs Manual mode handling
 * - Google + browser autofill support
 * - Field-level validation
 * - ISO code resolution for state
 *
 * @param defaultCountry Optional default country name
 */
const useAddressForm = (defaultCountry?: string) => {
    const [fieldState, setFieldState] = useState(() =>
        createInitialState(defaultCountry)
    );

    const [mode, setMode] = useState<"auto" | "manual">("auto");
    const [showOtherFields, setShowOtherFields] = useState(false);

    /* -------------------- FIELD CHANGE -------------------- */

    /**
     * Handles input change for address fields.
     */
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFieldState(prev => ({
            ...prev,
            [name]: { value, hasError: false },

            // Reset state ISO if user edits state manually
            ...name === "state"
                ? { state_iso_code: { value: "", hasError: false } }
                : {},
        }));
    }, []);

    /* -------------------- BLUR (STATE ISO RESOLUTION) -------------------- */

    /**
     * Resolves ISO code for state on blur (manual entry).
     */
    const onBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name !== "state" || !value) return;

        const res = iso3166.subdivision(countryISO, value);

        setFieldState(prev => ({
            ...prev,
            state: {
                ...prev.state,
                // If it fails to resolve, we mark it as an error to trigger border
                hasError: Boolean(value && !res?.regionCode),
            },
            state_iso_code: {
                value: res?.regionCode || "",
                hasError: Boolean(value && !res?.regionCode),
            },
        }));
    }, []);

    /* -------------------- GOOGLE / AUTOFILL -------------------- */

    /**
     * Handles address selection from Google or browser autofill.
     */
    const onPlaceChange = useCallback((
        address: Omit<IAddressModel, "country"> & { country?: { name: string; iso_2_letter_code: string } },
        isCompleteAddress: boolean,
        meta?: { source: AddressSource }
    ) => {
        if (meta?.source === "google" || meta?.source === "autofill") {
            setMode(isCompleteAddress ? "auto" : "manual");
            setShowOtherFields(true);
        }

        setFieldState(prev => ({
            ...prev,
            line1: { value: address.line1 || "", hasError: false },
            street_number: { value: address.street_number || "", hasError: false },
            street_name: { value: address.street_name || "", hasError: false },
            unit_number: { value: address.unit_number || "", hasError: false },
            city: { value: address.city || "", hasError: false },
            zip_code: { value: address.zip_code || "", hasError: false },
            state: { value: address.state.name || "", hasError: false },
            state_iso_code: {
                value: address.state.iso_2_letter_code || "",
                hasError: false,
            },
        }));
    }, []);

    /**
     * Handles cases where autofill is selected but Google API cannot resolve the text.
     * Forces manual mode and preserves the user's input.
     */
    const handleResolutionFailed = useCallback((failedValue: string) => {
        setMode("manual");
        setShowOtherFields(true);
        setFieldState(prev => ({
            ...prev,
            line1: { value: failedValue, hasError: false }
        }));
    }, []);

    const onStateChange = useCallback((stateName: string, iso: string) => {
        setFieldState(prev => ({
            ...prev,
            state: { ...prev.state, value: stateName, hasError: false },
            state_iso_code: {
                ...prev.state_iso_code,
                value: iso,
                hasError: false,
            },
        }));
    }, []);

    /* -------------------- VALIDATION + OUTPUT -------------------- */

    /**
     * Validates current form and returns structured address.
     *
     * @returns Address payload or undefined if validation fails
     */
    const getAddress = useCallback((): Omit<IAddressModel, "line1"> | undefined => {
        const isManual = mode === "manual";
        const stateISO = fieldState.state_iso_code.value;
        const activeFields = isManual ? manualFields : autoFields;

        let hasValidationErrors = false;

        // Create a deep copy (avoid mutating state directly)
        const nextFieldState = structuredClone(fieldState);

        for (const field of activeFields) {
            if (!field.required) continue;

            const key = field.name as AddressFormFieldKeys;
            const val = fieldState[key]?.value;

            // Special state ISO validation - Ensure 'state' hasError is set for border
            if (key === "state" && isManual && !stateISO) {
                nextFieldState.state.hasError = true;
                hasValidationErrors = true;
                continue;
            }

            if (!val || !val.trim()) {
                nextFieldState[key].hasError = true;
                hasValidationErrors = true;
            }
        }

        if (hasValidationErrors) {
            setFieldState(nextFieldState);
            return undefined;
        }

        return {
            street_number: fieldState.street_number.value,
            street_name: fieldState.street_name.value,
            unit_number: fieldState.unit_number.value,
            city: fieldState.city.value,
            zip_code: fieldState.zip_code.value,
            state: {
                name: fieldState.state.value,
                iso_2_letter_code: stateISO,
            },
        };
    }, [fieldState, mode]);

    /* ---------------------------------------------------------------------- */

    return {
        fieldState,
        setFieldState,
        mode,
        setMode,
        showOtherFields,
        setShowOtherFields,
        handleChange,
        onBlur,
        onPlaceChange,
        onStateChange,
        getAddress,
        handleResolutionFailed,
    };
};

export default useAddressForm;
