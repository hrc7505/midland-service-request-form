'use client';
import { useCallback, useState } from 'react';
import { Button, Divider } from "@fluentui/react-components";
import { ArrowLeftRegular, ArrowRightRegular, SaveRegular } from "@fluentui/react-icons";

import StepItem from '@/app/components/wizard/stepItem/stepItem';
import IWizardProps from '@/app/components/wizard/interfaces/IWizardProps';

import useWizardStyles from '@/app/components/wizard/useWizardStyles';

const Wizard = ({ steps, onSave }: IWizardProps) => {
    const styles = useWizardStyles();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    const isFirst = currentIdx === 0;
    const isLast = currentIdx === steps.length - 1;

    const next = useCallback(() => {
        setDirection('forward');
        setCurrentIdx(prev => Math.min(prev + 1, steps.length - 1));
    }, [steps.length]);

    const back = useCallback(() => {
        setDirection('backward');
        setCurrentIdx(prev => Math.max(prev - 1, 0));
    }, []);

    return (
        <div className={styles.wrapper}>
            {/* Top Navigation / Progress */}
            <div className={styles.header}>
                {steps.map((step, i) => (
                    <StepItem
                        key={step.id}
                        index={i}
                        label={step.label}
                        status={i === currentIdx ? 'active' : i < currentIdx ? 'completed' : 'upcoming'}
                    />
                ))}
            </div>
            <Divider />

            {/* Render Current Component */}
            <div className={styles.content}>
                <div key={currentIdx} className={direction === 'forward' ? styles.forward : styles.backward}>
                    {steps[currentIdx].component}
                </div>
            </div>

            <Divider />

            {/* Button Logic defined by your guide */}
            <div className={styles.footer}>
                {!isFirst && (
                    <Button icon={<ArrowLeftRegular />} onClick={back}>Back</Button>
                )}

                {isLast ? (
                    <Button appearance="primary" icon={<SaveRegular />} onClick={onSave}>Save</Button>
                ) : (
                    <Button appearance="primary" icon={<ArrowRightRegular />} iconPosition="after" onClick={next}>Continue</Button>
                )}
            </div>
        </div>
    );
};

export default Wizard;