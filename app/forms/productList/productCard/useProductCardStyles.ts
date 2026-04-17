import { makeStyles, tokens } from "@fluentui/react-components";

const useProductCardStyles = makeStyles({
    card: {
        marginBottom: '12px',
        padding: '16px',
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        fontSize: '14px',
        fontWeight: 600,
    },

    summary: {
        fontSize: '12px',
        color: tokens.colorNeutralForeground3,
    },

    actions: {
        display: "flex",
        gap: '4px',
    },

    actionBtn: {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: '6px',
        borderRadius: '6px',

        ":hover": {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },
});

export default useProductCardStyles;