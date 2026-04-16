import { makeStyles, tokens } from "@fluentui/react-components";

/**
 * Component styles
 */
const useFileUploaderStyles = makeStyles({
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

    fileGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
        marginTop: '16px',
    },

    fileCard: {
        position: 'relative',
        borderRadius: tokens.borderRadiusMedium,
        overflow: 'hidden',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
    },

    thumbnail: {
        width: '100%',
        height: '100px',
        objectFit: 'cover',
    },

    fileFooter: {
        padding: '6px 8px',
    },

    fileName: {
        display: 'block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontSize: tokens.fontSizeBase200,
    },

    removeBtn: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        backgroundColor: tokens.colorNeutralBackground1,
    },

    hiddenInput: {
        display: 'none',
    },

    srOnly: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
    },
});

export default useFileUploaderStyles;