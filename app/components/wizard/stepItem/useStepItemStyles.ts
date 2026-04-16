import { makeStyles, tokens } from "@fluentui/react-components";

const popIn = {
    from: { transform: 'scale(0.5)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
};

const useStepItemStyles = makeStyles({
    step: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        color: tokens.colorNeutralForeground3,
        transitionProperty: 'color',
        transitionDuration: tokens.durationNormal,
        transitionTimingFunction: tokens.curveEasyEase,
    },
    active: {
        color: tokens.colorNeutralForeground1,
    },
    completed: {
        color: tokens.colorPaletteGreenForeground3,
    },
    icon: {
        animationName: popIn,
        animationDuration: tokens.durationNormal,
        animationTimingFunction: tokens.curveEasyEase,
    },
    badge: {
        transitionProperty: 'transform, background-color, color, border-color',
        transitionDuration: tokens.durationNormal,
        transitionTimingFunction: tokens.curveEasyEase,
    },
    activeBadge: {
        transform: 'scale(1.1)',
    }
});

export default useStepItemStyles;