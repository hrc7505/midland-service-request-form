export default interface IStepItemProps {
    label: string;
    index: number;
    status: 'active' | 'completed' | 'upcoming';
}