"use client";

import { createContext, useState, useCallback, useContext, ReactNode } from "react";

import IFormState, { CustomerType } from "@/app/interfaces/IFormState";

interface IFormContext {
    formData: IFormState;
    handleUpdate: <V = string>(field: keyof IFormState, value: V) => void;
}

const FormContext = createContext<IFormContext | undefined>(undefined);

function getInitialFormData(): IFormState {
    return {
        customerType: CustomerType.Residential,

        // Requestor Info
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        midlandRepName: "",
        midlandAccount: "",
        address1: "",
        address2: "",
        city: "",
        province: "",
        postalCode: "",

        // Site Info
        siteContact: "",
        siteContactPhone: "",
        siteContactEmail: "",
        projectName: "",

        products: [],
    };
}

export const FormProvider = ({ children }: { children: ReactNode }) => {
    const [formData, setFormData] = useState(getInitialFormData);

    const handleUpdate = useCallback(<V = string,>(field: keyof IFormState, value: V) => {
        setFormData(prev => {
            // Clear the form state if the customer type changes
            if (field === "customerType" && prev.customerType !== value) {
                return { ...getInitialFormData(), customerType: value as unknown as CustomerType };
            }

            return { ...prev, [field]: value };
        });
    }, []);

    const value = { formData, handleUpdate };

    return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

const useFormContext = () => {
    const context = useContext(FormContext);
    if (context === undefined) {
        throw new Error("useFormContext must be used within a FormProvider");
    }
    return context;
};

export default useFormContext;