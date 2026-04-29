// app/utils/formValidators.ts
import IFormState, { CustomerType } from "@/app/interfaces/IFormState";

export default class FormValidators {
    /**
     * Helper to ensure a string exists and isn't just whitespace.
     */
    static hasText(value?: string): boolean {
        return typeof value === 'string' && value.trim().length > 0;
    }

    /**
     * Validates Step 1: Requestor Information
     */
    static isRequestorValid(data: IFormState): boolean {
        // Base requirements for everyone
        if (
            !this.hasText(data.firstName) ||
            !this.hasText(data.lastName) ||
            !this.isValidEmailFormat(data.email) ||
            !this.hasText(data.phone)
        ) {
            return false;
        }

        // Builder-specific requirements
        if (data.customerType === CustomerType.Builder) {
            return this.hasText(data.midlandRepName);
        }

        // Residential-specific requirements
        return this.hasText(data.address1) && this.hasText(data.province);
    }

    /**
     * Validates Step 3: Site Information (Builders Only)
     */
    static isSiteValid(data: IFormState): boolean {
        // Site is currently optional, but if you make project name required later:
        // return this.hasText(data.projectName);
        return true;
    }

    /**
     * Validates Step 4: Products/Appliances
     */
    static areProductsValid(data: IFormState): boolean {
        // Must have at least one product completely saved
        return Array.isArray(data.products) && data.products.length > 0;
    }

    /**
     * Optional: Basic email format validation
     */
    static isValidEmailFormat(email: string): boolean {
        if (!this.hasText(email)) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }
}