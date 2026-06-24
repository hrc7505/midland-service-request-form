import { makeStyles } from "@fluentui/react-components";

const useAddressStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    alignItems: "start",
  },
});

export default useAddressStyles;