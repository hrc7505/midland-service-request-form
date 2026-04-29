'use client';
import { useCallback, ChangeEvent } from "react";
import { Input, Field, Label, Dropdown, Option, InputOnChangeData } from "@fluentui/react-components";

import IFormState, { CustomerType } from "@/app/interfaces/IFormState";
import useFormContext from "@/app/context/formContext";
import useFieldValidation from "@/app/hooks/useFieldValidation";
import FormValidators from "@/app/utils/formValidations";

import useRequestorStyles from "@/app/forms/requestor/useRequestorStyles";

const provinces = [
    { value: '132190000', label: 'Alberta' },
    { value: '132190001', label: 'British Columbia' },
];

export default function RequestorInfo() {
    const styles = useRequestorStyles();
    const { formData: data, handleUpdate: onUpdate } = useFormContext();
    const { registerField } = useFieldValidation<IFormState>();

    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>, d: InputOnChangeData) => {
        onUpdate(ev.target.name as keyof IFormState, d.value);
    }, [onUpdate]);

    const fName = registerField('firstName', FormValidators.hasText(data.firstName), "First name is required.");
    const lName = registerField('lastName', FormValidators.hasText(data.lastName), "Last name is required.");
    const email = registerField('email', FormValidators.isValidEmailFormat(data.email), "Enter a valid email (e.g. name@domain.com).");
    const phone = registerField('phone', FormValidators.hasText(data.phone), "Phone number is required.");
    const address1 = registerField('address1', FormValidators.hasText(data.address1), "Address line 1 is required.");
    const city = registerField('city', FormValidators.hasText(data.city), "City is required.");
    const prov = registerField('province', FormValidators.hasText(data.province), "Province is required.");
    const postalCode = registerField('postalCode', FormValidators.hasText(data.postalCode), "Postal code is required.");
    const midlandRepName = registerField(
        'midlandRepName',
        data.customerType === CustomerType.Builder ? FormValidators.hasText(data.midlandRepName) : true,
        "Midland rep name is required for builders."
    );

    return (
        <div className={styles.grid}>
            {/* Name Row */}
            <div>
                <Label required weight="regular" size="medium">Name</Label>
                <div className={styles.row}>
                    <Field className={styles.col} hint="First Name" {...fName.fieldProps}>
                        <Input name="firstName" value={data.firstName} onChange={handleInputChange} {...fName.inputProps} />
                    </Field>
                    <Field className={styles.col} hint="Last Name" {...lName.fieldProps}>
                        <Input name="lastName" value={data.lastName} onChange={handleInputChange} {...lName.inputProps} />
                    </Field>
                </div>
            </div>

            {/* Email & Phone */}
            <Field label="Email" size="medium" {...email.fieldProps}>
                <Input type="email" name="email" value={data.email} onChange={handleInputChange} {...email.inputProps} />
            </Field>

            <Field label="Phone Number" required size="medium" {...phone.fieldProps}>
                <Input type="tel" name="phone" value={data.phone} onChange={handleInputChange}  {...phone.inputProps} />
            </Field>

            {data.customerType === CustomerType.Builder
                ? <Field label="Midland Rep Name" required size="medium" {...midlandRepName.fieldProps}>
                    <Input type="text" name="midlandRepName" value={data.midlandRepName} onChange={handleInputChange}  {...midlandRepName.inputProps} />
                </Field>
                :
                <>
                    {/* Address Section */}
                    <div>
                        <Label required weight="regular" size="medium">Address</Label>
                        <Field hint="Address Line 1" {...address1.fieldProps}>
                            <Input name="address1" value={data.address1} onChange={handleInputChange} {...address1.inputProps} />
                        </Field>
                    </div>
                    <Field hint="Address Line 2">
                        <Input name="address2" value={data.address2} onChange={handleInputChange} />
                    </Field>

                    {/* City, Province, Postal Code Row */}
                    <div className={styles.row}>
                        <Field className={styles.col} style={{ flex: 2 }} hint="City" required {...city.fieldProps}>
                            <Input name="city" value={data.city} onChange={handleInputChange} {...city.inputProps} />
                        </Field>
                        <Field className={styles.col} style={{ flex: 2 }} hint="Province" required {...prov.fieldProps}>
                            <Dropdown
                                placeholder="Select Province"
                                selectedOptions={data.province ? [data.province] : []}
                                value={provinces.find(p => p.value === data.province)?.label || ''}
                                onOptionSelect={(_, d) => onUpdate('province', d.optionValue as string)}
                                aria-required="true"
                                aria-label="Select Province"
                                {...prov.inputProps}
                            >
                                {provinces.map(province => (
                                    <Option key={province.value} value={province.value}>
                                        {province.label}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                        <Field className={styles.col} style={{ flex: 1 }} hint="Postal Code" required {...postalCode.fieldProps}>
                            <Input name="postalCode" value={data.postalCode} onChange={handleInputChange} {...postalCode.inputProps} />
                        </Field>
                    </div>
                </>
            }
        </div>
    );
}