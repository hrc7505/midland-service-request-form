'use client';
import { Input, Field, Label, Dropdown, Option } from "@fluentui/react-components";

import useFormContext from "@/app/context/formContext";

import useRequestorStyles from "@/app/forms/requestor/useRequestorStyles";

const provinces = [
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'YT', label: 'Yukon' },
];

export default function RequestorInfo() {
    const styles = useRequestorStyles();
    const { formData: data, handleUpdate: onUpdate } = useFormContext();

    return (
        <div className={styles.grid}>
            {/* Name Row */}
            <div>
                <Label required weight="regular" size="medium">Name</Label>
                <div className={styles.row}>
                    <Field className={styles.col} hint="First Name">
                        <Input value={data.firstName} onChange={(_, d) => onUpdate('firstName', d.value)} />
                    </Field>
                    <Field className={styles.col} hint="Last Name">
                        <Input value={data.lastName} onChange={(_, d) => onUpdate('lastName', d.value)} />
                    </Field>
                </div>
            </div>

            {/* Email & Phone */}
            <Field label="Email" size="medium">
                <Input type="email" value={data.email} onChange={(_, d) => onUpdate('email', d.value)} />
            </Field>

            <Field label="Phone Number" required size="medium">
                <Input type="tel" value={data.phone} onChange={(_, d) => onUpdate('phone', d.value)} />
            </Field>

            {data.customerType === "builder"
                ? <Field label="Midland Rep Name" required size="medium">
                    <Input type="text" value={data.midlandRepName} onChange={(_, d) => onUpdate("midlandRepName", d.value)} />
                </Field>
                :
                <>
                    {/* Address Section */}
                    <div>
                        <Label required weight="regular" size="medium">Address</Label>
                        <Field hint="Address Line 1">
                            <Input value={data.address1} onChange={(_, d) => onUpdate('address1', d.value)} />
                        </Field>
                    </div>
                    <Field hint="Address Line 2">
                        <Input value={data.address2} onChange={(_, d) => onUpdate('address2', d.value)} />
                    </Field>

                    {/* City, Province, Postal Code Row */}
                    <div className={styles.row}>
                        <Field className={styles.col} style={{ flex: 2 }} hint="City">
                            <Input value={data.city} onChange={(_, d) => onUpdate('city', d.value)} />
                        </Field>
                        <Field className={styles.col} style={{ flex: 2 }} hint="Province">
                            <Dropdown
                                placeholder="Select Province"
                                selectedOptions={data.province ? [data.province] : []}
                                value={provinces.find(p => p.value === data.province)?.label || ''}
                                onOptionSelect={(_, d) => onUpdate('province', d.optionValue as string)}
                            >
                                {provinces.map(province => (
                                    <Option key={province.value} value={province.value}>
                                        {province.label}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                        <Field className={styles.col} style={{ flex: 1 }} hint="Postal Code">
                            <Input value={data.postalCode} onChange={(_, d) => onUpdate('postalCode', d.value)} />
                        </Field>
                    </div>
                </>
            }
        </div>
    );
}