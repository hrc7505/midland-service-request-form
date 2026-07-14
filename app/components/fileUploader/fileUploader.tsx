"use client";

import React, { useState, useRef, useCallback, useMemo, useId, useEffect } from "react";
import { Text, Button, mergeClasses, Image, Tooltip, Spinner, Field } from "@fluentui/react-components";
import { ArrowUploadRegular, DocumentRegular, DismissRegular, CheckmarkCircleFilled, ErrorCircleFilled, DocumentPdfRegular, DocumentWordRegular, DocumentTextRegular, DocumentTableRegular, PlayCircleRegular, ArrowSyncRegular } from "@fluentui/react-icons";

import compressImage from "@/app/utils/imageCompression";
import FileUploaderProps from "@/app/components/fileUploader/interfaces/IFileUploaderProps";
import { UploadStatus } from "@/app/interfaces/IFormState";
import ImagePreviewDialog from "@/app/components/imagePreviewDialog/imagePreviewDialog";
import formatSize from "@/app/utils/formatSize";
import { FILE_CONFIG, FILE_UPLOADER_ACCEPT_STRING, getFileCategory, FILE_CATEGORY } from "@/app/config/fileConfig";

import useFileUploaderStyles from "@/app/components/fileUploader/useFileUploaderStyles";
import useCommonStyles from "@/app/styles/useCommonStyles";

/**
 * FileUploader Component
 *
 * Features:
 * - Drag & drop upload
 * - File validation (type, size, duplicates)
 * - Max file limit
 * - Image previews
 * - Accessible (ARIA + keyboard)
 * - Grid layout UI
 */
