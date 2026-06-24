import type { IProduct } from "@/app/interfaces/IFormState";
import { CustomerType } from "@/app/interfaces/IFormState";

/**
 * Evaluates whether a product draft is valid and ready to be saved.
 *
 * @param product - The product object to validate.
 * @param customerType - The customer type to apply specific rules.
 * @returns True if the product possesses all required base fields.
 */
const isProductValid = (product: IProduct, customerType: CustomerType): boolean => {
    const baseValid = Boolean(product.appliance && product.brand?.trim() && product.modelNumber?.trim());

    if (!baseValid) return false;

    if (customerType === CustomerType.Builder) {
        return Boolean(product.unitNumber?.trim());
    }

    if (customerType === CustomerType.Residential) {
        return Boolean(product.problem?.trim() && product.invoiceNumber?.trim());
    }

    return false;
};

export default isProductValid;
