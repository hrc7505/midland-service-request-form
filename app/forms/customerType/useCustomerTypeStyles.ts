import { makeStyles, tokens } from "@fluentui/react-components";

const useCustomerTypeStyles = makeStyles({
    container: { display: 'flex', flexDirection: 'column', gap: '12px' },
    question: { fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase400 }
});

export default useCustomerTypeStyles;