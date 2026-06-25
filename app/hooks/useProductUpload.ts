import { useCallback, useRef } from "react";

import { IProduct, IProductFile, UploadStatus } from "@/app/interfaces/IFormState";
import UploadService from "@/app/utils/uploadService";
import { UpdateProductFn } from "@/app/forms/productList/types/types";

export function useProductUpload(
    product: IProduct,
    onChange: UpdateProductFn
) {
    const sessionCreationPromise = useRef<Promise<string> | null>(null);

    const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

    const handleFilesChange = useCallback(async (newFiles: File[]) => {
        const oldFiles = product.photos || [];
        const oldUploaded = product.uploadedFiles || [];
        const productId = product.id;

        // 1. Find removed files
        const newFileKeys = new Set(newFiles.map(getFileKey));
        const removedFiles = oldFiles.filter(f => !newFileKeys.has(getFileKey(f)));

        // 2. Find added files
        const oldFileKeys = new Set(oldFiles.map(getFileKey));
        const addedFiles = newFiles.filter(f => !oldFileKeys.has(getFileKey(f)));

        let currentSessionId = product.uploadSessionId;
        let currentUploaded = [...oldUploaded];
        let currentPhotos = [...oldFiles];

        // Process removals
        for (const file of removedFiles) {
            const key = getFileKey(file);
            const metadata = currentUploaded.find(u => u.fileKey === key);

            if (currentSessionId && metadata?.fileId) {
                // Mark status as deleting in state
                currentUploaded = currentUploaded.map(u =>
                    u.fileKey === key ? { ...u, status: UploadStatus.Deleting } : u
                );
                onChange(productId, "uploadedFiles", currentUploaded);

                try {
                    // Await backend deletion
                    await UploadService.deleteUploadFile(currentSessionId, metadata.fileId);
                } catch (err) {
                    console.error("Failed to delete file from backend:", err);
                }
            }

            // Finally remove from photos and uploaded files
            currentPhotos = currentPhotos.filter(f => getFileKey(f) !== key);
            currentUploaded = currentUploaded.filter(u => u.fileKey !== key);

            onChange(productId, "photos", currentPhotos);
            onChange(productId, "uploadedFiles", currentUploaded);
        }

        // Process additions
        if (addedFiles.length === 0) return;

        // Update local photos first
        const updatedPhotos = [...currentPhotos, ...addedFiles];
        onChange(productId, "photos", updatedPhotos);

        // Pre-populate uploaded files with "pending" / "uploading" state
        const initialAddedMetadata: IProductFile[] = addedFiles.map(file => ({
            fileKey: getFileKey(file),
            fileName: file.name,
            contentType: file.type || "image/jpeg",
            status: UploadStatus.Pending,
        }));

        currentUploaded = [...currentUploaded, ...initialAddedMetadata];
        onChange(productId, "uploadedFiles", currentUploaded);

        // Helper to upload a single file
        const uploadSingleFile = async (file: File, sessionId: string) => {
            const key = getFileKey(file);

            // Set status to uploading
            currentUploaded = currentUploaded.map(u =>
                u.fileKey === key ? { ...u, status: UploadStatus.Uploading } : u
            );
            onChange(productId, "uploadedFiles", currentUploaded);

            try {
                // 1. Create file in session
                const fileReg = await UploadService.createUploadFile(
                    sessionId,
                    file.name,
                    file.type || "image/jpeg"
                );

                // 2. Put binary data to Azure blob
                await UploadService.uploadToAzureBlob(fileReg.UploadUrl, file);

                // 3. Complete upload
                await UploadService.completeUploadFile(sessionId, fileReg.FileId);

                // 4. Update status to success
                currentUploaded = currentUploaded.map(u =>
                    u.fileKey === key ? { ...u, status: UploadStatus.Success, fileId: fileReg.FileId } : u
                );
                onChange(productId, "uploadedFiles", currentUploaded);
            } catch (err) {
                console.error(`Failed uploading ${file.name}:`, err);
                currentUploaded = currentUploaded.map(u =>
                    u.fileKey === key ? { ...u, status: UploadStatus.Error, errorMsg: err instanceof Error ? err.message : String(err) } : u
                );
                onChange(productId, "uploadedFiles", currentUploaded);
            }
        };

        // Obtain or create session ID
        if (!currentSessionId) {
            if (!sessionCreationPromise.current) {
                sessionCreationPromise.current = (async () => {
                    const sid = await UploadService.createUploadSession();
                    onChange(productId, "uploadSessionId", sid);
                    return sid;
                })();
            }
            try {
                currentSessionId = await sessionCreationPromise.current;
            } catch (err) {
                console.error("Failed to create upload session:", err);
                sessionCreationPromise.current = null;
                // Mark all added files with error status
                currentUploaded = currentUploaded.map(u => {
                    const isAdded = initialAddedMetadata.some(a => a.fileKey === u.fileKey);
                    return isAdded ? { ...u, status: UploadStatus.Error, errorMsg: "Could not create upload session" } : u;
                });
                onChange(productId, "uploadedFiles", currentUploaded);
                return;
            } finally {
                sessionCreationPromise.current = null;
            }
        }

        // Upload all added files concurrently under the session ID
        await Promise.all(addedFiles.map(file => uploadSingleFile(file, currentSessionId!)));

    }, [product, onChange]);

    return { handleFilesChange };
}
