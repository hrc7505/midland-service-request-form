import type { IProduct } from "@/app/interfaces/IFormState";

export const isProductValid = (product: IProduct): boolean => {
    return Boolean(
        product.appliance &&
        product.brand.trim() &&
        product.problem.trim()
    );
};