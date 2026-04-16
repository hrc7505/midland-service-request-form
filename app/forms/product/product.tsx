'use client';
import { Input, Field, Textarea, Button, Checkbox, InputOnChangeData, TextareaOnChangeData } from "@fluentui/react-components";
import { AttachRegular, DeleteRegular } from "@fluentui/react-icons";
import { useCallback, ChangeEvent } from "react";

import IFormState from "@/app/interfaces/IFormState";
import useFormContext from "@/app/context/formContext";

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

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpdate('photo', e.target.files[0]);
        }
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

            <Field label="Additional photos (i.e. Picture of damage, Serial tag, etc.)">
                <div className={styles.fileActionGroup}>
                    <input
                        type="file"
                        id="file-upload"
                        className={styles.fileInput}
                        onChange={handleFileChange}
                    />
                    <Button
                        icon={<AttachRegular />}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        Choose File
                    </Button>
                    <Button
                        icon={<DeleteRegular />}
                        disabled={!data.photo}
                        onClick={() => onUpdate('photo', null)}
                    >
                        Remove File
                    </Button>
                    <span>{data.photo ? data.photo.name : 'No File Chosen'}</span>
                </div>
            </Field>

            <Checkbox
                label="Add More Photos"
                checked={data.addMorePhotos}
                onChange={(_, d) => onUpdate('addMorePhotos', !!d.checked)}
            />

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