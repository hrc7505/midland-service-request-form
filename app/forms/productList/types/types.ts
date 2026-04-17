import type { IProduct } from "@/app/interfaces/IFormState";

export type ProductKey = keyof IProduct;

export type UpdateProductFn = <K extends ProductKey>(
    id: string,
    key: K,
    value: IProduct[K]
) => void;

export interface ProductItemProps {
    product: IProduct;
    isEditing?: boolean;
    draftProduct?: IProduct | null;
    onEdit: (product: IProduct) => void;
    onChange: UpdateProductFn;
    onRemove: (id: string) => void;
}