'use client';
import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DismissRegular } from "@fluentui/react-icons";
import { Button, MessageBar, MessageBarActions, MessageBarBody, MessageBarGroup } from "@fluentui/react-components";

import IWizardStep from "@/app/components/wizard/interfaces/IWizardStep";
import Wizard from "@/app/components/wizard/wizard";
import CustomerTypeCompo from "@/app/forms/customerTypeCompo/customerTypeCompo";
import RequestorInfo from "@/app/forms/requestor/requestor";
import Site from "@/app/forms/site/site";
import useFormContext, { FormProvider } from "@/app/context/formContext";
import { CustomerType } from "@/app/interfaces/IFormState";
import FormValidators from "@/app/utils/formValidations";
import ProductList from "@/app/forms/productList/productList";

import usePageStyles from "@/app/usePageStyles";

const ServiceRequestForm = () => {
  const styles = usePageStyles();
  const { formData } = useFormContext();
  const [isPending, startTranstion] = useTransition();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string>();

  const steps = useMemo<IWizardStep[]>(() => {
    const listOfSteps: IWizardStep[] = [
      {
        id: 'selection',
        label: 'Customer Type',
        component: <CustomerTypeCompo />,
        isValid: true,
      },
      {
        id: 'requestor',
        label: 'Requestor Information',
        component: <RequestorInfo />,
        isValid: FormValidators.isRequestorValid(formData),
      },
    ];

    if (formData.customerType === CustomerType.Builder) {
      listOfSteps.push({
        id: 'site',
        label: 'Site Information',
        component: <Site />,
        isValid: FormValidators.isSiteValid(formData),
      });
    }

    listOfSteps.push({
      id: 'product',
      label: 'Appliances',
      component: <ProductList />,
      isValid: FormValidators.areProductsValid(formData),
    });
    return listOfSteps;
  }, [formData]);

  const handleFinalSave = useCallback(async () => {
    startTranstion(async () => {
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

        router.push("/success");
      } catch (error) {
        if (error instanceof Error) {
          setErrorMsg(error.message);
        } else {
          setErrorMsg('Failed to submit request');
        }
      }
    });
  }, [formData, router]);

  return (
    <div>
      <MessageBarGroup animate="both" >
        {errorMsg
          ? [
            <MessageBar intent="error" key="intent-error" className={styles.messageBar}>
              <MessageBarBody>
                {errorMsg}
              </MessageBarBody>
              <MessageBarActions
                containerAction={
                  <Button
                    onClick={() => setErrorMsg(undefined)}
                    aria-label="dismiss"
                    appearance="transparent"
                    icon={<DismissRegular />}
                  />
                }
              />
            </MessageBar>
          ]
          : []
        }
      </MessageBarGroup>
      <Wizard steps={steps} onSave={handleFinalSave} saving={isPending} />
    </div>
  );
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