"use client";

import React, { useMemo } from "react";
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, Button, Image, Text, mergeClasses } from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";

import IImagePreviewDialogProps from "@/app/components/imagePreviewDialog/interfaces/IImagePreviewDialogProps";
import formatSize from "@/app/utils/formatSize";

import useImagePreviewDialogStyles from "@/app/components/imagePreviewDialog/useImagePreviewDialogStyles";
import useCommonStyles from "@/app/styles/useCommonStyles";

const ImagePreviewDialog: React.FC<IImagePreviewDialogProps> = ({ open, onOpenChange, previewData }) => {
    const styles = useImagePreviewDialogStyles();
    const commonStyles = useCommonStyles();

    const compressedPercent = useMemo(() =>
        previewData?.originalSize && previewData.originalSize > previewData.size
            ? Math.round((1 - previewData.size / previewData.originalSize) * 100)
            : null, [previewData]);

    if (!previewData) return null;

    return (
        <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
            <DialogSurface className={styles.previewDialogSurface}>
                <DialogBody>
                    <DialogTitle
                        action={
                            <Button
                                appearance="subtle"
                                aria-label="close"
                                icon={<DismissRegular />}
                                onClick={() => onOpenChange(false)}
                            />
                        }
                    >
                        <div className={mergeClasses(commonStyles.flexColumn, commonStyles.gap1)}>
                            <Text weight="semibold">{previewData.name}</Text>
                            <div className={mergeClasses(commonStyles.flexRow, commonStyles.gap3, commonStyles.flexAlignCenter)}>
                                <Text size={200}>Size: {formatSize(previewData.size)}</Text>
                                {compressedPercent !== null && (
                                    <Text size={200} className={mergeClasses(commonStyles.flexAlignCenter, styles.compressedText)}>
                                        • Compressed by {compressedPercent}% (was {formatSize(previewData.originalSize!)})
                                    </Text>
                                )}
                            </div>
                        </div>
                    </DialogTitle>
                    <DialogContent className={mergeClasses(commonStyles.flexCenter, styles.previewDialogContent)}>
                        <Image
                            src={previewData.url}
                            alt={previewData.name}
                            className={styles.fullScreenImage}
                        />
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default ImagePreviewDialog;
