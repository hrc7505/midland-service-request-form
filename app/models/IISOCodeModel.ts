/**
 * Represents ISO code metadata (country/state).
 */
export default interface IISOCodeModel {
    /** Display name (e.g., India, California) */
    name: string;

    /** ISO 2-letter code (e.g., IN, US) */
    iso_2_letter_code: string;
}
