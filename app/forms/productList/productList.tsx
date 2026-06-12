'use client';

import { Button } from "@fluentui/react-components";
import { useCallback, useEffect, useMemo, useState } from "react";

import useFormContext from "@/app/context/formContext";
import { createEmptyProduct } from "@/app/utils/createEmptyProduct";
import { CustomerType, type IProduct } from "@/app/interfaces/IFormState";
import ProductCard from "@/app/forms/productList/productCard/productCard";
import ProductFormFields from "@/app/forms/productList/fields/productFields";
import FormValidators from "@/app/utils/formValidations";

export default function ProductList() {
    const { formData, handleUpdate } = useFormContext();

    const [draftProduct, setDraftProduct] = useState<IProduct | null>(null);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // ✅ Initial load → show only form (no products yet)
    useEffect(() => {
        if (formData.products.length === 0 && !draftProduct) {
            setDraftProduct(createEmptyProduct());
            setIsAdding(true);
        }
    }, [formData.products, draftProduct]);

    const isEditing = Boolean(editingProductId);

    const isDraftValid = useMemo(() => {
        if (!draftProduct) return false;

        const baseValid = FormValidators.hasText(draftProduct.appliance) &&
            FormValidators.hasText(draftProduct.brand) &&
            FormValidators.hasText(draftProduct.modelNumber);

        if (!baseValid) return false;

        if (formData.customerType === CustomerType.Builder) {
            return FormValidators.hasText(draftProduct.unitNumber);
        }

        if (formData.customerType === CustomerType.Residential) {
            return FormValidators.hasText(draftProduct.problem) &&
                FormValidators.hasText(draftProduct.invoiceNumber);
        }

        return true;
    }, [draftProduct, formData.customerType]);

    // ➕ Add new
    const handleAdd = useCallback(() => {
        if (isAdding || isEditing) return;

        setDraftProduct(createEmptyProduct());
        setIsAdding(true);
    }, [isAdding, isEditing]);

    // ✏️ Edit
    const handleEdit = useCallback((product: IProduct) => {
        setEditingProductId(product.id);
        setDraftProduct(product);
    }, []);

    // 💾 Save
    const handleSave = useCallback(() => {
        if (!draftProduct || !isDraftValid) return;

        let updated: IProduct[];

        if (isAdding) {
            updated = [...formData.products, draftProduct];
        } else {
            updated = formData.products.map(p =>
                p.id === draftProduct.id ? draftProduct : p
            );
        }

        handleUpdate('products', updated);

        setDraftProduct(null);
        setEditingProductId(null);
        setIsAdding(false);
    }, [draftProduct, isDraftValid, isAdding, formData.products, handleUpdate]);

    // ❌ Cancel (only for edit)
    const handleCancel = useCallback(() => {
        setDraftProduct(null);
        setEditingProductId(null);
        setIsAdding(false);
    }, []);

    // 🗑 Delete
    const handleRemove = useCallback((id: string) => {
        handleUpdate(
            'products',
            formData.products.filter(p => p.id !== id)
        );
    }, [formData.products, handleUpdate]);

    // ✍️ Draft change
    const handleChange = useCallback(
        (id: string, key: keyof IProduct, value: unknown) => {
            if (!draftProduct) return;

            setDraftProduct({
                ...draftProduct,
                [key]: value,
            });
        },
        [draftProduct]
    );

    const isFormVisible = isAdding || isEditing;

    return (
        <div>

            {/* ✅ FORM ONLY (Add or Edit Mode) */}
            {isFormVisible && draftProduct && (
                <div style={{ marginBottom: 24 }}>
                    <ProductFormFields
                        product={draftProduct}
                        onChange={handleChange}
                    />

                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <Button
                            appearance="primary"
                            onClick={handleSave}
                            disabled={!isDraftValid}
                        >
                            Save
                        </Button>

                        {/* ✅ Cancel only in edit mode */}
                        {isEditing && (
                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* ✅ SHOW CARDS ONLY WHEN NOT ADDING/EDITING */}
            {!isFormVisible && formData.products.length > 0 && (
                <>
                    {formData.products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={handleEdit}
                            onRemove={handleRemove}
                        />
                    ))}
                </>
            )}

            {/* ✅ ADD BUTTON (only when not editing/adding) */}
            {!isFormVisible && formData.products.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <Button
                        appearance="primary"
                        onClick={handleAdd}
                    >
                        + Add Appliance
                    </Button>
                </div>
            )}
        </div>
    );
}