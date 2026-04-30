import type IAddressFormField from "@card/components/addressForm/interfaces/IAddressFormField";

/**
 * Address form field configuration for both:
 * - Autocomplete mode (Google Places)
 * - Manual entry mode
 *
 * Hidden ISO fields are included to store derived values
 * (country/state ISO codes) required for backend processing.
 */

/** Hidden field to store selected country ISO code */
const countryISO: IAddressFormField = {
    label: "",
    name: "country_iso_code",
    required: true,
    hidden: true,
};

/** Visible state/province field */
const state: IAddressFormField = {
    label: "Province/State",
    name: "state",
    autoGridColumn: true,
    required: true,
};

/** Hidden field to store selected state ISO code */
const stateISO: IAddressFormField = {
    label: "",
    name: "state_iso_code",
    required: true,
    hidden: true,
};

/** City field (required in both modes) */
const city: IAddressFormField = {
    label: "City",
    name: "city",
    autoGridColumn: true,
    required: true,
};

/**
 * Fields used when address autocomplete is enabled.
 * Most values are populated via Google Places.
 */
export const autoFields: IAddressFormField[] = [
    { label: "Address Line 1", name: "line1", required: true },
    {
        label: "Address Line 2",
        name: "unit_number",
        placeholder: "Apt., suite, unit number, etc. (optional)",
    },
    countryISO,
    city,
    state,
    stateISO,
    { label: "Postal/Zip Code", name: "zip_code", required: true },
];

/**
 * Fields used for manual address entry.
 * Splits address into granular inputs (street number + name).
 */
export const manualFields: IAddressFormField[] = [
    { label: "Street Number", name: "street_number", required: true, autoGridColumn: true },
    { label: "Street Name", name: "street_name", required: true, autoGridColumn: true },
    {
        label: "Unit Number",
        name: "unit_number",
        autoGridColumn: true,
        placeholder: "Apt., suite, unit number, etc. (optional)",
    },
    city,
    state,
    countryISO,
    stateISO,
    { label: "Postal/Zip Code", name: "zip_code", autoGridColumn: true, required: true },
];
