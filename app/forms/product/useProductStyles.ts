import { makeStyles } from "@fluentui/react-components";

const useProductStyles = makeStyles({
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fileInput: { display: 'none' },
  fileActionGroup: { display: 'flex', gap: '8px', alignItems: 'center' }
});

export default useProductStyles;