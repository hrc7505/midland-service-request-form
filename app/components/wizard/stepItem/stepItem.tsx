import { mergeClasses, Text, Badge } from "@fluentui/react-components";
import { CheckmarkCircleFilled } from "@fluentui/react-icons";

import IStepItemProps from "@/app/components/wizard/stepItem/interfaces/IStepItemProps";

import useStepItemStyles from "@/app/components/wizard/stepItem/useStepItemStyles";

const StepItem = ({ label, index, status }: IStepItemProps) => {
    const styles = useStepItemStyles();

    return (
        <div className={mergeClasses(styles.step, status === 'active' && styles.active, status === 'completed' && styles.completed)}>
            {status === 'completed' ? (
                <CheckmarkCircleFilled fontSize={28} className={styles.icon} />
            ) : (
                <Badge 
                    className={mergeClasses(styles.badge, status === 'active' && styles.activeBadge)}
                    appearance={status === 'active' ? 'filled' : 'outline'}
                    size="extra-large"
                    shape="circular"
                >
                    {index + 1}
                </Badge>
            )}
            <Text 
                weight={status === 'active' ? 'semibold' : 'regular'}
                size={status === 'active' ? 500 : 400}
            >
                {label}
            </Text>
        </div>
    );
};

export default StepItem;