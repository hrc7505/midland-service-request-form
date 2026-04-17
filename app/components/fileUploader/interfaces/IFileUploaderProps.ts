/**
 * Props for FileUploader
 */
export default interface FileUploaderProps {
    files: File[];
    onChange: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxFileSizeMB?: number;
    disabled?: boolean;
    onError?: (message: string) => void;
}