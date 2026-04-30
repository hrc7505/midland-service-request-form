import type { IAddressModel } from "@chiizu/checkout-core";

/**
 * Imperative API exposed by AddressForm via ref.
 */
export default interface IAddressFormRef {
    /**
     * Returns validated address data.
     * Returns undefined if validation fails.
     */
    getAddress(): Omit<IAddressModel, "line1"> | undefined;
}
