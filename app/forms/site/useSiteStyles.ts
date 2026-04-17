import { makeStyles } from "@fluentui/react-components";

const useSiteStyles = makeStyles({
    grid: { display: 'flex', flexDirection: 'column', gap: '10px' },
    row: { display: 'flex', gap: '16px', width: '100%' },
    col: { flex: 1 },
});

export default useSiteStyles;