'use client';
import { Input, Field, Textarea, InputOnChangeData, TextareaOnChangeData } from "@fluentui/react-components";
import { useCallback, ChangeEvent } from "react";

import IFormState from "@/app/interfaces/IFormState";
import useFormContext from "@/app/context/formContext";
import FileUploader from "@/app/components/fileUploader/fileUploader";

import useProductStyles from "@/app/forms/product/useProductStyles";

export default function Product() {
    const { formData: data, handleUpdate: onUpdate } = useFormContext();
    const styles = useProductStyles();

    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>, d: InputOnChangeData) => {
        onUpdate(ev.target.name as keyof IFormState, d.value);
    }, [onUpdate]);

    const handleTextareaChange = useCallback((ev: ChangeEvent<HTMLTextAreaElement>, d: TextareaOnChangeData) => {
        onUpdate(ev.target.name as keyof IFormState, d.value);
    }, [onUpdate]);

    return (
        <div className={styles.container}>
            <Field label="Appliance Brand" required>
                <Input name="brand" value={data.brand} onChange={handleInputChange} />
            </Field>

            <Field label="Model Number">
                <Input name="modelNumber" value={data.modelNumber} onChange={handleInputChange} />
            </Field>

            <Field label="Serial Number">
                <Input name="serialNumber" value={data.serialNumber} onChange={handleInputChange} />
            </Field>

            <Field label="Delivery Date">
                {/* Using standard type="date" for simplicity, or DatePicker component if installed */}
                <Input
                    type="date"
                    name="deliveryDate"
                    value={data.deliveryDate}
                    onChange={handleInputChange}
                />
            </Field>
            {data.customerType === "residential" &&
                <Field label="Invoice Number">
                    <Input name="invoiceNumber" value={data.invoiceNumber} onChange={handleInputChange} />
                </Field>
            }

            <Field label="Appliance Problem" required>
                <Textarea
                    name="problem"
                    value={data.problem}
                    onChange={handleTextareaChange}
                    resize="vertical"
                />
            </Field>

            <Field label="Additional photos (damage, serial tag, etc.)">
                <FileUploader
                    files={data.photos || []}
                    onChange={(newFiles) => onUpdate('photos', newFiles)}
                />
            </Field>

            <Field label="Additional information you think might help">
                <Textarea
                    name="additionalNotes"
                    value={data.additionalNotes}
                    onChange={handleTextareaChange}
                    resize="vertical"
                />
            </Field>
        </div>
    );
}