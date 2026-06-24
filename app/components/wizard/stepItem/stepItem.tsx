import { Badge, mergeClasses, Text } from "@fluentui/react-components";
import { CheckmarkCircleFilled } from "@fluentui/react-icons";

import IStepItemProps from "@/app/components/wizard/stepItem/interfaces/IStepItemProps";

import useCommonStyles from "@/app/styles/useCommonStyles";

import useStepItemStyles from "@/app/components/wizard/stepItem/useStepItemStyles";

const StepItem = ({ label, index, status }: IStepItemProps) => {
    const styles = useStepItemStyles();
    const commonStyles = useCommonStyles();

    return (
        <div
            className={mergeClasses(commonStyles.flexAlignCenter, commonStyles.gap2, styles.step, status === "active" && styles.active, status === "completed" && styles.completed)}
        >
            {status === "completed"
                ? <CheckmarkCircleFilled fontSize={28} className={styles.icon} />
                : <Badge
                    appearance={status === "active" ? "filled" : "outline"}
                    size="extra-large"
                    shape="circular"
                    className={mergeClasses(styles.badge, status === "active" && styles.activeBadge)}
                >
                    {index + 1}
                </Badge>
            }

            <Text weight={status === "active" ? "semibold" : "regular"}            >
                {label}
            </Text>
        </div>
    );
};

export default StepItem;