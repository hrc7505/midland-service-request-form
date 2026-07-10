import { makeStyles, tokens } from "@fluentui/react-components";

/**
 * Component styles for ImagePreviewDialog
 */
const useImagePreviewDialogStyles = makeStyles({
    previewDialogSurface: {
        maxWidth: "90vw",
        maxHeight: "90vh",
        width: "auto",
    },

    previewDialogContent: {
        overflow: "hidden",
        paddingBottom: "16px",
    },

    fullScreenImage: {
        maxWidth: "100%",
        maxHeight: "calc(90vh - 80px)",
        objectFit: "contain",
        borderRadius: tokens.borderRadiusMedium,
    },

    compressedText: {
        color: tokens.colorPaletteGreenForeground1,
    },
});

export default useImagePreviewDialogStyles;
