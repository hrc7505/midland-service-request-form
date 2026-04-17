'use client';
import { Radio, RadioGroup, Label } from "@fluentui/react-components";

import useFormContext from "@/app/context/formContext";
import { CustomerType } from "@/app/interfaces/IFormState";

import useCustomerTypeCompoStyles from "@/app/forms/customerTypeCompo/useCustomerTypeCompoStyles";

const CustomerTypeCompo = () => {
    const styles = useCustomerTypeCompoStyles();
    const { formData, handleUpdate } = useFormContext();

    return (
        <div className={styles.container}>
            <Label className={styles.question} required>
                I am a Residential Customer or Single Family Builder
            </Label>
            <RadioGroup value={formData.customerType} onChange={(_, d) => handleUpdate('customerType', d.value)}>
                <Radio value={CustomerType.Residential} label="I am a Residential Customer or Single Family Builder" />
                <Radio value={CustomerType.Builder} label="I am a Multi-Family Builder" />
            </RadioGroup>
        </div>
    );
};

export default CustomerTypeCompo;