'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    makeStyles,
    tokens,
    Text,
    Button,
    mergeClasses,
} from '@fluentui/react-components';
import {
    ArrowUploadRegular,
    DocumentRegular,
    DismissRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    dropZone: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        border: `2px dashed ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        gap: '8px',
    },
    dropZoneActive: {
        border: `2px solid ${tokens.colorBrandStroke1}`,
        backgroundColor: tokens.colorBrandBackground2,
    },
    dropZoneDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    fileList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '16px',
    },
    fileItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
    },
    fileName: {
        flex: 1,
    },
    hiddenInput: {
        display: 'none',
    },
    dropZoneError: {
        border: `2px solid ${tokens.colorPaletteRedBorder2}`,
        backgroundColor: tokens.colorPaletteRedBackground1,
    },

    shake: {
        animationName: {
            '0%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-6px)' },
            '50%': { transform: 'translateX(6px)' },
            '75%': { transform: 'translateX(-4px)' },
            '100%': { transform: 'translateX(0)' },
        },
        animationDuration: '0.3s',
    },
});

export interface MultiFileUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    disabled?: boolean;
    onError?: (message: string) => void;
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
    files,
    onFilesChange,
    accept = 'image/*',
    multiple = true,
    maxFiles = 6,
    disabled = false,
    onError,
}) => {
    const styles = useStyles();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showErrorAnimation, setShowErrorAnimation] = useState(false);

    const isMaxReached = useMemo(() => {
        return files.length >= maxFiles;
    }, [files, maxFiles]);

    const appendFiles = useCallback(
        (fileList: FileList | null) => {
            if (!fileList || disabled || isMaxReached) return;

            const incomingFiles = Array.from(fileList);

            // Allowed types (derive from accept prop)
            const acceptedTypes = accept.split(',').map((t) => t.trim());

            const isValidType = (file: File) => {
                return acceptedTypes.some((type) => {
                    if (type === '*/*') return true;

                    // image/* case
                    if (type.endsWith('/*')) {
                        return file.type.startsWith(type.replace('/*', ''));
                    }

                    // exact match
                    return file.type === type;
                });
            };

            const validFiles: File[] = [];
            let hasInvalid = false;

            for (const file of incomingFiles) {
                if (isValidType(file)) {
                    validFiles.push(file);
                } else {
                    hasInvalid = true;
                }
            }

            if (hasInvalid) {
                onError?.('Some files are not supported and were ignored.');
                setShowErrorAnimation(true);
                const t = setTimeout(() => {
                    setShowErrorAnimation(false);
                    clearTimeout(t);
                }, 300);
            }

            // --- Duplicate prevention ---
            const existingKeys = new Set(
                files.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
            );

            const uniqueFiles = validFiles.filter((file) => {
                const key = `${file.name}-${file.size}-${file.lastModified}`;
                return !existingKeys.has(key);
            });

            if (uniqueFiles.length !== validFiles.length) {
                onError?.('Duplicate files were ignored.');
            }

            let newFiles = uniqueFiles;

            // --- Max file validation ---
            if (files.length + newFiles.length > maxFiles) {
                const remaining = maxFiles - files.length;

                if (remaining <= 0) {
                    onError?.(`You can upload a maximum of ${maxFiles} files.`);
                    return;
                }

                newFiles = newFiles.slice(0, remaining);
                onError?.(`Only ${remaining} more file(s) allowed.`);
            }

            if (newFiles.length > 0) {
                onFilesChange([...files, ...newFiles]);
            }
        },
        [files, onFilesChange, maxFiles, disabled, onError, isMaxReached, accept]
    );

    const handleRemoveFile = useCallback(
        (index: number) => {
            const updated = files.filter((_, i) => i !== index);
            onFilesChange(updated);
        },
        [files, onFilesChange]
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (!disabled && !isMaxReached) setIsDragging(true);
        },
        [disabled, isMaxReached]
    );

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            if (disabled || isMaxReached) return;
            appendFiles(e.dataTransfer.files);
        },
        [appendFiles, disabled, isMaxReached]
    );

    const handleClick = useCallback(() => {
        if (disabled || isMaxReached) return;
        inputRef.current?.click();
    }, [disabled, isMaxReached]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            appendFiles(e.target.files);
            e.target.value = '';
        },
        [appendFiles]
    );

    const isDisabled = disabled || isMaxReached;

    return (
        <div className={styles.container}>
            <div
                className={mergeClasses(
                    styles.dropZone,
                    isDragging && styles.dropZoneActive,
                    isDisabled && styles.dropZoneDisabled,
                    showErrorAnimation && styles.dropZoneError,
                    showErrorAnimation && styles.shake
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                aria-disabled={isDisabled}
            >
                <ArrowUploadRegular
                    fontSize={40}
                    primaryFill={tokens.colorNeutralForeground3}
                />

                <Text weight="semibold">
                    {isMaxReached
                        ? 'Maximum files uploaded'
                        : 'Drag files here or click to upload'}
                </Text>

                <Text size={200}>
                    Supports {accept} files (Max: {maxFiles})
                </Text>

                <input
                    ref={inputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    className={styles.hiddenInput}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                />
            </div>

            <div className={styles.fileList}>
                {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className={styles.fileItem}>
                        <DocumentRegular />

                        <Text className={styles.fileName} size={300} truncate>
                            {file.name}
                        </Text>

                        <Button
                            appearance="subtle"
                            icon={<DismissRegular />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(index);
                            }}
                            disabled={disabled}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
