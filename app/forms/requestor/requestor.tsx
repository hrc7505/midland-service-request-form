"use client";
import { useCallback, ChangeEvent } from "react";
import { Input, Field, Label, InputOnChangeData, mergeClasses } from "@fluentui/react-components";

import IFormState, { CustomerType } from "@/app/interfaces/IFormState";
import useFormContext from "@/app/context/formContext";
import useFieldValidation from "@/app/hooks/useFieldValidation";
import FormValidators from "@/app/utils/formValidations";
import Address from "@/app/components/address/address";

import useRequestorStyles from "@/app/forms/requestor/useRequestorStyles";
import useCommonStyles from "@/app/styles/useCommonStyles";

export default function RequestorInfo() {
    const styles = useRequestorStyles();
    const commonStyles = useCommonStyles();
    const { formData: data, handleUpdate: onUpdate } = useFormContext();
    const { registerField } = useFieldValidation<IFormState>();

    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>, d: InputOnChangeData) => {
        onUpdate(ev.target.name as keyof IFormState, d.value);
    }, [onUpdate]);

    const fName = registerField("firstName", FormValidators.hasText(data.firstName), "First name is required.");
    const lName = registerField("lastName", FormValidators.hasText(data.lastName), "Last name is required.");
    const email = registerField("email", FormValidators.hasText(data.email) && FormValidators.isValidEmailFormat(data.email), "Email is required and must be valid (e.g. name@domain.com).");
    const phone = registerField("phone", FormValidators.hasText(data.phone), "Phone number is required.");
    const address1 = registerField("address1", FormValidators.hasText(data.address1), "Address line 1 is required.");
    const city = registerField("city", FormValidators.hasText(data.city), "City is required.");
    const prov = registerField("province", FormValidators.hasText(data.province), "Province is required.");
    const postalCode = registerField("postalCode", FormValidators.hasText(data.postalCode), "Postal code is required.");
    const midlandRepName = registerField(
        "midlandRepName",
        data.customerType === CustomerType.Builder ? FormValidators.hasText(data.midlandRepName) : true,
        "Midland rep name is required for builders."
    );
    const midlandAccount = registerField(
        "midlandAccount",
        true,
        ""
    );

    return (
        <div className={mergeClasses(commonStyles.flexColumn, styles.grid)}>
            {/* Name Row */}
            <div className={mergeClasses(commonStyles.fullWidth, styles.row)}>
                <Field label="First Name" required size="medium" className={mergeClasses(commonStyles.fullWidth, styles.col)} {...fName.fieldProps}>
                    <Input name="firstName" value={data.firstName} onChange={handleInputChange} placeholder="First Name"{...fName.inputProps} />
                </Field>
                <Field label="Last Name" required size="medium" className={mergeClasses(commonStyles.fullWidth, styles.col)}  {...lName.fieldProps}>
                    <Input name="lastName" value={data.lastName} onChange={handleInputChange} placeholder="Last Name" {...lName.inputProps} />
                </Field>
            </div>

            {/* Email & Phone */}
            <Field label="Email" size="medium" required {...email.fieldProps}>
                <Input type="email" name="email" value={data.email} onChange={handleInputChange} {...email.inputProps} />
            </Field>

            <Field label="Phone Number" required size="medium" {...phone.fieldProps}>
                <Input type="tel" name="phone" value={data.phone} onChange={handleInputChange}  {...phone.inputProps} />
            </Field>

            {data.customerType === CustomerType.Builder
                ? (
                    <>
                        <Field label="Midland Rep Name" required size="medium" {...midlandRepName.fieldProps}>
                            <Input type="text" name="midlandRepName" value={data.midlandRepName} onChange={handleInputChange}  {...midlandRepName.inputProps} />
                        </Field>
                        <Field label="Midland Account #" size="medium" {...midlandAccount.fieldProps}>
                            <Input type="text" name="midlandAccount" value={data.midlandAccount} onChange={handleInputChange}  {...midlandAccount.inputProps} />
                        </Field>
                    </>
                )
                : <Address
                    data={data}
                    handleInputChange={handleInputChange}
                    onUpdate={onUpdate}
                    validations={{ address1, city, province: prov, postalCode }}
                />
            }
        </div>
    );
}