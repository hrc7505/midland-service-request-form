"use client";

import { Button, mergeClasses } from "@fluentui/react-components";
import { useCallback, useMemo, useState, useEffect } from "react";

import useFormContext from "@/app/context/formContext";
import createEmptyProduct from "@/app/utils/createEmptyProduct";
import { CustomerType, type IProduct, UploadStatus } from "@/app/interfaces/IFormState";
import ProductCard from "@/app/forms/productList/productCard/productCard";
import ProductFormFields from "@/app/forms/productList/fields/productFields";
import FormValidators from "@/app/utils/formValidations";
import UploadService from "@/app/utils/uploadService";

import useCommonStyles from "@/app/styles/useCommonStyles";
import useProductListStyles from "@/app/forms/productList/useProductListStyles";

/**
 * Component that orchestrates the lifecycle of product drafts—handling the addition,
 * editing, removal, and saving of products into the centralized form state.
 */
interface IProductListProps {
    setIsEditingProduct?: (val: boolean) => void;
}

export default function ProductList({ setIsEditingProduct }: IProductListProps = {}) {
    const { formData, handleUpdate } = useFormContext();
    const styles = useProductListStyles();
    const commonStyles = useCommonStyles();

    const [draftProduct, setDraftProduct] = useState<IProduct | null>(null);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [isCleaningUp, setIsCleaningUp] = useState(false);

    const isEditing = Boolean(editingProductId);
    const isEffectivelyAdding = !isEditing && !isAdding && formData.products.length === 0;

    const isDraftValid = useMemo(() => {
        const productToValidate = draftProduct ?? (isEffectivelyAdding ? createEmptyProduct() : null);
        if (!productToValidate) return false;

        const baseValid = FormValidators.hasText(productToValidate.appliance) &&
            FormValidators.hasText(productToValidate.brand) &&
            FormValidators.hasText(productToValidate.modelNumber);

        if (!baseValid) return false;

        // Ensure no files are in pending/uploading/error/deleting state
        const filesUploading = productToValidate.uploadedFiles?.some(f => f.status === UploadStatus.Uploading || f.status === UploadStatus.Pending || f.status === UploadStatus.Deleting) ?? false;
        const filesError = productToValidate.uploadedFiles?.some(f => f.status === UploadStatus.Error) ?? false;
        if (filesUploading || filesError) return false;

        if (formData.customerType === CustomerType.Builder) {
            return FormValidators.hasText(productToValidate.unitNumber);
        }

        if (formData.customerType === CustomerType.Residential) {
            return FormValidators.hasText(productToValidate.problem) &&
                FormValidators.hasText(productToValidate.invoiceNumber);
        }

        return false;
    }, [draftProduct, isEffectivelyAdding, formData.customerType]);

    const isUploadingOrDeleting = useMemo(() => {
        const productToValidate = draftProduct ?? (isEffectivelyAdding ? createEmptyProduct() : null);
        if (!productToValidate) return false;
        return (productToValidate.uploadedFiles?.some(f => f.status === UploadStatus.Uploading || f.status === UploadStatus.Pending || f.status === UploadStatus.Deleting) ?? false) || isCleaningUp;
    }, [draftProduct, isEffectivelyAdding, isCleaningUp]);

    // ➕ Add new
    const handleAdd = useCallback(() => {
        if (isAdding || isEditing) return;

        setDraftProduct(createEmptyProduct());
        setIsAdding(true);
        setShowErrors(false);
    }, [isAdding, isEditing]);

    // ✏️ Edit
    const handleEdit = useCallback((product: IProduct) => {
        setEditingProductId(product.id);
        setDraftProduct(product);
        setShowErrors(false);
    }, []);

    // 💾 Save
    const handleSave = useCallback(() => {
        const productToSave = draftProduct ?? (isEffectivelyAdding ? createEmptyProduct() : null);
        if (!productToSave) return;

        if (!isDraftValid) {
            setShowErrors(true);
            return;
        }

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
        setShowErrors(false);
    }, [draftProduct, isDraftValid, isAdding, isEffectivelyAdding, formData.products, handleUpdate]);

    // ❌ Cancel (only for edit)
    const handleCancel = useCallback(async () => {
        if (draftProduct && draftProduct.uploadSessionId && draftProduct.uploadedFiles) {
            const sessionId = draftProduct.uploadSessionId;
            let filesToDelete: string[] = [];

            if (isAdding) {
                // All uploaded files are new
                filesToDelete = draftProduct.uploadedFiles
                    .map(f => f.fileId)
                    .filter((id): id is string => !!id);
            } else {
                // Find original product to see which files were already there
                const originalProduct = formData.products.find(p => p.id === draftProduct.id);
                const originalFileIds = new Set(originalProduct?.uploadedFiles?.map(f => f.fileId).filter(Boolean) || []);
                filesToDelete = draftProduct.uploadedFiles
                    .map(f => f.fileId)
                    .filter((id): id is string => !!id && !originalFileIds.has(id));
            }

            if (filesToDelete.length > 0) {
                setIsCleaningUp(true);
                try {
                    const deletePromises = filesToDelete.map(fileId =>
                        UploadService.deleteUploadFile(sessionId, fileId).catch(err => {
                            console.error(`Failed to clean up uploaded file ${fileId} on cancel:`, err);
                            throw err;
                        })
                    );
                    await Promise.allSettled(deletePromises);
                } finally {
                    setIsCleaningUp(false);
                }
            }
        }
        setDraftProduct(null);
        setEditingProductId(null);
        setIsAdding(false);
        setShowErrors(false);
    }, [isAdding, draftProduct, formData.products]);

    // 🗑 Delete
    const handleRemove = useCallback(async (id: string) => {
        const productToRemove = formData.products.find(p => p.id === id);
        if (productToRemove && productToRemove.uploadSessionId && productToRemove.uploadedFiles) {
            const sessionId = productToRemove.uploadSessionId;
            const filesToDelete = productToRemove.uploadedFiles
                .map(f => f.fileId)
                .filter((fid): fid is string => !!fid);

            if (filesToDelete.length > 0) {
                setIsCleaningUp(true);
                try {
                    const deletePromises = filesToDelete.map(fileId =>
                        UploadService.deleteUploadFile(sessionId, fileId).catch(err => {
                            console.error(`Failed to delete file ${fileId} from backend on product deletion:`, err);
                            throw err;
                        })
                    );
                    await Promise.allSettled(deletePromises);
                } finally {
                    setIsCleaningUp(false);
                }
            }
        }
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

    useEffect(() => {
        setIsEditingProduct?.(isFormVisible);
        return () => {
            setIsEditingProduct?.(false);
        };
    }, [isFormVisible, setIsEditingProduct]);

    return (
        <div>

            {/* ✅ FORM ONLY (Add or Edit Mode) */}
            {
                isFormVisible && productInForm && (
                    <div>
                        <ProductFormFields
                            product={productInForm}
                            onChange={handleChange}
                            showErrors={showErrors}
                        />

                        <div className={mergeClasses(commonStyles.flexRow, commonStyles.gap2, styles.actionContainer)}>
                            <Button
                                appearance="primary"
                                onClick={handleSave}
                                disabled={isUploadingOrDeleting}
                            >
                                Save
                            </Button>

                            {/* ✅ Cancel only in edit mode */}
                            {(isEditing || (isAdding && formData.products.length > 0)) && (
                                <Button onClick={handleCancel} disabled={isCleaningUp}>
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