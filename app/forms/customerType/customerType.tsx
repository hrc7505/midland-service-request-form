'use client';
import { Radio, RadioGroup, Label } from "@fluentui/react-components";

import useFormContext from "@/app/context/formContext";

import useCustomerTypeStyles from "@/app/forms/customerType/useCustomerTypeStyles";

const CustomerType = () => {
    const styles = useCustomerTypeStyles();
    const { formData, handleUpdate } = useFormContext();

    return (
        <div className={styles.container}>
            <Label className={styles.question} required>
                I am a Residential Customer or Single Family Builder
            </Label>
            <RadioGroup value={formData.customerType} onChange={(_, d) => handleUpdate('customerType', d.value)}>
                <Radio value="residential" label="I am a Residential Customer or Single Family Builder" />
                <Radio value="builder" label="I am a Multi-Family Builder" />
            </RadioGroup>
        </div>
    );
};

export default CustomerType;