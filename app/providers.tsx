'use client';

import { FluentProvider, webLightTheme, createDOMRenderer, RendererProvider, renderToStyleElements } from '@fluentui/react-components';
import { useServerInsertedHTML } from 'next/navigation';
import { useMemo } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const renderer = useMemo(() => createDOMRenderer(), []);

    useServerInsertedHTML(() => {
        const styles = renderToStyleElements(renderer);
        return <>{styles}</>;
    });

    return (
        <RendererProvider renderer={renderer}>
            <FluentProvider theme={webLightTheme}>
                {children}
            </FluentProvider>
        </RendererProvider>
    );
}