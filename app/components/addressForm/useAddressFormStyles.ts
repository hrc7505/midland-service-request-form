import { color } from "@chiizu/checkout-core";
import { makeStyles } from "@griffel/react";

const useAddressFormStyles = makeStyles({
    root: {
        display: "grid",
        gap: "10px",
        gridTemplateColumns: "1fr 1fr",
        marginTop: "15px",
        // Todo: Move this to root component of public-js when we add it.
        containerType: "inline-size",
    },
    field: {
        animationName: {
            from: {
                transform: "translateY(50%)",
            },
            to: {
                transform: "translateY(0)",
            }
        },
        animationDuration: "0.5s",
        animationFillMode: "forwards",
        gridColumn: "1 / -1",
    },
    headerText: {
        color: color.Black,
        fontSize: "14px",
        fontWeight: 500,
    },

    addressFormToggleLink: {
        color: color.Primary,
        fontSize: "12px",
        cursor: "pointer",
        display: "block",
        marginTop: "3px",
        transformOrigin: "left",
        transform: "scale(1)",
        transitionProperty: "transform",
        transitionDuration: "0.1s",
        transitionTimingFunction: "ease-in-out",
        padding: 0,
        background: "none",
        border: "none",

        ":hover": {
            textDecoration: "underline",
        },

        ":active": {
            transform: "scale(0.99)",
        },
    },
});

export default useAddressFormStyles;
