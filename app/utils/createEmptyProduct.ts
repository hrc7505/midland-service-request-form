import { v4 as uuid } from "uuid";

import { IProduct } from "@/app/interfaces/IFormState";

export const createEmptyProduct = (): IProduct => ({
    id: uuid(),
    appliance: undefined,
    brand: '',
    problem: '',
    photos: [],
});