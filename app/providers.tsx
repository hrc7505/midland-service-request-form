'use client';

import * as React from 'react';
import { FluentProvider, webLightTheme, createDOMRenderer, RendererProvider, renderToStyleElements } from '@fluentui/react-components';
import { useServerInsertedHTML } from 'next/navigation';

export default function Providers({ children }: { children: React.ReactNode }) {
    const renderer = React.useMemo(() => createDOMRenderer(), []);

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