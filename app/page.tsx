'use client';
import { useCallback, useMemo } from "react";

import IWizardStep from "@/app/components/wizard/interfaces/IWizardStep";
import Wizard from "@/app/components/wizard/wizard";
import CustomerTypeCompo from "@/app/forms/customerTypeCompo/customerTypeCompo";
import RequestorInfo from "@/app/forms/requestor/requestor";
import Product from "@/app/forms/product/product";
import Site from "@/app/forms/site/site";
import useFormContext, { FormProvider } from "@/app/context/formContext";
import { CustomerType } from "@/app/interfaces/IFormState";

import usePageStyles from "@/app/usePageStyles";

const ServiceRequestForm = () => {
  const { formData } = useFormContext();

  const steps = useMemo<IWizardStep[]>(() => {
    const listOfSteps: IWizardStep[] = [
      {
        id: 'selection',
        label: 'Type',
        component: <CustomerTypeCompo />
      },
      {
        id: 'requestor',
        label: 'Requestor',
        component: <RequestorInfo />
      },
    ];

    if (formData.customerType === CustomerType.Builder) {
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
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Logic for handling the production errors we set up in the API
        throw new Error(result.error || 'Failed to submit request');
      }

      // Success! 
      // result.ticketNumber and result.caseId are now available
      alert(`Success! Your Service Request has been created: ${result.ticketNumber}`);

      // Optional: Reset form or redirect to a thank you page
      // window.location.href = `/success?ticket=${result.ticketNumber}`;

    } catch (error) {
      if (error instanceof Error) {
        console.error("Submission Error:", error.message);
        alert(`Error: ${error.message}`);
      } else {
        console.error("Submission Error:", error);
        alert('Error: Failed to submit request');
      }
    }
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