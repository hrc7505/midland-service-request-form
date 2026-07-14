import apiRequest from "@/app/utils/request";
import { getFileCategory, FILE_CONFIG, FILE_CATEGORY } from "@/app/config/fileConfig";

export interface IUploadSessionResponse {
    id?: string;
    uploadSessionId?: string;
    UploadSessionId?: string;
}

export interface ICreateFileResponse {
    FileId: string;
    UploadUrl: string;
    BlobContainer: string;
    BlobPath: string;
    ExpiresOnUtc: string;
}

const logDev = (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
        console.log(...args);
    }
};

function getAttachmentType(contentType: string, fileName: string): string {
    const category = getFileCategory({ type: contentType, name: fileName });
    if (category === FILE_CATEGORY.UNKNOWN) return "Other";
    return FILE_CONFIG[category].attachmentType;
}

export default class UploadService {
    /**
     * Creates a new upload session
     */
    static async createUploadSession(uploadPurpose?: number | string): Promise<string> {
        logDev("[UploadService] Creating upload session...");
        const data = await apiRequest<IUploadSessionResponse>("/api/upload-sessions", {
            method: "POST",
            body: uploadPurpose ? { uploadPurpose } : undefined,
        });

        logDev("[UploadService] Create session response:", data);
        const sessionId = data.id || data.uploadSessionId || data.UploadSessionId;
        if (!sessionId) {
            throw new Error("Invalid response: missing session ID");
        }
        return sessionId;
    }

    /**
     * Registers a file within an upload session
     */
    static async createUploadFile(
        uploadSessionId: string,
        fileName: string,
        contentType: string,
        uploadPurpose?: number | string
    ): Promise<ICreateFileResponse> {
        const attachmentType = getAttachmentType(contentType, fileName);
        logDev(`[UploadService] Registering file ${fileName} under session ${uploadSessionId}...`);
        const data = await apiRequest<ICreateFileResponse>(`/api/upload-sessions/${uploadSessionId}/files`, {
            method: "POST",
            body: { fileName, contentType, attachmentType, uploadPurpose },
        });

        // Redact SAS url from logs to avoid exposure of sensitive credentials
        logDev("[UploadService] File registration response:", { FileId: data.FileId });
        return data;
    }

    /**
     * Uploads the raw binary file to the Azure Blob secure SAS URL via proxy
     */
    static async uploadToAzureBlob(uploadUrl: string, file: File): Promise<void> {
        logDev(`[UploadService] Uploading binary of ${file.name} via proxy...`, { size: file.size, type: file.type });
        await apiRequest(`/api/upload-to-blob?url=${encodeURIComponent(uploadUrl)}`, {
            method: "POST",
            body: file,
        });
        logDev(`[UploadService] Uploaded binary of ${file.name} successfully via proxy.`);
    }

    /**
     * Marks the file upload as complete
     */
    static async completeUploadFile(uploadSessionId: string, fileId: string): Promise<void> {
        logDev(`[UploadService] Completing file upload ${fileId} in session ${uploadSessionId}...`);
        await apiRequest(`/api/upload-sessions/${uploadSessionId}/files/${fileId}/complete`, {
            method: "POST",
        });
        logDev(`[UploadService] File upload completion successful for ${fileId}.`);
    }

    /**
     * Deletes a file from the upload session
     */
    static async deleteUploadFile(uploadSessionId: string, fileId: string): Promise<void> {
        logDev(`[UploadService] Deleting file ${fileId} from session ${uploadSessionId}...`);
        await apiRequest(`/api/upload-sessions/${uploadSessionId}/files/${fileId}`, {
            method: "DELETE",
        });
        logDev(`[UploadService] File ${fileId} deleted successfully.`);
    }
}
