"use client";

import React, { useState, useRef, useCallback, useMemo, useId, useEffect } from "react";
import { Text, Button, mergeClasses, Image, Tooltip, Spinner } from "@fluentui/react-components";
import { ArrowUploadRegular, DocumentRegular, DismissRegular, WarningRegular, CheckmarkCircleFilled, ErrorCircleFilled } from "@fluentui/react-icons";

import FileUploaderProps from "@/app/components/fileUploader/interfaces/IFileUploaderProps";
import { UploadStatus } from "@/app/interfaces/IFormState";

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
    accept = "image/*",
    multiple = true,
    maxFiles = 6,
    maxFileSizeMB = 2,
    disabled = false,
    onError,
}) => {
    const styles = useFileUploaderStyles();
    const commonStyles = useCommonStyles();
    const inputRef = useRef<HTMLInputElement>(null);
    const liveRegionId = useId();
    const objectUrls = useRef<Record<string, string>>({});

    const [isDragging, setIsDragging] = useState(false);
    const [showError, setShowError] = useState(false);
    const [ariaMessage, setAriaMessage] = useState("");
    const [previews, setPreviews] = useState<{key: string, url: string | null}[]>([]);

    const isMaxReached = useMemo(() => files.length >= maxFiles, [files.length, maxFiles]);

    const isDisabled = disabled || isMaxReached;

    const getFileKey = useCallback((file: File) => `${file.name}-${file.size}-${file.lastModified}`, []);

    const acceptedTypes = useMemo(() => accept.split(",").map((t) => t.trim()), [accept]);

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
                return file.type.startsWith(type.replace("/*", ""));
            }
            return file.type === type;
        });
    }, [accept, acceptedTypes]);

    const isValidSize = useCallback((file: File) => file.size <= maxFileSizeMB * 1024 * 1024,
        [maxFileSizeMB]
    );

    const triggerError = useCallback((message: string) => {
        onError?.(message);
        setAriaMessage(message);
        setShowError(true);
        setTimeout(() => setShowError(false), 300);
    }, [onError]
    );

    const processFiles = useCallback((fileList: FileList | null) => {
        if (!fileList || isDisabled) return;

        const incoming = Array.from(fileList);
        const valid: File[] = [];

        for (const file of incoming) {
            if (!isValidType(file)) {
                triggerError(`Unsupported: ${file.name}`);
                continue;
            }

            if (!isValidSize(file)) {
                triggerError(`Too large: ${file.name}`);
                continue;
            }

            valid.push(file);
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

            next = next.slice(0, remaining);
            triggerError(`Only ${remaining} more allowed`);
        }

        if (next.length) {
            onChange([...files, ...next]);
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

        // Create URLs for new image files
        files.forEach((file) => {
            const key = getFileKey(file);
            if (file.type.startsWith("image/") && !objectUrls.current[key]) {
                objectUrls.current[key] = URL.createObjectURL(file);
            }
        });

        setPreviews(files.map((file) => {
            const key = getFileKey(file);
            return { key, url: file.type.startsWith("image/") ? objectUrls.current[key] || null : null };
        }));
    }, [files, getFileKey]);

    useEffect(() => {
        return () => {
            Object.values(objectUrls.current).forEach((url) => URL.revokeObjectURL(url));
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

    return (
        <div className={commonStyles.flexColumn}>
            {/* ARIA live region */}
            <div className={styles.srOnly} aria-live="polite" id={liveRegionId}>
                {ariaMessage}
            </div>

            {/* Dropzone */}
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
                    showError && styles.dropZoneError,
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
                <ArrowUploadRegular fontSize={40} />

                <Text weight="semibold">
                    {isMaxReached
                        ? "Maximum files uploaded"
                        : "Drag files or click to upload"}
                </Text>

                <Text size={200}>
                    {accept} • Max {maxFiles} • {maxFileSizeMB}MB each
                </Text>

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

            {/* Grid */}
            <div className={mergeClasses(styles.fileGrid, commonStyles.gap3)}>
                {files.map((file, index) => {
                    const preview = previews[index]?.url;
                    const key = getFileKey(file);
                    const metadata = uploadedFiles.find(u => u.fileKey === key);
                    const status = metadata?.status || UploadStatus.Success;
                    const isUploading = status === UploadStatus.Uploading || status === UploadStatus.Pending;
                    const isDeleting = status === UploadStatus.Deleting;
                    const isError = status === UploadStatus.Error;
                    const isSuccess = status === UploadStatus.Success;

                    return (
                        <div key={key} className={styles.fileCard}>
                            <Tooltip content={isError ? (metadata?.errorMsg || "Upload failed") : file.name} relationship="label">
                                <div>
                                    <div className={styles.thumbnailContainer}>
                                        {preview ? (
                                            <Image
                                                src={preview}
                                                alt={file.name}
                                                className={styles.thumbnail}
                                            />
                                        ) : (
                                            <div className={styles.thumbnail}>
                                                <DocumentRegular />
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
                                            onChange(files.filter((_, i) => i !== index));
                                        }}
                                        aria-label={`Remove ${file.name}`}
                                    />

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
        </div>
    );
};

export default FileUploader;