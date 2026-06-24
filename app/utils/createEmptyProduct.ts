import { v4 as uuid } from "uuid";

import { IProduct } from "@/app/interfaces/IFormState";

/**
 * Generates a fresh, empty product template equipped with a newly minted UUID.
 *
 * @returns A strictly typed, initialized `IProduct` record.
 */
const createEmptyProduct = (): IProduct => ({
    id: uuid(),
    appliance: undefined,
    brand: "",
    problem: "",
    photos: [],
});

export default createEmptyProduct;