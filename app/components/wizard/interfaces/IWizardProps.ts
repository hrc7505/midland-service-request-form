import IWizardStep from "@/app/components/wizard/interfaces/IWizardStep";

export default interface IWizardProps {
    saving: boolean;
    steps: IWizardStep[];
    onSave: () => void;
}