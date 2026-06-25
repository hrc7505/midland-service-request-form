import apiRequest from "@/app/utils/request";

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

export default class UploadService {
    /**
     * Creates a new upload session
     */
    static async createUploadSession(): Promise<string> {
        console.log("[UploadService] Creating upload session...");
        const data = await apiRequest<IUploadSessionResponse>("/api/upload-sessions", {
            method: "POST",
        });

        console.log("[UploadService] Create session response:", data);
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
        contentType: string
    ): Promise<ICreateFileResponse> {
        console.log(`[UploadService] Registering file ${fileName} under session ${uploadSessionId}...`);
        const data = await apiRequest<ICreateFileResponse>(`/api/upload-sessions/${uploadSessionId}/files`, {
            method: "POST",
            body: { fileName, contentType },
        });

        console.log("[UploadService] File registration response:", data);
        return data;
    }

    /**
     * Uploads the raw binary file to the Azure Blob secure SAS URL via proxy
     */
    static async uploadToAzureBlob(uploadUrl: string, file: File): Promise<void> {
        console.log(`[UploadService] Uploading binary of ${file.name} via proxy...`, { size: file.size, type: file.type });
        await apiRequest(`/api/upload-to-blob?url=${encodeURIComponent(uploadUrl)}`, {
            method: "POST",
            body: file,
        });
        console.log(`[UploadService] Uploaded binary of ${file.name} successfully via proxy.`);
    }

    /**
     * Marks the file upload as complete
     */
    static async completeUploadFile(uploadSessionId: string, fileId: string): Promise<void> {
        console.log(`[UploadService] Completing file upload ${fileId} in session ${uploadSessionId}...`);
        await apiRequest(`/api/upload-sessions/${uploadSessionId}/files/${fileId}/complete`, {
            method: "POST",
        });
        console.log(`[UploadService] File upload completion successful for ${fileId}.`);
    }

    /**
     * Deletes a file from the upload session
     */
    static async deleteUploadFile(uploadSessionId: string, fileId: string): Promise<void> {
        console.log(`[UploadService] Deleting file ${fileId} from session ${uploadSessionId}...`);
        await apiRequest(`/api/upload-sessions/${uploadSessionId}/files/${fileId}`, {
            method: "DELETE",
        });
        console.log(`[UploadService] File ${fileId} deleted successfully.`);
    }
}
