'use client';

import { Input, Field, Label, Dropdown, Option } from "@fluentui/react-components";

import IAddressProps from "@/app/components/address/interfaces/IAddressProps";
import useAddressStyles from "@/app/components/address/useAddressStyles";

export const provinces = [
    { value: '132190000', label: 'Alberta' },
    { value: '132190001', label: 'British Columbia' },
];

export default function Address({
    data,
    handleInputChange,
    onUpdate,
    validations,
}: IAddressProps) {
    const styles = useAddressStyles();
    return (
        <>
            {/* Address Section */}
            <div>
                <Label required weight="regular" size="medium">Address</Label>
                <Field hint="Address Line 1" {...validations.address1.fieldProps}>
                    <Input name="address1" value={data.address1} onChange={handleInputChange} {...validations.address1.inputProps} />
                </Field>
            </div>
            <Field hint="Address Line 2">
                <Input name="address2" value={data.address2 || ''} onChange={handleInputChange} />
            </Field>

            {/* City, Province, Postal Code Row */}
            <div className={styles.row}>
                <Field className={styles.col} style={{ flex: 2 }} hint="City" required {...validations.city.fieldProps}>
                    <Input name="city" value={data.city} onChange={handleInputChange} {...validations.city.inputProps} />
                </Field>
                <Field className={styles.col} style={{ flex: 2 }} hint="Province" required {...validations.province.fieldProps}>
                    <Dropdown
                        placeholder="Select Province"
                        selectedOptions={data.province ? [data.province] : []}
                        value={provinces.find(p => p.value === data.province)?.label || ''}
                        onOptionSelect={(_, d) => onUpdate('province', d.optionValue as string)}
                        aria-required="true"
                        aria-label="Select Province"
                        {...validations.province.inputProps}
                    >
                        {provinces.map(province => (
                            <Option key={province.value} value={province.value}>
                                {province.label}
                            </Option>
                        ))}
                    </Dropdown>
                </Field>
                <Field className={styles.col} style={{ flex: 1 }} hint="Postal Code" required {...validations.postalCode.fieldProps}>
                    <Input name="postalCode" value={data.postalCode} onChange={handleInputChange} {...validations.postalCode.inputProps} />
                </Field>
            </div>
        </>
    );
}
