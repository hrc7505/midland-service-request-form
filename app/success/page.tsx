'use client';

import { Body1, Title2, Body1Strong, Caption1 } from '@fluentui/react-components';
import { CheckmarkCircleFilled } from '@fluentui/react-icons';

import useSuccessPageStyles from '@/app/success/useSuccessPageStyles';

const SuccessPage = () => {
    const styles = useSuccessPageStyles();

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>

                <CheckmarkCircleFilled className={styles.icon} />

                <Title2 className={styles.title}>
                    Your Service Request has been created
                </Title2>

                <Body1Strong className={styles.primaryText}>
                    A confirmation email with your service ticket details will be sent to you shortly.
                </Body1Strong>

                <Body1 className={styles.secondaryText}>
                    Our service team will review your request and a technician will contact you soon to confirm your appointment time.
                </Body1>

                <Caption1 className={styles.supportText}>
                    For any urgent enquiries or to update your request, please contact our support desk.
                </Caption1>
            </div>
        </div>
    );
};

export default SuccessPage;