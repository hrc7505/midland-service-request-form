export default interface IWizardStep {
    id: string;
    label: string;
    component: React.ReactNode;
    isValid?: boolean;
}