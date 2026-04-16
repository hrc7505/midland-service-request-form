'use client';
import { useCallback, ChangeEvent } from "react";
import { Input, Field, Label, Dropdown, Option, InputOnChangeData } from "@fluentui/react-components";

import IFormState from "@/app/interfaces/IFormState";
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

    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>, d: InputOnChangeData) => {
        onUpdate(ev.target.name as keyof IFormState, d.value);
    }, [onUpdate]);

    return (
        <div className={styles.grid}>
            {/* Name Row */}
            <div>
                <Label required weight="regular" size="medium">Name</Label>
                <div className={styles.row}>
                    <Field className={styles.col} hint="First Name">
                        <Input name="firstName" value={data.firstName} onChange={handleInputChange} />
                    </Field>
                    <Field className={styles.col} hint="Last Name">
                        <Input name="lastName" value={data.lastName} onChange={handleInputChange} />
                    </Field>
                </div>
            </div>

            {/* Email & Phone */}
            <Field label="Email" size="medium">
                <Input type="email" name="email" value={data.email} onChange={handleInputChange} />
            </Field>

            <Field label="Phone Number" required size="medium">
                <Input type="tel" name="phone" value={data.phone} onChange={handleInputChange} />
            </Field>

            {data.customerType === "builder"
                ? <Field label="Midland Rep Name" required size="medium">
                    <Input type="text" name="midlandRepName" value={data.midlandRepName} onChange={handleInputChange} />
                </Field>
                :
                <>
                    {/* Address Section */}
                    <div>
                        <Label required weight="regular" size="medium">Address</Label>
                        <Field hint="Address Line 1">
                            <Input name="address1" value={data.address1} onChange={handleInputChange} />
                        </Field>
                    </div>
                    <Field hint="Address Line 2">
                        <Input name="address2" value={data.address2} onChange={handleInputChange} />
                    </Field>

                    {/* City, Province, Postal Code Row */}
                    <div className={styles.row}>
                        <Field className={styles.col} style={{ flex: 2 }} hint="City">
                            <Input name="city" value={data.city} onChange={handleInputChange} />
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
                            <Input name="postalCode" value={data.postalCode} onChange={handleInputChange} />
                        </Field>
                    </div>
                </>
            }
        </div>
    );
}