import { makeStyles, tokens } from "@fluentui/react-components";

const useCommonStyles = makeStyles({
    // --- Flexbox Layouts ---
    flexRow: {
        display: "flex",
        flexDirection: "row",
    },
    flexColumn: {
        display: "flex",
        flexDirection: "column",
    },
    flexCenter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    flexAlignCenter: {
        display: "flex",
        alignItems: "center",
    },
    flexJustifyBetween: {
        display: "flex",
        justifyContent: "space-between",
    },

    // --- Spacing (Gaps) ---
    gap1: { gap: "4px" },
    gap2: { gap: "8px" },
    gap3: { gap: "12px" },
    gap4: { gap: "16px" },

    // --- Sizing ---
    fullWidth: { width: "100%" },
    fullHeight: { height: "100%" },

    // --- Text Variants ---
    textWrap: {
        whiteSpace: "normal",
        wordWrap: "break-word",
    },
    textNoWrap: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    // --- Text Colors ---
    textMuted: { color: tokens.colorNeutralForeground3 },
    textDanger: { color: tokens.colorPaletteRedForeground1 },
    textSuccess: { color: tokens.colorPaletteGreenForeground1 },
});

export default useCommonStyles;
