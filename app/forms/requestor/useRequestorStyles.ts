import { makeStyles } from "@fluentui/react-components";

const useRequestorStyles = makeStyles({
    grid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'flex', gap: '16px', width: '100%' },
    col: { flex: 1 },
});

export default useRequestorStyles;