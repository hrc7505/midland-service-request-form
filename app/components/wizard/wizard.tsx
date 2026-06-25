"use client";

import { useCallback, useState, SubmitEvent, useEffect } from "react";
import { Badge, Button, Divider, Spinner, Text, tokens, mergeClasses } from "@fluentui/react-components";
import { ArrowLeftRegular, ArrowRightRegular, CheckmarkCircleFilled, SaveRegular } from "@fluentui/react-icons";

import StepItem from "@/app/components/wizard/stepItem/stepItem";
import IWizardProps from "@/app/components/wizard/interfaces/IWizardProps";

import useWizardStyles from "@/app/components/wizard/useWizardStyles";
import useCommonStyles from "@/app/styles/useCommonStyles";

const Wizard = ({ steps, onSave, saving, disableNav }: IWizardProps) => {
    const styles = useWizardStyles();
    const commonStyles = useCommonStyles();

    const [currentIdx, setCurrentIdx] = useState(0);

    const hasSteps = steps.length > 0;

    useEffect(() => {
        if (!hasSteps) {
            setCurrentIdx(0);
            return;
        }
        setCurrentIdx(prev => Math.min(prev, steps.length - 1));
    }, [hasSteps, steps.length]);

    const isValidIdx = currentIdx >= 0 && currentIdx < steps.length;
    const currentStep = hasSteps && isValidIdx ? steps[currentIdx] : undefined;
    const isFirst = currentIdx === 0;
    const isLast = hasSteps && currentIdx === steps.length - 1;
    const canProgress = currentStep?.isValid !== false;
    const [direction, setDirection] = useState<"forward" | "backward">("forward");

    const next = useCallback(() => {
        if (!canProgress) {
            return;
        }
        setDirection("forward");
        setCurrentIdx(prev => Math.min(prev + 1, steps.length - 1));
    }, [canProgress, steps.length]);

    const back = useCallback(() => {
        setDirection("backward");
        setCurrentIdx(prev => Math.max(prev - 1, 0));
    }, []);

    const handleSubmit = useCallback((e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Force all inputs to be "touched" so custom validation hooks display inline errors
        const elements = e.currentTarget.querySelectorAll("input, textarea, select");
        elements.forEach((el) => {
            el.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
            el.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
        });

        const isNativeValid = e.currentTarget.checkValidity(); // Fires "invalid" events for native UI without the tooltips
        if (isLast) {
            if (canProgress && isNativeValid) onSave();
        } else {
            if (canProgress && isNativeValid) next();
        }
    }, [isLast, canProgress, next, onSave]);

    if (!hasSteps) {
        return null;
    }

    return (
        <form className={mergeClasses(commonStyles.flexColumn, commonStyles.fullWidth, styles.wrapper)} noValidate onSubmit={handleSubmit}        >
            {/* Desktop Stepper */}
            <div className={mergeClasses(commonStyles.flexJustifyBetween, styles.desktopHeader)}>
                {steps.map((step, index) => (
                    <StepItem
                        key={step.id}
                        index={index}
                        label={step.label}
                        status={index === currentIdx
                            ? "active"
                            : index < currentIdx ? "completed" : "upcoming"
                        }
                    />
                ))}
            </div>

            {/* Mobile Stepper */}
            <div className={mergeClasses(styles.mobileHeader, commonStyles.gap3)}>
                {currentIdx > 0 && (
                    <div className={mergeClasses(commonStyles.flexAlignCenter, styles.stack)}>
                        {steps
                            .slice(0, currentIdx)
                            .map((_, index) => (
                                <div
                                    key={index}
                                    className={styles.stackItem}
                                    style={{
                                        zIndex: index + 1,
                                        opacity: 0.5 + ((index + 1) / currentIdx) * 0.5,
                                    }}
                                >
                                    <div className={mergeClasses(commonStyles.flexCenter, styles.completedCircle)}>
                                        <CheckmarkCircleFilled fontSize={20} primaryFill={tokens.colorStatusSuccessForeground1} />
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                <div key={currentIdx} className={mergeClasses(commonStyles.flexAlignCenter, commonStyles.gap2, styles.activeStep)}>
                    <Badge appearance="filled" size="extra-large" shape="circular">
                        {currentIdx + 1}
                    </Badge>

                    <Text weight="semibold" className={styles.activeLabel}>
                        {isValidIdx ? steps[currentIdx].label : null}
                    </Text>
                </div>

                {currentIdx < steps.length - 1 && (
                    <div className={mergeClasses(commonStyles.flexAlignCenter, styles.stack)}>
                        {steps
                            .slice(currentIdx + 1)
                            .map((_, index, arr) => (
                                <div
                                    key={index}
                                    className={styles.stackItem}
                                    style={{
                                        zIndex: arr.length - index,
                                        opacity: index === 0
                                            ? 1
                                            : index === 1 ? 0.75 : 0.5,
                                    }}
                                >
                                    <Badge
                                        appearance="outline"
                                        size="extra-large"
                                        shape="circular"
                                        className={index === 0 ? styles.upcomingBadge : styles.upcomingBadgeMuted}
                                    >
                                        {currentIdx + index + 2}
                                    </Badge>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            <Divider />

            <div className={styles.content}>
                <div
                    key={currentIdx}
                    className={direction === "forward" ? styles.forward : styles.backward}
                >
                    {isValidIdx ? steps[currentIdx].component : null}
                </div>
            </div>

            <Divider />

            <div className={mergeClasses(commonStyles.flexJustifyBetween, commonStyles.gap3, styles.footer)}>
                <Button
                    type="button"
                    disabled={isFirst || saving || disableNav}
                    icon={<ArrowLeftRegular />}
                    onClick={back}
                >
                    Back
                </Button>

                {isLast
                    ? <Button
                        type="submit"
                        appearance="primary"
                        disabled={saving || disableNav}
                        icon={!saving ? <SaveRegular /> : undefined}
                    >
                        {saving ? <Spinner size="extra-tiny" label="Saving..." /> : "Submit"}
                    </Button>
                    : <Button
                        type="submit"
                        appearance="primary"
                        disabled={disableNav}
                        icon={<ArrowRightRegular />}
                        iconPosition="after"
                    >
                        Continue
                    </Button>
                }
            </div>
        </form>
    );
};

export default Wizard;