"use client";

import { Card } from "@fluentui/react-components";
import { DeleteRegular, EditRegular } from "@fluentui/react-icons";

import type { IProduct } from "@/app/interfaces/IFormState";
import useProductCardStyles from "@/app/forms/productList/productCard/useProductCardStyles";

interface Props {
    product: IProduct;
    onEdit: (p: IProduct) => void;
    onRemove: (id: string) => void;
}

export default function ProductCard({
    product,
    onEdit,
    onRemove,
}: Props) {
    const styles = useProductCardStyles();

    const title = product.appliance || "Appliance";

    const summary = [
        product.brand,
        product.modelNumber && `Model ${product.modelNumber}`,
    ].filter(Boolean).join(" • ");

    return (
        <Card className={styles.card}>
            <div className={styles.header}>
                <div>
                    <div className={styles.title}>{title}</div>
                    {summary && (
                        <div className={styles.summary}>{summary}</div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.actionBtn}
                        aria-label={`Edit ${title}`}
                        onClick={() => onEdit(product)}
                    >
                        <EditRegular />
                    </button>

                    <button
                        className={styles.actionBtn}
                        aria-label={`Delete ${title}`}
                        onClick={() => onRemove(product.id)}
                    >
                        <DeleteRegular />
                    </button>
                </div>
            </div>
        </Card>
    );
}