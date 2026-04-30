import IISOCodeModel from "@/app/models/IISOCodeModel";

/**
 * Represents a billing or shipping address.
 */
export default interface IAddressModel {
    /** Full address line used for UI display purposes */
    line1: string;

    /** Street number (e.g., 221B) */
    street_number: string;

    /** Street name (e.g., Baker Street) */
    street_name: string;

    /** Unit, apartment, or suite number */
    unit_number?: string;

    /** City name */
    city: string;

    /** State or province information */
    state: IISOCodeModel;

    /** Postal or ZIP code */
    zip_code: string;
}
