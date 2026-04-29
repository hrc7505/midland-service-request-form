import { makeStyles, tokens } from "@fluentui/react-components";

const useSuccessPageStyles = makeStyles({
    // 1. The Card Container: Adds elevation and a soft border
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center', // Centers all text
        padding: '48px 40px',
        maxWidth: '400px',
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusXLarge,
        boxShadow: tokens.shadow16,
        border: `1px solid ${tokens.colorTransparentStroke}`,
    },

    // 2. The Icon: Bigger, bolder, and uses semantic success colors
    icon: {
        color: tokens.colorStatusSuccessBackground3,
        fontSize: '80px',
        marginBottom: '24px',
    },

    // 3. Typography Hierarchy
    title: {
        marginBottom: '16px',
        color: tokens.colorNeutralForeground1,
        textAlign: 'center',
    },
    primaryText: {
        marginBottom: '12px',
        color: tokens.colorNeutralForeground1,
        textAlign: 'center',
    },
    secondaryText: {
        marginBottom: '24px',
        color: tokens.colorNeutralForeground2, // Slightly lighter grey
        lineHeight: '1.5',
        textAlign: 'center',
    },
    supportText: {
        marginBottom: '32px',
        color: tokens.colorNeutralForeground3, // Even lighter for the footer note
        textAlign: 'center',
    },
});

export default useSuccessPageStyles;
