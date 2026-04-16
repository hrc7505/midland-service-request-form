'use client';
import { useCallback, useMemo } from "react";

import IWizardStep from "@/app/components/wizard/interfaces/IWizardStep";
import Wizard from "@/app/components/wizard/wizard";
import CustomerType from "@/app/forms/customerType/customerType";
import RequestorInfo from "@/app/forms/requestor/requestor";
import Product from "@/app/forms/product/product";
import Site from "@/app/forms/site/site";
import useFormContext, { FormProvider } from "@/app/context/formContext";

import usePageStyles from "@/app/usePageStyles";

const ServiceRequestForm = () => {
  const { formData } = useFormContext();

  const steps = useMemo<IWizardStep[]>(() => {
    const listOfSteps: IWizardStep[] = [
      {
        id: 'selection',
        label: 'Type',
        component: <CustomerType />
      },
      {
        id: 'requestor',
        label: 'Requestor',
        component: <RequestorInfo />
      },
    ];

    if (formData.customerType === "builder") {
      listOfSteps.push({
        id: 'site',
        label: 'Site',
        component: <Site />
      });
    }

    listOfSteps.push({
      id: 'product',
      label: 'Product',
      component: <Product />
    });
    return listOfSteps;
  }, [formData]);

  const handleFinalSave = useCallback(async () => {
    console.log("Submitting full form to Next.js API Route:", formData);
    // API Call here...
  }, [formData]);

  return <Wizard steps={steps} onSave={handleFinalSave} />;
};

export default function ServiceRequestPage() {
  const styles = usePageStyles();

  return (
    <div className={styles.container}>
      <FormProvider>
        <ServiceRequestForm />
      </FormProvider>
    </div>
  );
}