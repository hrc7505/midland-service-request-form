'use client';

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

import type { UpdateProductFn } from "@/app/forms/productList/types/types";
import useProductFormFieldStyles from "@/app/forms/productList/fields/useProductFormFieldStyles";

interface ProductFormFieldsProps {
    product: IProduct;
    onChange: UpdateProductFn;
}

/**
 * Appliance dropdown options
 */
const APPLIANCES = [
    { label: 'Refrigerator', value: '132190000' },
    { label: 'Dishwasher', value: '132190001' },
    { label: 'Washer', value: '132190002' },
    { label: 'Dryer', value: '132190003' },
    { label: 'Range', value: '132190004' },
    { label: 'Oven', value: '132190005' },
    { label: 'Microwave', value: '132190006' },
] as const;

export default function ProductFormFields({
    product,
    onChange,
}: ProductFormFieldsProps) {
    const styles = useProductFormFieldStyles();
    const { formData } = useFormContext();

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
                onChange(product.id, 'appliance', data.optionValue);
            }
        },
        [onChange, product.id]
    );

    /**
     * File uploader change
     */
    const handlePhotosChange = useCallback(
        (files: File[]) => {
            onChange(product.id, 'photos', files);
        },
        [onChange, product.id]
    );

    return (
        <div className={styles.container}>

            {/* Builder only */}
            {formData.customerType === CustomerType.Builder && (
                <Field label="Unit Number">
                    <Input
                        value={product.unitNumber || ''}
                        onChange={handleInputChange('unitNumber')}
                    />
                </Field>
            )}

            {/* Appliance */}
            <Field label="Appliance" required>
                <Dropdown
                    placeholder="Select Appliance"
                    selectedOptions={product.appliance ? [product.appliance] : []}
                    value={
                        APPLIANCES.find(a => a.value === product.appliance)?.label || ''
                    }
                    onOptionSelect={handleApplianceChange}
                >
                    {APPLIANCES.map(item => (
                        <Option key={item.value} value={item.value}>
                            {item.label}
                        </Option>
                    ))}
                </Dropdown>
            </Field>

            {/* Brand */}
            <Field label="Appliance Brand" required>
                <Input
                    value={product.brand}
                    onChange={handleInputChange('brand')}
                />
            </Field>

            {/* Model */}
            <Field label="Model Number">
                <Input
                    value={product.modelNumber || ''}
                    onChange={handleInputChange('modelNumber')}
                />
            </Field>

            {/* Serial */}
            <Field label="Serial Number">
                <Input
                    value={product.serialNumber || ''}
                    onChange={handleInputChange('serialNumber')}
                />
            </Field>

            {/* Delivery Date */}
            <Field label="Delivery Date">
                <Input
                    type="date"
                    value={product.deliveryDate || ''}
                    onChange={handleInputChange('deliveryDate')}
                />
            </Field>

            {/* Residential only */}
            {formData.customerType === CustomerType.Residential && (
                <Field label="Invoice Number">
                    <Input
                        value={product.invoiceNumber || ''}
                        onChange={handleInputChange('invoiceNumber')}
                    />
                </Field>
            )}

            {/* Problem */}
            <Field label="Appliance Problem" required>
                <Textarea
                    resize="vertical"
                    value={product.problem}
                    onChange={handleTextareaChange('problem')}
                />
            </Field>

            {/* Photos */}
            <Field label="Additional Photos">
                <FileUploader
                    files={product.photos || []}
                    onChange={handlePhotosChange}
                />
            </Field>

            {/* Notes */}
            <Field label="Additional Notes">
                <Textarea
                    resize="vertical"
                    value={product.additionalNotes || ''}
                    onChange={handleTextareaChange('additionalNotes')}
                />
            </Field>

        </div>
    );
}