const FileUploader: React.FC<FileUploaderProps> = ({
    files,
    uploadedFiles = [],
    onChange,
    accept = FILE_UPLOADER_ACCEPT_STRING,
    multiple = true,
    maxFiles = 6,
    disabled = false,
    onError,
    onRetry,
}) => {
    const styles = useFileUploaderStyles();
    const commonStyles = useCommonStyles();
    const inputRef = useRef<HTMLInputElement>(null);
    const liveRegionId = useId();
    const objectUrls = useRef<Record<string, string>>({});

    const [isDragging, setIsDragging] = useState(false);
    const [showError, setShowError] = useState(false);
    const [ariaMessage, setAriaMessage] = useState("");
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [fullScreenPreview, setFullScreenPreview] = useState<{ url: string | null; file?: File; name: string; size: number; type?: string; originalSize?: number } | null>(null);
    const [previews, setPreviews] = useState<{ key: string, url: string | null }[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);

    const isMaxReached = useMemo(() => files.length >= maxFiles, [files.length, maxFiles]);

    const isDisabled = disabled || isMaxReached || isCompressing;

    const getFileKey = useCallback((file: File) => `${file.name}-${file.size}-${file.lastModified}`, []);

    const acceptedTypes = useMemo(() => accept.split(",").map((t) => t.trim()), [accept]);

    const parsedExtensions = useMemo(() => {
        if (!accept) return null;
        const exts = acceptedTypes.filter(t => t.startsWith("."));

        const result: Partial<Record<keyof typeof FILE_CONFIG, string[]>> = {};
        for (const [category, config] of Object.entries(FILE_CONFIG)) {
            result[category as keyof typeof FILE_CONFIG] = exts.filter(e => (config.extensions as readonly string[]).includes(e));
        }
        return result;
    }, [accept, acceptedTypes]);

    const isValidType = useCallback((file: File) => {
        if (!accept.trim()) {
            return true;
        }
        return acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
                return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            if (type === "*/*") return true;
            if (type.endsWith("/*")) {
                const baseType = type.replace("/*", "");
                if (!file.type && baseType === FILE_CATEGORY.IMAGE) {
                    // Fallback for some mobile browsers returning empty file.type for camera photos
                    return true;
                }
                return file.type.startsWith(baseType);
            }
            return file.type === type;
        });
    }, [accept, acceptedTypes]);

    const isValidSize = useCallback((file: File) => {
        const sizeMB = file.size / (1024 * 1024);
        const category = getFileCategory(file);

        if (category === FILE_CATEGORY.UNKNOWN) return sizeMB <= FILE_CONFIG[FILE_CATEGORY.DOCUMENT].maxSizeMB; // Fallback to document size

        return sizeMB <= FILE_CONFIG[category].maxSizeMB;
    }, []);

    const triggerError = useCallback((message: string) => {
        onError?.(message);
        setAriaMessage(message);
        setShowError(true);
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => setShowError(false), 300);
    }, [onError]);

    const processFiles = useCallback(async (fileList: FileList | null) => {
        setAriaMessage("");
        if (!fileList || isDisabled) return;

        setIsCompressing(true);
        try {
            const incoming = Array.from(fileList);
            const valid: File[] = [];

            for (const file of incoming) {
                if (!isValidType(file)) {
                    triggerError(`Unsupported: ${file.name}`);
                    continue;
                }

                let processedFile = file;
                const category = getFileCategory(file);

                // Compress images only if > maxSizeMB
                if (file.size > FILE_CONFIG[FILE_CATEGORY.IMAGE].maxSizeMB * 1024 * 1024 && category === FILE_CATEGORY.IMAGE) {
                    try {
                        processedFile = await compressImage(file, FILE_CONFIG[FILE_CATEGORY.IMAGE].maxSizeMB, 1920);
                    } catch (error) {
                        console.error("Image compression error:", error);
                    }
                }

                if (!isValidSize(processedFile)) {
                    triggerError(`Too large: ${processedFile.name}`);
                    continue;
                }

                valid.push(processedFile);
            }

            const existing = new Set(files.map(getFileKey));
            const unique = valid.filter((f) => !existing.has(getFileKey(f)));

            if (unique.length !== valid.length) {
                triggerError("Duplicate files ignored");
            }

            let next = unique;

            if (files.length + next.length > maxFiles) {
                const remaining = maxFiles - files.length;

                if (remaining <= 0) {
                    triggerError(`Max ${maxFiles} files allowed`);
                    return;
                }
                const ignoredCount = next.length - remaining;
                next = next.slice(0, remaining);
                triggerError(`Max ${maxFiles} files allowed. ${ignoredCount} file(s) ignored.`);
            }

            if (next.length) {
                onChange([...files, ...next]);
            }
        } finally {
            setIsCompressing(false);
        }
    },
        [
            files,
            isDisabled,
            isValidType,
            isValidSize,
            maxFiles,
            onChange,
            triggerError,
            getFileKey,
        ]
    );

    /**
     * Manage object URLs lifecycle
     */
    useEffect(() => {
        const currentKeys = new Set(files.map(getFileKey));

        // Revoke URLs for files that have been removed
        Object.keys(objectUrls.current).forEach((key) => {
            if (!currentKeys.has(key)) {
                URL.revokeObjectURL(objectUrls.current[key]);
                delete objectUrls.current[key];
            }
        });

        // Create URLs for new files
        const loadPreviews = async () => {
            const newPreviews = await Promise.all(
                files.map(async (file) => {
                    const key = getFileKey(file);
                    const category = getFileCategory(file);

                    if (category === FILE_CATEGORY.IMAGE) {
                        if (!objectUrls.current[key]) {
                            objectUrls.current[key] = URL.createObjectURL(file);
                        }
                        return { key, url: objectUrls.current[key] };
                    }

                    if (category === FILE_CATEGORY.VIDEO) {
                        if (!objectUrls.current[key]) {
                            const { default: getVideoThumbnail } = await import("@/app/utils/videoThumbnail");
                            const thumbUrl = await getVideoThumbnail(file);
                            objectUrls.current[key] = thumbUrl;
                        }
                        return { key, url: objectUrls.current[key] };
                    }

                    return { key, url: null };
                })
            );

            // Wait for all to finish before updating state to prevent flicker
            setPreviews(newPreviews);
        };

        loadPreviews();
    }, [files, getFileKey]);

    useEffect(() => {
        const urls = objectUrls.current;
        return () => {
            Object.values(urls).forEach((url) => {
                if (url && url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    /**
     * Smart truncation (keeps extension)
     */
    const getDisplayName = useCallback((name: string) => {
        const extIndex = name.lastIndexOf(".");
        if (extIndex === -1) return name;

        const base = name.slice(0, extIndex);
        const ext = name.slice(extIndex);

        const MAX = 18;
        if (name.length <= MAX) return name;

        const visible = MAX - ext.length - 1;
        return `${base.slice(0, visible)}…${ext}`;
    }, []);

    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        };
    }, []);

    // Cleanup video blob URL when closing preview
    useEffect(() => {
        const previewUrl = fullScreenPreview?.url;
        const isVideo = fullScreenPreview?.file ? getFileCategory(fullScreenPreview.file) === FILE_CATEGORY.VIDEO : false;
        return () => {
            if (previewUrl && isVideo && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [fullScreenPreview]);

    return (
        <div className={commonStyles.flexColumn}>
            {/* ARIA live region */}
            <div className={styles.srOnly} aria-live="polite" id={liveRegionId}>
                {ariaMessage}
            </div>

            {/* Dropzone wrapped in Field for perfect validation UI */}
            <Field
                validationState={ariaMessage ? "error" : "none"}
                validationMessage={ariaMessage || undefined}
            >
                <div
                    role="button"
                    tabIndex={0}
                    aria-disabled={isDisabled}
                    aria-describedby={liveRegionId}
                    className={mergeClasses(
                        commonStyles.flexColumn,
                        commonStyles.flexCenter,
                        commonStyles.gap2,
                        styles.dropZone,
                        isDragging && styles.dropZoneActive,
                        isDisabled && styles.dropZoneDisabled,
                        !!ariaMessage && styles.dropZoneError,
                        showError && styles.shake
                    )}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!isDisabled) setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        processFiles(e.dataTransfer.files);
                    }}
                    onClick={() => !isDisabled && inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                >
                    {isCompressing ? <Spinner size="large" /> : <ArrowUploadRegular fontSize={40} />}

                    <Text weight="semibold">
                        {isCompressing
                            ? "Compressing images..."
                            : isMaxReached
                                ? "Maximum files uploaded"
                                : "Drag files or click to upload"}
                    </Text>

                    <div className={mergeClasses(commonStyles.flexColumn, commonStyles.flexCenter, commonStyles.gap1, styles.dropZoneTextContainer)}>
                        <Text size={200}>Maximum {maxFiles} files allowed</Text>
                        {parsedExtensions && (
                            <div className={mergeClasses(commonStyles.flexColumn, commonStyles.flexCenter, commonStyles.gap1, styles.extensionsContainer)}>
                                {Object.entries(parsedExtensions).map(([category, exts]) => {
                                    if (!exts || exts.length === 0) return null;
                                    const config = FILE_CONFIG[category as keyof typeof FILE_CONFIG];
                                    const label = category.charAt(0).toUpperCase() + category.slice(1) + "s"; // e.g., 'Images'
                                    return (
                                        <Text key={category} size={100}>
                                            {label} (≤ {config.maxSizeMB}MB): {exts.join(", ")}
                                        </Text>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        multiple={multiple}
                        accept={accept}
                        className={styles.hiddenInput}
                        onChange={(e) => {
                            processFiles(e.target.files);
                            e.target.value = "";
                        }}
                        disabled={isDisabled}
                    />
                </div>
            </Field>

            {/* Grid */}
            <div className={mergeClasses(styles.fileGrid, commonStyles.gap3)}>
                {files.map((file, index) => {
                    const preview = previews[index]?.url;
                    const key = getFileKey(file);
                    const metadata = uploadedFiles.find(u => u.fileKey === key);
                    const status = metadata?.status || UploadStatus.Pending;
                    const isUploading = status === UploadStatus.Uploading || status === UploadStatus.Pending;
                    const isDeleting = status === UploadStatus.Deleting;
                    const isError = status === UploadStatus.Error;
                    const isSuccess = status === UploadStatus.Success;

                    const originalSize = (file as File & { originalSize?: number }).originalSize;
                    const compressedPercent = originalSize && originalSize > file.size
                        ? Math.round((1 - file.size / originalSize) * 100)
                        : null;

                    const tooltipContent = (
                        <div className={mergeClasses(commonStyles.flexColumn, commonStyles.gap1)}>
                            <Text weight="semibold">{file.name}</Text>
                            <Text size={200}>Size: {formatSize(file.size)}</Text>
                            {compressedPercent !== null && (
                                <Text size={200} className={styles.compressedText}>
                                    Compressed by {compressedPercent}% (was {formatSize(originalSize!)})
                                </Text>
                            )}
                        </div>
                    );

                    return (
                        <div key={key} className={styles.fileCard}>
                            <Tooltip content={isError ? (metadata?.errorMsg || "Upload failed") : tooltipContent} relationship="label">
                                <div>
                                    <div className={styles.thumbnailContainer}>
                                        {preview ? (
                                            <>
                                                <Image
                                                    src={preview}
                                                    alt={file.name}
                                                    className={mergeClasses(styles.thumbnail, styles.thumbnailClickable)}
                                                    onClick={() => setFullScreenPreview({
                                                        url: getFileCategory(file) === FILE_CATEGORY.VIDEO ? URL.createObjectURL(file) : preview,
                                                        file: file,
                                                        name: file.name,
                                                        size: file.size,
                                                        type: file.type,
                                                        originalSize: (file as File & { originalSize?: number }).originalSize
                                                    })}
                                                />
                                                {getFileCategory(file) === FILE_CATEGORY.VIDEO && (
                                                    <div className={mergeClasses(commonStyles.flexCenter, styles.videoPlayIconContainer)}>
                                                        <PlayCircleRegular fontSize={40} />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div
                                                className={mergeClasses(
                                                    styles.thumbnail,
                                                    styles.thumbnailClickable,
                                                    commonStyles.flexColumn,
                                                    commonStyles.flexCenter,
                                                    styles.documentFallbackThumbnail
                                                )}
                                                onClick={() => setFullScreenPreview({
                                                    url: URL.createObjectURL(file),
                                                    file: file,
                                                    name: file.name,
                                                    size: file.size,
                                                    type: file.type,
                                                    originalSize: (file as File & { originalSize?: number }).originalSize
                                                })}
                                            >
                                                {file.type === "application/pdf" ? (
                                                    <DocumentPdfRegular fontSize={48} style={{ color: "#d13438" }} />
                                                ) : file.type.includes("wordprocessingml") || file.type.includes("msword") ? (
                                                    <DocumentWordRegular fontSize={48} style={{ color: "#2b579a" }} />
                                                ) : file.type.includes("spreadsheetml") || file.type.includes("ms-excel") ? (
                                                    <DocumentTableRegular fontSize={48} style={{ color: "#107c41" }} />
                                                ) : file.type.includes("text") ? (
                                                    <DocumentTextRegular fontSize={48} />
                                                ) : (
                                                    <DocumentRegular fontSize={48} />
                                                )}
                                            </div>
                                        )}

                                        {/* Uploading overlay */}
                                        {isUploading && (
                                            <div className={mergeClasses(styles.overlay, commonStyles.flexColumn, commonStyles.flexCenter)}>
                                                <Spinner size="medium" appearance="inverted" />
                                                <Text size={100} weight="semibold" className={styles.overlayText}>Uploading...</Text>
                                            </div>
                                        )}

                                        {/* Deleting overlay */}
                                        {isDeleting && (
                                            <div className={mergeClasses(styles.overlay, commonStyles.flexColumn, commonStyles.flexCenter)}>
                                                <Spinner size="medium" appearance="inverted" />
                                                <Text size={100} weight="semibold" className={styles.overlayText}>Deleting...</Text>
                                            </div>
                                        )}

                                        {/* Error badge */}
                                        {isError && (
                                            <div className={styles.errorBadge}>
                                                <ErrorCircleFilled fontSize={18} />
                                            </div>
                                        )}

                                        {/* Success badge */}
                                        {isSuccess && (
                                            <div className={styles.successBadge}>
                                                <CheckmarkCircleFilled fontSize={18} />
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        className={styles.removeBtn}
                                        appearance="subtle"
                                        icon={<DismissRegular />}
                                        size="small"
                                        disabled={isUploading || isDeleting}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setAriaMessage("");
                                            onChange(files.filter((_, i) => i !== index));
                                        }}
                                        aria-label={`Remove ${file.name}`}
                                    />

                                    {isError && onRetry && (
                                        <Button
                                            className={styles.retryBtn}
                                            appearance="subtle"
                                            icon={<ArrowSyncRegular />}
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRetry(file);
                                            }}
                                            aria-label={`Retry upload for ${file.name}`}
                                        />
                                    )}

                                    <div className={styles.fileFooter}>
                                        <Text className={mergeClasses(commonStyles.textNoWrap, styles.fileName)}>
                                            {getDisplayName(file.name)}
                                        </Text>
                                    </div>
                                </div>
                            </Tooltip>
                        </div>
                    );
                })}
            </div>

            {/* Full Screen Preview Dialog */}
            <ImagePreviewDialog
                open={!!fullScreenPreview}
                onOpenChange={(isOpen) => !isOpen && setFullScreenPreview(null)}
                previewData={fullScreenPreview}
            />
        </div>
    );
};

export default FileUploader;