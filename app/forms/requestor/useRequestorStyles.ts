import { makeStyles } from "@fluentui/react-components";

const useRequestorStyles = makeStyles({
    grid: { gap: "10px" },
    row: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        alignItems: "start",
        gap: "10px",
    },
    col: { flex: 1 },
});

export default useRequestorStyles;