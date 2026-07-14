import { useCallback, useRef, useEffect } from "react";

import { IProduct, IProductFile, UploadStatus } from "@/app/interfaces/IFormState";
import UploadService from "@/app/utils/uploadService";
import { UpdateProductFn } from "@/app/forms/productList/types/types";

export default function useProductUpload(product: IProduct, onChange: UpdateProductFn) {
    const productRef = useRef(product);
    productRef.current = product;

    // Keep mutable refs of the latest known files to avoid async race conditions
    // when multiple state updates occur before React can re-render.
    const uploadedFilesRef = useRef(product.uploadedFiles || []);
    const photosRef = useRef(product.photos || []);

    useEffect(() => {
        uploadedFilesRef.current = product.uploadedFiles || [];
    }, [product.uploadedFiles]);

    useEffect(() => {
        photosRef.current = product.photos || [];
    }, [product.photos]);

    const sessionCreationPromise = useRef<Promise<string> | null>(null);

    const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

    const updateUploadedFiles = useCallback((newUploaded: IProductFile[]) => {
        uploadedFilesRef.current = newUploaded;
        onChange(productRef.current.id, "uploadedFiles", newUploaded);
    }, [onChange]);

    const updatePhotosList = useCallback((newPhotosList: File[]) => {
        photosRef.current = newPhotosList;
        onChange(productRef.current.id, "photos", newPhotosList);
    }, [onChange]);

    const uploadSingleFile = useCallback(async (file: File, sessionId: string) => {
        const key = getFileKey(file);

        // Set status to uploading and clear error
        updateUploadedFiles(
            uploadedFilesRef.current.map(u =>
                u.fileKey === key ? { ...u, status: UploadStatus.Uploading, errorMsg: undefined } : u
            )
        );

        try {
            // 1. Create file in session
            const fileReg = await UploadService.createUploadFile(
                sessionId,
                file.name,
                file.type || "image/jpeg",
                132190000 // ServiceRequestAttachment
            );

            // 2. Put binary data to Azure blob
            await UploadService.uploadToAzureBlob(fileReg.UploadUrl, file);

            // 3. Complete upload
            await UploadService.completeUploadFile(sessionId, fileReg.FileId);

            // 4. Update status to success
            updateUploadedFiles(
                uploadedFilesRef.current.map(u =>
                    u.fileKey === key ? { ...u, status: UploadStatus.Success, fileId: fileReg.FileId } : u
                )
            );
        } catch (err) {
            console.error(`Failed uploading ${file.name}:`, err);
            updateUploadedFiles(
                uploadedFilesRef.current.map(u =>
                    u.fileKey === key ? { ...u, status: UploadStatus.Error, errorMsg: err instanceof Error ? err.message : String(err) } : u
                )
            );
        }
    }, [updateUploadedFiles]);

    const handleFilesChange = useCallback(async (newFiles: File[]) => {
        const productId = productRef.current.id;

        const currentPhotos = photosRef.current;
        let currentUploaded = uploadedFilesRef.current;

        // 1. Find removed files
        const newFileKeys = new Set(newFiles.map(getFileKey));
        const removedFiles = currentPhotos.filter(f => !newFileKeys.has(getFileKey(f)));

        // 2. Find added files
        const oldFileKeys = new Set(currentPhotos.map(getFileKey));
        const addedFiles = newFiles.filter(f => !oldFileKeys.has(getFileKey(f)));

        let currentSessionId = productRef.current.uploadSessionId;

        // Process removals
        for (const file of removedFiles) {
            const key = getFileKey(file);
            currentUploaded = uploadedFilesRef.current;
            const metadata = currentUploaded.find(u => u.fileKey === key);

            if (currentSessionId && metadata?.fileId) {
                // Mark status as deleting in state
                updateUploadedFiles(
                    uploadedFilesRef.current.map(u =>
                        u.fileKey === key ? { ...u, status: UploadStatus.Deleting } : u
                    )
                );

                try {
                    // Await backend deletion
                    await UploadService.deleteUploadFile(currentSessionId, metadata.fileId);
                } catch (err) {
                    console.error("Failed to delete file from backend:", err);
                    // Reset status back to Success since deletion failed, do not filter out
                    updateUploadedFiles(
                        uploadedFilesRef.current.map(u =>
                            u.fileKey === key ? { ...u, status: UploadStatus.Success } : u
                        )
                    );
                    continue; // Skip the removal logic below
                }
            }

            // Finally remove from photos and uploaded files
            updatePhotosList(photosRef.current.filter(f => getFileKey(f) !== key));
            updateUploadedFiles(uploadedFilesRef.current.filter(u => u.fileKey !== key));

            await new Promise(resolve => setTimeout(resolve, 0));
        }

        // Process additions
        if (addedFiles.length === 0) return;

        // Update local photos first
        updatePhotosList([...photosRef.current, ...addedFiles]);

        // Pre-populate uploaded files with "pending" / "uploading" state
        const initialAddedMetadata: IProductFile[] = addedFiles.map(file => ({
            fileKey: getFileKey(file),
            fileName: file.name,
            contentType: file.type || "image/jpeg",
            status: UploadStatus.Pending,
        }));

        updateUploadedFiles([...uploadedFilesRef.current, ...initialAddedMetadata]);

        await new Promise(resolve => setTimeout(resolve, 0));

        // Obtain or create session ID
        if (!currentSessionId) {
            if (!sessionCreationPromise.current) {
                sessionCreationPromise.current = (async () => {
                    const sid = await UploadService.createUploadSession(132190000);
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
                updateUploadedFiles(
                    uploadedFilesRef.current.map(u => {
                        const isAdded = initialAddedMetadata.some(a => a.fileKey === u.fileKey);
                        return isAdded ? { ...u, status: UploadStatus.Error, errorMsg: "Could not create upload session" } : u;
                    })
                );
                return;
            } finally {
                sessionCreationPromise.current = null;
            }
        }

        // Upload all added files sequentially under the session ID
        for (const file of addedFiles) {
            await uploadSingleFile(file, currentSessionId);
            await new Promise(resolve => setTimeout(resolve, 0));
        }

    }, [onChange, updatePhotosList, updateUploadedFiles, uploadSingleFile]);

    const handleRetryUpload = useCallback(async (file: File) => {
        let currentSessionId = productRef.current.uploadSessionId;

        if (!currentSessionId) {
            if (!sessionCreationPromise.current) {
                sessionCreationPromise.current = (async () => {
                    const sid = await UploadService.createUploadSession(132190000);
                    onChange(productRef.current.id, "uploadSessionId", sid);
                    return sid;
                })();
            }
            try {
                currentSessionId = await sessionCreationPromise.current;
            } catch (err) {
                console.error("Failed to create upload session for retry:", err);
                sessionCreationPromise.current = null;
                return;
            } finally {
                sessionCreationPromise.current = null;
            }
        }

        await uploadSingleFile(file, currentSessionId);
    }, [onChange, uploadSingleFile]);

    return { handleFilesChange, handleRetryUpload };
}

