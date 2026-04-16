'use client';

import React, { useState, useRef, useCallback, useMemo, useId, useEffect } from 'react';
import { Text, Button, mergeClasses, Image, Tooltip } from '@fluentui/react-components';
import { ArrowUploadRegular, DocumentRegular, DismissRegular } from '@fluentui/react-icons';

import FileUploaderProps from '@/app/components/fileUploader/interfaces/IFileUploaderProps';

import useFileUploaderStyles from '@/app/components/fileUploader/useFileUploaderStyles';

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
    onChange,
    accept = 'image/*',
    multiple = true,
    maxFiles = 6,
    maxFileSizeMB = 2,
    disabled = false,
    onError,
}) => {
    const styles = useFileUploaderStyles();
    const inputRef = useRef<HTMLInputElement>(null);
    const liveRegionId = useId();

    const [isDragging, setIsDragging] = useState(false);
    const [showError, setShowError] = useState(false);
    const [ariaMessage, setAriaMessage] = useState('');

    const isMaxReached = useMemo(
        () => files.length >= maxFiles,
        [files.length, maxFiles]
    );

    const isDisabled = disabled || isMaxReached;

    const getFileKey = useCallback(
        (file: File) => `${file.name}-${file.size}-${file.lastModified}`,
        []
    );

    const acceptedTypes = useMemo(
        () => accept.split(',').map((t) => t.trim()),
        [accept]
    );

    const isValidType = useCallback(
        (file: File) =>
            acceptedTypes.some((type) => {
                if (type === '*/*') return true;
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.replace('/*', ''));
                }
                return file.type === type;
            }),
        [acceptedTypes]
    );

    const isValidSize = useCallback(
        (file: File) => file.size <= maxFileSizeMB * 1024 * 1024,
        [maxFileSizeMB]
    );

    const triggerError = useCallback(
        (message: string) => {
            onError?.(message);
            setAriaMessage(message);
            setShowError(true);
            setTimeout(() => setShowError(false), 300);
        },
        [onError]
    );

    const processFiles = useCallback(
        (fileList: FileList | null) => {
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
                triggerError('Duplicate files ignored');
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
     * Generate previews safely
     */
    const previews = useMemo(
        () =>
            files.map((file) => ({
                key: getFileKey(file),
                url: file.type.startsWith('image/')
                    ? URL.createObjectURL(file)
                    : null,
            })),
        [files, getFileKey]
    );

    useEffect(() => {
        return () => {
            previews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
        };
    }, [previews]);

    /**
     * Smart truncation (keeps extension)
     */
    const getDisplayName = useCallback((name: string) => {
        const extIndex = name.lastIndexOf('.');
        if (extIndex === -1) return name;

        const base = name.slice(0, extIndex);
        const ext = name.slice(extIndex);

        const MAX = 18;
        if (name.length <= MAX) return name;

        const visible = MAX - ext.length - 1;
        return `${base.slice(0, visible)}…${ext}`;
    }, []);

    return (
        <div className={styles.container}>
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
                    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
            >
                <ArrowUploadRegular fontSize={40} />

                <Text weight="semibold">
                    {isMaxReached
                        ? 'Maximum files uploaded'
                        : 'Drag files or click to upload'}
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
                        e.target.value = '';
                    }}
                    disabled={isDisabled}
                />
            </div>

            {/* Grid */}
            <div className={styles.fileGrid}>
                {files.map((file, index) => {
                    const preview = previews[index]?.url;

                    return (
                        <div key={getFileKey(file)} className={styles.fileCard}>
                            <Tooltip content={file.name} relationship="label">
                                <div>
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

                                    <Button
                                        className={styles.removeBtn}
                                        appearance="subtle"
                                        icon={<DismissRegular />}
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(files.filter((_, i) => i !== index));
                                        }}
                                        aria-label={`Remove ${file.name}`}
                                    />

                                    <div className={styles.fileFooter}>
                                        <Text className={styles.fileName}>
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