"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, Button, Image, Text, mergeClasses } from "@fluentui/react-components";
import { DismissRegular, VideoOffRegular, DocumentRegular } from "@fluentui/react-icons";

import IImagePreviewDialogProps from "@/app/components/imagePreviewDialog/interfaces/IImagePreviewDialogProps";
import formatSize from "@/app/utils/formatSize";
import { getFileCategory, FILE_CATEGORY, PDF_MIME_TYPE } from "@/app/config/fileConfig";

import useImagePreviewDialogStyles from "@/app/components/imagePreviewDialog/useImagePreviewDialogStyles";
import useCommonStyles from "@/app/styles/useCommonStyles";

const ImagePreviewDialog: React.FC<IImagePreviewDialogProps> = ({ open, onOpenChange, previewData }) => {
    const styles = useImagePreviewDialogStyles();
    const commonStyles = useCommonStyles();

    const compressedPercent = useMemo(() =>
        previewData?.originalSize && previewData.originalSize > previewData.size
            ? Math.round((1 - previewData.size / previewData.originalSize) * 100)
            : null, [previewData]);

    const isMobile = useSyncExternalStore(
        () => () => { },
        () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        () => false
    );

    const [failedVideoUrl, setFailedVideoUrl] = useState<string | null>(null);
    const videoError = previewData?.url && failedVideoUrl === previewData.url;

    if (!previewData) return null;

    const category = getFileCategory(previewData.file || { name: previewData.name, type: previewData.type || "" });
    const isVideo = category === FILE_CATEGORY.VIDEO;
    const isImage = category === FILE_CATEGORY.IMAGE;
    const isDocument = category === FILE_CATEGORY.DOCUMENT;

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
                        {isVideo ? (
                            videoError ? (
                                <div className={mergeClasses(commonStyles.flexColumn, commonStyles.flexCenter, commonStyles.gap2)}>
                                    <VideoOffRegular fontSize={48} />
                                    <Text weight="semibold">Video format not supported for local preview</Text>
                                    <Text size={200}>You can still upload this file.</Text>
                                </div>
                            ) : (
                                <video
                                    src={previewData.url || ""}
                                    controls
                                    className={styles.fullScreenImage}
                                    autoPlay
                                    onError={() => setFailedVideoUrl(previewData.url || "")}
                                />
                            )
                        ) : isImage ? (
                            <Image
                                src={previewData.url || ""}
                                alt={previewData.name}
                                className={styles.fullScreenImage}
                            />
                        ) : isDocument && !isMobile && previewData.type === PDF_MIME_TYPE ? (
                            <iframe
                                src={previewData.url || ""}
                                className={mergeClasses(styles.fullScreenImage, styles.iframePreview)}
                                title={previewData.name}
                            />
                        ) : (
                            <div className={mergeClasses(commonStyles.flexColumn, commonStyles.flexCenter, commonStyles.gap2, styles.fallbackPreview)}>
                                <DocumentRegular fontSize={48} />
                                <Text weight="semibold">Preview not available for this file format{isMobile && isDocument ? " on mobile devices" : ""}</Text>
                                <Text size={200}>You can still upload this document.</Text>
                            </div>
                        )}
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default ImagePreviewDialog;
