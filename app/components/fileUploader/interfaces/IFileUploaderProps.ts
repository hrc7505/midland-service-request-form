import { IProductFile } from "@/app/interfaces/IFormState";

/**
 * Props for FileUploader
 */
export default interface FileUploaderProps {
    files: File[];
    uploadedFiles?: IProductFile[];
    onChange: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxFileSizeMB?: number;
    disabled?: boolean;
    onError?: (message: string) => void;
}