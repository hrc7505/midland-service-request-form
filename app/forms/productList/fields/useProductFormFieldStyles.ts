import { makeStyles, tokens } from "@fluentui/react-components";

export default makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: '16px',
    },

    // Optional: group rows (if you want 2-column layout later)
    row: {
        display: "flex",
        gap: '12px',
        flexWrap: "wrap",
    },

    // Optional: half width field (used inside row)
    half: {
        flex: '1 1 48%',
        minWidth: '220px',
    },

    // Optional: full width field
    full: {
        width: '100%',
    },

    // Improve textarea feel
    textarea: {
        minHeight: '80px',
    },

    // Section spacing (if you later group fields)
    section: {
        display: "flex",
        flexDirection: "column",
        gap: '12px',
        paddingTop: '8px',
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },

    // Optional label enhancement (rarely needed with Field)
    label: {
        fontSize: '12px',
        fontWeight: 600,
        color: tokens.colorNeutralForeground2,
    },
});