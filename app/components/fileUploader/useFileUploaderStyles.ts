import { makeStyles, tokens } from "@fluentui/react-components";

/**
 * Component styles
 */
const useFileUploaderStyles = makeStyles({
    dropZone: {
        padding: "20px",
        border: `2px dashed ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground2,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },

    dropZoneActive: {
        border: `2px solid ${tokens.colorBrandStroke1}`,
        backgroundColor: tokens.colorBrandBackground2,
    },

    dropZoneDisabled: {
        opacity: 0.6,
        cursor: "not-allowed",
    },

    dropZoneError: {
        border: `1px solid ${tokens.colorPaletteRedBorder2}`,
        backgroundColor: tokens.colorPaletteRedBackground1,
        margin: "1px", // Compensates for the 1px reduction in border width to prevent layout shift
    },

    shake: {
        animationName: {
            "0%": { transform: "translateX(0)" },
            "25%": { transform: "translateX(-6px)" },
            "50%": { transform: "translateX(6px)" },
            "75%": { transform: "translateX(-4px)" },
            "100%": { transform: "translateX(0)" },
        },
        animationDuration: "0.3s",
    },

    fileGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        marginTop: "16px",
    },

    fileCard: {
        position: "relative",
        borderRadius: tokens.borderRadiusMedium,
        overflow: "hidden",
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
    },

    thumbnail: {
        width: "100%",
        height: "100px",
        objectFit: "cover",
    },

    thumbnailContainer: {
        position: "relative",
        width: "100%",
        height: "100px",
        overflow: "hidden",
    },

    fileFooter: {
        padding: "6px 8px",
    },

    fileName: {
        display: "block",
        fontSize: tokens.fontSizeBase200,
    },

    removeBtn: {
        position: "absolute",
        top: "4px",
        right: "4px",
        backgroundColor: tokens.colorNeutralBackground1,
    },

    retryBtn: {
        position: "absolute",
        top: "4px",
        right: "36px",
        backgroundColor: tokens.colorNeutralBackground1,
    },

    hiddenInput: {
        display: "none",
    },

    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: tokens.colorNeutralForegroundInverted,
        backdropFilter: "blur(2px)",
        transition: "all 0.3s ease",
        gap: "4px",
    },

    overlayText: {
        color: tokens.colorNeutralForegroundInverted,
    },

    errorBadge: {
        position: "absolute",
        bottom: "4px",
        left: "4px",
        color: tokens.colorPaletteRedForeground1,
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "50%",
        display: "flex",
        boxShadow: tokens.shadow2,
    },

    successBadge: {
        position: "absolute",
        bottom: "4px",
        left: "4px",
        color: tokens.colorPaletteGreenForeground1,
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "50%",
        display: "flex",
        boxShadow: tokens.shadow2,
    },

    srOnly: {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
    },

    thumbnailClickable: {
        cursor: "pointer",
        transition: "opacity 0.2s ease",
        "&:hover": {
            opacity: 0.8,
        },
    },

    compressedText: {
        color: tokens.colorPaletteGreenForeground1,
    },

    dropZoneTextContainer: {
        textAlign: "center",
    },

    extensionsContainer: {
        opacity: 0.7,
        maxWidth: "450px",
        marginTop: "4px",
    },

    videoPlayIconContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        color: "white",
        filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.7))",
    },

    documentFallbackThumbnail: {
        backgroundColor: "#f3f2f1",
        color: "#605e5c",
    },
});

export default useFileUploaderStyles;