import IWizardStep from "@/app/components/wizard/interfaces/IWizardStep";

export default interface IWizardProps {
    steps: IWizardStep[];
    onSave: () => void;
}