export default interface IImagePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previewData: {
        url: string | null;
        file?: File;
        name: string;
        size: number;
        originalSize?: number;
        type?: string;
    } | null;
}