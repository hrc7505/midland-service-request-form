import { color } from "@chiizu/checkout-core";
import { makeStaticStyles } from "@griffel/react";

const useGoogleAddressSearchStyles = makeStaticStyles({
    ".chiizu-google-wrapper.high": {
        zIndex: 2,
    },
    ".chiizu-google-wrapper.low": {
        zIndex: 1,
    },
    // The Outer Wrapper (Handles your Chiizu border and rounded corners)
    "gmp-place-autocomplete": {
        boxSizing: "border-box",
        outline: "none",
        width: "100%",
        height: "30px",
        backgroundColor: color.White,
        border: `1px solid ${color.LightGrey}`,
        borderRadius: "10px",
        boxShadow: `0px 1px 1px ${color.BlackAlpha03}, 0px 3px 6px ${color.BlackAlpha02}`,
        display: "block",
        "--gmp-font-family": "inherit",
        "--gmp-color-primary": color.Primary, // Keeps your dropdown hover states Chiizu Blue!
    },

    // The Focus State (Applies to the wrapper perfectly)
    "gmp-place-autocomplete:focus-within(:not(data-error='true'))": {
        border: `1px solid ${color.Primary}`,
    },

    // Ensure the input padding matches your other standard fields
    "gmp-place-autocomplete::part(input)": {
        border: "none",
        outline: "none",
        backgroundColor: color.Transparent,
        fontSize: "12px",
        color: color.Black,
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        padding: "5px 10px"
    },

    // Placeholder
    "gmp-place-autocomplete::part(input)::placeholder": {
        color: color.DarkGrey,
    },
});

export default useGoogleAddressSearchStyles;
