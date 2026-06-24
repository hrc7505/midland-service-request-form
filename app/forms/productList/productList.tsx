"use client";

import { Button, mergeClasses } from "@fluentui/react-components";
import { useCallback, useMemo, useState } from "react";

import useFormContext from "@/app/context/formContext";
import createEmptyProduct from "@/app/utils/createEmptyProduct";
import { CustomerType, type IProduct } from "@/app/interfaces/IFormState";
import ProductCard from "@/app/forms/productList/productCard/productCard";
import ProductFormFields from "@/app/forms/productList/fields/productFields";
import FormValidators from "@/app/utils/formValidations";

import useCommonStyles from "@/app/styles/useCommonStyles";

import useProductListStyles from "@/app/forms/productList/useProductListStyles";

/**
 * Component that orchestrates the lifecycle of product drafts—handling the addition,
 * editing, removal, and saving of products into the centralized form state.
 */
export default function ProductList() {
    const { formData, handleUpdate } = useFormContext();
    const styles = useProductListStyles();
    const commonStyles = useCommonStyles();

    const [draftProduct, setDraftProduct] = useState<IProduct | null>(null);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const isEditing = Boolean(editingProductId);
    const isEffectivelyAdding = !isEditing && !isAdding && formData.products.length === 0;

    const isDraftValid = useMemo(() => {
        const productToValidate = draftProduct ?? (isEffectivelyAdding ? createEmptyProduct() : null);
        if (!productToValidate) return false;

        const baseValid = FormValidators.hasText(productToValidate.appliance) &&
            FormValidators.hasText(productToValidate.brand) &&
            FormValidators.hasText(productToValidate.modelNumber);

        if (!baseValid) return false;

        if (formData.customerType === CustomerType.Builder) {
            return FormValidators.hasText(productToValidate.unitNumber);
        }

        if (formData.customerType === CustomerType.Residential) {
            return FormValidators.hasText(productToValidate.problem) &&
                FormValidators.hasText(productToValidate.invoiceNumber);
        }

            return false;
    }, [draftProduct, isEffectivelyAdding, formData.customerType]);

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
        const productToSave = draftProduct ?? (isEffectivelyAdding ? createEmptyProduct() : null);
        if (!productToSave || !isDraftValid) return;

        let updated: IProduct[];

        if (isAdding || isEffectivelyAdding) {
            updated = [...formData.products, productToSave];
        } else {
            updated = formData.products.map(p =>
                p.id === productToSave.id ? productToSave : p
            );
        }

        handleUpdate("products", updated);

        setDraftProduct(null);
        setEditingProductId(null);
        setIsAdding(false);
    }, [draftProduct, isDraftValid, isAdding, isEffectivelyAdding, formData.products, handleUpdate]);

    // ❌ Cancel (only for edit)
    const handleCancel = useCallback(() => {
        setDraftProduct(null);
        setEditingProductId(null);
        setIsAdding(false);
    }, []);

    // 🗑 Delete
    const handleRemove = useCallback((id: string) => {
        handleUpdate(
            "products",
            formData.products.filter(p => p.id !== id)
        );
    }, [formData.products, handleUpdate]);

    // ✍️ Draft change
    const handleChange = useCallback(
        (id: string, key: keyof IProduct, value: unknown) => {
            setDraftProduct(prev => ({
                ...(prev ?? (isEffectivelyAdding ? createEmptyProduct() : null)!),
                [key]: value
            }));
        },
        [isEffectivelyAdding]
    );

    const isFormVisible = isAdding || isEditing || isEffectivelyAdding;
    const productInForm = draftProduct ?? (isEffectivelyAdding ? createEmptyProduct() : null);

    return (
        <div>

            {/* ✅ FORM ONLY (Add or Edit Mode) */}
            {
                isFormVisible && productInForm && (
                    <div>
                        <ProductFormFields
                            product={productInForm}
                            onChange={handleChange}
                        />

                        <div className={mergeClasses(commonStyles.flexRow, commonStyles.gap2, styles.actionContainer)}>
                            <Button
                                appearance="primary"
                                onClick={handleSave}
                                disabled={!isDraftValid}
                            >
                                Save
                            </Button>

                            {/* ✅ Cancel only in edit mode */}
                            {(isEditing || (isAdding && formData.products.length > 0)) && (
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
                <div className={styles.addBtnWrapper}>
                    <Button appearance="primary" onClick={handleAdd}>
                        + Add Appliance
                    </Button>
                </div>
            )}
        </div>
    );
}