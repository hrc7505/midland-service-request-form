'use client';
import { useCallback, ChangeEvent } from "react";
import { Input, Field, /* Dropdown, Option, */ InputOnChangeData } from "@fluentui/react-components";

import IFormState from "@/app/interfaces/IFormState";
import useFormContext from "@/app/context/formContext";

import useSiteStyles from "@/app/forms/site/useSiteStyles";

/* const provinces = [
    { value: 'ON', label: 'Ontario' },
    { value: 'QC', label: 'Quebec' },
    { value: 'AB', label: 'Alberta' },
]; */

export default function Site() {
    const styles = useSiteStyles();
    const { formData: data, handleUpdate: onUpdate } = useFormContext();

    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>, d: InputOnChangeData) => {
        onUpdate(ev.target.name as keyof IFormState, d.value);
    }, [onUpdate]);

    return (
        <div className={styles.grid}>
            <Field label="Site Contact (if different)">
                <Input name="siteContact" value={data.siteContact} onChange={handleInputChange} />
            </Field>

            <Field label="Project Name">
                <Input name="projectName" value={data.projectName} onChange={handleInputChange} />
            </Field>

            {/* Address Section */}
           {/*  <Field label="Street Address" required hint="Address Line 1">
                <Input name="siteAddress1" value={data.siteAddress1} onChange={handleInputChange} />
            </Field>
            <Field hint="Address Line 2">
                <Input name="siteAddress2" value={data.siteAddress2} onChange={handleInputChange} />
            </Field> */}

            {/* City, Province, Postal Code Row */}
            {/* <div className={styles.row}>
                <Field className={styles.col} style={{ flex: 2 }} hint="City">
                    <Input name="siteCity" value={data.siteCity} onChange={handleInputChange} />
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
                    <Input name="sitePostalCode" value={data.sitePostalCode} onChange={handleInputChange} />
                </Field>
            </div>

            <Field label="City and Province">
                <Input name="cityAndProvince" value={data.cityAndProvince} onChange={handleInputChange} />
            </Field> */}
        </div>
    );
}