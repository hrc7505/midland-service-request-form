'use client';
import { Input, Field, Dropdown, Option } from "@fluentui/react-components";

import useFormContext from "@/app/context/formContext";

import useSiteStyles from "@/app/forms/site/useSiteStyles";

const provinces = [
    { value: 'ON', label: 'Ontario' },
    { value: 'QC', label: 'Quebec' },
    { value: 'AB', label: 'Alberta' },
];

export default function Site() {
    const styles = useSiteStyles();
    const { formData: data, handleUpdate: onUpdate } = useFormContext();

    return (
        <div className={styles.grid}>
            <Field label="Site Contact (if different)">
                <Input value={data.siteContact} onChange={(_, d) => onUpdate('siteContact', d.value)} />
            </Field>

            <Field label="Project Name">
                <Input value={data.projectName} onChange={(_, d) => onUpdate('projectName', d.value)} />
            </Field>

            {/* Address Section */}
            <Field label="Street Address" required hint="Address Line 1">
                <Input value={data.siteAddress1} onChange={(_, d) => onUpdate('siteAddress1', d.value)} />
            </Field>
            <Field hint="Address Line 2">
                <Input value={data.siteAddress2} onChange={(_, d) => onUpdate('siteAddress2', d.value)} />
            </Field>

            {/* City, Province, Postal Code Row */}
            <div className={styles.row}>
                <Field className={styles.col} style={{ flex: 2 }} hint="City">
                    <Input value={data.siteCity} onChange={(_, d) => onUpdate('siteCity', d.value)} />
                </Field>
                <Field className={styles.col} style={{ flex: 2 }} hint="Province">
                    <Dropdown
                        placeholder="Select Province"
                        selectedOptions={data.siteProvince ? [data.siteProvince] : []}
                        value={provinces.find(p => p.value === data.siteProvince)?.label || ''}
                        onOptionSelect={(_, d) => onUpdate('siteProvince', d.optionValue as string)}
                    >
                        {provinces.map(province => (
                            <Option key={province.value} value={province.value}>
                                {province.label}
                            </Option>
                        ))}
                    </Dropdown>
                </Field>
                <Field className={styles.col} style={{ flex: 1 }} hint="Postal Code">
                    <Input value={data.sitePostalCode} onChange={(_, d) => onUpdate('sitePostalCode', d.value)} />
                </Field>
            </div>

            <Field label="City and Province">
                <Input value={data.cityAndProvince} onChange={(_, d) => onUpdate('cityAndProvince', d.value)} />
            </Field>

            <Field label="Unit Number (Required)" required>
                <Input value={data.unitNumber} onChange={(_, d) => onUpdate('unitNumber', d.value)} />
            </Field>
        </div>
    );
}