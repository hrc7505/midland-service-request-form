import { makeStyles, tokens } from "@fluentui/react-components";

const useWizardStyles = makeStyles({
    wrapper: {
        gap: "20px",
        padding: "24px",
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        boxSizing: "border-box"
    },

    desktopHeader: {
        "@media (max-width: 768px)": {
            display: "none",
        },
    },

    mobileHeader: {
        display: "none",

        "@media (max-width: 768px)": {
            display: "flex",
            alignItems: "center",
            width: "100%",
        },
    },

    activeStep: {
        flex: 1,
        animationName: {
            from: {
                opacity: 0,
                transform: "translateX(16px)",
            },
            to: {
                opacity: 1,
                transform: "translateX(0)",
            },
        },
        animationDuration: "350ms",
        animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    },

    activeLabel: {
        whiteSpace: "nowrap",
        "@media (max-width: 360px)": {
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
    },
    stack: {
        height: "40px",
        position: "relative",
    },

    stackItem: {
        position: "relative",
        marginLeft: "-14px",
        ":first-child": {
            marginLeft: "0",
        },
        transitionProperty: "transform, opacity",
        transitionDuration: "350ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    },

    upcomingBadge: {
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: "0 2px 8px rgba(0,0,0,.12)",
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },

    upcomingBadgeMuted: {
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        boxShadow: "none",
    },

    completedCircle: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: "0 2px 8px rgba(0,0,0,.12)",
        animationName: {
            from: {
                opacity: 0,
                transform: "translateX(12px)",
            },
            to: {
                opacity: 1,
                transform: "translateX(0)",
            },
        },
        animationDuration: "350ms",
    },
    content: {
        minHeight: "200px"
    },
    footer: {
    },
    forward: {
        animationName: {
            from: {
                opacity: 0,
                transform: "translateX(20px)"
            },
            to: {
                opacity: 1,
                transform: "translateX(0)"
            }
        },
        animationDuration: "300ms",
        animationTimingFunction: "ease-out"
    },

    backward: {
        animationName: {
            from: {
                opacity: 0,
                transform: "translateX(-20px)"
            },
            to: {
                opacity: 1,
                transform: "translateX(0)"
            }
        },
        animationDuration: "300ms",
        animationTimingFunction: "ease-out"
    }
});

export default useWizardStyles;