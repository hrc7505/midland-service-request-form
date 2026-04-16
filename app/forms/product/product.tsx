'use client';
import { Input, Field, Textarea, Button, Checkbox } from "@fluentui/react-components";
import { AttachRegular, DeleteRegular } from "@fluentui/react-icons";
import { useCallback } from "react";

import useFormContext from "@/app/context/formContext";

import useProductStyles from "@/app/forms/product/useProductStyles";

export default function Product() {
    const { formData: data, handleUpdate: onUpdate } = useFormContext();
    const styles = useProductStyles();

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpdate('photo', e.target.files[0]);
        }
    }, [onUpdate]);

    return (
        <div className={styles.container}>
            <Field label="Appliance Brand" required>
                <Input value={data.brand} onChange={(_, d) => onUpdate('brand', d.value)} />
            </Field>

            <Field label="Model Number">
                <Input value={data.modelNumber} onChange={(_, d) => onUpdate('modelNumber', d.value)} />
            </Field>

            <Field label="Serial Number">
                <Input value={data.serialNumber} onChange={(_, d) => onUpdate('serialNumber', d.value)} />
            </Field>

            <Field label="Delivery Date">
                {/* Using standard type="date" for simplicity, or DatePicker component if installed */}
                <Input
                    type="date"
                    value={data.deliveryDate}
                    onChange={(_, d) => onUpdate('deliveryDate', d.value)}
                />
            </Field>
            {data.customerType === "residential" &&
                <Field label="Invoice Number">
                    <Input value={data.invoiceNumber} onChange={(_, d) => onUpdate('invoiceNumber', d.value)} />
                </Field>
            }

            <Field label="Appliance Problem" required>
                <Textarea
                    value={data.problem}
                    onChange={(_, d) => onUpdate('problem', d.value)}
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
                    value={data.additionalNotes}
                    onChange={(_, d) => onUpdate('additionalNotes', d.value)}
                    resize="vertical"
                />
            </Field>
        </div>
    );
}