import IAddressModel from "@/app/models/IAddressModel";

/**
 * Union of all address form field keys, including
 * additional ISO code fields not present in IAddressModel.
 *
 * Used to strongly type form state and field mappings.
 */
export type AddressFormFieldKeys = keyof IAddressModel | "country_iso_code" | "state_iso_code";
