export default interface IImagePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previewData: {
        url: string;
        name: string;
        size: number;
        originalSize?: number;
    } | null;
}