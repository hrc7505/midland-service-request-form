import { forwardRef, useCallback, useImperativeHandle } from "react";
import { Dropdown, TextField } from "@chiizu/checkout-core";

import GoogleAddressSearch from "@card/components/googleAddressSearch/googleAddressSearch";
import StateAutocomplete from "@card/components/stateAutocomplete/stateAutocomplete";
import countries from "@card/data/countries.json";
import { useBaseContext } from "@card/context/baseContext/baseContext";
import type IAddressFormRef from "@card/components/addressForm/interfaces/IAddressFormRef";
import type IAddressFormField from "@card/components/addressForm/interfaces/IAddressFormField";
import { autoFields, manualFields } from "@card/components/addressForm/addressFormFields";
import useAddressForm from "@card/hooks/useAddressForm";

import useAddressFormStyles from "@card/components/addressForm/useAddressFormStyles";

const options = [...countries]
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map(c => ({ key: c.name, text: c.name }));

/**
 * AddressForm component with forwardRef to expose getAddress method
 * to parent components. It uses useAddressForm hook for managing form state and logic.
 * The form can toggle between autocomplete and manual entry modes.
 */
const AddressForm = forwardRef<IAddressFormRef>((_, ref) => {
    const { defaultCountry } = useBaseContext();
    const styles = useAddressFormStyles();

    const {
        fieldState,
        mode,
        showOtherFields,
        setMode,
        setShowOtherFields,
        handleChange,
        handleCountryChange,
        onBlur,
        onPlaceChange,
        onStateChange,
        getAddress
    } = useAddressForm(defaultCountry);

    useImperativeHandle(ref, () => ({
        getAddress,
    }), [getAddress]);

    const renderField = useCallback((field: IAddressFormField) => {
        if (field.name === "line1") {
            return (
                <GoogleAddressSearch
                    key={fieldState.country_iso_code.value}
                    {...field}
                    {...fieldState[field.name]}
                    onChange={handleChange}
                    onBlur={onBlur}
                    onPlaceChange={onPlaceChange}
                    countryISO2LetterCode={fieldState.country_iso_code.value}
                />
            );
        }

        if (!showOtherFields) return null;

        if (field.name === "state") {
            return (
                <StateAutocomplete
                    key={field.name}
                    {...field}
                    {...fieldState[field.name]}
                    onChange={handleChange}
                    onBlur={onBlur}
                    onPlaceChange={onStateChange}
                    countryISO2LetterCode={fieldState.country_iso_code.value}
                />
            );
        }

        return (
            <TextField
                key={field.name}
                {...field}
                {...fieldState[field.name]}
                onChange={handleChange}
                onBlur={onBlur}
            />
        );
    }, [fieldState, handleChange, onBlur, onPlaceChange, onStateChange, showOtherFields]);

    const autoManualBtnClick = useCallback(() => {
        const next = mode === "auto" ? "manual" : "auto";
        setMode(next);
        setShowOtherFields(true);
    }, [mode, setMode, setShowOtherFields]);

    return (
        <div className={styles.root}>
            <div className={styles.headerText}>Billing Address</div>

            <div className={styles.field}>
                <Dropdown
                    {...fieldState.country}
                    name="country"
                    label="Country"
                    options={options}
                    onChange={handleCountryChange}
                    autoComplete="off"
                />

                <button
                    type="button"
                    className={styles.addressFormToggleLink}
                    onClick={autoManualBtnClick}
                    aria-pressed={mode === "manual"}
                >
                    {mode === "auto"
                        ? "Switch to manual entry"
                        : "Use autocomplete instead"}
                </button>
            </div>

            {fieldState.country.value &&
                (mode === "auto" ? autoFields : manualFields).map(renderField)}
        </div>
    );
});

export default AddressForm;
