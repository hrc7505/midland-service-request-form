"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, Button, Image, Text, mergeClasses } from "@fluentui/react-components";
import { DismissRegular, VideoOffRegular, DocumentRegular } from "@fluentui/react-icons";

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

    const [failedVideoUrl, setFailedVideoUrl] = useState<string | null>(null);
    const videoError = previewData?.url && failedVideoUrl === previewData.url;

    if (!previewData) return null;

    const isVideo = previewData.type?.startsWith("video/");
    const isImage = previewData.type?.startsWith("image/") || (!previewData.type && previewData.url);

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
                        ) : previewData.type === "application/pdf" ? (
                            <iframe
                                src={previewData.url || ""}
                                className={styles.fullScreenImage}
                                style={{ height: "80vh", width: "100%", border: "none" }}
                                title={previewData.name}
                            />
                        ) : (
                            <div className={mergeClasses(commonStyles.flexColumn, commonStyles.flexCenter, commonStyles.gap2)} style={{ height: "400px", width: "100%" }}>
                                <DocumentRegular fontSize={48} />
                                <Text weight="semibold">Preview not available for this file format</Text>
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
