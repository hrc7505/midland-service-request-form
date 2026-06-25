"use client";

import {
    Field,
    Input,
    Textarea,
    Dropdown,
    Option,
    InputOnChangeData,
    TextareaOnChangeData,
} from "@fluentui/react-components";
import { useCallback } from "react";

import { IProduct, CustomerType } from "@/app/interfaces/IFormState";
import useFormContext from "@/app/context/formContext";
import FileUploader from "@/app/components/fileUploader/fileUploader";
import useFieldValidation from "@/app/hooks/useFieldValidation";
import type { UpdateProductFn } from "@/app/forms/productList/types/types";
import FormValidators from "@/app/utils/formValidations";
import { useProductUpload } from "@/app/hooks/useProductUpload";

import useProductFormFieldStyles from "@/app/forms/productList/fields/useProductFormFieldStyles";

interface ProductFormFieldsProps {
    product: IProduct;
    onChange: UpdateProductFn;
    showErrors?: boolean;
}

/**
 * Appliance dropdown options
 */
const APPLIANCES = [
    { label: "Refrigerator", value: "Refrigerator" },
    { label: "Dishwasher", value: "Dishwasher" },
    { label: "Washer", value: "Washer" },
    { label: "Dryer", value: "Dryer" },
    { label: "Range", value: "Range" },
    { label: "Oven", value: "Oven" },
    { label: "Microwave", value: "Microwave" },
] as const;

export default function ProductFormFields({
    product,
    onChange,
    showErrors,
}: ProductFormFieldsProps) {
    const styles = useProductFormFieldStyles();
    const { formData } = useFormContext();
    const { registerField } = useFieldValidation<IProduct>();
    const { handleFilesChange } = useProductUpload(product, onChange);

    const applianceField = registerField(
        "appliance",
        FormValidators.hasText(product.appliance || ""),
        "Appliance is required.",
        showErrors
    );
    const unitNumberField = registerField(
        "unitNumber",
        formData.customerType === CustomerType.Builder ? FormValidators.hasText(product.unitNumber || "") : true,
        "Unit number is required for builders.",
        showErrors
    );
    const brandField = registerField(
        "brand",
        FormValidators.hasText(product.brand || ""),
        "Brand is required.",
        showErrors
    );
    const modelNumberField = registerField(
        "modelNumber",
        FormValidators.hasText(product.modelNumber || ""),
        "Model number is required.",
        showErrors
    );
    const applianceProblemField = registerField(
        "problem",
        formData.customerType === CustomerType.Residential ? FormValidators.hasText(product.problem || "") : true,
        "Problem description is required for residential.",
        showErrors
    );
    const invoiceNumberField = registerField(
        "invoiceNumber",
        formData.customerType === CustomerType.Residential ? FormValidators.hasText(product.invoiceNumber || "") : true,
        "Invoice number is required for residential.",
        showErrors
    );

    /**
     * Generic input handler
     */
    const handleInputChange = useCallback(
        <K extends keyof IProduct>(key: K) =>
            (_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
                onChange(product.id, key, data.value as IProduct[K]);
            },
        [onChange, product.id]
    );

    /**
     * Generic textarea handler
     */
    const handleTextareaChange = useCallback(
        <K extends keyof IProduct>(key: K) =>
            (_: React.ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData) => {
                onChange(product.id, key, data.value as IProduct[K]);
            },
        [onChange, product.id]
    );

    /**
     * Appliance dropdown change
     */
    const handleApplianceChange = useCallback(
        (_: unknown, data: { optionValue?: string }) => {
            if (data.optionValue) {
                onChange(product.id, "appliance", data.optionValue);
            }
        },
        [onChange, product.id]
    );

    /**
     * File uploader change
     */
    const handlePhotosChange = useCallback(
        (files: File[]) => {
            handleFilesChange(files);
        },
        [handleFilesChange]
    );

    return (
        <div className={styles.container}>

            {/* Builder only */}
            {formData.customerType === CustomerType.Builder && (
                <Field label="Unit Number" required {...unitNumberField.fieldProps}>
                    <Input
                        value={product.unitNumber || ""}
                        onChange={handleInputChange("unitNumber")}
                        {...unitNumberField.inputProps}
                    />
                </Field>
            )}

            {/* Appliance */}
            <Field label="Appliance" required {...applianceField.fieldProps}>
                <Dropdown
                    placeholder="Select Appliance"
                    selectedOptions={product.appliance ? [product.appliance] : []}
                    value={
                        APPLIANCES.find(a => a.value === product.appliance)?.label || ""
                    }
                    onOptionSelect={handleApplianceChange}
                    {...applianceField.inputProps}
                >
                    {APPLIANCES.map(item => (
                        <Option key={item.value} value={item.value}>
                            {item.label}
                        </Option>
                    ))}
                </Dropdown>
            </Field>

            {/* Brand */}
            <Field label="Appliance Brand" required {...brandField.fieldProps}>
                <Input
                    value={product.brand}
                    onChange={handleInputChange("brand")}
                    {...brandField.inputProps}
                />
            </Field>

            {/* Model */}
            <Field label="Model Number" required {...modelNumberField.fieldProps}>
                <Input
                    value={product.modelNumber || ""}
                    onChange={handleInputChange("modelNumber")}
                    {...modelNumberField.inputProps}
                />
            </Field>

            {/* Serial */}
            <Field label="Serial Number">
                <Input
                    value={product.serialNumber || ""}
                    onChange={handleInputChange("serialNumber")}
                />
            </Field>

            {/* Delivery Date */}
            <Field label="Delivery Date">
                <Input
                    type="date"
                    value={product.deliveryDate || ""}
                    onChange={handleInputChange("deliveryDate")}
                />
            </Field>

            {/* Residential only */}
            {formData.customerType === CustomerType.Residential && (
                <Field label="Invoice Number" required {...invoiceNumberField.fieldProps}>
                    <Input
                        value={product.invoiceNumber || ""}
                        onChange={handleInputChange("invoiceNumber")}
                        {...invoiceNumberField.inputProps}
                    />
                </Field>
            )}

            {/* Problem */}
            <Field label="Appliance Problem" required={formData.customerType === CustomerType.Residential} {...applianceProblemField.fieldProps}>
                <Textarea
                    resize="vertical"
                    value={product.problem}
                    onChange={handleTextareaChange("problem")}
                    {...applianceProblemField.inputProps}
                />
            </Field>

            {/* Photos */}
            <Field label="Additional Photos">
                <FileUploader
                    files={product.photos || []}
                    uploadedFiles={product.uploadedFiles || []}
                    onChange={handlePhotosChange}
                />
            </Field>

            {/* Notes */}
            <Field label="Additional Notes">
                <Textarea
                    resize="vertical"
                    value={product.additionalNotes || ""}
                    onChange={handleTextareaChange("additionalNotes")}
                />
            </Field>

        </div>
    );
}