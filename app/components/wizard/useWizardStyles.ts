import { makeStyles, tokens } from "@fluentui/react-components";

const useWizardStyles = makeStyles({
    wrapper: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', border: `1px solid ${tokens.colorNeutralStroke1}`, borderRadius: tokens.borderRadiusMedium },
    header: { display: 'flex', justifyContent: 'space-between', paddingBottom: '12px' },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' },
    content: { minHeight: '200px' },
    forward: {
        animationName: {
            from: { opacity: 0, transform: 'translateX(20px)' },
            to: { opacity: 1, transform: 'translateX(0)' }
        },
        animationDuration: '300ms',
        animationTimingFunction: 'ease-out'
    },
    backward: {
        animationName: {
            from: { opacity: 0, transform: 'translateX(-20px)' },
            to: { opacity: 1, transform: 'translateX(0)' }
        },
        animationDuration: '300ms',
        animationTimingFunction: 'ease-out'
    }
});

export default useWizardStyles;