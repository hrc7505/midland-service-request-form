'use client';
import { useCallback, ChangeEvent } from "react";
import { Input, Field, InputOnChangeData } from "@fluentui/react-components";

import IFormState, { CustomerType } from "@/app/interfaces/IFormState";
import useFormContext from "@/app/context/formContext";
import useFieldValidation from "@/app/hooks/useFieldValidation";
import FormValidators from "@/app/utils/formValidations";

import useSiteStyles from "@/app/forms/site/useSiteStyles";
import Address from "@/app/components/address/address";

/* const provinces = [
    { value: 'ON', label: 'Ontario' },
    { value: 'QC', label: 'Quebec' },
    { value: 'AB', label: 'Alberta' },
]; */

export default function Site() {
    const styles = useSiteStyles();
    const { formData: data, handleUpdate: onUpdate } = useFormContext();
    const { registerField } = useFieldValidation<IFormState>();

    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>, d: InputOnChangeData) => {
        onUpdate(ev.target.name as keyof IFormState, d.value);
    }, [onUpdate]);

    const projectNameField = registerField(
        'projectName',
        data.customerType === CustomerType.Builder ? FormValidators.hasText(data.projectName || '') : true,
        "Project name is required for builders."
    );

    const hasSiteContact = !!data.siteContact && data.siteContact.trim().length > 0;

    const siteContactPhoneField = registerField(
        'siteContactPhone',
        data.customerType === CustomerType.Builder && hasSiteContact ? FormValidators.hasText(data.siteContactPhone || '') : true,
        "Site contact phone is required."
    );

    const siteContactEmailField = registerField(
        'siteContactEmail',
        data.customerType === CustomerType.Builder && hasSiteContact ? (FormValidators.hasText(data.siteContactEmail || '') && FormValidators.isValidEmailFormat(data.siteContactEmail || '')) : true,
        "Valid site contact email is required."
    );

    const address1 = registerField('address1', FormValidators.hasText(data.address1), "Address line 1 is required.");
    const city = registerField('city', FormValidators.hasText(data.city), "City is required.");
    const prov = registerField('province', FormValidators.hasText(data.province), "Province is required.");
    const postalCode = registerField('postalCode', FormValidators.hasText(data.postalCode), "Postal code is required.");

    return (
        <div className={styles.grid}>
            <Field label="Project Name" required={data.customerType === CustomerType.Builder} {...projectNameField.fieldProps}>
                <Input name="projectName" value={data.projectName || ''} onChange={handleInputChange} {...projectNameField.inputProps} />
            </Field>

            <Address
                data={data}
                handleInputChange={handleInputChange}
                onUpdate={onUpdate}
                validations={{ address1, city, province: prov, postalCode }}
            />

            <Field label="Site Contact (if different)">
                <Input name="siteContact" value={data.siteContact || ''} onChange={handleInputChange} />
            </Field>

            {hasSiteContact && (
                <>
                    <Field label="Site Contact Phone" required={data.customerType === CustomerType.Builder} {...siteContactPhoneField.fieldProps}>
                        <Input type="tel" name="siteContactPhone" value={data.siteContactPhone || ''} onChange={handleInputChange} {...siteContactPhoneField.inputProps} />
                    </Field>
                    <Field label="Site Contact Email" required={data.customerType === CustomerType.Builder} {...siteContactEmailField.fieldProps}>
                        <Input type="email" name="siteContactEmail" value={data.siteContactEmail || ''} onChange={handleInputChange} {...siteContactEmailField.inputProps} />
                    </Field>
                </>
            )}
        </div>
    );
}